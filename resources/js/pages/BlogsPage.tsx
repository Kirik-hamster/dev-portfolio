import React, { useState, useEffect } from 'react';
import { User, Article, Blog, BlogPagination } from '../types';
import { ArrowRight } from 'lucide-react';
import { Pagination } from '../components/ui/Pagination';
import { PremiumLoader } from '../components/PremiumLoader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BlogApiService } from '../services/BlogApiService';
import { ArticleApiService } from '../services/ArticleApiService';
import { TagApiService } from '../services/TagApiService';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { FilterBar } from '../components/ui/FilterBar';
import { StatusModal } from '../components/ui/StatusModal';
import { TagsModal } from '../components/ui/blogPage/TagsModal';
import { PostCard } from '../components/blog/PostCard';
import { BlogCard } from '../components/blog/BlogCard';
import { BlogHeader } from '../components/blog/BlogHeader';
import { TagCapsule } from '../components/blog/TagCapsule';

// Расширяем типы
interface ArticleWithBlog extends Article {
    blog?: Blog;
    user?: User;
}

interface BlogWithUser extends Blog {
    user?: User;
}

interface BlogsPageProps {
    user: User | null;
    onNavigateToProfile: () => void;
    onArticleSelect: (article: Article) => void;
    initialBlogId?: number | null;
    onBlogSelect?: (id: number | null) => void;
}

interface GenericPagination<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

