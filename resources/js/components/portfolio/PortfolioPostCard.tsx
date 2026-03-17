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

export const PortfolioPostCard: React.FC<PortfolioPostCardProps> = ({
    article, isAdmin, onSelect, onToggleLike, onToggleFavorite, onOpenTags, onEdit, onDelete
}) => {
    return (
        <div 
            onClick={() => onSelect(article)} 
            className="group cursor-pointer relative flex flex-col bg-white/[0.01] border border-white/5 rounded-[24px] sm:rounded-[45px] overflow-hidden transition-all duration-700 hover:border-blue-500/30 hover:bg-white/[0.02] backdrop-blur-2xl shadow-2xl h-full"
        >
            <div className="absolute top-0 left-0 right-0 h-12 sm:h-14 bg-white/[0.01] border-b border-white/5 flex items-center justify-between px-5 sm:px-10 z-30 backdrop-blur-md">
                
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="flex gap-1.5 sm:gap-2.5 opacity-20 group-hover:opacity-60 transition-opacity">
                    <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-white/40 border border-white/5" />
                    <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-white/40 border border-white/5" />
                    <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-white/40 border border-white/5" />
                </div>

                {/* Metrics Cluster (Повысили контраст white/60 и gap-3 для мобилок) */}
                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Views */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Eye size={12} className="text-white/30" />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/60">
                                {article.views_count || 0}
                            </span>
                        </div>

                        <div className="w-px h-3 sm:h-4 bg-white/10" />

                        {/* Comments */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <MessageSquare size={12} className="text-white/30" />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/60">
                                {article.comments_count || 0}
                            </span>
                        </div>

                        <div className="w-px h-3 sm:h-4 bg-white/10" />

                        {/* Likes */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleLike(e, article); }}
                            className="flex items-center gap-1.5 sm:gap-2 group/like"
                        >
                            <Heart 
                                size={12} 
                                fill={article.is_liked ? "currentColor" : "none"} 
                                className={`transition-all duration-300 ${article.is_liked ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-white/30 group-hover/like:text-red-400'}`} 
                            />
                            <span className={`text-[9px] sm:text-[10px] font-black ${article.is_liked ? 'text-white' : 'text-white/60 group-hover/like:text-white'}`}>
                                {article.likes_count || 0}
                            </span>
                        </button>
                    </div>

                    {/* Star */}
                    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(e, article); }}>
                        <Star 
                            size={14} 
                            fill={article.is_favorited ? "currentColor" : "none"} 
                            className={`transition-all ${article.is_favorited ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'text-white/20 hover:text-white'}`} 
                        />
                    </button>

                    {/* ADMIN TOOLS: Теперь видны везде, но на мобилках gap меньше */}
                    {isAdmin && (
                        <div className="flex items-center gap-3 sm:gap-4 ml-1 pl-3 sm:pl-6 border-l border-white/10">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(article); }}>
                                <Edit3 size={14} className="text-white/30 hover:text-blue-400 transition-colors" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(article.id); }}>
                                <Trash2 size={14} className="text-white/30 hover:text-red-500 transition-colors" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* PREVIEW AREA (Ratio 16/10) */}
            <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-white/[0.03] to-transparent border-b border-white/5 overflow-hidden pt-12 sm:pt-14">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-1000 group-hover:scale-110">
                    <Layout strokeWidth={1} className="w-16 h-16 sm:w-[120px] sm:h-[120px]" />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.02] via-transparent to-white/[0.02] pointer-events-none" />

                {article.type && (
                    <div className="absolute bottom-4 sm:bottom-6 left-6 sm:left-10">
                        <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-full backdrop-blur-xl">
                            <span className="text-[8px] sm:text-[9px] font-black uppercase text-blue-400 tracking-[0.2em]">
                                {article.type}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="p-5 sm:p-10 flex flex-col flex-1 relative z-10">
                <h3 className="text-lg sm:text-2xl font-black tracking-tighter leading-tight group-hover:text-blue-400 transition-colors text-white uppercase mb-3 sm:mb-4 line-clamp-2">
                    {article.title}
                </h3>
                
                <p className="text-gray-500 text-[12px] sm:text-sm leading-relaxed line-clamp-2 mb-6 sm:mb-10 italic font-medium opacity-60">
                    {article.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>

                {/* BOTTOM PANEL */}
                <div className="mt-auto pt-5 sm:pt-8 border-t border-white/5 flex items-center justify-between gap-3">
                    <div className="relative flex-grow overflow-hidden h-7 sm:h-9 flex items-center [mask-image:linear-gradient(to_right,white_80%,transparent_100%)]">
                        <div className="flex flex-nowrap gap-2 sm:gap-3 items-center">
                            {article.tech_stack?.split(',').map((t: string, i: number) => (
                                <span key={i} className="text-[8px] sm:text-[9px] px-2 sm:px-3.5 py-1 sm:py-2 bg-white/[0.03] border border-white/5 rounded-lg sm:rounded-xl text-gray-500 uppercase font-black tracking-widest whitespace-nowrap shrink-0">{t.trim()}</span>
                            ))}
                        </div>
                    </div>
                    
                    {article.tech_stack && article.tech_stack.split(',').length > 2 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onOpenTags(article.tech_stack!.split(','), article.title); }} 
                            className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-white/5 border border-white/10 text-blue-400 rounded-lg sm:rounded-2xl transition-all hover:bg-blue-500 hover:text-white active:scale-90 shrink-0 shadow-lg"
                        >
                            <Plus strokeWidth={3} className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};