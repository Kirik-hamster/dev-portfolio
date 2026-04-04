// resources/js/components/blog/BlogHeader.tsx
import React, { useState, useRef, useLayoutEffect } from 'react';
import { ShieldCheck, User as UserIcon, Heart, Star, Folder, ChevronLeft, Eye, Tag, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Blog } from '../../types';

interface BlogHeaderProps {
    activeBlog: Blog | null;
    mode?: 'public' | 'profile';
    onToggleLike?: (id: number, type: 'blog') => void;
    onToggleFavorite?: (id: number, type: 'blog') => void;
    onOpenTags: (tags: string[], title: string) => void;
    onShowUser: (userId: number, context: any) => void;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({ 
    activeBlog, 
    mode = 'public', 
    onToggleLike, 
    onToggleFavorite, 
    onOpenTags,
    onShowUser
}) => {
    const navigate = useNavigate();
    const tagsContainerRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
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
        <div className="mb-10 sm:mb-20 bg-white/[0.01] border border-white/5 rounded-[40px] sm:rounded-[65px] relative overflow-hidden backdrop-blur-3xl group/header transition-all duration-700">
            
            {/* 1. БАННЕР 21:9 (ФОН) */}
            <div className="relative aspect-[21/9] w-full overflow-hidden shrink-0">
                {activeBlog?.image_url ? (
                    <>
                        <img 
                            src={activeBlog.image_url} 
                            className="w-full h-full object-cover transition-transform duration-[3s] group-hover/header:scale-110" 
                            alt="Header" 
                        />
                        {/* Затемнение для читаемости текста */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />
                        <div className="absolute inset-0 bg-black/20" />
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 flex items-center justify-center">
                        <Folder size={80} className="text-white/[0.03]" />
                    </div>
                )}

                {/* Кнопка "Назад" поверх обложки */}
                {isProfile && (
                    <button 
                        onClick={() => navigate('/profile/blog')} 
                        className="absolute top-8 left-8 p-4 bg-black/40 hover:bg-white text-white hover:text-black rounded-2xl transition-all border border-white/10 backdrop-blur-xl z-30 group/back"
                    >
                        <ChevronLeft size={20} className="group-hover/back:-translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            {/* 2. КОНТЕНТНАЯ ЧАСТЬ (Наплывает на баннер) */}
            <div className="relative z-10 px-8 sm:px-16 pb-12 -mt-16 sm:-mt-24">
                
                {/* ВЕРХНИЙ РЯД: АВТОР И СТАТИСТИКА */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                    
                    {/* АВТОРСКИЙ БЛОК */}
                    <div 
                        onClick={() => activeBlog && onShowUser(activeBlog.user_id, { id: activeBlog.id, type: 'blog' })}
                        className="flex items-center gap-5 sm:gap-7 cursor-pointer group/user w-full min-w-0" // Добавили min-w-0
                    >
                        <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-[35px] sm:rounded-[45px] bg-[#0a0a0a] border-4 border-[#080808] flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group/avatar">
                            {activeBlog?.user?.role === 'admin' 
                                ? <ShieldCheck size={40} className="text-blue-500" /> 
                                : <UserIcon size={40} className="text-gray-600" />
                            }
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="flex flex-col gap-2 flex-1 min-w-0 pt-4">
                            <div className="flex items-center gap-3 w-full">
                                <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none truncate">
                                    {isProfile ? activeBlog?.title : activeBlog?.user?.name}
                                </h2>
                                
                                <div className="shrink-0 p-2 rounded-full bg-white/5 border border-white/10 text-gray-500 group-hover/user:text-blue-500 group-hover/user:border-blue-500/30 transition-all active:scale-90">
                                    <Info size={18} />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {!isProfile && (
                                    <span className="text-[8px] px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md font-black uppercase tracking-widest shrink-0">
                                        {activeBlog?.user?.role}
                                    </span>
                                )}
                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] truncate">
                                    {isProfile ? "Category Workspace" : "Автор"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* КНОПКИ ДЕЙСТВИЯ / СТАТИСТИКА */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-3 px-6 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-gray-400">
                            <Eye size={16} />
                            <span className="text-xs font-black uppercase">{activeBlog?.total_views || 0}</span>
                        </div>
                        
                        <button 
                            onClick={() => !isProfile && onToggleLike?.(activeBlog!.id, 'blog')}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all active:scale-95 font-black text-[11px] uppercase tracking-widest
                                ${activeBlog?.is_liked 
                                    ? 'bg-red-500 text-white border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <Heart size={16} fill={activeBlog?.is_liked ? "currentColor" : "none"} />
                            {activeBlog?.likes_count || 0}
                        </button>

                        {!isProfile && (
                            <button 
                                onClick={() => onToggleFavorite?.(activeBlog!.id, 'blog')}
                                className={`p-4 rounded-2xl border transition-all ${activeBlog?.is_favorited ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                            >
                                <Star size={18} fill={activeBlog?.is_favorited ? "currentColor" : "none"} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ОПИСАНИЕ */}
                <div className="max-w-3xl mb-12">
                    <p className="text-[15px] sm:text-lg text-gray-400/90 leading-relaxed font-medium border-l-2 border-blue-600/30 pl-8 italic">
                        {activeBlog?.description || "This workspace has no description yet. Explore the articles below to learn more about the contents of this folder."}
                    </p>
                </div>

                {/* ТЕГИ */}
                {activeBlog?.top_tags && activeBlog.top_tags.length > 0 && (
                    <div className="flex flex-col gap-6 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-3 text-blue-500/40">
                            <Tag size={12} />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Теги</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow overflow-hidden h-11 flex items-center [mask-image:linear-gradient(to_right,white_80%,transparent_100%)]">
                                <div ref={tagsContainerRef} className="flex gap-3 items-center overflow-hidden">
                                    {activeBlog.top_tags.map((tag: string) => (
                                        <span key={tag} className="px-5 py-2.5 bg-white/[0.03] border border-white/5 text-gray-500 text-[10px] font-black uppercase rounded-xl hover:text-white hover:border-white/20 transition-all cursor-default">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {isOverflowing && (
                                <button 
                                    onClick={() => onOpenTags(activeBlog.top_tags || [], activeBlog.title)}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                >
                                    View All
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};