import { Head, Link } from '@inertiajs/react';

export default function TermsAndConditions() {
    return (
        <>
            <Head title="Terms & Conditions – BSABShop" />
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="mx-auto flex h-[64px] max-w-4xl items-center px-4">
                        <Link href={route('home')} className="text-xl font-bold text-[#2d6a2d]">🌿 BSABShop</Link>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800">Terms & Conditions</h1>
                    <p className="text-sm text-gray-500">Last updated: January 1, 2026</p>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4 text-sm text-gray-700 leading-relaxed">
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">1. Acceptance of Terms</h2>
                            <p>By accessing or using BSABShop, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">2. Eligibility</h2>
                            <p>BSABShop is intended for CPSU-BSAB students, faculty, and authorized sellers. You must be at least 18 years old or have parental consent to make purchases.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">3. Account Responsibilities</h2>
                            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">4. Orders & Payments</h2>
                            <p>All orders are subject to product availability. We accept GCash, PayMaya, and Cash on Delivery. Prices are in Philippine Peso (₱) and may change without prior notice.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">5. Returns & Refunds</h2>
                            <p>Items may be returned within 7 days of delivery if they are defective or not as described. Refunds are processed within 5–7 business days.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">6. Prohibited Conduct</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Posting false or misleading product listings.</li>
                                <li>Attempting to manipulate auction bids fraudulently.</li>
                                <li>Using the platform for any unlawful purpose.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">7. Limitation of Liability</h2>
                            <p>BSABShop is not liable for any indirect, incidental, or consequential damages arising from the use of the platform.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">8. Changes to Terms</h2>
                            <p>We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">9. Contact</h2>
                            <p>Questions? Reach us at <span className="text-[#2d6a2d] font-medium">support@bsabshop.edu.ph</span>.</p>
                        </div>
                    </section>

                    <div className="flex gap-4 text-sm">
                        <Link href={route('cookies')} className="text-[#2d6a2d] hover:underline">Cookie Policy</Link>
                        <Link href={route('privacy')} className="text-[#2d6a2d] hover:underline">Privacy Policy</Link>
                        <Link href={route('home')} className="text-gray-500 hover:underline">← Back to Home</Link>
                    </div>
                </main>
            </div>
        </>
    );
}
