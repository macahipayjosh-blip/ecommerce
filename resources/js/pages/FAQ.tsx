import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const faqs = [
    {
        category: 'Orders',
        items: [
            {
                q: 'How do I place an order?',
                a: 'Browse products, add items to your cart, and proceed to checkout. You will need to be logged in to complete a purchase.',
            },
            {
                q: 'Can I cancel my order?',
                a: 'You can cancel an order while it is still in "Pending" status. Once confirmed or shipped, cancellation is no longer available.',
            },
            {
                q: 'How do I track my order?',
                a: 'Go to My Orders in your dashboard. Each order shows its current status and delivery updates.',
            },
        ],
    },
    {
        category: 'Payments',
        items: [
            {
                q: 'What payment methods are accepted?',
                a: 'We accept GCash, PayMaya, and Cash on Delivery (COD).',
            },
            {
                q: 'Is my payment information secure?',
                a: 'Yes. Payments are processed through trusted third-party gateways. We do not store your card or wallet credentials.',
            },
            {
                q: 'Can I use a voucher or coupon?',
                a: 'Yes. Enter your voucher code at checkout or claim available vouchers from your dashboard.',
            },
        ],
    },
    {
        category: 'Shipping & Delivery',
        items: [
            {
                q: 'How long does delivery take?',
                a: 'Delivery typically takes 1–3 business days within the CPSU campus area. Remote areas may take longer.',
            },
            {
                q: 'Is there a delivery fee?',
                a: 'Delivery fees vary depending on your location and order total. The fee is shown at checkout before you confirm.',
            },
        ],
    },
    {
        category: 'Returns & Refunds',
        items: [
            {
                q: 'How do I return an item?',
                a: 'Go to My Orders, select the order, and click "Request Return". Returns are accepted within 7 days of delivery for defective or incorrect items.',
            },
            {
                q: 'When will I receive my refund?',
                a: 'Refunds are processed within 5–7 business days after the return is approved.',
            },
        ],
    },
    {
        category: 'Account',
        items: [
            {
                q: 'How do I become a seller?',
                a: 'Log in, go to your account menu, and click "Become a Seller". Fill out the seller application form and wait for admin approval.',
            },
            {
                q: 'I forgot my password. What do I do?',
                a: 'Click "Forgot Password" on the login page and enter your email. A reset link will be sent to your inbox.',
            },
            {
                q: 'How do I update my delivery address?',
                a: 'Go to My Account → Addresses to add or update your delivery addresses.',
            },
        ],
    },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-sm font-medium text-gray-800 hover:text-[#2d6a2d]"
            >
                <span>{q}</span>
                <ChevronRight className={`h-4 w-4 shrink-0 text-[#2d6a2d] transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
            </button>
            {open && <p className="pb-4 text-sm leading-relaxed text-gray-500">{a}</p>}
        </div>
    );
}

export default function FAQ() {
    return (
        <>
            <Head title="FAQ – BSABShop" />
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="mx-auto flex h-[64px] max-w-4xl items-center px-4">
                        <Link href={route('home')} className="text-xl font-bold text-[#2d6a2d]">🌿 BSABShop</Link>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h1>
                        <p className="mt-1 text-sm text-gray-500">Can't find your answer? Contact us at <span className="text-[#2d6a2d] font-medium">support@bsabshop.edu.ph</span></p>
                    </div>

                    {faqs.map((section) => (
                        <div key={section.category} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#2d6a2d]">{section.category}</h2>
                            {section.items.map((item) => (
                                <FAQItem key={item.q} q={item.q} a={item.a} />
                            ))}
                        </div>
                    ))}

                    <div className="flex gap-4 text-sm">
                        <Link href={route('terms')} className="text-[#2d6a2d] hover:underline">Terms & Conditions</Link>
                        <Link href={route('privacy')} className="text-[#2d6a2d] hover:underline">Privacy Policy</Link>
                        <Link href={route('cookies')} className="text-[#2d6a2d] hover:underline">Cookie Policy</Link>
                        <Link href={route('home')} className="text-gray-500 hover:underline">← Back to Home</Link>
                    </div>
                </main>
            </div>
        </>
    );
}
