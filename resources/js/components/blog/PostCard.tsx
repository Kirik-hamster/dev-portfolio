import React from 'react';
import { Article, User } from '../../types';
import { Heart, Star, ShieldCheck, User as UserIcon, FileText } from 'lucide-react';

interface PostCardProps {
    article: any;
    onSelect: (article: any) => void;
    onToggleLike: (id: number, type: 'article') => void;
    onToggleFavorite: (id: number, type: 'article') => void;
    onOpenTags: (tags: string[], title: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ article, onSelect, onToggleLike, onToggleFavorite, onOpenTags }) => {
    return (
        <div 
            onClick={() => onSelect(article)} 
            className="group p-8 bg-white/[0.01] border border-white/5 rounded-[45px] hover:border-blue-500/20 transition-all duration-500 cursor-pointer h-[420px] flex flex-col relative overflow-hidden backdrop-blur-sm"
        >
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                        {article.user?.role === 'admin' ? <ShieldCheck size={18} className="text-blue-500"/> : <UserIcon size={18} className="text-gray-400"/>}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase text-white/90 leading-none tracking-tight">{article.user?.name || 'Anonymous'}</span>
                        <span className="text-[8px] font-bold uppercase text-gray-600 tracking-widest mt-1">{article.user?.role || 'member'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleLike(article.id, 'article'); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 active:scale-90 ${article.is_liked ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-white/5 border-white/5 text-gray-500 hover:text-red-400'}`}
                    >
                        <Heart size={14} fill={article.is_liked ? "currentColor" : "none"} />
                        <span className="text-[10px] font-black">{article.likes_count || 0}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(article.id, 'article'); }} className={`p-2.5 rounded-xl border transition-all duration-300 active:scale-90 ${article.is_favorited ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-white/5 border-white/5 text-gray-500 hover:text-yellow-400'}`}><Star size={14} fill={article.is_favorited ? "currentColor" : "none"} /></button>
                </div>
            </div>

            <div className="relative z-10 flex-grow">
                <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors line-clamp-2 tracking-tighter leading-tight">{article.title}</h3>
                <p className="text-[13px] text-gray-500 line-clamp-3 leading-relaxed font-medium">{article.content?.replace(/<[^>]*>/g, '').substring(0, 140)}...</p>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 relative z-10 flex items-center justify-between gap-4">
                <div className="relative flex-grow overflow-hidden h-8 flex items-center [mask-image:linear-gradient(to_right,white_75%,transparent_100%)]">
                    <div className="flex flex-nowrap gap-2 items-center">
                        {article.tech_stack?.split(',').map((t: string, i: number) => (
                            <span key={i} className="text-[8px] px-2.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-gray-500 uppercase font-black tracking-widest whitespace-nowrap shrink-0">{t.trim()}</span>
                        ))}
                    </div>
                </div>
                {article.tech_stack && article.tech_stack.split(',').length > 3 && (
                    <button onClick={(e) => { e.stopPropagation(); onOpenTags(article.tech_stack.split(',').map((t: string) => t.trim()), article.title); }} className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[12px] font-black shrink-0 active:scale-90 shadow-lg shadow-blue-500/5 z-30">+</button>
                )}
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-[0.02] transform -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700"><FileText size={200} /></div>
        </div>
    );
};