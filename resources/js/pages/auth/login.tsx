import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });
    const [showPw, setShowPw] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Log in" />
            <div className="flex min-h-screen" style={{ background: '#f4f7f0' }}>
                {/* ── Left panel ── */}
                <div
                    className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden px-14 py-12 lg:flex"
                    style={{ background: 'linear-gradient(160deg, #f0f5e8 0%, #e8f0dc 100%)' }}
                >
                    {/* Brand — centered */}
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
                            Start Your Agricultural
                            <br />
                            Journey Today
                        </h2>
                    </div>

                    {/* Farm illustration SVG */}
                    <div className="absolute right-0 bottom-0 left-0">
                        <svg viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                            {/* Sky gradient */}
                            <rect width="600" height="320" fill="url(#sky)" />
                            <defs>
                                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f0f5e8" stopOpacity="0" />
                                    <stop offset="100%" stopColor="#c8dba8" stopOpacity="0.4" />
                                </linearGradient>
                            </defs>
                            {/* Rolling field lines */}
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <ellipse
                                    key={i}
                                    cx="300"
                                    cy={200 + i * 18}
                                    rx={320 - i * 12}
                                    ry={14 + i * 4}
                                    fill="none"
                                    stroke="#a8c878"
                                    strokeWidth="1.2"
                                    strokeOpacity={0.35 + i * 0.05}
                                />
                            ))}
                            {/* Ground */}
                            <ellipse cx="300" cy="310" rx="340" ry="60" fill="#b8d490" fillOpacity="0.3" />
                            {/* Trees left */}
                            <ellipse cx="60" cy="200" rx="28" ry="35" fill="#6aaa4a" fillOpacity="0.5" />
                            <ellipse cx="90" cy="195" rx="22" ry="28" fill="#5a9a3a" fillOpacity="0.4" />
                            {/* Trees right */}
                            <ellipse cx="540" cy="205" rx="30" ry="38" fill="#6aaa4a" fillOpacity="0.5" />
                            <ellipse cx="510" cy="200" rx="24" ry="30" fill="#5a9a3a" fillOpacity="0.4" />
                            {/* Crop rows */}
                            {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
                                <line
                                    key={i}
                                    x1={300 + i * 50}
                                    y1="240"
                                    x2={300 + i * 30}
                                    y2="310"
                                    stroke="#8ab858"
                                    strokeWidth="1.5"
                                    strokeOpacity="0.4"
                                />
                            ))}
                        </svg>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div
                    className="flex flex-1 items-center justify-center px-6 py-12"
                    style={{ background: 'linear-gradient(160deg, #f8faf4 0%, #eef4e4 100%)' }}
                >
                    {/* Card */}
                    <div className="w-full max-w-sm">
                        <div className="rounded-2xl border bg-white px-8 py-9 shadow-lg" style={{ borderColor: '#c8dba8' }}>
                            {/* Logo */}
                            <div className="mb-6 flex flex-col items-center">
                                <div className="mb-3 flex items-center gap-2">
                                    <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
                                        <path
                                            d="M22 6C14 6 8 13 8 22c0 4 1.5 7.5 4 10l10-10-4 14c1.2.6 2.6 1 4 1 8 0 14-7 14-15S30 6 22 6z"
                                            fill="#2d6a2d"
                                        />
                                        <path d="M22 6c0 0-2 8 2 14s10 8 10 8" stroke="#4a9e4a" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <span className="text-xl font-bold" style={{ color: '#1a4a1a' }}>
                                        BSAB<span style={{ color: '#3a8a3a' }}>Shop</span>
                                    </span>
                                </div>
                                <h1 className="text-lg font-extrabold tracking-widest uppercase" style={{ color: '#1a4a1a' }}>
                                    Member Login
                                </h1>
                            </div>

                            {status && (
                                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-700">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase" style={{ color: '#4a7a4a' }}>
                                        Email or Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: '#6aaa4a' }} />
                                        <input
                                            type="email"
                                            required
                                            autoFocus
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="email@example.com"
                                            className="w-full rounded-lg border py-2.5 pr-3 pl-9 text-sm transition-all focus:ring-2 focus:outline-none"
                                            style={{
                                                borderColor: errors.email ? '#dc2626' : '#b8d890',
                                                background: '#f4faea',
                                                focusRingColor: '#6aaa4a',
                                            }}
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold tracking-wider uppercase" style={{ color: '#4a7a4a' }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" style={{ color: '#6aaa4a' }} />
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            required
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Password"
                                            className="w-full rounded-lg border py-2.5 pr-10 pl-9 text-sm transition-all focus:ring-2 focus:outline-none"
                                            style={{
                                                borderColor: errors.password ? '#dc2626' : '#b8d890',
                                                background: '#f4faea',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw((v) => !v)}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold"
                                            style={{ color: '#4a7a4a' }}
                                        >
                                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                </div>

                                {/* Remember + Forgot */}
                                <div className="flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="h-3.5 w-3.5 rounded border-gray-300 accent-green-700"
                                        />
                                        <span className="text-xs" style={{ color: '#4a7a4a' }}>
                                            Keep Me Logged In
                                        </span>
                                    </label>
                                    {canResetPassword && (
                                        <a
                                            href={route('password.request')}
                                            className="text-xs font-medium hover:underline"
                                            style={{ color: '#3a8a3a' }}
                                        >
                                            Forgot Password?
                                        </a>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold tracking-widest text-white uppercase transition-all disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, #2d6a2d 0%, #3a8a3a 100%)' }}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Sign In
                                </button>
                            </form>

                            {/* Register */}
                            <p className="mt-5 text-center text-xs" style={{ color: '#6a8a6a' }}>
                                Don't have an account?{' '}
                                <a href={route('register')} className="font-semibold hover:underline" style={{ color: '#3a8a3a' }}>
                                    Sign Up
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
