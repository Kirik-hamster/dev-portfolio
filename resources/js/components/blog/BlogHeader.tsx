import React, { useState, useRef, useLayoutEffect } from 'react';
import { ShieldCheck, User as UserIcon, Heart, Star, Folder, Tag } from 'lucide-react';

interface BlogHeaderProps {
    activeBlog: any;
    onToggleLike: (id: number, type: 'blog') => void;
    onToggleFavorite: (id: number, type: 'blog') => void;
    onOpenTags: (tags: string[], title: string) => void;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({ activeBlog, onToggleLike, onToggleFavorite, onOpenTags }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const tagsContainerRef = useRef<HTMLDivElement>(null);

    const checkOverflow = () => {
        if (tagsContainerRef.current) {
            const { scrollWidth, clientWidth } = tagsContainerRef.current;
            setIsOverflowing(scrollWidth > clientWidth);
        }
    };

    useLayoutEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [activeBlog?.top_tags]);

    return (
        <div className="mb-8 sm:mb-16 p-6 sm:p-12 bg-white/[0.02] border border-white/5 rounded-[32px] sm:rounded-[60px] relative overflow-hidden backdrop-blur-3xl group/header transition-all duration-700 hover:border-white/10">
            {/* ФОНОВАЯ ПАПКА: Скрываем на самых маленьких экранах или уменьшаем */}
            <div className="absolute -right-10 -bottom-10 sm:-right-20 sm:-bottom-20 opacity-[0.02] sm:opacity-[0.03] text-white rotate-12 pointer-events-none transition-all duration-1000 group-hover/header:scale-110 group-hover/header:rotate-[20deg]">
                <Folder size={250} className="sm:w-[400px] sm:h-[400px]" strokeWidth={1} />
            </div>

            <div className="relative z-10">
                {/* ВЕРХНИЙ БЛОК: Автор и Кнопки */}
                <div className="flex flex-col gap-8 lg:flex-row justify-between items-start lg:items-center mb-10 sm:mb-12">
                    
                    {/* АВТОР: Адаптивные размеры аватара и текста */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50" />
                            {activeBlog?.user?.role === 'admin' 
                                ? <ShieldCheck size={24} className="sm:size-8 text-blue-500 relative z-10" /> 
                                : <UserIcon size={24} className="sm:size-8 text-gray-500 relative z-10" />
                            }
                        </div>
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter leading-none">
                                    {activeBlog?.user?.name || 'Загрузка...'}
                                </h2>
                                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md font-black uppercase tracking-widest">
                                    {activeBlog?.user?.role || 'member'}
                                </span>
                            </div>
                            <span className="text-[8px] sm:text-[10px] font-bold uppercase text-gray-600 tracking-[0.2em] sm:tracking-[0.4em]">Автор блога</span>
                        </div>
                    </div>

                    {/* КНОПКИ ДЕЙСТВИЯ: Теперь в ряд даже на мобилках */}
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <button 
                            onClick={() => onToggleLike(activeBlog!.id, 'blog')} 
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl sm:rounded-[24px] border transition-all duration-500 active:scale-95 
                                ${activeBlog?.is_liked ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.15)]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'}`}
                        >
                            <Heart size={18} className="sm:size-5" fill={activeBlog?.is_liked ? "currentColor" : "none"} />
                            <span className="text-xs sm:text-sm font-black">{activeBlog?.likes_count || 0}</span>
                        </button>
                        <button 
                            onClick={() => onToggleFavorite(activeBlog!.id, 'blog')} 
                            className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-[24px] border transition-all duration-500 active:scale-95
                                ${activeBlog?.is_favorited ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.15)]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'}`}
                        >
                            <Star size={18} className="sm:size-5" fill={activeBlog?.is_favorited ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>

                {/* ОПИСАНИЕ: Уменьшаем шрифт и отступы */}
                <div className="max-w-2xl mb-10 sm:mb-12">
                    <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-700 block mb-3 tracking-[0.2em]">Описание / О себе</span>
                    <p className="text-[13px] sm:text-[15px] text-gray-400/80 leading-relaxed font-medium border-l border-blue-500/20 pl-4 sm:pl-8 italic">
                        {activeBlog?.description || "Автор еще не добавил описание..."}
                    </p>
                </div>

                {/* ТЕГИ */}
                {activeBlog?.top_tags && activeBlog.top_tags.length > 0 && (
                    <div className="flex flex-col gap-3 sm:gap-4 mt-8 sm:mt-10">
                        <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-700 block italic tracking-[0.15em] sm:tracking-[0.2em]">Популярные теги блога</span>
                        
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                            <div className="flex-grow overflow-hidden h-8 sm:h-10 flex items-center [mask-image:linear-gradient(to_right,white_80%,transparent_100%)]">
                                <div 
                                    ref={tagsContainerRef}
                                    className="flex flex-nowrap gap-2 sm:gap-2.5 items-center overflow-hidden w-full"
                                >
                                    {activeBlog.top_tags.map((tag: string) => (
                                        <span key={tag} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/[0.03] border border-white/5 text-gray-500 text-[8px] sm:text-[9px] font-black uppercase rounded-lg sm:rounded-xl tracking-widest hover:text-blue-400 hover:border-blue-400/30 transition-all cursor-default whitespace-nowrap shrink-0">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {isOverflowing && (
                                <button 
                                    onClick={() => onOpenTags(activeBlog.top_tags, activeBlog.user?.name)} 
                                    className="flex items-center justify-center px-3 sm:px-4 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[8px] sm:text-[10px] font-black shrink-0 active:scale-90"
                                >
                                    СМОТРЕТЬ ВСЕ
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};