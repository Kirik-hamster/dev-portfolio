import React from 'react';
import { Blog, User } from '../../types';
import { Heart, Star, ShieldCheck, User as UserIcon, Folder } from 'lucide-react';

interface BlogCardProps {
    blog: any;
    onNavigate: (id: number) => void;
    onToggleLike: (id: number, type: 'blog') => void;
    onToggleFavorite: (id: number, type: 'blog') => void;
    onOpenTags: (tags: string[], title: string) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onNavigate, onToggleLike, onToggleFavorite, onOpenTags }) => {
    return (
        <div 
            onClick={() => onNavigate(blog.id)} 
            /* Адаптируем padding (p-6 на мобилках) и закругления */
            className="group p-6 sm:p-8 bg-white/[0.02] border border-white/5 rounded-[32px] sm:rounded-[45px] hover:border-blue-500/30 transition-all duration-500 cursor-pointer h-80 flex flex-col relative overflow-hidden backdrop-blur-sm"
        >
            {/* 1. ВЕРХНЯЯ ПАНЕЛЬ: АВТОР И КНОПКИ */}
            <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {blog.user?.role === 'admin' 
                            ? <ShieldCheck size={16} className="sm:size-[18px] text-blue-500" /> 
                            : <UserIcon size={16} className="sm:size-[18px] text-gray-500" />
                        }
                    </div>
                    {/* min-w-0 позволяет truncate работать правильно внутри flex */}
                    <div className="flex flex-col min-w-0">
                        <p className="text-[10px] sm:text-[11px] font-black uppercase text-white/90 leading-tight truncate">
                            {blog.user?.name || 'User'}
                        </p>
                        <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.1em] text-gray-500/80 truncate">
                            {blog.user?.role || 'member'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Кнопки лайков с адаптированным размером */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleLike(blog.id, 'blog'); }} 
                        className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border transition-all active:scale-90
                            ${blog.is_liked 
                                ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                : 'bg-white/5 border-white/5 text-gray-500 hover:text-red-400'}`}
                    >
                        <Heart size={12} className="sm:size-[14px]" fill={blog.is_liked ? "currentColor" : "none"} />
                        <span className="text-[9px] sm:text-[10px] font-black">{blog.likes_count || 0}</span>
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(blog.id, 'blog'); }} 
                        className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-90
                            ${blog.is_favorited 
                                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' 
                                : 'bg-white/5 border-white/5 text-gray-500 hover:text-yellow-400'}`}
                    >
                        <Star size={12} className="sm:size-[14px]" fill={blog.is_favorited ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            {/* 2. КОНТЕНТ */}
            <div className="relative z-10">
                {/* Уменьшаем шрифт заголовка на мобилках */}
                <h3 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 tracking-tighter group-hover:text-blue-400 transition-colors line-clamp-1">
                    {blog.title}
                </h3>
                <p className="text-[11px] sm:text-[12px] text-gray-500 line-clamp-2 leading-relaxed italic font-medium">
                    {blog.description || "Автор еще не добавил описание..."}
                </p>
            </div>

            {/* 3. НИЖНЯЯ ПАНЕЛЬ: ТЕГИ */}
            <div className="mt-auto pt-4 sm:pt-6 border-t border-white/5 relative z-10 flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 h-6 sm:h-7 overflow-hidden flex-grow">
                    {blog.top_tags?.map((tag: string) => (
                        <span key={tag} className="text-[7px] sm:text-[8px] px-2 py-1 sm:px-2.5 sm:py-1.5 bg-blue-500/5 border border-blue-500/10 text-blue-400/70 rounded-lg uppercase font-black whitespace-nowrap tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>
                {blog.top_tags && blog.top_tags.length > 3 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenTags(blog.top_tags, blog.title); }} 
                        className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/5 border border-white/10 text-blue-400 hover:bg-blue-500/20 transition-all text-[9px] sm:text-[10px] font-black shrink-0 active:scale-90"
                    >
                        +
                    </button>
                )}
            </div>

            {/* 4. ДЕКОР: ПАПКА (меньше на мобилках) */}
            <div className="absolute -right-8 -bottom-8 sm:-right-12 sm:-bottom-12 opacity-[0.03] transform rotate-12 pointer-events-none transition-all duration-700 group-hover:scale-125 group-hover:rotate-[20deg] text-white">
                <Folder size={200} className="sm:w-[280px] sm:h-[280px]" strokeWidth={1} />
            </div>
        </div>
    );
};