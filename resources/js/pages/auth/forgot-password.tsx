import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

const LeftPanel = () => (
    <div
        className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden px-14 py-12 lg:flex"
        style={{ background: 'linear-gradient(160deg, #f0f5e8 0%, #e8f0dc 100%)' }}
    >
        <div className="z-10 text-center">
            <p className="mb-4 text-sm font-medium text-green-700">Welcome to BSAB E-Commerce</p>
            <div className="mb-6 flex items-center justify-center gap-3">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <path d="M22 6C14 6 8 13 8 22c0 4 1.5 7.5 4 10l10-10-4 14c1.2.6 2.6 1 4 1 8 0 14-7 14-15S30 6 22 6z" fill="#2d6a2d" />
                    <path d="M22 6c0 0-2 8 2 14s10 8 10 8" stroke="#4a9e4a" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-3xl font-bold" style={{ color: '#1a4a1a' }}>
                    BSAB<span style={{ color: '#3a8a3a' }}>Shop</span>
                </span>
            </div>
            <h2 className="text-3xl leading-tight font-bold" style={{ color: '#1a4a1a' }}>
                Start Your Agricultural<br />Journey Today
            </h2>
        </div>
        <div className="absolute right-0 bottom-0 left-0">
            <svg viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                <rect width="600" height="320" fill="url(#sky)" />
                <defs>
                    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f0f5e8" stopOpacity="0" />
                        <stop offset="100%" stopColor="#c8dba8" stopOpacity="0.4" />
                    </linearGradient>
                </defs>
                {[0,1,2,3,4,5,6,7,8,9,10].map((i) => (
                    <ellipse key={i} cx="300" cy={200 + i * 18} rx={320 - i * 12} ry={14 + i * 4}
                        fill="none" stroke="#a8c878" strokeWidth="1.2" strokeOpacity={0.35 + i * 0.05} />
                ))}
                <ellipse cx="300" cy="310" rx="340" ry="60" fill="#b8d490" fillOpacity="0.3" />
                <ellipse cx="60" cy="200" rx="28" ry="35" fill="#6aaa4a" fillOpacity="0.5" />
                <ellipse cx="90" cy="195" rx="22" ry="28" fill="#5a9a3a" fillOpacity="0.4" />
                <ellipse cx="540" cy="205" rx="30" ry="38" fill="#6aaa4a" fillOpacity="0.5" />
                <ellipse cx="510" cy="200" rx="24" ry="30" fill="#5a9a3a" fillOpacity="0.4" />
                {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map((i) => (
                    <line key={i} x1={300 + i * 50} y1="240" x2={300 + i * 30} y2="310"
                        stroke="#8ab858" strokeWidth="1.5" strokeOpacity="0.4" />
                ))}
            </svg>
        </div>
    </div>
);

interface Props { status?: string; otp_sent: boolean; otp_email: string; }

