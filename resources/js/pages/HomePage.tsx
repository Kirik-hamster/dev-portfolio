import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface HomePageProps {
    onNavigateToPortfolio: () => void;
}

/**
 * Домашняя страница (Hero-секция).
 * Приветствует пользователя и предлагает перейти к портфолио.
 */
export function HomePage({ onNavigateToPortfolio }: HomePageProps) {
    return (
        <div className="max-w-6xl mx-auto px-6 w-full flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 animate-in fade-in zoom-in duration-1000">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent leading-tight">
                Solving Business<br/>Problems with Code.
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                Fullstack-разработчик, специализирующийся на создании масштабируемых веб-приложений.
                Превращаю идеи в работающие продукты с помощью Laravel, React и современной инфраструктуры.
            </p>
            <button
                onClick={onNavigateToPortfolio}
                className="mt-4 px-10 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2"
            >
                Посмотреть портфолио
                <ArrowUpRight size={16} />
            </button>
        </div>
    );
}
