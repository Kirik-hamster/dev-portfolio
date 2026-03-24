import React from 'react';
import { createPortal } from 'react-dom';
import { ListTree, X } from 'lucide-react';

export interface TocItem {
    text: string;
    level: number;
    id?: string;
    pos?: number; 
}

interface MobileTocDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    toc: TocItem[];
    onScrollTo: (target: string | number) => void; 
}

export const MobileTocDrawer: React.FC<MobileTocDrawerProps> = ({ isOpen, onClose, toc, onScrollTo }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="lg:hidden fixed inset-0 z-[999] flex flex-col justify-end p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
            
            {/* Drawer Content */}
            <div className="relative bg-[#080808] border border-white/10 rounded-[40px] p-8 max-h-[80vh] overflow-y-auto shadow-[0_-20px_80px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10 duration-500">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3 text-blue-500">
                        <ListTree size={18} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Содержание</span>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                        <X size={20}/>
                    </button>
                </div>
                
                <nav className="flex flex-col gap-6">
                    {/* ⚡️ УНИЧТОЖЕНО: h теперь строго TocItem */}
                    {toc.map((h: TocItem, i: number) => (
                        <button 
                            key={i} 
                            onClick={() => { 
                                const target = h.pos !== undefined ? h.pos : h.id;
                                if (target !== undefined) onScrollTo(target); 
                                onClose(); 
                            }} 
                            className={`text-left transition-all active:scale-95 ${
                                h.level === 1 
                                    ? 'text-sm font-black text-white uppercase tracking-tight' 
                                    : 'text-xs font-bold text-gray-500 pl-4 border-l border-white/5'
                            }`}
                        >
                            {h.text}
                        </button>
                    ))}
                </nav>
            </div>
        </div>,
        document.body
    );
};