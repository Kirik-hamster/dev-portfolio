import React from 'react';
import { AlignLeft, X } from 'lucide-react';
import { useFooterOffset } from '../../hooks/useFooterOffset';

interface MobileTocToggleProps {
    onClick: () => void;
    isOpen: boolean;
}

export const MobileTocToggle: React.FC<MobileTocToggleProps> = ({ onClick, isOpen }) => {
    const bottomOffset = useFooterOffset(24); // Всегда снизу

    return (
        <div 
            className="lg:hidden fixed right-6 z-[60] transition-all duration-500 ease-in-out"
            style={{ bottom: `${bottomOffset}px` }}
        >
            <button 
                onClick={onClick}
                className={`
                    w-14 h-14 flex items-center justify-center
                    rounded-full shadow-[0_20px_50px_rgba(59,130,246,0.2)]
                    active:scale-90 transition-all duration-300
                    backdrop-blur border
                    ${isOpen 
                        ? 'bg-red-500/20 border-red-500/50 text-red-500 rotate-90' 
                        : 'bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30'}
                    animate-in fade-in zoom-in slide-in-from-bottom-8
                `}
            >
                {isOpen ? <X size={26} /> : <AlignLeft size={26} />}
            </button>
        </div>
    );
};