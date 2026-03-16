// resources/js/components/BlogCard.tsx
import React from 'react';
import { Heart, Star, ShieldCheck, User as UserIcon, Folder, Pencil, Trash2, Eye, Plus } from 'lucide-react';

interface BlogCardProps {
    blog: any;
    mode?: 'public' | 'profile';
    onNavigate: (id: number) => void;
    onToggleLike?: (id: number, type: 'blog') => void;
    onToggleFavorite?: (id: number, type: 'blog') => void;
    onOpenTags: (tags: string[], title: string) => void;
    onEdit?: (blog: any) => void;
    onDelete?: (id: number) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
    blog, mode = 'public', onNavigate, onToggleLike, onToggleFavorite, onOpenTags, onEdit, onDelete
}) => {
    const isProfile = mode === 'profile';

    return (
        <div 
            onClick={() => onNavigate(blog.id)} 
            className="group bg-white/[0.01] border border-white/5 rounded-[40px] hover:border-blue-500/20 transition-all duration-500 cursor-pointer h-[400px] flex flex-col relative overflow-hidden backdrop-blur-sm"
        >
            {/* 1. SYSTEM TITLE BAR (ШАПКА ОКНА) */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-white/[0.03] border-b border-white/5 flex items-center justify-between px-6 z-30">
                {/* Левая часть: Кнопки macOS */}
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>

                {/* Правая часть: Показатели */}
                <div className="flex items-center gap-3">
                    {/* Просмотры всего блога */}
                    <div className="flex items-center gap-1.5 text-gray-500/50">
                        <Eye size={11} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{blog.total_views || 0}</span>
                    </div>

                    <div className="w-px h-2.5 bg-white/10" />

                    {/* Лайки блога */}
                    <div 
                        onClick={(e) => { e.stopPropagation(); if(!isProfile) onToggleLike?.(blog.id, 'blog'); }}
                        className={`flex items-center gap-1.5 transition-all ${blog.is_liked ? 'text-red-500' : 'text-gray-500/50 hover:text-white'}`}
                    >
                        <Heart size={11} fill={blog.is_liked ? "currentColor" : "none"} />
                        <span className="text-[9px] font-black">{blog.likes_count || 0}</span>
                    </div>

                    {/* Избранное (Звездочка) */}
                    {!isProfile && (
                        <div 
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(blog.id, 'blog'); }}
                            className={`transition-all ${blog.is_favorited ? 'text-yellow-500' : 'text-gray-500/50 hover:text-white'}`}
                        >
                            <Star size={11} fill={blog.is_favorited ? "currentColor" : "none"} />
                        </div>
                    )}

                    {/* Управление для профиля */}
                    {isProfile && (
                        <div className="flex items-center gap-2 ml-1 pl-2 border-l border-white/10">
                            <Pencil size={11} className="text-gray-500 hover:text-blue-400" onClick={(e) => { e.stopPropagation(); onEdit?.(blog); }} />
                            <Trash2 size={11} className="text-gray-500 hover:text-red-500" onClick={(e) => { e.stopPropagation(); onDelete?.(blog.id); }} />
                        </div>
                    )}
                </div>
            </div>

            {/* 2. КОНТЕНТНАЯ ЧАСТЬ */}
            <div className="flex-1 flex flex-col pt-14 px-7 pb-8 relative z-10">
                
                {/* БЛОК АВТОРА */}
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/5">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        {blog.user?.role === 'admin' ? <ShieldCheck size={14} className="text-blue-500" /> : <UserIcon size={14} className="text-gray-400" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase text-white/90 truncate leading-none mb-1">{blog.user?.name || 'User'}</span>
                        <span className="text-[7px] font-bold uppercase text-gray-600 tracking-widest">{blog.user?.role || 'member'}</span>
                    </div>
                </div>

                {/* ТИТУЛ И ТЕКСТ */}
                <div className="flex-1">
                    <h3 className="text-xl font-black mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 tracking-tighter leading-tight uppercase">
                        {blog.title}
                    </h3>
                    <p className="text-gray-500 italic font-medium leading-relaxed text-[13px] line-clamp-3 opacity-70">
                        {blog.description || "Автор еще не добавил описание..."}
                    </p>
                </div>

                {/* НИЖНЯЯ ПАНЕЛЬ (ТЕГИ) */}
                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="relative flex-grow overflow-hidden h-7 flex items-center [mask-image:linear-gradient(to_right,white_75%,transparent_100%)]">
                        <div className="flex flex-nowrap gap-2 items-center">
                            {blog.top_tags?.map((tag: string, i: number) => (
                                <span key={i} className="text-[8px] px-2.5 py-1.5 bg-blue-500/5 border border-blue-500/10 text-blue-400/70 rounded-lg uppercase font-black whitespace-nowrap shrink-0 tracking-wider">#{tag}</span>
                            ))}
                        </div>
                    </div>
                    {blog.top_tags && blog.top_tags.length > 3 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onOpenTags(blog.top_tags, blog.title); }} 
                            className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shrink-0 active:scale-90 shadow-lg"                        
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>

            {/* ДЕКОР (Папка вместо текста) */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.02] transform rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700 text-white">
                <Folder size={180} />
            </div>
        </div>
    );
};