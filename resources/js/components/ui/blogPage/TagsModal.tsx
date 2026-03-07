import React from 'react';
import { X, Tag } from 'lucide-react';

interface TagsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tags: string[];
    title: string;
    type?: 'post' | 'blog';
    onTagClick?: (tag: string) => void;
}

export const TagsModal: React.FC<TagsModalProps> = ({ 
    isOpen, onClose, tags, title, type = 'post', onTagClick 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-[#0d0d0d]/90 border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl overflow-hidden flex flex-col">
                
                {/* КНОПКА ЗАКРЫТИЯ (X): Теперь ближе к углу и красная */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/5 border border-white/5 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 z-50 active:scale-90"
                >
                    <X size={16} />
                </button>

                <div className="absolute -right-12 -top-12 opacity-[0.02] text-white rotate-12 pointer-events-none">
                    <Tag size={220} strokeWidth={1} />
                </div>

                <div className="relative z-10 flex flex-col">
                    <div className="flex flex-col gap-1.5 mb-10 pr-6">
                        {/* Статусная надпись */}
                        <span className="text-[9px] font-black uppercase text-blue-500/80 tracking-[0.4em]">
                            {type === 'post' ? 'Теги публикации' : 'Категории автора'}
                        </span>
                        {/* Чистый заголовок */}
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white/90 leading-tight">
                            {title}
                        </h3>
                    </div>

                    <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex flex-wrap gap-2.5">
                            {tags.map(tag => (
                                <button 
                                    key={tag} 
                                    onClick={() => {
                                        if (onTagClick) onTagClick(tag);
                                        onClose();
                                    }}
                                    className="px-4 py-2.5 bg-white/[0.03] border border-white/5 hover:border-white/20 text-gray-400 hover:text-white text-[10px] font-bold uppercase rounded-xl tracking-widest transition-all duration-300 active:scale-95"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full mt-10 py-4 bg-white/5 border border-white/5 text-white/40 text-[9px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                    >
                        Закрыть окно
                    </button>
                </div>
            </div>
        </div>
    );
};