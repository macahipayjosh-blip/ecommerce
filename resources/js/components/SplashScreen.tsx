import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone, siteLogo }: { onDone: () => void; siteLogo?: string | null }) {
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 600);
        const t2 = setTimeout(() => setPhase('out'), 6400);
        const t3 = setTimeout(onDone, 7000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onDone]);

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'linear-gradient(135deg, #1a4d1a 0%, #2d6a2d 50%, #4a9e4a 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'opacity 0.6s ease',
                opacity: phase === 'out' ? 0 : 1,
                pointerEvents: phase === 'out' ? 'none' : 'all',
            }}
        >
            {/* Animated rings */}
            <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 28 }}>
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute', inset: 0,
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.2)',
                            animation: `splash-ping 2s ease-out ${i * 0.4}s infinite`,
                        }}
                    />
                ))}

                {/* Logo circle */}
                <div
                    style={{
                        position: 'absolute', inset: 16,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: `splash-scale-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both`,
                    }}
                >
                    {siteLogo ? (
                        <img
                            src={`/storage/${siteLogo}`}
                            alt="Logo"
                            style={{ width: 72, height: 72, objectFit: 'contain', animation: 'splash-leaf 3s ease-in-out infinite' }}
                        />
                    ) : (
                        <span style={{ fontSize: 52, lineHeight: 1, animation: 'splash-leaf 3s ease-in-out infinite' }}>🌿</span>
                    )}
                </div>
            </div>

            {/* Brand name */}
            <div
                style={{
                    animation: 'splash-fade-up 0.7s ease 0.3s both',
                    textAlign: 'center',
                }}
            >
                <p style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: 2, margin: 0 }}>
                    BSAB<span style={{ color: '#a7f3a7' }}>Shop</span>
                </p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 4, marginTop: 4, textTransform: 'uppercase' }}>
                    CPSU E-Commerce
                </p>
            </div>

            {/* Loading dots */}
            <div style={{ display: 'flex', gap: 6, marginTop: 40, animation: 'splash-fade-up 0.7s ease 0.6s both' }}>
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.7)',
                            animation: `splash-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes splash-ping {
                    0%   { transform: scale(0.6); opacity: 0.6; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
                @keyframes splash-scale-in {
                    from { transform: scale(0); opacity: 0; }
                    to   { transform: scale(1); opacity: 1; }
                }
                @keyframes splash-fade-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes splash-bounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                    40%           { transform: scale(1.2); opacity: 1; }
                }
                @keyframes splash-leaf {
                    0%, 100% { transform: rotate(-8deg) scale(1); }
                    50%      { transform: rotate(8deg) scale(1.08); }
                }
            `}</style>
        </div>
    );
}
