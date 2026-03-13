import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Trash2, Plus, Layout, Heart, MessageSquare, Star } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { Article, User } from '../types';
import { PremiumLoader } from '../components/PremiumLoader';
import { ConfirmModal } from '@/components/ui/ConfirmModel';
import { Pagination } from '../components/ui/Pagination';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { FilterBar } from '../components/ui/FilterBar';
import { TagsModal } from '@/components/ui/blogPage/TagsModal';
import { ArticleApiService } from '../services/ArticleApiService';
import { StatusModal } from '../components/ui/StatusModal';

export function PortfolioPage({ user, blogId, onArticleSelect, onEditArticle, onCreateArticle }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [searchType, setSearchType] = useState<'title' | 'author'>('title');
    const [sort, setSort] = useState<'latest' | 'popular'>('latest');
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    
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

    // 1. ИСПРАВЛЕНИЕ ПОИСКА: Убираем setCurrentPage(1) из общего потока, 
    // чтобы не провоцировать лишние рендеры
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

    // 2. ИСПРАВЛЕНИЕ ПЕТЛИ: Синхронизируем только когда данные РЕАЛЬНО пришли
    useEffect(() => {
        if (articles && articles.length > 0) {
            setLocalArticles(articles);
        } else if (!loading) {
            setLocalArticles([]);
        }
    }, [articles, loading]);

    useEffect(() => {
        // Если пришли новые статьи из хука (после логина или фильтра) — 
        // ПОЛНОСТЬЮ перезаписываем локальный стейт
        if (articles) {
            setLocalArticles(articles);
        }
    }, [articles, loading]);

    const isAdmin = user?.role === 'admin';

    const handleToggleLike = async (e: React.MouseEvent, article: Article) => {
        e.stopPropagation();
        if (!user) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Авторизация',
                message: 'Лайки доступны только зарегистрированным пользователям.'
            });
            return;
        }
        
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
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Авторизация',
                message: 'Сохранять проекты в избранное могут только авторизованные пользователи.'
            });
            return;
        }

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
                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mb-2">Portfolio</h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Engineering & Design Cases</p>
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
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {localArticles.map((article: Article) => (
                    <div 
                        key={article.id} 
                        onClick={() => onArticleSelect(article)} 
                        className="group cursor-pointer relative flex flex-col bg-white/[0.02] border border-white/10 rounded-[40px] overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:bg-white/[0.03] backdrop-blur-lg shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                    >
                        <div className="relative aspect-[16/9] w-full bg-white/[0.03] border-b border-white/10 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-105 transition-transform duration-1000">
                                <Layout size={80} strokeWidth={1} className="text-white" />
                            </div>
                            
                            {/* КНОПКИ АДМИНА: lg:opacity-0 прячет их на десктопе до ховера */}
                            {isAdmin && (
                                <div className="absolute top-6 right-6 flex gap-2 z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-2 lg:group-hover:translate-y-0 transition-all duration-300">
                                    {/* Редактирование: Liquid Glass, бледная */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onEditArticle(article); }} 
                                        className="p-3 bg-white/10 text-white rounded-xl border border-white/10 backdrop-blur-sm shadow-xl hover:bg-white/20 transition-all active:scale-95 hover:border-white/20"
                                    >
                                        <Edit3 size={16}/>
                                    </button>
                                    {/* Удаление: Liquid Glass, бледная красная */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setArticleToDelete(article.id); setIsDeleteModalOpen(true); }} 
                                        className="p-3 bg-red-500/10 text-red-300 rounded-xl border border-red-500/20 backdrop-blur-sm shadow-xl hover:bg-red-500/20 hover:text-red-200 transition-all active:scale-95 hover:border-red-500/30"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* КОНТЕНТ */}
                        <div className="p-8 sm:p-10 flex flex-col flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[9px] font-black uppercase text-blue-500 tracking-[0.2em]">{article.type}</span>
                                
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={(e) => handleToggleLike(e, article)} 
                                        className={`flex items-center gap-1.5 transition-all active:scale-90 ${article.is_liked ? 'text-red-500' : 'text-gray-600 hover:text-red-400'}`}
                                    >
                                        <Heart size={16} fill={article.is_liked ? "currentColor" : "none"} />
                                        <span className="text-[11px] font-black">{article.likes_count || 0}</span>
                                    </button>
                                    <button 
                                        onClick={(e) => handleToggleFavorite(e, article)} 
                                        className={`flex items-center transition-all active:scale-90 ${article.is_favorited ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-400'}`}
                                    >
                                        <Star size={16} fill={article.is_favorited ? "currentColor" : "none"} />
                                    </button>
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <MessageSquare size={16} />
                                        <span className="text-[11px] font-black">{article.comments_count || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-black tracking-tighter mb-4 leading-tight group-hover:text-blue-400 transition-colors text-white">{article.title}</h3>
                            
                            <div 
                                className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-8 italic font-medium opacity-60" 
                                dangerouslySetInnerHTML={{ __html: article.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...' }} 
                            />

                            {/* 3. ТЕГИ: С модалкой */}
                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-2 overflow-hidden h-7">
                                    {article.tech_stack?.split(',').slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="text-[8px] px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-gray-400 uppercase font-black">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                                {article.tech_stack && article.tech_stack.split(',').length > 2 && (
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setTagsModal({ isOpen: true, tags: article.tech_stack!.split(','), title: article.title }); 
                                        }} 
                                        className="w-7 h-7 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black hover:bg-blue-500 hover:text-white transition-all shrink-0"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
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