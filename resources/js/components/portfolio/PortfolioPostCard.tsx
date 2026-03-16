import React from 'react';
import { Heart, Star, Edit3, Trash2, Eye, Layout, Plus, MessageSquare } from 'lucide-react';
import { Article } from '../../types';

interface PortfolioPostCardProps {
    article: Article;
    isAdmin: boolean;
    onSelect: (article: Article) => void;
    onToggleLike: (e: React.MouseEvent, article: Article) => void;
    onToggleFavorite: (e: React.MouseEvent, article: Article) => void;
    onOpenTags: (tags: string[], title: string) => void;
    onEdit: (article: Article) => void;
    onDelete: (id: number) => void;
}

// resources/js/components/portfolio/PortfolioPostCard.tsx

export const PortfolioPostCard: React.FC<PortfolioPostCardProps> = ({
    article, isAdmin, onSelect, onToggleLike, onToggleFavorite, onOpenTags, onEdit, onDelete
}) => {
    return (
        <div 
            onClick={() => onSelect(article)} 
            className="group cursor-pointer relative flex flex-col bg-[#0a0a0a] border border-white/5 rounded-[45px] overflow-hidden transition-all duration-500 hover:border-blue-500/20 hover:bg-[#0c0c0c] shadow-3xl h-full"
        >
            {/* 1. PREMIUM SYSTEM TITLE BAR */}
<div className="absolute top-0 left-0 right-0 h-14 bg-white/[0.01] border-b border-white/5 flex items-center justify-between px-10 z-30 backdrop-blur-md">
    {/* macOS Style Dots */}
    <div className="flex gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
    </div>

    {/* Metrics & Actions (Без капсул, только чистые линии) */}
    <div className="flex items-center gap-6">
        <div className="flex items-center gap-5">
            {/* Views */}
            <div className="flex items-center gap-2 text-gray-500/40">
                <Eye size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{article.views_count || 0}</span>
            </div>

            <div className="w-px h-3 bg-white/10" />

            {/* Comments */}
            <div className="flex items-center gap-2 text-gray-500/40">
                <MessageSquare size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{article.comments_count || 0}</span>
            </div>

            <div className="w-px h-3 bg-white/10" />

            {/* Likes */}
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleLike(e, article); }}
                className={`flex items-center gap-2 transition-all ${article.is_liked ? 'text-red-500' : 'text-gray-500/40 hover:text-white'}`}
            >
                <Heart size={12} fill={article.is_liked ? "currentColor" : "none"} />
                <span className="text-[10px] font-black">{article.likes_count || 0}</span>
            </button>
        </div>

        {/* Star (Избранное) */}
        <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(e, article); }}
            className={`transition-all ${article.is_favorited ? 'text-yellow-500' : 'text-gray-500/40 hover:text-white'}`}
        >
            <Star size={13} fill={article.is_favorited ? "currentColor" : "none"} />
        </button>

        {/* Admin Tools */}
        {isAdmin && (
            <div className="flex items-center gap-4 ml-2 pl-6 border-l border-white/10">
                <Edit3 size={13} className="text-gray-500/40 hover:text-blue-400 transition-colors" onClick={(e) => { e.stopPropagation(); onEdit(article); }} />
                <Trash2 size={13} className="text-gray-500/40 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); onDelete(article.id); }} />
            </div>
        )}
    </div>
</div>

            {/* 2. PREVIEW AREA */}
            <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/5 overflow-hidden pt-14">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-1000">
                    <Layout size={100} strokeWidth={1} />
                </div>
                
                {/* Исправленный "Овал" (Тип проекта) - показываем только если есть текст */}
                {article.type && (
                    <div className="absolute bottom-6 left-10">
                        <div className="px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded-lg backdrop-blur-md">
                            <span className="text-[9px] font-black uppercase text-blue-500/80 tracking-[0.2em]">
                                {article.type}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. CONTENT AREA */}
            <div className="p-10 flex flex-col flex-1 relative z-10">
                <h3 className="text-2xl font-black tracking-tighter leading-tight group-hover:text-blue-400 transition-colors text-white uppercase mb-4">
                    {article.title}
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-10 italic font-medium opacity-70">
                    {article.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>

                {/* BOTTOM PANEL */}
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="relative flex-grow overflow-hidden h-8 flex items-center [mask-image:linear-gradient(to_right,white_80%,transparent_100%)]">
                        <div className="flex flex-nowrap gap-2.5 items-center">
                            {article.tech_stack?.split(',').map((t: string, i: number) => (
                                <span key={i} className="text-[9px] px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-gray-500 uppercase font-black tracking-widest whitespace-nowrap shrink-0">{t.trim()}</span>
                            ))}
                        </div>
                    </div>
                    
                    {article.tech_stack && article.tech_stack.split(',').length > 2 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onOpenTags(article.tech_stack!.split(','), article.title); }} 
                            className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-blue-400 rounded-xl transition-all hover:bg-blue-500 hover:text-white active:scale-90 shrink-0"
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};