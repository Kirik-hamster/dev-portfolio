import React from 'react';
import { X, Tag } from 'lucide-react';

interface TagsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tags: string[];
    title: string;
    onTagClick?: (tag: string) => void;
}

export const TagsModal: React.FC<TagsModalProps> = ({ isOpen, onClose, tags, title, onTagClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* BACKDROP */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
            
            {/* КАРТОЧКА: Добавили max-h для мобилок */}
            <div className="relative w-full max-w-lg max-h-[85vh] sm:max-h-none bg-[#0d0d0d] border border-white/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
                
                {/* ДЕКОР */}
                <div className="absolute -right-10 -top-10 opacity-5 text-blue-500 rotate-12 pointer-events-none hidden sm:block">
                    <Tag size={180} strokeWidth={1} />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* ШАПКА МОДАЛКИ */}
                    <div className="flex justify-between items-start mb-6 sm:mb-8">
                        <div className="flex flex-col gap-1 pr-8">
                            <span className="text-[8px] sm:text-[9px] font-black uppercase text-blue-500 tracking-[0.3em]">Категории</span>
                            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white line-clamp-2">{title}</h3>
                        </div>
                        <button 
                            onClick={onClose}
                            className="shrink-0 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* СПИСОК ТЕГОВ: Свой скроллбар */}
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex flex-wrap gap-2 sm:gap-2.5 pb-4">
                            {tags.map(tag => (
                                <button 
                                    key={tag} 
                                    onClick={() => {
                                        if (onTagClick) onTagClick(tag);
                                        onClose();
                                    }}
                                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 text-[9px] sm:text-[10px] font-black uppercase rounded-xl tracking-widest transition-all duration-300 whitespace-nowrap active:scale-95"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* КНОПКА ЗАКРЫТИЯ */}
                    <button 
                        onClick={onClose}
                        className="w-full mt-6 sm:mt-10 py-4 sm:py-5 bg-white text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-[0.98] shrink-0"
                    >
                        Вернуться назад
                    </button>
                </div>
            </div>
        </div>
    );
};