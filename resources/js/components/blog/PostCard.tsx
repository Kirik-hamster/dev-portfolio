import React from 'react';
import { Heart, Star, ShieldCheck, User as UserIcon, FileText, Pencil, Trash2 } from 'lucide-react';

interface PostCardProps {
    article: any;
    mode?: 'public' | 'profile'; // 'public' - для блога, 'profile' - для личного кабинета
    onSelect: (article: any) => void;
    onToggleLike: (id: number, type: 'article') => void;
    onToggleFavorite: (id: number, type: 'article') => void;
    onOpenTags: (tags: string[], title: string) => void;
    onEdit?: (article: any) => void; // Только для профиля
    onDelete?: (id: number) => void;  // Только для профиля
}

export const PostCard: React.FC<PostCardProps> = ({ 
    article, mode = 'public', onSelect, onToggleLike, onToggleFavorite, onOpenTags, onEdit, onDelete 
}) => {
    const isProfile = mode === 'profile';

    return (
        <div 
            onClick={() => onSelect(article)} 
            className="group p-6 sm:p-8 bg-white/[0.01] border border-white/5 rounded-[35px] sm:rounded-[45px] hover:border-blue-500/20 transition-all duration-500 cursor-pointer h-[400px] sm:h-[420px] flex flex-col relative overflow-hidden backdrop-blur-sm"
        >
            {/* 1. ВЕРХНЯЯ ПАНЕЛЬ: Здесь происходит главная магия трансформации */}
            <div className="flex items-start justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/5 relative z-20 gap-4">
                
                {/* ЛЕВАЯ ЧАСТЬ: Автор (в блоге) ИЛИ Заголовок (в профиле) */}
                <div className="flex-1 min-w-0">
                    {!isProfile ? (
                        /* РЕЖИМ БЛОГА: Блок автора */
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                {article.user?.role === 'admin' ? <ShieldCheck size={18} className="text-blue-500"/> : <UserIcon size={18} className="text-gray-400"/>}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-black uppercase text-white/90 leading-none truncate">{article.user?.name || 'Anonymous'}</span>
                                <span className="text-[8px] font-bold uppercase text-gray-600 tracking-widest mt-1">{article.user?.role || 'member'}</span>
                            </div>
                        </div>
                    ) : (
                        /* РЕЖИМ ПРОФИЛЯ: Название поднимается в самый верх */
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight break-words">
                            {article.title}
                        </h3>
                    )}
                </div>

                {/* ПРАВАЯ ЧАСТЬ: Кнопки (Лайки/Звезды в блоге ИЛИ Правка/Удаление в профиле) */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                    
                    {/* КНОПКИ УПРАВЛЕНИЯ (Только в профиле) */}
                    {isProfile && (
                        <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEdit?.(article); }}
                                className="p-2.5 bg-white/10 sm:bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-500 rounded-xl border border-white/5 transition-all"
                            >
                                <Pencil size={14} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete?.(article.id); }}
                                className="p-2.5 bg-white/10 sm:bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-xl border border-white/5 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}

                    {/* ЛАЙКИ: Интерактивные в блоге, статические в профиле */}
                    <button 
                        disabled={isProfile}
                        onClick={(e) => { e.stopPropagation(); onToggleLike(article.id, 'article'); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${isProfile ? 'bg-white/5 border-white/5 text-gray-500 cursor-default' : (article.is_liked ? 'bg-red-500/10 border-red-500/20 text-red-500 active:scale-90' : 'bg-white/5 border-white/5 text-gray-500 hover:text-red-400 active:scale-90')}`}
                    >
                        <Heart size={14} fill={(article.is_liked || isProfile) ? "currentColor" : "none"} className={isProfile ? "opacity-20" : ""} />
                        <span className="text-[10px] font-black">{article.likes_count || 0}</span>
                    </button>

                    {/* ИЗБРАННОЕ: Только в режиме блога */}
                    {!isProfile && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(article.id, 'article'); }} 
                            className={`p-2.5 rounded-xl border transition-all duration-300 active:scale-90 ${article.is_favorited ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-white/5 border-white/5 text-gray-500 hover:text-yellow-400'}`}
                        >
                            <Star size={14} fill={article.is_favorited ? "currentColor" : "none"} />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. КОНТЕНТ (Описание) */}
            <div className="relative z-10 flex-1">
                {/* В режиме блога заголовок остается здесь, под автором */}
                {!isProfile && (
                    <h3 className="text-xl sm:text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors line-clamp-2 tracking-tighter leading-tight">
                        {article.title}
                    </h3>
                )}
                <p className={`text-gray-500 italic font-medium leading-relaxed ${isProfile ? 'text-[14px] line-clamp-6' : 'text-[13px] line-clamp-3'}`}>
                    {article.content?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </p>
            </div>

            {/* 3. НИЖНЯЯ ПАНЕЛЬ: ТЕГИ (Без изменений) */}
            <div className="mt-auto pt-6 border-t border-white/5 relative z-10 flex items-center justify-between gap-4">
                <div className="relative flex-grow overflow-hidden h-8 flex items-center [mask-image:linear-gradient(to_right,white_75%,transparent_100%)]">
                    <div className="flex flex-nowrap gap-2 items-center">
                        {article.tech_stack?.split(',').map((t: string, i: number) => (
                            <span key={i} className="text-[8px] px-2.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-gray-500 uppercase font-black tracking-widest whitespace-nowrap shrink-0">{t.trim()}</span>
                        ))}
                    </div>
                </div>
                {article.tech_stack && article.tech_stack.split(',').length > 3 && (
                    <button onClick={(e) => { e.stopPropagation(); onOpenTags(article.tech_stack.split(',').map((t: string) => t.trim()), article.title); }} className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[12px] font-black shrink-0 active:scale-90 shadow-lg">+</button>
                )}
            </div>
            
            {/* ФОНОВЫЙ ДЕКОР */}
            <div className="absolute -right-8 -bottom-8 opacity-[0.02] transform -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700 text-white">
                <FileText size={200} />
            </div>
        </div>
    );
};