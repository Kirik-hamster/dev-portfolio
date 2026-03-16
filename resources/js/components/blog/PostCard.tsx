// resources/js/components/blog/PostCard.tsx
import React from 'react';
import { Heart, Star, ShieldCheck, User as UserIcon, FileText, Pencil, Trash2, Eye, Plus } from 'lucide-react';
// Импортируем интерфейс Article
import { Article } from '../../types'; 

interface PostCardProps {
    article: Article; // Заменили any на Article
    mode?: 'public' | 'profile';
    onSelect: (article: Article) => void; // Заменили any
    onToggleLike: (id: number, type: 'article') => void;
    onToggleFavorite: (id: number, type: 'article') => void;
    onOpenTags: (tags: string[], title: string) => void;
    onEdit?: (article: Article) => void; // Заменили any
    onDelete?: (id: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
    article, mode = 'public', onSelect, onToggleLike, onToggleFavorite, onOpenTags, onEdit, onDelete 
}) => {
    const isProfile = mode === 'profile';

    return (
        <div 
            onClick={() => onSelect(article)} 
            className="group bg-white/[0.01] border border-white/5 rounded-[40px] hover:border-blue-500/20 transition-all duration-500 cursor-pointer h-[420px] flex flex-col relative overflow-hidden backdrop-blur-sm"
        >
            {/* 1. SYSTEM TITLE BAR */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-white/[0.03] border-b border-white/5 flex items-center justify-between px-6 z-30">
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-gray-500/50">
                        <Eye size={11} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{article.views_count || 0}</span>
                    </div>

                    <div className="w-px h-2.5 bg-white/10" />

                    <div 
                        onClick={(e) => { e.stopPropagation(); if(!isProfile) onToggleLike(article.id, 'article'); }}
                        className={`flex items-center gap-1.5 transition-all ${article.is_liked ? 'text-red-500' : 'text-gray-500/50 hover:text-white'}`}
                    >
                        <Heart size={11} fill={article.is_liked ? "currentColor" : "none"} />
                        <span className="text-[9px] font-black">{article.likes_count || 0}</span>
                    </div>

                    {!isProfile && (
                        <div 
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(article.id, 'article'); }}
                            className={`transition-all ${article.is_favorited ? 'text-yellow-500' : 'text-gray-500/50 hover:text-white'}`}
                        >
                            <Star size={11} fill={article.is_favorited ? "currentColor" : "none"} />
                        </div>
                    )}

                    {isProfile && (
                        <div className="flex items-center gap-2 ml-1 pl-2 border-l border-white/10">
                            <Pencil size={11} className="text-gray-500 hover:text-blue-400" onClick={(e) => { e.stopPropagation(); onEdit?.(article); }} />
                            <Trash2 size={11} className="text-gray-500 hover:text-red-500" onClick={(e) => { e.stopPropagation(); onDelete?.(article.id); }} />
                        </div>
                    )}
                </div>
            </div>

            {/* 2. CONTENT AREA */}
            <div className="flex-1 flex flex-col pt-14 px-7 pb-8 relative z-10">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/5">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        {article.user?.role === 'admin' ? <ShieldCheck size={14} className="text-blue-500"/> : <UserIcon size={14} className="text-gray-400"/>}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase text-white/90 truncate leading-none mb-1">{article.user?.name}</span>
                        <span className="text-[7px] font-bold uppercase text-gray-600 tracking-widest">{article.user?.role}</span>
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-black mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 tracking-tighter leading-tight uppercase">
                        {article.title}
                    </h3>
                    <p className="text-gray-500 italic font-medium leading-relaxed text-[13px] line-clamp-3 opacity-70">
                        {article.content?.replace(/<[^>]*>/g, '').substring(0, 180)}...
                    </p>
                </div>

                {/* 3. TAGS PANEL */}
                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="relative flex-grow overflow-hidden h-7 flex items-center [mask-image:linear-gradient(to_right,white_75%,transparent_100%)]">
                        <div className="flex flex-nowrap gap-2 items-center">
                            {article.tech_stack?.split(',').map((t: string, i: number) => (
                                <span key={i} className="text-[8px] px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-gray-500 uppercase font-black tracking-widest whitespace-nowrap shrink-0">{t.trim()}</span>
                            ))}
                        </div>
                    </div>
                    {article.tech_stack && article.tech_stack.split(',').length > 3 && (
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                // ТУТ ИСПРАВИЛИ: Добавили тип (t: string)
                                onOpenTags(article.tech_stack!.split(',').map((t: string) => t.trim()), article.title); 
                            }} 
                            className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shrink-0 active:scale-90 shadow-lg"
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>

            <div className="absolute -right-6 -bottom-6 opacity-[0.02] transform -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700 text-white">
                <FileText size={180} />
            </div>
        </div>
    );
};