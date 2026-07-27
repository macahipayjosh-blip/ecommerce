import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface AdminRegisterForm {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'admin';
}

const field = (err?: string) =>
    `w-full rounded-lg border text-sm text-black focus:outline-none focus:ring-2 transition-all ${err ? 'border-red-400 bg-red-50' : 'border-[#b8d890] bg-[#f4faea]'}`;

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-semibold tracking-wider uppercase mb-1.5" style={{ color: '#4a7a4a' }}>
        {children}
    </label>
);

export default function AdminRegister({ token }: { token: string }) {
    const { data, setData, post, processing, errors, reset } = useForm<AdminRegisterForm>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin',
    });

    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.register.store', token), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Admin Registration" />
            <div className="min-h-screen flex items-start" style={{ background: '#f4f7f0' }}>

                {/* ── Left panel ── */}
                <div className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden px-14 py-12 sticky top-0 h-screen"
                    style={{ background: 'linear-gradient(160deg, #f0f5e8 0%, #e8f0dc 100%)' }}>

                    <div className="text-center z-10">
                        <p className="text-sm font-medium text-green-700 mb-4">Admin Portal — BSAB E-Commerce</p>
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                <path d="M22 6C14 6 8 13 8 22c0 4 1.5 7.5 4 10l10-10-4 14c1.2.6 2.6 1 4 1 8 0 14-7 14-15S30 6 22 6z" fill="#2d6a2d"/>
                                <path d="M22 6c0 0-2 8 2 14s10 8 10 8" stroke="#4a9e4a" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span className="text-3xl font-bold" style={{ color: '#1a4a1a' }}>
                                BSAB<span style={{ color: '#3a8a3a' }}>Shop</span>
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold leading-tight" style={{ color: '#1a4a1a' }}>
                            Private Admin<br />Registration
                        </h2>
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2">
                            <ShieldCheck className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-semibold text-amber-700">Token-protected access only</span>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                            <rect width="600" height="320" fill="url(#sky2)"/>
                            <defs>
                                <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f0f5e8" stopOpacity="0"/>
                                    <stop offset="100%" stopColor="#c8dba8" stopOpacity="0.4"/>
                                </linearGradient>
                            </defs>
                            {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
                                <ellipse key={i} cx="300" cy={200 + i * 18} rx={320 - i * 12} ry={14 + i * 4}
                                    fill="none" stroke="#a8c878" strokeWidth="1.2" strokeOpacity={0.35 + i * 0.05}/>
                            ))}
                            <ellipse cx="300" cy="310" rx="340" ry="60" fill="#b8d490" fillOpacity="0.3"/>
                            <ellipse cx="60" cy="200" rx="28" ry="35" fill="#6aaa4a" fillOpacity="0.5"/>
                            <ellipse cx="90" cy="195" rx="22" ry="28" fill="#5a9a3a" fillOpacity="0.4"/>
                            <ellipse cx="540" cy="205" rx="30" ry="38" fill="#6aaa4a" fillOpacity="0.5"/>
                            <ellipse cx="510" cy="200" rx="24" ry="30" fill="#5a9a3a" fillOpacity="0.4"/>
                            {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(i => (
                                <line key={i} x1={300 + i * 50} y1="240" x2={300 + i * 30} y2="310"
                                    stroke="#8ab858" strokeWidth="1.5" strokeOpacity="0.4"/>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="flex flex-1 items-center justify-center px-6 py-8 overflow-y-auto"
                    style={{ background: 'linear-gradient(160deg, #f8faf4 0%, #eef4e4 100%)', minHeight: '100vh' }}>

                    <div className="w-full max-w-sm">
                        <div className="bg-white rounded-2xl shadow-lg border px-8 py-8"
                            style={{ borderColor: '#c8dba8' }}>

                            {/* Logo */}
                            <div className="flex flex-col items-center mb-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
                                        <path d="M22 6C14 6 8 13 8 22c0 4 1.5 7.5 4 10l10-10-4 14c1.2.6 2.6 1 4 1 8 0 14-7 14-15S30 6 22 6z" fill="#2d6a2d"/>
                                        <path d="M22 6c0 0-2 8 2 14s10 8 10 8" stroke="#4a9e4a" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                    <span className="text-xl font-bold" style={{ color: '#1a4a1a' }}>
                                        BSAB<span style={{ color: '#3a8a3a' }}>Shop</span>
                                    </span>
                                </div>
                                <h1 className="text-lg font-extrabold tracking-widest uppercase" style={{ color: '#1a4a1a' }}>
                                    Admin Registration
                                </h1>
                                <p className="text-xs mt-1" style={{ color: '#6a8a6a' }}>Private — Authorized Personnel Only</p>
                            </div>

                            {/* Private badge */}
                            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 mb-4">
                                <ShieldCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-700">This page is restricted. Unauthorized access is prohibited.</p>
                            </div>

                            <form onSubmit={submit} className="space-y-3">

                                {/* Name row */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label>First Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#6aaa4a' }} />
                                            <input type="text" required autoFocus value={data.first_name}
                                                onChange={e => setData('first_name', e.target.value)}
                                                placeholder="Juan" disabled={processing}
                                                className={`${field(errors.first_name)} pl-8 pr-3 py-2.5`} />
                                        </div>
                                        {errors.first_name && <p className="mt-0.5 text-xs text-red-500">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <Label>Last Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#6aaa4a' }} />
                                            <input type="text" required value={data.last_name}
                                                onChange={e => setData('last_name', e.target.value)}
                                                placeholder="Dela Cruz" disabled={processing}
                                                className={`${field(errors.last_name)} pl-8 pr-3 py-2.5`} />
                                        </div>
                                        {errors.last_name && <p className="mt-0.5 text-xs text-red-500">{errors.last_name}</p>}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <Label>Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#6aaa4a' }} />
                                        <input type="email" required value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="admin@example.com" disabled={processing}
                                            className={`${field(errors.email)} pl-8 pr-3 py-2.5`} />
                                    </div>
                                    {errors.email && <p className="mt-0.5 text-xs text-red-500">{errors.email}</p>}
                                </div>

                                {/* Role — hidden, always admin */}
                                <input type="hidden" name="role" value={data.role} onChange={() => {}} />

                                {/* Password */}
                                <div>
                                    <Label>Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#6aaa4a' }} />
                                        <input type={showPw ? 'text' : 'password'} required value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            placeholder="Password" disabled={processing}
                                            className={`${field(errors.password)} pl-8 pr-10 py-2.5`} />
                                        <button type="button" onClick={() => setShowPw(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#4a7a4a' }}>
                                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-0.5 text-xs text-red-500">{errors.password}</p>}
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <Label>Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#6aaa4a' }} />
                                        <input type={showConfirm ? 'text' : 'password'} required value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm Password" disabled={processing}
                                            className={`${field(errors.password_confirmation)} pl-8 pr-10 py-2.5`} />
                                        <button type="button" onClick={() => setShowConfirm(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#4a7a4a' }}>
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && <p className="mt-0.5 text-xs text-red-500">{errors.password_confirmation}</p>}
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={processing}
                                    className="w-full py-3 rounded-full text-sm font-bold tracking-widest uppercase text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                                    style={{ background: 'linear-gradient(135deg, #2d6a2d 0%, #3a8a3a 100%)' }}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Create Admin Account
                                </button>
                            </form>

                            <p className="mt-5 text-center text-xs" style={{ color: '#6a8a6a' }}>
                                Already have an account?{' '}
                                <Link href={route('login')} className="font-semibold hover:underline" style={{ color: '#3a8a3a' }}>
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
