import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Trash2, Plus, Layout, Heart, MessageSquare, Star } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { Article, User, SortOption } from '../types';
import { PremiumLoader } from '../components/PremiumLoader';
import { ConfirmModal } from '@/components/ui/ConfirmModel';
import { Pagination } from '../components/ui/Pagination';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { FilterBar } from '../components/ui/FilterBar';
import { TagsModal } from '@/components/ui/blogPage/TagsModal';
import { ArticleApiService } from '../services/ArticleApiService';
import { StatusModal } from '../components/ui/StatusModal';
import { PortfolioPostCard } from '@/components/portfolio/PortfolioPostCard';
import { AuthRequiredModal } from '@/components/ui/AuthRequiredModal';
import { BannedUserModal } from '@/components/ui/moderation/BannedUserModal';
import { useBanCheck } from '../hooks/useBanCheck';

interface PortfolioPageProps {
    user: User | null;
    blogId?: number | null;
    onArticleSelect: (article: Article) => void;
    onEditArticle: (article: Article) => void;
    onCreateArticle: () => void;
}

export function PortfolioPage({ 
    user, blogId, onArticleSelect, onEditArticle, onCreateArticle 
}: PortfolioPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [searchType, setSearchType] = useState<'title' | 'author'>('title');
    const [sort, setSort] = useState<SortOption>('latest');
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    // ЛОКАЛЬНЫЙ СПИСОК: Используем его как единственный источник правды для UI
    const [localArticles, setLocalArticles] = useState<Article[]>([]);

    const [tagsModal, setTagsModal] = useState<{ isOpen: boolean; tags: string[]; title: string }>({
        isOpen: false, tags: [], title: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<number | null>(null);

    const [statusModal, setStatusModal] = useState({ 
        isOpen: false, 
        type: 'error' as 'success' | 'error', 
        title: '', 
        message: '' 
    });

    const { isBanModalOpen, checkBan, closeBanModal } = useBanCheck(user);

    const lastArticlesRef = useRef<string>("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { articles, pagination, currentPage, setCurrentPage, loading, deleteArticle } = useArticles(
        debouncedSearch, 
        blogId ?? null,
        searchType,
        sort,
        favoritesOnly,
        user?.id
    );

    useEffect(() => {
        if (!articles) return;

        // Создаем уникальный ключ текущих данных (длина + ID первой статьи)
        const currentFingerprint = `${articles.length}-${articles[0]?.id}`;

        // Если данные РЕАЛЬНО новые — обновляем стейт
        if (currentFingerprint !== lastArticlesRef.current) {
            lastArticlesRef.current = currentFingerprint;
            setLocalArticles(articles);
        }
    }, [articles]);

    const isAdmin = user?.role === 'admin';

    const handleToggleLike = async (e: React.MouseEvent, article: Article) => {
        e.stopPropagation();
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        if (checkBan()) return;
        
        // ⚡️ Умное оптимистичное обновление
        setLocalArticles(prev => prev.map(a => {
            if (a.id === article.id) {
                const willBeLiked = !a.is_liked; // Определяем будущее состояние
                const currentCount = a.likes_count || 0;
                
                // Если ставим лайк: +1. Если убираем: -1, но не меньше 0
                const newCount = willBeLiked 
                    ? currentCount + 1 
                    : Math.max(0, currentCount - 1); 

                return { ...a, is_liked: willBeLiked, likes_count: newCount };
            }
            return a;
        }));

        const res = await ArticleApiService.toggleLike(article.id);
        if (!res.ok) {
            // Если сервер ответил ошибкой — откатываем к данным из хука
            setLocalArticles(articles);
            setStatusModal({
                isOpen: true, type: 'error', title: 'Ошибка',
                message: 'Не удалось сохранить лайк.'
            });
        }
    };

    // Добавляем логику избранного 
    const handleToggleFavorite = async (e: React.MouseEvent, article: Article) => {
        e.stopPropagation();
        
        // Проверка авторизации через твою модлаку
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        if (checkBan()) return;

        // Оптимистичное обновление стейта (звёздочка загорится сразу)
        setLocalArticles(prev => prev.map(a => 
            a.id === article.id ? { ...a, is_favorited: !a.is_favorited } : a
        ));

        const res = await ArticleApiService.toggleFavorite(article.id);
        if (!res.ok) {
        // Откат стейта при ошибке через статус-модалку
        setLocalArticles(prev => prev.map(a => 
            a.id === article.id ? { ...a, is_favorited: !!article.is_favorited } : a
        ));
        setStatusModal({
            isOpen: true,
            type: 'error',
            title: 'Ошибка',
            message: 'Не удалось обновить статус избранного. Попробуйте позже.'
        });
    }
    };

    if (loading && localArticles.length === 0) return <PremiumLoader />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full animate-in fade-in duration-700">
            <ScrollToTop />

            {/* ХЕДЕР */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 border-b border-white/5 pb-12 text-white">
                <div>
                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mb-2">Портфолио</h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Кейсы по разработке</p>
                </div>
                {isAdmin && (
                    <button onClick={onCreateArticle} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-2xl">
                        <Plus size={16} strokeWidth={3} /> Добавить проект
                    </button>
                )}
            </div>

            {/* ФИЛЬТРЫ */}
            <div className="mb-16">
                <FilterBar 
                    searchQuery={searchQuery}
                    setSearchQuery={(val) => { 
                        setSearchQuery(val); 
                        if (currentPage !== 1) setCurrentPage(1); // Сбрасываем страницу только если мы не на первой
                    }}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {localArticles.map((article: Article) => (
                    <PortfolioPostCard 
                        key={article.id}
                        article={article}
                        isAdmin={isAdmin}
                        onSelect={onArticleSelect}
                        onToggleLike={handleToggleLike}
                        onToggleFavorite={handleToggleFavorite}
                        onOpenTags={(tags, title) => setTagsModal({ isOpen: true, tags, title })}
                        onEdit={onEditArticle}
                        onDelete={(id) => { setArticleToDelete(id); setIsDeleteModalOpen(true); }}
                    />
                ))}
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="mt-20">
                    <Pagination 
                        currentPage={currentPage} 
                        lastPage={pagination.last_page} 
                        onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                    />
                </div>
            )}
            <BannedUserModal 
                isOpen={isBanModalOpen} 
                onClose={closeBanModal} 
                user={user} 
            />
            <TagsModal 
                isOpen={tagsModal.isOpen} 
                tags={tagsModal.tags} 
                title={tagsModal.title} 
                onClose={() => setTagsModal(prev => ({ ...prev, isOpen: false }))} 
                onTagClick={(tag) => {
                    setSearchQuery(tag);
                    setTagsModal(prev => ({ ...prev, isOpen: false }));
                }}
            />
            <ConfirmModal isOpen={isDeleteModalOpen} title="Удалить проект?" message="Это действие нельзя отменить." onConfirm={() => { if(articleToDelete) deleteArticle(articleToDelete); setIsDeleteModalOpen(false); }} onCancel={() => setIsDeleteModalOpen(false)} />
            <AuthRequiredModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
            <StatusModal 
                isOpen={statusModal.isOpen}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}