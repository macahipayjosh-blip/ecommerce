<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #2d6a2d; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .header p { color: #a8d5a8; margin: 8px 0 0; }
        .body { padding: 32px; }
        .trophy { font-size: 48px; text-align: center; margin-bottom: 16px; }
        .highlight { background: #e8f5e9; border-left: 4px solid #2d6a2d; padding: 16px; border-radius: 4px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .label { color: #666; font-size: 13px; }
        .value { font-weight: bold; font-size: 13px; }
        .btn { display: block; width: fit-content; margin: 24px auto; background: #2d6a2d; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 You Won the Auction!</h1>
            <p>Congratulations, {{ $winner->name }}</p>
        </div>
        <div class="body">
            <div class="trophy">🏆</div>
            <p style="text-align:center; color:#333;">You placed the highest bid on <strong>{{ $product->name }}</strong> and won!</p>

            <div class="highlight">
                <div class="row">
                    <span class="label">Auction Item</span>
                    <span class="value">{{ $product->name }}</span>
                </div>
                <div class="row">
                    <span class="label">Breed / Age</span>
                    <span class="value">{{ $product->breed }} • {{ $product->age }}</span>
                </div>
                <div class="row">
                    <span class="label">Winning Bid</span>
                    <span class="value">₱{{ number_format($order->subtotal, 2) }}</span>
                </div>
                <div class="row">
                    <span class="label">Auction Fee (8%)</span>
                    <span class="value">₱{{ number_format($order->auction_fee, 2) }}</span>
                </div>
                <div class="row" style="border:none;">
                    <span class="label">Total Due</span>
                    <span class="value" style="color:#2d6a2d; font-size:16px;">₱{{ number_format($order->total, 2) }}</span>
                </div>
            </div>

            <div class="row">
                <span class="label">Order Number</span>
                <span class="value">{{ $order->order_number }}</span>
            </div>
            <div class="row">
                <span class="label">Status</span>
                <span class="value">Confirmed</span>
            </div>

            <p style="color:#666; font-size:13px; margin-top:20px;">
                Your order has been created and a rider will be assigned to deliver your item. You will receive further updates as your order progresses.
            </p>

            <a href="{{ url('/customer/orders/' . $order->id) }}" class="btn">View My Order</a>
        </div>
        <div class="footer">
            © {{ date('Y') }} CPSU BSABShop. All rights reserved.
        </div>
    </div>
</body>
</html>
