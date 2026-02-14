
import React, { useState } from 'react';
import { Search, Edit3, Trash2 } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { Article } from '../types';

interface PortfolioPageProps {
    onArticleSelect: (article: Article) => void;
    onEditArticle: (article: Article) => void;
    onCreateArticle: () => void;
}

/**
 * Страница "Портфолио", отображающая список всех статей.
 * Использует хук useArticles для получения данных и управления ими.
 */
export function PortfolioPage({ onArticleSelect, onEditArticle, onCreateArticle }: PortfolioPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { articles, loading, deleteArticle } = useArticles(searchQuery);

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Удалить статью?')) {
            deleteArticle(id);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* --- NEW SEARCH AND CREATE CONTAINER --- */}
            <div className="flex justify-between items-center gap-4 mb-8">
                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-full pl-12 pr-6 py-2.5 outline-none focus:bg-white/[0.07] focus:border-blue-500/50 transition-all text-sm"
                    />
                </div>
                <button onClick={onCreateArticle} className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10">+ Создать</button>
            </div>

            {loading && articles.length === 0 ? (
                <p>Loading articles...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {articles.map(article => (
                        <div
                            key={article.id}
                            onClick={() => onArticleSelect(article)}
                            className="group cursor-pointer relative p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-500 backdrop-blur-sm"
                        >
                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditArticle(article); }}
                                    className="p-2.5 bg-white text-black rounded-full hover:scale-110 transition"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, article.id)}
                                    className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-full transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-500 mb-4">{article.type}</div>
                            <h3 className="text-2xl font-semibold mb-4 leading-tight group-hover:text-blue-400 transition-colors">{article.title}</h3>
                            <div className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6" dangerouslySetInnerHTML={{ __html: article.content }} />
                            <div className="pt-6 border-t border-white/5 flex gap-2 overflow-hidden">
                                {article.tech_stack?.split(',').map(tag => (
                                    <span key={tag} className="text-[9px] px-2 py-1 bg-white/5 rounded-md text-gray-500 border border-white/5 uppercase font-bold"># {tag.trim()}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
