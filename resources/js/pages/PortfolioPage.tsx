import React, { useState } from 'react';
import { Search, Edit3, Trash2, Plus } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { Article, User } from '../types';
import { PremiumLoader } from '../components/PremiumLoader';
import { ConfirmModal } from '@/components/ui/ConfirmModel';

interface PortfolioPageProps {
    user: User | null; 
    blogId?: number | null; 
    onArticleSelect: (article: Article) => void;
    onEditArticle: (article: Article) => void;
    onCreateArticle: () => void;
}

export function PortfolioPage({ user, blogId, onArticleSelect, onEditArticle, onCreateArticle }: PortfolioPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
    
    // Достаем пагинацию из нашего крутого хука
    const { articles, pagination, currentPage, setCurrentPage, loading, deleteArticle } = useArticles(searchQuery, blogId ?? undefined);

    const handleConfirmDelete = () => {
        if (articleToDelete) {
            deleteArticle(articleToDelete);
            setIsDeleteModalOpen(false);
            setArticleToDelete(null);
        }
    };

    const isAdmin = user?.role === 'admin';

    // Если идет загрузка и данных еще нет — показываем лоадер
    if (loading && articles.length === 0) return <PremiumLoader />;

    return (
        <div className="max-w-6xl mx-auto px-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
            <div className="flex justify-between items-center gap-4 mb-12">
                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск проектов..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} // Сброс на 1-ю страницу при поиске
                        className="w-full bg-white/[0.02] border border-white/5 rounded-full pl-14 pr-6 py-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                </div>
                {isAdmin && (
                    <button onClick={onCreateArticle} className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold uppercase text-[10px] hover:bg-blue-600 hover:text-white transition-all">
                        <Plus size={16} /> Добавить проект
                    </button>
                )}
            </div>

            {articles.length === 0 ? (
                <div className="py-20 text-center opacity-40 uppercase text-[10px] font-black">В этой категории пока нет работ</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {articles.map((article: Article) => (
                            <div key={article.id} onClick={() => onArticleSelect(article)} className="group cursor-pointer relative p-10 rounded-[48px] bg-white/[0.01] border border-white/5 hover:border-blue-500/20 transition-all duration-700 overflow-hidden">
                                {isAdmin && (
                                    <div className="absolute top-8 right-8 flex gap-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all z-30">
                                        <button onClick={(e) => { e.stopPropagation(); onEditArticle(article); }} className="p-3 bg-white text-black rounded-full shadow-xl"><Edit3 size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); setArticleToDelete(article.id); setIsDeleteModalOpen(true); }} className="p-3 bg-red-500 text-white rounded-full shadow-xl"><Trash2 size={16} /></button>
                                    </div>
                                )}
                                <div className="relative z-10">
                                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-blue-500 mb-6 block">{article.type}</span>
                                    <h3 className="text-3xl font-bold mb-6 tracking-tighter">{article.title}</h3>
                                    <div className="text-gray-400 text-sm line-clamp-2 mb-10" dangerouslySetInnerHTML={{ __html: article.content }} />
                                    <div className="flex flex-wrap gap-2">
                                        {article.tech_stack?.split(',').map((tag: string) => (
                                            <span key={tag} className="text-[9px] px-3 py-1.5 bg-white/5 rounded-full text-gray-500 border border-white/5 uppercase font-black tracking-tighter">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ПАГИНАЦИЯ ПОРТФОЛИО */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-20">
                            {[...Array(pagination.last_page)].map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => {
                                        setCurrentPage(i + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' }); // Плавный скролл вверх
                                    }}
                                    className={`w-10 h-10 rounded-2xl font-black text-[11px] transition-all border ${
                                        currentPage === i + 1 
                                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                                            : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                                    }`}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            <ConfirmModal isOpen={isDeleteModalOpen} title="Удалить проект?" message="Это действие нельзя отменить." onConfirm={handleConfirmDelete} onCancel={() => setIsDeleteModalOpen(false)} />
        </div>
    );
}