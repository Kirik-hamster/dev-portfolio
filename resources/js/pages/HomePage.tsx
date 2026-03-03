import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Code2, Cpu, Rocket, Terminal } from 'lucide-react';
import { PremiumLoader } from '../components/PremiumLoader'; // Вернули на место!
import { ScrollToTop } from '../components/ui/ScrollToTop';

interface HomePageProps {
    onNavigateToPortfolio: () => void;
}

export function HomePage({ onNavigateToPortfolio }: HomePageProps) {
    const [loading, setLoading] = useState(true);

    // Симуляция премиальной загрузки при первом входе
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <PremiumLoader />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 w-full relative">
            {/* Глобальный элемент навигации */}
            <ScrollToTop />

            {/* 1. HERO SECTION */}
            <section className="flex flex-col items-center justify-center min-h-[90vh] text-center space-y-12 animate-in fade-in zoom-in duration-1000">
                <div className="px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Available for projects</span>
                </div>
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-white/90 to-white/20 bg-clip-text text-transparent leading-[0.9]">
                    Solving Business<br/>Problems with Code.
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-medium italic">
                    Fullstack-разработчик, специализирующийся на создании масштабируемых систем.
                    Превращаю идеи в продукты с помощью Laravel & React.
                </p>
                <button
                    onClick={onNavigateToPortfolio}
                    className="px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.15)] flex items-center gap-3 active:scale-95"
                >
                    Explore Works <ArrowUpRight size={18} />
                </button>
            </section>

            {/* 2. SERVICES SECTION (Для объема и веса) */}
            <section className="py-40 grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                    { title: "Frontend Architecture", desc: "Building resilient UIs with React & TypeScript.", icon: Code2, color: "text-blue-500" },
                    { title: "Backend Systems", desc: "High-performance APIs powered by Laravel.", icon: Terminal, color: "text-emerald-500" },
                    { title: "Database Design", desc: "Optimized schemas for massive data scaling.", icon: Cpu, color: "text-purple-500" },
                    { title: "DevOps & Cloud", desc: "Reliable deployments and CI/CD pipelines.", icon: Rocket, color: "text-orange-500" }
                ].map((s, i) => (
                    <div key={i} className="p-12 bg-white/[0.01] border border-white/5 rounded-[50px] space-y-6 hover:bg-white/[0.02] transition-all group">
                        <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${s.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                            <s.icon size={28} />
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase">{s.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{s.desc}</p>
                    </div>
                ))}
            </section>

            {/* 3. EXPERIENCE SECTION (Добиваем высоту) */}
            <section className="py-40 border-t border-white/5">
                <h2 className="text-5xl font-black uppercase tracking-tighter mb-20 text-center">My Philosophy</h2>
                <div className="space-y-20">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <span className="text-6xl font-black text-white/5 tabular-nums leading-none">01</span>
                        <div>
                            <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">Clean Code First</h4>
                            <p className="text-gray-500 max-w-2xl leading-8 italic">Я верю, что код должен быть понятен человеку, а не только машине. Это залог долгой жизни любого продукта.</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <span className="text-6xl font-black text-white/5 tabular-nums leading-none">02</span>
                        <div>
                            <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">User-Centric Design</h4>
                            <p className="text-gray-500 max-w-2xl leading-8 italic">Интерфейс — это мост. Если он шатается, пользователь уйдет. Моя задача — сделать его железным и красивым.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. FOOTER CALL TO ACTION */}
            <section className="py-40 text-center">
                <div className="inline-block p-1 bg-white/5 rounded-full mb-10">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                </div>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12">Let's build<br/>something great.</h2>
                <button className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-colors">Get in touch — 2024</button>
            </section>
        </div>
    );
}