// resources/js/components/blog/PostCard.tsx
import React from 'react';
import { Heart, Star, ShieldCheck, User as UserIcon, FileText, Pencil, Trash2, Eye, Plus, Info } from 'lucide-react';
import { Article, UserReportContext } from '../../types'; 

interface PostCardProps {
    article: Article;
    mode?: 'public' | 'profile';
    onSelect: (article: Article) => void;
    onToggleLike: (id: number, type: 'article') => void;
    onToggleFavorite: (id: number, type: 'article') => void;
    onOpenTags: (tags: string[], title: string) => void;
    onEdit?: (article: Article) => void;
    onDelete?: (id: number) => void;
    onShowUser: (userId: number, context: UserReportContext) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
    article, mode = 'public', onSelect, onToggleLike, onToggleFavorite, onOpenTags, onEdit, onDelete , onShowUser
}) => {
    const isProfile = mode === 'profile';

    return (
        <div 
            onClick={() => onSelect(article)} 
            className="group bg-[#080808]/40 border border-white/5 rounded-[35px] hover:border-blue-500/30 transition-all duration-500 cursor-pointer min-h-[440px] flex flex-col relative overflow-hidden backdrop-blur-md"
        >
            {/* 1. SYSTEM TITLE BAR (Метрики и управление) */}
            <div className="h-10 bg-white/[0.03] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex gap-1.5 opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-gray-500/50">
                        <Eye size={10} />
                        <span className="text-[9px] font-black">{article.views_count || 0}</span>
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

            {/* 2. КОНТЕНТНАЯ ЧАСТЬ */}
            <div className="flex flex-col flex-1 min-w-0">
                            
                {/* БЛОК АВТОРА (с отступом) */}
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        onShowUser(article.user_id, { id: article.id, type: 'article' });
                    }}
                    className="px-5 pt-2 mb-2 flex items-center gap-2.5 shrink-0 cursor-pointer group/user"
                >
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 group-hover/user:border-blue-500/30 transition-colors">
                        {article.user?.role === 'admin' ? <ShieldCheck size={12} className="text-blue-500" /> : <UserIcon size={12} className="text-gray-500" />}
                    </div>
                    
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-black uppercase text-white/90 truncate leading-none">
                                {article.user?.name || 'User'}
                            </span>
                            {/* Иконка теперь часть строки ника, очень аккуратная */}
                            <Info size={12} className="text-blue-500 opacity-50 group-hover/user:opacity-100 transition-all shrink-0" />
                        </div>
                        <span className="text-[7px] font-bold uppercase text-gray-600 tracking-widest leading-none">
                            {article.user?.role || 'member'}
                        </span>
                    </div>
                </div>
                {/* ОБЛОЖКА (НА ВСЮ ШИРИНУ) */}
                <div className="relative aspect-[21/9] w-full border-y border-white/5 bg-black/40 overflow-hidden shrink-0">
                    {article.image_url ? (
                        <img 
                            src={article.image_url}  
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                            alt="Cover" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/[0.02] to-transparent">
                            <FileText size={32} className="text-white/5" />
                        </div>
                    )}
                </div>

                {/* ТЕКСТОВАЯ ЧАСТЬ (Гибкое описание) */}
                <div className="px-7 pt-5 flex-1 min-w-0 flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight line-clamp-1 shrink-0 mb-1 group-hover:text-blue-400 transition-colors">
                        {article.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 italic opacity-60 leading-relaxed line-clamp-3 whitespace-normal overflow-hidden">
                        {article.content?.replace(/<[^>]*>/g, '') || "Содержимое отсутствует..."}
                    </p>
                </div>

                {/* НИЖНЯЯ ПАНЕЛЬ ТЕГОВ */}
                <div className="px-7 pb-6 mt-4">
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="relative flex-grow overflow-hidden h-7 flex items-center [mask-image:linear-gradient(to_right,white_75%,transparent_100%)]">
                            <div className="flex flex-nowrap gap-2 items-center">
                                {article.tech_stack?.split(',').slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-[8px] px-2.5 py-1.5 bg-blue-500/5 border border-blue-500/10 text-blue-400/70 rounded-lg uppercase font-black whitespace-nowrap shrink-0 tracking-wider">
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {article.tech_stack && article.tech_stack.split(',').length > 2 && (
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onOpenTags(article.tech_stack!.split(',').map(t => t.trim()), article.title); 
                                }}
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
                <FileText size={120} />
            </div>
        </div>
    );
};