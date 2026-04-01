// resources/js/components/BlogCard.tsx
import React from 'react';
import { Heart, Star, ShieldCheck, User as UserIcon, Folder, Pencil, Trash2, Eye, Plus } from 'lucide-react';
import { Blog } from '../../types';

interface BlogCardProps {
    blog: Blog;
    mode?: 'public' | 'profile';
    onNavigate: (id: number) => void;
    onToggleLike?: (id: number, type: 'blog') => void;
    onToggleFavorite?: (id: number, type: 'blog') => void;
    onOpenTags: (tags: string[], title: string) => void;
    onEdit?: (blog: Blog) => void;
    onDelete?: (id: number) => void;
    onShowUser: (userId: number, context: any) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
    blog, mode = 'public', onNavigate, onToggleLike, onToggleFavorite, onOpenTags, onEdit, onDelete, onShowUser
}) => {
    const isProfile = mode === 'profile';

    return (
        <div 
            onClick={() => onNavigate(blog.id)} 
            className="group bg-[#080808]/40 border border-white/5 rounded-[35px] hover:border-blue-500/30 transition-all duration-500 cursor-pointer min-h-[440px] flex flex-col relative overflow-hidden backdrop-blur-md"
        >
            {/* 1. ШАПКА ОКНА (Метрики) */}
            <div className="h-10 bg-white/[0.03] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex gap-1.5 opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-gray-500/50">
                        <Eye size={10} />
                        <span className="text-[9px] font-black">{blog.total_views || 0}</span>
                    </div>
                    <div className="w-px h-2.5 bg-white/10" />
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
            <div className="flex flex-col flex-1 min-w-0">
                
                {/* БЛОК АВТОРА (с отступом) */}
                <div 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onShowUser(blog.user_id, { id: blog.id, type: 'blog' }); 
                    }}
                    className="px-5 pt-2 mb-2 flex items-center gap-2.5 shrink-0"
                >
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        {blog.user?.role === 'admin' ? <ShieldCheck size={12} className="text-blue-500" /> : <UserIcon size={12} className="text-gray-500" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black uppercase text-white/90 truncate leading-none mb-0.5">{blog.user?.name || 'User'}</span>
                        <span className="text-[7px] font-bold uppercase text-gray-600 tracking-widest leading-none">{blog.user?.role || 'member'}</span>
                    </div>
                </div>

                {/* ОБЛОЖКА (НА ВСЮ ШИРИНУ) */}
                <div className="relative aspect-[21/9] w-full border-y border-white/5 bg-black/40 overflow-hidden shrink-0">
                    {blog.image_url ? (
                        <img 
                            src={blog.image_url} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                            alt="Cover" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/[0.02] to-transparent">
                            <Folder size={32} className="text-white/5" />
                        </div>
                    )}
                </div>

                {/* ТЕКСТОВАЯ ЧАСТЬ */}
                <div className="px-7 pt-5 flex-1 min-w-0 flex flex-col">
                    {/* Заголовок — строго 1 строка, чтобы не «толкать» описание */}
                    <h3 className="text-lg font-black text-white uppercase tracking-tight line-clamp-1 shrink-0 mb-1 group-hover:text-blue-400 transition-colors">
                        {blog.title}
                    </h3>
                    
                    {/* Описание — займет от 1 до 3 строк, в зависимости от того, сколько места осталось */}
                    <p className="text-[11px] text-gray-500 italic opacity-60 leading-relaxed line-clamp-3 whitespace-normal overflow-hidden">
                        {blog.description || "Описание пространства..."}
                    </p>
                </div>

                {/* НИЖНЯЯ ПАНЕЛЬ ТЕГОВ */}
                <div className="px-7 pb-6 mt-4">
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="relative flex-grow overflow-hidden h-7 flex items-center [mask-image:linear-gradient(to_right,white_75%,transparent_100%)]">
                            <div className="flex flex-nowrap gap-2 items-center">
                                {blog.top_tags?.map((tag: string, i: number) => (
                                    <span key={i} className="text-[8px] px-2.5 py-1.5 bg-blue-500/5 border border-blue-500/10 text-blue-400/70 rounded-lg uppercase font-black whitespace-nowrap shrink-0 tracking-wider">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {blog.top_tags && blog.top_tags.length > 2 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onOpenTags(blog.top_tags ?? [], blog.title); }}
                                className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shrink-0 active:scale-90 shadow-lg"
                            >
                                <Plus size={14} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ФОНОВЫЙ ДЕКОР */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] text-white rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Folder size={120} />
            </div>
        </div>
    );
};