export default function ForgotPassword({ status, otp_sent, otp_email }: Props) {
    const emailForm = useForm({ email: '' });
    const otpForm = useForm({ email: otp_email, otp: '' });
    const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
                     useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    const sendOtp: FormEventHandler = (e) => {
        e.preventDefault();
        emailForm.post(route('password.otp.send'));
    };

    const verifyOtp: FormEventHandler = (e) => {
        e.preventDefault();
        otpForm.post(route('password.otp.verify'));
    };

    const handleOtpInput = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const digits = otpForm.data.otp.split('');
        digits[index] = value.slice(-1);
        otpForm.setData('otp', digits.join('').padEnd(6, '').slice(0, 6));
        if (value && index < 5) otpRefs[index + 1].current?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpForm.data.otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    return (
        <>
            <Head title="Forgot password" />
            <div className="flex min-h-screen" style={{ background: '#f4f7f0' }}>
                <LeftPanel />

                <div className="flex flex-1 items-center justify-center px-6 py-12"
                    style={{ background: 'linear-gradient(160deg, #f8faf4 0%, #eef4e4 100%)' }}>
                    <div className="w-full max-w-sm">
                        <div className="rounded-2xl border bg-white px-8 py-9 shadow-lg" style={{ borderColor: '#c8dba8' }}>

                            {/* Logo */}
                            <div className="mb-6 flex flex-col items-center">
                                <div className="mb-3 flex items-center gap-2">
                                    <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
                                        <path d="M22 6C14 6 8 13 8 22c0 4 1.5 7.5 4 10l10-10-4 14c1.2.6 2.6 1 4 1 8 0 14-7 14-15S30 6 22 6z" fill="#2d6a2d" />
                                        <path d="M22 6c0 0-2 8 2 14s10 8 10 8" stroke="#4a9e4a" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <span className="text-xl font-bold" style={{ color: '#1a4a1a' }}>
                                        BSAB<span style={{ color: '#3a8a3a' }}>Shop</span>
                                    </span>
                                </div>
                                <h1 className="text-lg font-extrabold tracking-widest uppercase" style={{ color: '#1a4a1a' }}>
                                    {otp_sent ? 'Verify OTP' : 'Forgot Password'}
                                </h1>
                            </div>

                            {status && (
                                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-700">
                                    {status}
                                </div>
                            )}

                            {/* ── Step 1: Email ── */}
                            {!otp_sent && (
                                <form onSubmit={sendOtp} className="space-y-4">
                                    <p className="text-center text-xs" style={{ color: '#6a8a6a' }}>
                                        Enter your email and we'll send a 6-digit OTP.
                                    </p>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase" style={{ color: '#4a7a4a' }}>
                                            Email address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: '#6aaa4a' }} />
                                            <input
                                                type="email" required autoFocus
                                                value={emailForm.data.email}
                                                onChange={(e) => emailForm.setData('email', e.target.value)}
                                                placeholder="email@example.com"
                                                className="w-full rounded-lg border py-2.5 pr-3 pl-9 text-sm transition-all focus:ring-2 focus:outline-none"
                                                style={{ borderColor: emailForm.errors.email ? '#dc2626' : '#b8d890', background: '#f4faea' }}
                                            />
                                        </div>
                                        {emailForm.errors.email && <p className="mt-1 text-xs text-red-500">{emailForm.errors.email}</p>}
                                    </div>
                                    <button type="submit" disabled={emailForm.processing}
                                        className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold tracking-widest text-white uppercase transition-all disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg, #2d6a2d 0%, #3a8a3a 100%)' }}>
                                        {emailForm.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Send OTP
                                    </button>
                                </form>
                            )}

                            {/* ── Step 2: OTP ── */}
                            {otp_sent && (
                                <form onSubmit={verifyOtp} className="space-y-4">
                                    <p className="text-center text-xs" style={{ color: '#6a8a6a' }}>
                                        A 6-digit OTP was sent to <span className="font-semibold" style={{ color: '#3a8a3a' }}>{otp_email}</span>.
                                        It expires in 10 minutes.
                                    </p>

                                    {/* 6-box OTP input */}
                                    <div>
                                        <label className="mb-2 block text-center text-xs font-semibold tracking-wider uppercase" style={{ color: '#4a7a4a' }}>
                                            Enter OTP
                                        </label>
                                        <div className="flex justify-center gap-2">
                                            {[0,1,2,3,4,5].map((i) => (
                                                <input
                                                    key={i}
                                                    ref={otpRefs[i]}
                                                    type="text" inputMode="numeric" maxLength={1}
                                                    value={otpForm.data.otp[i] ?? ''}
                                                    onChange={(e) => handleOtpInput(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    className="h-12 w-10 rounded-lg border text-center text-lg font-bold focus:ring-2 focus:outline-none transition-all"
                                                    style={{
                                                        borderColor: otpForm.errors.otp ? '#dc2626' : '#b8d890',
                                                        background: '#f4faea',
                                                        color: '#1a4a1a',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        {otpForm.errors.otp && <p className="mt-1 text-center text-xs text-red-500">{otpForm.errors.otp}</p>}
                                    </div>

                                    <button type="submit" disabled={otpForm.processing || otpForm.data.otp.length < 6}
                                        className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold tracking-widest text-white uppercase transition-all disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg, #2d6a2d 0%, #3a8a3a 100%)' }}>
                                        {otpForm.processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                        Verify OTP
                                    </button>
                                </form>
                            )}

                            <p className="mt-5 text-center text-xs" style={{ color: '#6a8a6a' }}>
                                {otp_sent ? (
                                    <>Wrong email?{' '}
                                        <a href={route('password.request')} className="font-semibold hover:underline" style={{ color: '#3a8a3a' }}>Start over</a>
                                    </>
                                ) : (
                                    <>Return to{' '}
                                        <a href={route('login')} className="font-semibold hover:underline" style={{ color: '#3a8a3a' }}>log in</a>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
