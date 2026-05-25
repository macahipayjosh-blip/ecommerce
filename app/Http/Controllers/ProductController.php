<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\ProductImage;
use App\Models\FlashSale;
use App\Models\ProductMessage;
use App\Http\Controllers\Admin\SettingsController;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function welcome(Request $request)
    {
        $products = Product::with(['category', 'brand', 'images'])
            ->where('status', 'active')
            ->where('is_auction', false)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->latest()
            ->take(6)
            ->get();

        $categories = Category::select('id', 'name', 'image')->get();
        $settings = SettingsController::all();

        $flashSale = FlashSale::where('active', true)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->latest('start_time')
            ->first();

        $flashSaleProducts = collect();
        if ($flashSale) {
            $approvedProductIds = \App\Models\FlashSaleProduct::where('flash_sale_id', $flashSale->id)
                ->where('status', 'approved')
                ->pluck('product_id');

            if ($approvedProductIds->isNotEmpty()) {
                $fsps = \App\Models\FlashSaleProduct::where('flash_sale_id', $flashSale->id)
                    ->where('status', 'approved')
                    ->get()
                    ->keyBy('product_id');

                $flashSaleProducts = Product::with(['category', 'brand', 'images'])
                    ->where('status', 'active')
                    ->whereIn('id', $approvedProductIds)
                    ->take(4)
                    ->get()
                    ->map(function ($p) use ($fsps) {
                        $fsp = $fsps[$p->id] ?? null;
                        $p->flash_price       = $fsp ? (float) $fsp->flash_price : null;
                        $p->flash_stock_left  = $fsp ? $fsp->remainingStock() : null;
                        return $p;
                    });
            }
        }

        $liveAuctions = Product::where('is_auction', true)
            ->whereIn('auction_status', ['live', 'pending'])
            ->where('auction_end_at', '>=', now())
            ->with(['images' => fn($q) => $q->where('is_primary', true)->select('id', 'product_id', 'image_path')])
            ->withCount('bids')
            ->latest('auction_end_at')
            ->take(4)
            ->get();

        return Inertia::render('welcome', compact('products', 'categories', 'settings', 'flashSale', 'flashSaleProducts', 'liveAuctions'));
    }

    public function index(Request $request)
    {
        $input = $request->validate([
            'search'   => 'nullable|string|max:255',
            'category' => 'nullable|integer|exists:categories,id',
            'brand'    => 'nullable|integer|exists:brands,id',
            'sort'     => 'nullable|in:price_low,price_high,name_asc,name_desc,newest',
        ]);

        $query = Product::with(['category', 'brand', 'images'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('status', 'active')
            ->where('is_auction', false);

        if (!empty($input['search'])) {
            $query->where('name', 'like', '%' . $input['search'] . '%');
        }
        if (!empty($input['category'])) {
            $query->where('category_id', $input['category']);
        }
        if (!empty($input['brand'])) {
            $query->where('brand_id', $input['brand']);
        }
        match ($input['sort'] ?? 'newest') {
            'price_low'  => $query->orderBy('price'),
            'price_high' => $query->orderByDesc('price'),
            'name_asc'   => $query->orderBy('name'),
            'name_desc'  => $query->orderByDesc('name'),
            default      => $query->latest(),
        };

        $products   = $query->paginate(12)->withQueryString();
        $categories = Category::select('id', 'name')->get();
        $brands     = Brand::select('id', 'name')->get();
        $filters    = array_merge(['search' => '', 'category' => '', 'brand' => '', 'sort' => ''], array_filter($input));

        $view = Auth::user()?->hasRole('customer') ? 'Customer/Products/Index' : 'Shop/AllProducts';

        return Inertia::render($view, compact('products', 'categories', 'brands', 'filters'));
    }

    public function adminIndex(Request $request)
    {
        $input = $request->validate([
            'category' => 'nullable|integer|exists:categories,id',
            'brand'    => 'nullable|integer|exists:brands,id',
            'search'   => 'nullable|string|max:255',
            'sort'     => 'nullable|in:price_low,price_high,name_asc,name_desc,newest',
        ]);

        $query = Product::with(['category', 'brand', 'images'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        if (!empty($input['category'])) {
            $query->where('category_id', $input['category']);
        }
        if (!empty($input['brand'])) {
            $query->where('brand_id', $input['brand']);
        }
        if (!empty($input['search'])) {
            $query->where('name', 'like', '%' . $input['search'] . '%');
        }

        match ($input['sort'] ?? 'newest') {
            'price_low'  => $query->orderBy('price'),
            'price_high' => $query->orderByDesc('price'),
            'name_asc'   => $query->orderBy('name'),
            'name_desc'  => $query->orderByDesc('name'),
            default      => $query->latest(),
        };

        $products   = $query->paginate(20)->withQueryString();
        $categories = Category::select('id', 'name')->get();
        $brands     = Brand::select('id', 'name')->get();
        $filters    = array_merge(['category' => '', 'brand' => '', 'search' => '', 'sort' => ''], array_filter($input));

        return Inertia::render('Admin/Products/Index', compact('products', 'categories', 'brands', 'filters'));
    }

    public function adminShow(Product $product)
    {
        $product->load(['category', 'brand', 'seller', 'images', 'reviews.user']);
        return Inertia::render('Admin/Products/Show', compact('product'));
    }

    public function show(Product $product)
    {
        $product->load(['category', 'brand', 'seller', 'images', 'reviews.user']);

        // Load auction bids when product is an auction
        if ($product->is_auction) {
            $product->load(['bids.user']);
        }

        $inWishlist = false;
        $messages = [];
        if ($user = auth()->user()) {
            $user->loadMissing('customerProfile');
            $wishlist = $user->customerProfile?->wishlist ?? [];
            $inWishlist = in_array($product->id, $wishlist);

            // Load conversation between this user and the seller for this product
            $sellerId = $product->vendor_id;
            if ($sellerId) {
                $messages = ProductMessage::with('sender:id,name')
                    ->where('product_id', $product->id)
                    ->where(function ($q) use ($user, $sellerId) {
                        $q->where(fn($q) => $q->where('sender_id', $user->id)->where('receiver_id', $sellerId))
                          ->orWhere(fn($q) => $q->where('sender_id', $sellerId)->where('receiver_id', $user->id));
                    })
                    ->orderBy('created_at')
                    ->get(['id', 'sender_id', 'message', 'created_at']);
            }
        }
        $product->in_wishlist = $inWishlist;

        $similarProducts = Product::with(['images'])
            ->where('status', 'active')
            ->where('is_auction', false)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->withAvg('reviews', 'rating')
            ->latest()
            ->take(4)
            ->get()
            ->map(fn($p) => [
                'id'    => $p->id,
                'name'  => $p->name,
                'price' => $p->price,
                'compare_at_price' => $p->compare_at_price,
                'avg_rating' => $p->reviews_avg_rating,
                'image' => $p->images->firstWhere('is_primary', true)?->url ?? $p->images->first()?->url,
            ]);

        $view = Auth::user()?->hasRole('customer') ? 'Customer/Products/Show' : 'Products/Show';
        return Inertia::render($view, compact('product', 'messages', 'similarProducts'));
    }

    public function create()
    {
        if (!Auth::user()?->hasAnyRole(['seller', 'admin', 'super_admin'])) {
            abort(403);
        }

        $categories = Category::select('id', 'name')->get();
        $brands     = Brand::select('id', 'name')->get();

        return Inertia::render('Admin/Products/Create', compact('categories', 'brands'));
    }

    public function store(Request $request)
    {
        if (!Auth::user()?->hasAnyRole(['seller', 'admin', 'super_admin'])) {
            abort(403);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'slug'           => 'required|string|unique:products',
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'weight'         => 'nullable|numeric|min:0',
            'weight_unit'    => 'nullable|string|in:kg,g,ton,lb,oz',
            'sku'            => 'nullable|string|max:255',
            'category_id'    => 'required|exists:categories,id',
            'brand_id'       => 'required|exists:brands,id',
            'status'         => 'required|in:active,inactive',
            'images.*'       => 'image|max:2048',
        ]);

        $validated['vendor_id'] = Auth::id();
        $product = Product::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Product created.');
    }

    public function edit(Product $product)
    {
        if (Auth::id() !== $product->vendor_id && !Auth::user()?->hasAnyRole(['admin', 'super_admin'])) {
            abort(403);
        }

        $product->load('images');
        $categories = Category::select('id', 'name')->get();
        $brands     = Brand::select('id', 'name')->get();

        return Inertia::render('Admin/Products/Edit', compact('product', 'categories', 'brands'));
    }

    public function update(Request $request, Product $product)
    {
        if (Auth::id() !== $product->vendor_id && !Auth::user()?->hasAnyRole(['admin', 'super_admin'])) {
            abort(403);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'slug'           => 'required|string|unique:products,slug,' . $product->id,
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'weight'         => 'nullable|numeric|min:0',
            'weight_unit'    => 'nullable|string|in:kg,g,ton,lb,oz',
            'sku'            => 'nullable|string|max:255',
            'category_id'    => 'required|exists:categories,id',
            'brand_id'       => 'required|exists:brands,id',
            'status'         => 'required|in:active,inactive',
        ]);

        $product->update($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_primary' => $product->images()->count() === 1 && $index === 0,
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Product updated.');
    }

    public function destroyImage(Product $product, ProductImage $image)
    {
        if ($image->product_id !== $product->id) abort(404);
        $image->delete();
        return back();
    }

    public function destroy(Product $product)
    {
        if (Auth::id() !== $product->vendor_id && !Auth::user()?->hasRole('admin')) {
            abort(403);
        }
        $product->delete();
        return redirect()->route('admin.products.index')->with('success', 'Product deleted.');
    }
}
