import { useState, useEffect } from 'react';

export const useFooterOffset = (baseOffset: number) => {
    const [offset, setOffset] = useState(baseOffset);

    // Синхронизируем стейт, если базовый отступ изменился извне
    useEffect(() => {
        setOffset(baseOffset);
    }, [baseOffset]);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const footer = document.querySelector('footer');
            
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top < windowHeight) {
                    const visibleFooterHeight = windowHeight - footerRect.top;
                    setOffset(visibleFooterHeight + baseOffset);
                } else {
                    setOffset(baseOffset);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Сразу вызываем, чтобы рассчитать позицию при монтировании
        handleScroll();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, [baseOffset]);

    return offset;
};