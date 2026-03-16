import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useFooterOffset } from '../../hooks/useFooterOffset';

interface ScrollToTopProps {
    hasOffset?: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ hasOffset = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    // Динамический расчет: 92px (над кнопкой) или 24px (внизу)
    const baseBottom = hasOffset ? 92 : 24; 
    const bottomOffset = useFooterOffset(baseBottom);

    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ bottom: `${bottomOffset}px` }}
            className={`
                fixed right-6 z-[70] 
                w-14 h-14 flex items-center justify-center
                bg-white/5 backdrop-blur
                border border-white/10 shadow-2xl 
                rounded-2xl text-gray-400 
                transition-all duration-500 ease-in-out
                hover:text-blue-400 hover:scale-110 hover:bg-white/[0.08]
                hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]
                active:scale-95
                group
                animate-in fade-in zoom-in slide-in-from-bottom-8
            `}
        >
            <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
    );
};