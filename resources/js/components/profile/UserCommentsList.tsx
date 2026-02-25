import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Search, ArrowUpRight, Clock, Hash, ChevronDown } from 'lucide-react';
import { CommentApiService, HistoryParams } from '../../services/CommentApiService';
import { PremiumLoader } from '../PremiumLoader';

export const UserCommentsList: React.FC = () => {
    const [comments, setComments] = useState<any[]>([]); // Тип можно уточнить в types.ts
    const [loading, setLoading] = useState(true);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [filters, setFilters] = useState<HistoryParams>({
        search: '',
        sort: 'latest',
        tag: ''
    });
    const sortOptions = [
        { id: 'latest', label: 'Сначала новые' },
        { id: 'popular', label: 'Популярные' },
        { id: 'active', label: 'Обсуждаемые' }
    ];

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await CommentApiService.getHistory(filters);
            setComments(data.data); // data.data, так как Laravel присылает пагинацию
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Подгружаем данные при изменении фильтров (с небольшой задержкой для поиска)
    useEffect(() => {
        const timer = setTimeout(fetchHistory, 400);
        return () => clearTimeout(timer);
    }, [filters.search, filters.sort, filters.tag]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Панель инструментов */}
            <div className="flex flex-col lg:flex-row gap-4 mb-12 items-stretch">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-[22px] py-4 pl-14 pr-6 text-white text-sm outline-none focus:border-blue-500/30 focus:bg-blue-500/[0.01] transition-all"
                        placeholder="Поиск по названию поста..." 
                    />
                </div>
                
                {/* КАСТОМНЫЙ "ДОРОГОЙ" СЕЛЕКТОР */}
                <div className="relative min-w-[240px]">
                    <button 
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="w-full h-full bg-white/[0.02] border border-white/5 rounded-[22px] px-6 py-4 flex items-center justify-between group hover:border-blue-500/20 transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-400 transition-colors">
                            {sortOptions.find(o => o.id === filters.sort)?.label}
                        </span>
                        <ChevronDown size={14} className={`text-gray-600 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSortOpen && (
                        <div className="absolute top-[calc(100%+12px)] right-0 w-full bg-white/[0.01] border border-white/[0.05] rounded-[32px] overflow-hidden z-50 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-300">
    <div className="p-2 space-y-1">
        {sortOptions.map(option => (
            <button
                key={option.id}
                onClick={() => { setFilters({...filters, sort: option.id as any}); setIsSortOpen(false); }}
                className={`w-full px-6 py-4 rounded-[24px] text-left text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-500 flex items-center justify-between group/item ${
                    filters.sort === option.id 
                    ? 'text-blue-500 bg-blue-500/[0.03]' // Едва заметный оттенок вместо глухой заливки
                    : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'
                }`}
            >
                <span>{option.label}</span>
                
                {/* Элегантный индикатор вместо изменения всего фона */}
                {filters.sort === option.id && (
                    <div className="w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                )}
            </button>
        ))}
    </div>
</div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><PremiumLoader /></div>
            ) : comments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="group bg-white/[0.02] border border-white/5 p-8 rounded-[40px] hover:border-blue-500/20 transition-all duration-500 relative overflow-hidden">
                            {/* Ссылка-якорь на пост */}
                            <a 
                                href={`/article/${comment.article_id}#comment-${comment.id}`}
                                className="absolute top-6 right-6 p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white hover:bg-blue-600 transition-all"
                                title="Перейти к обсуждению"
                            >
                                <ArrowUpRight size={18} />
                            </a>

                            <div className="space-y-4">
                                {/* Название статьи и теги */}
                                <div className="space-y-2 pr-12">
                                    <h4 className="text-white font-black text-xl tracking-tighter uppercase group-hover:text-blue-400 transition-colors">
                                        {comment.article.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {comment.article.tags?.map((tag: any) => (
                                            <span key={tag.id} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                                <Hash size={10} /> {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Текст комментария */}
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/20 rounded-full" />
                                    <p className="text-gray-400 text-sm leading-relaxed pl-6 italic">
                                        «{comment.content}»
                                    </p>
                                </div>

                                {/* Статистика и дата */}
                                <div className="flex items-center gap-8 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <ThumbsUp size={14} className="text-blue-500/50" />
                                        <span className="text-[10px] font-black">{comment.likes_count}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MessageSquare size={14} className="text-gray-600" />
                                        <span className="text-[10px] font-black">{comment.replies_count} отв.</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                                        <Clock size={12} />
                                        {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center space-y-4">
                    <MessageSquare size={48} className="mx-auto text-white/5" />
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Комментариев не найдено</p>
                </div>
            )}
        </div>
    );
};