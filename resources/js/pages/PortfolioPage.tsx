import React, { useState } from 'react';
import { Search, Edit3, Trash2, Plus } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
// Импортируем готовые типы вместо локального определения
import { Article, User } from '../types';

interface PortfolioPageProps {
    user: User | null; 
    // Разрешаем null и undefined, чтобы TS не ругался при передаче из App.tsx
    blogId?: number | null; 
    onArticleSelect: (article: Article) => void;
    onEditArticle: (article: Article) => void;
    onCreateArticle: () => void;
}

export function PortfolioPage({ 
    user, 
    blogId, 
    onArticleSelect, 
    onEditArticle, 
    onCreateArticle 
}: PortfolioPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Передаем blogId в хук. Если он undefined, хук загрузит /api/portfolio
    const { articles, loading, deleteArticle } = useArticles(searchQuery, blogId ?? undefined);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Удалить статью?')) {
            deleteArticle(id);
        }
    };

    // Проверка прав доступа
    const isAdmin = user?.role === 'admin';

    return (
        <div className="max-w-6xl mx-auto px-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
            <div className="flex justify-between items-center gap-4 mb-12">
                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск в этой категории..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-full pl-14 pr-6 py-4 outline-none focus:bg-white/[0.05] focus:border-blue-500/50 transition-all text-sm tracking-wide"
                    />
                </div>
                
                {/* Создание доступно админу или если мы находимся внутри какого-то блога */}
                {isAdmin && (
                    <button 
                        onClick={onCreateArticle} 
                        className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl shadow-blue-500/10"
                    >
                        <Plus size={16} /> Добавить проект
                    </button>
                )}
            </div>

            {/* СПИСОК СТАТЕЙ */}
            {loading && articles.length === 0 ? (
                <div className="flex flex-col items-center py-32 opacity-20">
                    <div className="w-12 h-12 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin mb-6" />
                    <p className="uppercase text-[10px] font-black tracking-[0.5em]">Получение данных...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {articles.map(article => (
                        <div
                            key={article.id}
                            onClick={() => onArticleSelect(article)}
                            className="group cursor-pointer relative p-10 rounded-[48px] bg-white/[0.01] border border-white/5 hover:border-blue-500/20 transition-all duration-700 backdrop-blur-sm overflow-hidden"
                        >
                            {/* Фоновый эффект свечения */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            {/* Кнопки управления */}
                            {isAdmin && (
                                <div className="absolute top-8 right-8 flex gap-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-30">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEditArticle(article); }}
                                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition shadow-2xl"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, article.id)}
                                        className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-full transition shadow-2xl"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="relative z-10">
                                <span className="inline-block text-[9px] font-black tracking-[0.3em] uppercase text-blue-500 mb-6">{article.type}</span>
                                <h3 className="text-3xl font-bold mb-6 leading-tight group-hover:text-blue-400 transition-colors tracking-tighter">{article.title}</h3>
                                <div className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-10 font-medium" dangerouslySetInnerHTML={{ __html: article.content }} />
                                
                                <div className="flex flex-wrap gap-2">
                                    {article.tech_stack?.split(',').map(tag => (
                                        <span key={tag} className="text-[9px] px-3 py-1.5 bg-white/5 rounded-full text-gray-500 border border-white/5 uppercase font-black tracking-tighter">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}