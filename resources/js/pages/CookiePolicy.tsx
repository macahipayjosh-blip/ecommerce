import { Head, Link } from '@inertiajs/react';

export default function CookiePolicy() {
    return (
        <>
            <Head title="Cookie Policy – BSABShop" />
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="mx-auto flex h-[64px] max-w-4xl items-center gap-3 px-4">
                        <Link href={route('home')} className="text-xl font-bold text-[#2d6a2d]">
                            🌿 BSABShop
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800">Cookie Policy</h1>
                    <p className="text-sm text-gray-500">Last updated: January 1, 2026</p>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4 text-sm text-gray-700 leading-relaxed">
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">What Are Cookies?</h2>
                            <p>Cookies are small text files stored on your device when you visit BSABShop. They help us remember your preferences and improve your shopping experience.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">How We Use Cookies</h2>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-medium">Essential cookies</span> – Required for the site to function (e.g., keeping you logged in, maintaining your cart).</li>
                                <li><span className="font-medium">Analytics cookies</span> – Help us understand how visitors interact with the site so we can improve it.</li>
                                <li><span className="font-medium">Preference cookies</span> – Remember your settings such as language and region.</li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">Third-Party Cookies</h2>
                            <p>We may use third-party services (e.g., payment gateways like GCash and PayMaya) that set their own cookies. We do not control these cookies.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">Managing Cookies</h2>
                            <p>You can disable cookies through your browser settings. Note that disabling essential cookies may affect site functionality.</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-1">Contact</h2>
                            <p>For questions about our cookie use, contact us at <span className="text-[#2d6a2d] font-medium">support@bsabshop.edu.ph</span>.</p>
                        </div>
                    </section>

                    <div className="flex gap-4 text-sm">
                        <Link href={route('terms')} className="text-[#2d6a2d] hover:underline">Terms & Conditions</Link>
                        <Link href={route('privacy')} className="text-[#2d6a2d] hover:underline">Privacy Policy</Link>
                        <Link href={route('home')} className="text-gray-500 hover:underline">← Back to Home</Link>
                    </div>
                </main>
            </div>
        </>
    );
}
