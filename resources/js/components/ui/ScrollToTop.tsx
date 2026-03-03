import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [bottomOffset, setBottomOffset] = useState(40); // Базовый отступ 40px

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            
            // Показываем кнопку после 400px
            setIsVisible(scrollY > 400);

            // ДИНАМИЧЕСКИЙ РАСЧЕТ: Ищем футер и считаем его положение
            const footer = document.querySelector('footer');
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                
                // Если верх футера поднялся выше края экрана (rect.top < windowHeight)
                if (footerRect.top < windowHeight) {
                    const visibleFooterHeight = windowHeight - footerRect.top;
                    setBottomOffset(visibleFooterHeight + 40); // Футер + запас
                } else {
                    setBottomOffset(40); // Обычное положение
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); 
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            style={{
                // Динамически меняем bottom в реальном времени для плавного всплытия
                bottom: `${bottomOffset}px`,
            }}
             className={`
                fixed right-10 z-[60] p-4
                bg-white/[0.03] backdrop-blur-3xl
                border border-white/10
                shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(255,255,255,0.05)]
                rounded-2xl text-gray-400 
                transition-all duration-500 ease-in-out
                hover:text-blue-400 hover:scale-110 hover:bg-white/[0.08]
                hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]
                active:scale-95
                group
                animate-in fade-in zoom-in slide-in-from-bottom-8
            `}
        >
            <div className="relative z-10">
                <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform duration-500" />
            </div>
            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-t from-blue-500/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity"/>
        </button>
    );
};