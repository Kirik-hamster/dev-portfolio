import React, { useState, useRef, useLayoutEffect } from 'react';
import { ShieldCheck, User as UserIcon, Heart, Star, Folder, ChevronLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Blog } from '../../types';

interface BlogHeaderProps {
    activeBlog: Blog | null;
    mode?: 'public' | 'profile'; // Добавляем режим
    onToggleLike?: (id: number, type: 'blog') => void;
    onToggleFavorite?: (id: number, type: 'blog') => void;
    onOpenTags: (tags: string[], title: string) => void;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({ 
    activeBlog, 
    mode = 'public', 
    onToggleLike, 
    onToggleFavorite, 
    onOpenTags 
}) => {
    const navigate = useNavigate();
    const [isOverflowing, setIsOverflowing] = useState(false);
    const tagsContainerRef = useRef<HTMLDivElement>(null);
    const isProfile = mode === 'profile';

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
            <div className="absolute -right-10 -top-10 opacity-[0.02] text-white rotate-12 pointer-events-none transition-all duration-1000 group-hover/header:scale-110">
                <Folder size={300} strokeWidth={1} />
            </div>

            <div className="relative z-10">
                {/* ВЕРХНИЙ РЯД */}
                <div className="flex flex-col gap-8 lg:flex-row justify-between items-start lg:items-center mb-10 sm:mb-12">
                    
                    {/* ЛОГИКА ШАПКИ: Назад (в профиле) или Автор (в блогах) */}
                    {isProfile ? (
                        <button onClick={() => navigate('/profile/blog')} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all border border-white/5">
                            <ChevronLeft size={24} className="rotate-180" />
                        </button>
                    ) : (
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0">
                                {activeBlog?.user?.role === 'admin' ? <ShieldCheck className="text-blue-500" /> : <UserIcon className="text-gray-500" />}
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter">{activeBlog?.user?.name || 'Загрузка...'}</h2>
                                    <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded uppercase font-black">{activeBlog?.user?.role || 'member'}</span>
                                </div>
                                <span className="text-[8px] font-bold uppercase text-gray-600 tracking-[0.4em]">Автор блога</span>
                            </div>
                        </div>
                    )}

                    {/* СТАТИСТИКА / КНОПКИ */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2.5 px-5 py-3.5 bg-white/[0.03] border border-white/5 rounded-2xl text-gray-500">
                            <Eye size={18} className="opacity-50" />
                            <span className="text-sm font-black tracking-tight">{activeBlog?.total_views || 0}</span>
                        </div>
                        <div 
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all active:scale-95 
                                ${isProfile ? 'bg-white/[0.03] border-white/5 text-gray-500 cursor-default' : 
                                (activeBlog?.is_liked 
                                    ? 'bg-red-500/10 border-red-500/40 text-red-500 cursor-pointer' 
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-white cursor-pointer')}`}
                            onClick={() => {
                                if (!isProfile && activeBlog) {
                                    onToggleLike?.(activeBlog.id, 'blog'); // Безопасный вызов
                                }
                            }}
                        >
                            <Heart size={18} fill={(activeBlog?.is_liked || isProfile) ? "currentColor" : "none"} className={isProfile ? "opacity-20" : ""} />
                            <span className="text-sm font-black">{activeBlog?.likes_count || 0}</span>
                        </div>

                        {!isProfile && (
                            <button onClick={() => onToggleFavorite?.(activeBlog!.id, 'blog')} className={`p-3.5 rounded-2xl border transition-all ${activeBlog?.is_favorited ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                                <Star size={18} fill={activeBlog?.is_favorited ? "currentColor" : "none"} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ЗАГОЛОВОК КАТЕГОРИИ (Только в профиле) */}
                {isProfile && (
                    <div className="mb-10">
                        <span className="text-[8px] font-black uppercase text-blue-500/60 block mb-4 tracking-[0.2em]">Название категории:</span>
                        <h3 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white leading-none">{activeBlog?.title}</h3>
                    </div>
                )}

                {/* ОПИСАНИЕ */}
                <div className="max-w-2xl mb-10">
                    <span className="text-[8px] font-black uppercase text-gray-700 block mb-3 tracking-[0.2em]">Описание</span>
                    <p className="text-[14px] text-gray-400/80 leading-relaxed font-medium border-l border-blue-500/20 pl-6 italic">
                        {activeBlog?.description || "Описание пока не добавлено..."}
                    </p>
                </div>

                {/* ТЕГИ */}
                {activeBlog?.top_tags && activeBlog.top_tags.length > 0 && (
                    <div className="flex flex-col gap-4 mt-10">
                        <span className="text-[8px] font-black uppercase text-gray-700 block tracking-[0.2em]">Популярные теги</span>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow overflow-hidden h-10 flex items-center [mask-image:linear-gradient(to_right,white_80%,transparent_100%)]">
                                <div ref={tagsContainerRef} className="flex gap-2.5 items-center overflow-hidden">
                                    {activeBlog.top_tags.map((tag: string) => (
                                        <span key={tag} className="px-4 py-2 bg-white/[0.03] border border-white/5 text-gray-500 text-[9px] font-black uppercase rounded-xl whitespace-nowrap">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                            {isOverflowing && (
                                <button 
                                    onClick={() => onOpenTags(
                                        activeBlog?.top_tags || [],
                                        activeBlog?.title || activeBlog?.user?.name || 'Категория'
                                    )} 
                                    className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black shrink-0 hover:bg-blue-500 hover:text-white transition-all"
                                >
                                    ВСЕ
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};