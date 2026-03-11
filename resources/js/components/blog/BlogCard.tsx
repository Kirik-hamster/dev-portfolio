import React from 'react';
import { Heart, Star, ShieldCheck, User as UserIcon, Folder, Pencil, Trash2 } from 'lucide-react';

interface BlogCardProps {
    blog: any;
    mode?: 'public' | 'profile'; // Добавляем переключатель режима
    onNavigate: (id: number) => void;
    onToggleLike?: (id: number, type: 'blog') => void;
    onToggleFavorite?: (id: number, type: 'blog') => void;
    onOpenTags: (tags: string[], title: string) => void;
    onEdit?: (blog: any) => void;
    onDelete?: (id: number) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
    blog, 
    mode = 'public', 
    onNavigate, 
    onToggleLike, 
    onToggleFavorite, 
    onOpenTags,
    onEdit, onDelete
}) => {
    const isProfile = mode === 'profile';

    return (
        <div 
            onClick={() => onNavigate(blog.id)} 
            className="group p-6 sm:p-8 bg-white/[0.02] border border-white/5 rounded-[32px] sm:rounded-[45px] hover:border-blue-500/30 transition-all duration-500 cursor-pointer h-80 flex flex-col relative overflow-hidden backdrop-blur-sm"
        >
            {/* 1. ВЕРХНЯЯ ПАНЕЛЬ */}
            <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10 gap-2 w-full">
                
                {/* ЛЕВАЯ ЧАСТЬ: Автор (в блогах) или Заголовок (в профиле) */}
                {!isProfile ? (
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            {blog.user?.role === 'admin' 
                                ? <ShieldCheck size={18} className="text-blue-500" /> 
                                : <UserIcon size={18} className="text-gray-500" />
                            }
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-[11px] font-black uppercase text-white/90 leading-tight truncate">{blog.user?.name || 'User'}</p>
                            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-gray-500/80 truncate">{blog.user?.role || 'member'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-[60%] sm:w-[65%] min-w-0 pr-2">
                        <h3 className="text-lg sm:text-xl font-black tracking-tighter group-hover:text-blue-400 transition-colors line-clamp-2 leading-none break-words">
                            {blog.title}
                        </h3>
                    </div>
                )}

                {/* ПРАВАЯ ЧАСТЬ: Кнопки */}

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
                    {isProfile && (
                        <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEdit?.(blog); }}
                                className="p-2 bg-white/5 hover:bg-blue-500/20 text-gray-500 hover:text-blue-500 rounded-xl border border-white/5 transition-all"
                            >
                                <Pencil size={13} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete?.(blog.id); }}
                                className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-xl border border-white/5 transition-all"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    )}
                    {/* ЛАЙКИ: Не кликабельны в профиле */}
                    <div 
                        onClick={(e) => { 
                            if (isProfile) return; 
                            e.stopPropagation(); 
                            onToggleLike?.(blog.id, 'blog'); 
                        }} 
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl border transition-all min-w-fit 
                            ${isProfile ? 'bg-white/5 border-white/5 text-gray-500' :
                            (blog.is_liked ? 'bg-red-500/10 border-red-500/20 text-red-500 active:scale-90' : 'bg-white/5 border-white/5 text-gray-500 hover:text-red-400 active:scale-90')}`}
                    >
                        <Heart size={14} fill={(blog.is_liked || isProfile) ? "currentColor" : "none"} className={isProfile ? "opacity-20" : ""} />
                        <span className="text-xs font-black">{blog.likes_count || 0}</span>
                    </div>
                    
                    {/* ИЗБРАННОЕ: Скрыто в профиле */}
                    {!isProfile && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(blog.id, 'blog'); }} 
                            className={`p-2 rounded-xl border transition-all active:scale-90
                                ${blog.is_favorited ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-white/5 border-white/5 text-gray-500 hover:text-yellow-400'}`}
                        >
                            <Star size={14} fill={blog.is_favorited ? "currentColor" : "none"} />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. КОНТЕНТ (Описание) */}
            <div className="relative z-10 flex-1">
                {/* В обычном режиме здесь еще и заголовок, в профиле он уже ушел наверх */}
                {!isProfile && (
                    <h3 className="text-xl sm:text-2xl font-black mb-3 tracking-tighter group-hover:text-blue-400 transition-colors line-clamp-1">
                        {blog.title}
                    </h3>
                )}
                <p className={`text-gray-500 leading-relaxed italic font-medium ${isProfile ? 'text-[13px] line-clamp-4' : 'text-[12px] line-clamp-2'}`}>
                    {blog.description || "Автор еще не добавил описание..."}
                </p>
            </div>

            {/* 3. НИЖНЯЯ ПАНЕЛЬ: ТЕГИ */}
            <div className="mt-auto pt-6 border-t border-white/5 relative z-10 flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2 h-7 overflow-hidden flex-grow">
                    {blog.top_tags?.map((tag: string) => (
                        <span key={tag} className="text-[8px] px-2.5 py-1.5 bg-blue-500/5 border border-blue-500/10 text-blue-400/70 rounded-lg uppercase font-black whitespace-nowrap tracking-wider">
                            #{tag}
                        </span>
                    ))}
                </div>
                {blog.top_tags && blog.top_tags.length > 3 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenTags(blog.top_tags, blog.title); }} 
                        className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[10px] font-black shrink-0 active:scale-90"
                    >
                        +
                    </button>
                )}
            </div>

            {/* 4. ДЕКОР */}
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] transform rotate-12 pointer-events-none transition-all duration-700 group-hover:scale-125 text-white">
                <Folder size={200} strokeWidth={1} />
            </div>
        </div>
    );
};