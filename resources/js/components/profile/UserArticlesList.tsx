import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Plus, FileText, Loader2 } from 'lucide-react'; // Добавили Loader2
import { useArticles } from '../../hooks/useArticles';
import { Article, User, SortOption } from '../../types';
import { ConfirmModal } from '../ui/ConfirmModel';
import { Pagination } from '../ui/Pagination';
import { PremiumLoader } from '../PremiumLoader';
import { FilterBar } from '../ui/FilterBar';
import { PostCard } from '../blog/PostCard';

interface Props {
    user: User | null;
    blogId: number;
    onArticleSelect: (article: Article) => void;
    onEditArticle: (article: Article) => void;
    onCreateArticle: () => void;
    onOpenTags: (tags: string[], title: string) => void;
    onShowUser: (userId: number, context: any) => void;
    onCheckBan: () => boolean;
}

export function UserArticlesList({ 
    user, blogId, onArticleSelect, onEditArticle, onCreateArticle, onOpenTags, onShowUser, onCheckBan
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(''); 

    const [searchType, setSearchType] = useState<'title' | 'author'>('title');
    const [sort, setSort] = useState<SortOption>('latest');
    const [favoritesOnly, setFavoritesOnly] = useState(false);

    // Debounce для сервера (500мс)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { articles, pagination, currentPage, setCurrentPage, loading, deleteArticle } = useArticles(
        debouncedSearch, 
        blogId, 
        searchType, 
        sort, 
        favoritesOnly
    );

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<number | null>(null);

    const handleDeleteTrigger = (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setArticleToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (articleToDelete) {
            deleteArticle(articleToDelete);
            setIsDeleteModalOpen(false);
            setArticleToDelete(null);
        }
    }

    useEffect(() => {
        // Находим шапку контента и скроллим к ней
        const header = document.querySelector('main');
        if (header) {
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentPage])

    const handleCreateClick = () => {
        if (onCheckBan()) return; // Если забанен — модалка откроется, выполнение прервется
        onCreateArticle();
    };

    // Показываем большой лоадер только при ПЕРВОЙ загрузке
    if (loading && articles.length === 0) return <PremiumLoader />;

    return (
        /* Убрали общую анимацию, чтобы шапка не дергалась */
        <div className="space-y-8"> 
            <div className="flex flex-col gap-6">
                <div className="flex justify-end items-center gap-4">
                    {/* Маленький индикатор загрузки, если мы просто фильтруем */}
                    {loading && (
                        <div className="flex items-center gap-2 text-blue-500/50 animate-in fade-in">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Обновление...</span>
                        </div>
                    )}
                    <button onClick={onCreateArticle} className="flex items-center gap-2 px-6 py-3.5 bg-white text-black rounded-full font-black uppercase text-[10px] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
                        <Plus size={14} /> Добавить запись
                    </button>
                </div>

                <FilterBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchType={searchType}
                    setSearchType={setSearchType}
                    sort={sort}
                    setSort={setSort}
                    favoritesOnly={favoritesOnly}
                    setFavoritesOnly={setFavoritesOnly}
                    isProfileMode={true}
                    isAuthenticated={!!user}
                />
            </div>

            {/* Контентная часть */}
            <div className={`transition-all duration-500 ${loading ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`}>
                {articles.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-white/5 rounded-[40px] animate-in fade-in">
                        <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest mb-8">
                            {searchQuery ? "Ничего не найдено" : "В этой папке пока пусто"}
                        </p>
                        {!searchQuery && (
                            <button onClick={onCreateArticle} className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase hover:scale-105 transition-all">
                                Создать первую запись
                            </button>
                        )}
                    </div>
                ) : (
                    /* Анимация только на саму сетку */
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {articles.map((article: Article) => (
                            <PostCard 
                                key={article.id}
                                article={article}
                                mode="profile" // ВКЛЮЧАЕМ РЕЖИМ ПРОФИЛЯ
                                onSelect={onArticleSelect}
                                onToggleLike={() => {}} // В профиле кнопка заблокирована (disabled)
                                onToggleFavorite={() => {}} // В профиле кнопки избранного нет
                                onOpenTags={onOpenTags}
                                onEdit={onEditArticle} // Передаем функцию редактирования
                                onDelete={handleDeleteTrigger}// Передаем удаление
                                onShowUser={onShowUser}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Удаление записи"
                message="Вы уверены? Это действие нельзя отменить."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />

            {pagination && (
                <Pagination 
                    currentPage={currentPage} 
                    lastPage={pagination.last_page} 
                    onPageChange={(p) => setCurrentPage(p)} 
                />
            )}
        </div>
    );
}