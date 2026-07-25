import { Head, Link } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Privacy Policy – BSABShop" />
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="mx-auto flex h-[64px] max-w-4xl items-center px-4">
                        <Link href={route('home')} className="text-xl font-bold text-[#2d6a2d]">🌿 BSABShop</Link>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
                    <p className="text-sm text-gray-500">Last updated: January 1, 2026</p>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4 text-sm text-gray-700 leading-relaxed">
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">1. Information We Collect</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-medium">Account data</span> – name, email, password (hashed).</li>
                                <li><span className="font-medium">Order data</span> – delivery address, payment method, order history.</li>
                                <li><span className="font-medium">Usage data</span> – pages visited, search queries, device/browser info.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">2. How We Use Your Information</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>To process and fulfill your orders.</li>
                                <li>To send order confirmations and delivery updates.</li>
                                <li>To improve platform features and user experience.</li>
                                <li>To prevent fraud and ensure platform security.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">3. Sharing of Information</h2>
                            <p>We do not sell your personal data. We may share data with delivery riders and payment processors solely to complete your transactions.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">4. Data Retention</h2>
                            <p>We retain your data for as long as your account is active or as required by law. You may request deletion of your account at any time.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">5. Your Rights</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Access and download your personal data.</li>
                                <li>Request correction of inaccurate data.</li>
                                <li>Request deletion of your account and associated data.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">6. Security</h2>
                            <p>We use industry-standard encryption and security practices to protect your data. However, no method of transmission over the internet is 100% secure.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">7. Contact</h2>
                            <p>For privacy concerns, contact us at <span className="text-[#2d6a2d] font-medium">support@bsabshop.edu.ph</span>.</p>
                        </div>
                    </section>

                    <div className="flex gap-4 text-sm">
                        <Link href={route('cookies')} className="text-[#2d6a2d] hover:underline">Cookie Policy</Link>
                        <Link href={route('terms')} className="text-[#2d6a2d] hover:underline">Terms & Conditions</Link>
                        <Link href={route('home')} className="text-gray-500 hover:underline">← Back to Home</Link>
                    </div>
                </main>
            </div>
        </>
    );
}
