import React from 'react';
import { ListTree } from 'lucide-react';

interface NavItem {
    id?: string;
    pos?: number;
    text: string;
    level: number;
}

interface ArticleNavigationProps {
    toc: NavItem[];
    onItemClick: (item: NavItem) => void;
    title?: string;
}

export const ArticleNavigation: React.FC<ArticleNavigationProps> = ({ toc, onItemClick, title = "Содержание" }) => {
    return (
         <aside className="hidden lg:block sticky top-32 self-start w-[350px] shrink-0 z-10">
            <div className="p-10 bg-white/[0.01] border border-white/10 rounded-[55px] backdrop-blur-3xl shadow-3xl overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-10 text-blue-500">
                    <ListTree size={18} />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-80">{title}</span>
                </div>

                <nav className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {toc.map((h, i) => (
                        <button 
                            key={i}
                            onClick={() => onItemClick(h)}
                            className={`flex items-start gap-4 text-left transition-all hover:text-blue-400 group/item w-full
                                ${h.level === 1 ? 'text-[12px] font-black uppercase text-white' : 'text-[11px] font-bold text-gray-500 pl-6 border-l border-white/5'}`}
                        >
                            <span className="leading-tight truncate">{h.text}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
};