export function BlogsPage({ user, onArticleSelect, initialBlogId, onBlogSelect }: BlogsPageProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState<'blogs' | 'posts'>(
        (searchParams.get('view') as 'blogs' | 'posts') || 'blogs'
    );
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedBlogId, setSelectedBlogId] = useState<number | null>(initialBlogId || null);
    
    const [activeBlog, setActiveBlog] = useState<BlogWithUser | null>(null);

    const [pagination, setPagination] = useState<GenericPagination<BlogWithUser | ArticleWithBlog> | null>(null);
    const [articles, setArticles] = useState<ArticleWithBlog[]>([]); // Храним все для тегов
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [globalTags, setGlobalTags] = useState<string[]>([]);

    const [searchType, setSearchType] = useState<'title' | 'author'>('title');
    const [sort, setSort] = useState<'latest' | 'popular'>('latest');
    const [favoritesOnly, setFavoritesOnly] = useState(false);

    
    const handleViewChange = (mode: 'blogs' | 'posts') => {
        setViewMode(mode);
        setSearchParams({ view: mode }, { replace: true }); // replace: true, чтобы не плодить историю переходов
    };
    

    const [modal, setModal] = useState({ 
        isOpen: false, 
        type: 'error' as 'success' | 'error', 
        title: '', 
        message: '' 
    });

    const [tagsModal, setTagsModal] = useState<{ isOpen: boolean; tags: string[]; title: string }>({
        isOpen: false,
        tags: [],
        title: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        // Используем сервис вместо прямого fetch
        TagApiService.fetchTopTags().then(setGlobalTags);
    }, []);

    // Загружаем статьи один раз только для формирования облака тегов (topTags)
    useEffect(() => {
        const loadTagsData = async () => {
            try {
                const res = await fetch('/api/community-articles');
                const responseData = await res.json();
                const cleanArticles = Array.isArray(responseData) ? responseData : (responseData.data || []);
                setArticles(cleanArticles);
            } catch (e) { console.error("Fetch error in tags:",e); }
        };
        loadTagsData();
    }, []);

    const loadContent = async (isCancelled: () => boolean) => {
        setLoading(true);
        try {
            let data;
            const params = {
                page: currentPage, 
                tag: selectedTag || '',
                search: searchQuery,
                search_type: searchType,
                sort: sort,
                favorites_only: favoritesOnly
            };

            // Логика выбора API остается прежней
            if (initialBlogId) {
                data = await ArticleApiService.fetchByBlog(Number(initialBlogId), params);
            } else if (viewMode === 'blogs') {
                data = await BlogApiService.fetchAll(params);
            } else {
                data = await ArticleApiService.fetchCommunity(params);
            }
            
            if (!isCancelled()) {
                setPagination(data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            if (!isCancelled()) {
                setPagination({ data: [], current_page: 1, last_page: 1, total: 0, per_page: 9 });
            }
        } finally {
            if (!isCancelled()) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        let active = true;
        const isCancelled = () => !active;

        loadContent(isCancelled);

        return () => {
            active = false;
        };
    }, [currentPage, selectedTag, viewMode, selectedBlogId, searchType, sort, favoritesOnly, searchQuery, initialBlogId]);
        
    useEffect(() => {
        if (!initialBlogId) {
            setSelectedBlogId(null);
            setActiveBlog(null);
        } else {
            const bId = Number(initialBlogId);
            setSelectedBlogId(bId);
            setViewMode('posts');
            setSearchQuery('');
            setSelectedTag(null);
            setSort('latest');
            setFavoritesOnly(false);
            setCurrentPage(1);

            window.scrollTo({ top: 0, behavior: 'instant' });

            BlogApiService.fetchOne(bId)
                .then(data => setActiveBlog(data))
                .catch(() => {
                    setModal({
                        isOpen: true,
                        type: 'error',
                        title: 'Блог не найден',
                        message: `ID ${bId} не существует.`
                    });
                    navigate('/blogs');
                });
        }
    }, [initialBlogId]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [currentPage]);

    const handleToggleLike = async (id: number, type: 'blog' | 'article') => {
        if (!user) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Доступ ограничен',
                message: 'Войдите в аккаунт, чтобы ставить лайки и поддерживать авторов.'
            });
            return;
        }
        const service = type === 'blog' ? BlogApiService : ArticleApiService;
        const res = await service.toggleLike(id);
        
        if (res.ok) {
            const result = await res.json();
            
            // 1. Обновляем список (карточки)
            setPagination(prev => prev ? {
                ...prev,
                data: prev.data.map((item: any) => 
                    item.id === id ? { ...item, is_liked: result.is_liked, likes_count: result.likes_count } : item
                )
            } : null);

            // 2. ВАЖНО: Обновляем активный блог в шапке!
            if (type === 'blog' && activeBlog?.id === id) {
                setActiveBlog(prev => prev ? { 
                    ...prev, 
                    is_liked: result.is_liked, 
                    likes_count: result.likes_count 
                } : null);
            }
        }
    };

    const handleToggleFavorite = async (id: number, type: 'blog' | 'article') => {
        if (!user) return;
        const service = type === 'blog' ? BlogApiService : ArticleApiService;
        const res = await service.toggleFavorite(id);
        if (res.ok) {
            const result = await res.json();
            setPagination(prev => prev ? {
                ...prev,
                data: prev.data.map((item: BlogWithUser | ArticleWithBlog) => 
                    item.id === id ? { ...item, is_favorited: result.is_favorited } : item
                )
            } : null);
            if (type === 'blog' && activeBlog?.id === id) {
                setActiveBlog(prev => prev ? { ...prev, is_favorited: result.is_favorited } : null);
            }
        }
    };

    return (
        <div className="pb-20 animate-in fade-in duration-700">
            <ScrollToTop />
            {/* ТЕГ-КАПСУЛА */}
            <TagCapsule 
                isSearchMode={isSearchMode}
                setIsSearchMode={setIsSearchMode}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                globalTags={selectedBlogId && activeBlog?.top_tags ? activeBlog.top_tags : globalTags}
                setCurrentPage={setCurrentPage}
                viewMode={viewMode}
                isInsideBlog={!!selectedBlogId}
                setViewMode={handleViewChange} 
                setSelectedBlogId={setSelectedBlogId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <div className="max-w-6xl mx-auto px-6">
                {/* ШАПКА СТРАНИЦЫ: Адаптивная верстка */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
                        {selectedBlogId 
                            ? (activeBlog?.title || 'Загрузка...')
                            : (viewMode === 'blogs' ? 'Блоги' : 'Посты')
                        }
                    </h1>

                    {selectedBlogId && (
                        <button 
                            onClick={() => { 
                                setSelectedBlogId(null);
                                setActiveBlog(null);
                                setViewMode('blogs');
                                setCurrentPage(1);
                                setPagination(null); 
                                navigate('/blogs');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            /* w-full на мобилках для удобства нажатия, sm:w-auto на десктопе */
                            className="w-full sm:w-auto text-[10px] font-black uppercase text-gray-500 flex items-center justify-center gap-2 border border-white/5 bg-white/[0.02] px-6 py-3.5 sm:py-2.5 rounded-xl hover:text-white transition-all shadow-xl active:scale-95 shrink-0"
                        >
                            <ArrowRight size={14} className="rotate-180" /> 
                            <span>Назад к блогам</span>
                        </button>
                    )}
                </div>
                {!selectedBlogId && (
                    <FilterBar 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        searchType={searchType}
                        setSearchType={setSearchType}
                        sort={sort}
                        setSort={setSort}
                        favoritesOnly={favoritesOnly}
                        setFavoritesOnly={setFavoritesOnly}
                        isProfileMode={viewMode === 'posts'}
                        
                    />
                )}

                {selectedBlogId && viewMode === 'posts' && (
                    <>
                        <BlogHeader 
                            activeBlog={activeBlog} 
                            onToggleLike={handleToggleLike} 
                            onToggleFavorite={handleToggleFavorite} 
                            onOpenTags={(tags, title) => setTagsModal({ isOpen: true, tags, title })}
                        />
                        <div className="mb-12">
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
                            />
                        </div>
                    </>
                )}

                {loading ? 
                    <PremiumLoader /> 
                : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* РЕЖИМ БЛОГОВ */}
                            {viewMode === 'blogs' && pagination?.data.map((item) => (
                                <BlogCard 
                                    key={item.id} 
                                    blog={item as BlogWithUser} 
                                    onNavigate={(id) => navigate(`/blogs/${id}`)}
                                    onToggleLike={handleToggleLike}
                                    onToggleFavorite={handleToggleFavorite}
                                    onOpenTags={(tags, title) => setTagsModal({ isOpen: true, tags, title })}
                                />
                            ))}

                            {/* РЕЖИМ ПУБЛИКАЦИЙ */}
                            {viewMode === 'posts' && pagination?.data.map((item) => {
                                // Явно говорим TS, что в этом режиме item — это Статья
                                const article = item as ArticleWithBlog; 
                                return (
                                    <PostCard 
                                        key={article.id} 
                                        article={article} 
                                        onSelect={onArticleSelect}
                                        onToggleLike={handleToggleLike}
                                        onToggleFavorite={handleToggleFavorite}
                                        onOpenTags={(tags, title) => setTagsModal({ isOpen: true, tags, title })}
                                    />
                                );
                            })}
                        </div>

                        {/* ЧИСЛОВАЯ ПАГИНАЦИЯ */}
                        {pagination && pagination.last_page > 1 && (
                            <Pagination 
                                currentPage={currentPage} 
                                lastPage={pagination.last_page} 
                                onPageChange={(p) => setCurrentPage(p)}
                            />
                        )}
                    </>
                )}
            </div>
            <StatusModal 
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
            />
            <TagsModal 
                isOpen={tagsModal.isOpen}
                tags={tagsModal.tags}
                title={tagsModal.title}
                onClose={() => setTagsModal(prev => ({ ...prev, isOpen: false }))}
                onTagClick={(tag) => {
                    setSelectedTag(tag);
                }}
            />
        </div>
    );
}