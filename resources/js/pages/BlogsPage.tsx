import React, { useState, useEffect, useMemo } from 'react';
import { User, Article, Blog, BlogPagination } from '../types';
import { LayoutGrid, List, Tag, Folder, X, User as UserIcon, ShieldCheck, ArrowRight, FileText, 
    Search, Heart, Star } from 'lucide-react';
import { Pagination } from '../components/ui/Pagination';
import { PremiumLoader } from '../components/PremiumLoader';
import { useNavigate } from 'react-router-dom';
import { BlogApiService } from '../services/BlogApiService';
import { ArticleApiService } from '../services/ArticleApiService';
import { TagApiService } from '../services/TagApiService';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { FilterBar } from '../components/ui/FilterBar';
import { StatusModal } from '../components/ui/StatusModal';
import { TagsModal } from '../components/ui/blogPage/TagsModal';

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

export function BlogsPage({ user, onArticleSelect, initialBlogId, onBlogSelect }: BlogsPageProps) {
    const [viewMode, setViewMode] = useState<'blogs' | 'posts'>('blogs');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedBlogId, setSelectedBlogId] = useState<number | null>(initialBlogId || null);
    
    const [activeBlog, setActiveBlog] = useState<BlogWithUser | null>(null);

    const [pagination, setPagination] = useState<BlogPagination | null>(null);
    const [articles, setArticles] = useState<ArticleWithBlog[]>([]); // Храним все для тегов
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [globalTags, setGlobalTags] = useState<string[]>([]);

    const [searchType, setSearchType] = useState<'title' | 'author'>('title');
    const [sort, setSort] = useState<'latest' | 'popular'>('latest');
    const [favoritesOnly, setFavoritesOnly] = useState(false);

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

    const loadContent = async () => {
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

            // 1. САМЫЙ ВЫСОКИЙ ПРИОРИТЕТ: Если в URL есть ID блога
            // Мы игнорируем viewMode. Если мы в блоге, нам нужны ТОЛЬКО посты этого автора.
            if (initialBlogId) {
                data = await ArticleApiService.fetchByBlog(Number(initialBlogId), params);
            } 
            // 2. Если мы на общем URL (/blogs) и выбран режим "Папки"
            else if (viewMode === 'blogs') {
                data = await BlogApiService.fetchAll(params);
            } 
            // 3. Если мы на общем URL (/blogs) и выбран режим "Публикации" (Community)
            else {
                data = await ArticleApiService.fetchCommunity(params);
            }
            
            setPagination(data);
        } catch (err) {
            console.error("Fetch error:", err);
            setPagination({ data: [], current_page: 1, last_page: 1, total: 0, per_page: 9 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContent();
    }, [currentPage, selectedTag, viewMode, selectedBlogId, searchType, sort, favoritesOnly, searchQuery, initialBlogId]);
        
    useEffect(() => {
        if (!initialBlogId) {
            setSelectedBlogId(null);
            setActiveBlog(null);
        } else {
            const bId = Number(initialBlogId);
            setSelectedBlogId(bId);
            setViewMode('posts');
            // --- НОВОЕ: Очищаем фильтры при входе в конкретный блог ---
            setSearchQuery('');      // Сбрасываем поиск
            setSelectedTag(null);    // Сбрасываем тег
            setSort('latest');       // Возвращаем сортировку по умолчанию
            setFavoritesOnly(false); // Выключаем "Избранное"
            setCurrentPage(1);       // Всегда на первую страницу
            // ---------------------------------------------------------

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

    const handleToggleLike = async (id: number, type: 'blog' | 'article') => {
        if (!user) return alert("Войдите, чтобы ставить лайки!"); // Твой AuthRequiredModal тут идеально подойдет
        
        const service = type === 'blog' ? BlogApiService : ArticleApiService;
        const res = await service.toggleLike(id);
        
        if (res.ok) {
            const result = await res.json();
            // Обновляем данные в текущей пагинации без перезагрузки всей страницы
            setPagination(prev => prev ? {
                ...prev,
                data: prev.data.map((item: any) => 
                    item.id === id ? { ...item, is_liked: result.is_liked, likes_count: result.likes_count } : item
                )
            } : null);
            if (type === 'blog' && activeBlog?.id === id) {
                setActiveBlog(prev => prev ? { ...prev, is_liked: result.is_liked, likes_count: result.likes_count } : null);
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
                data: prev.data.map((item: any) => 
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
            <div className="sticky top-24 z-40 mb-16 px-6">
                <div className="max-w-2xl mx-auto bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 px-8 flex items-center justify-between shadow-2xl transition-all duration-500">
                    <div className="flex items-center gap-6 flex-grow">
                        <Tag size={12} className="text-blue-500 shrink-0" />
                        <div className="flex items-center justify-between flex-grow pr-6 border-r border-white/10">
                            <div className="flex items-center gap-4 overflow-hidden">
                                {isSearchMode ? (
                                    <input 
                                        autoFocus 
                                        type="text" 
                                        placeholder="Введите название тега..." 
                                        value={selectedTag || ''} // Привязываем к тегу
                                        onChange={(e) => { 
                                            const val = e.target.value;
                                            setSelectedTag(val || null); // Обновляем только тег
                                            setCurrentPage(1); 
                                        }}
                                        className="bg-transparent border-none outline-none text-[10px] font-bold uppercase text-white w-full placeholder:text-gray-600"
                                    />
                                ) : (
                                    <>
                                        <button onClick={() => {setSelectedTag(null); setCurrentPage(1);}} className={`text-[9px] font-black uppercase tracking-widest ${!selectedTag ? 'text-white' : 'text-gray-500'}`}>All</button>
                                        {globalTags.map((tag: string) => ( // Добавили : string, чтобы ушла ошибка "any"
                                            <button 
                                                key={tag} 
                                                onClick={() => {setSelectedTag(tag); setCurrentPage(1);}} 
                                                className={`text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${selectedTag === tag ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                            <button 
                                onClick={() => { 
                                    setIsSearchMode(!isSearchMode); 
                                    if (isSearchMode) { 
                                        setSelectedTag(null);
                                    } 
                                }} 
                                className="text-gray-500 hover:text-blue-500 ml-4 transition-colors"
                            >
                                {isSearchMode ? <X size={14} /> : <Search size={14} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                        <button onClick={() => { setViewMode('blogs'); setSelectedBlogId(null); setCurrentPage(1); }} className={`p-2 rounded-full transition-all ${viewMode === 'blogs' ? 'bg-white text-black' : 'text-gray-500'}`}><LayoutGrid size={14} /></button>
                        <button onClick={() => { setViewMode('posts'); setSelectedBlogId(null); setCurrentPage(1); }} className={`p-2 rounded-full transition-all ${viewMode === 'posts' ? 'bg-white text-black' : 'text-gray-500'}`}><List size={14} /></button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <h1 className="text-5xl font-black uppercase tracking-tighter">
                        {selectedBlogId 
                            ? (activeBlog?.title || activeBlog?.title || 'Загрузка...')
                            : (viewMode === 'blogs' ? 'Блоги' : 'Публикации')
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
                            className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 border border-white/5 bg-white/[0.02] px-5 py-2.5 rounded-xl hover:text-white transition-all shadow-xl active:scale-95"
                        >
                            <ArrowRight size={14} className="rotate-180" /> Назад к блогам
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
                    />
                )}

                {selectedBlogId && viewMode === 'posts' && (
                    <>
                    <div className="mb-16 p-12 bg-white/[0.02] border border-white/5 rounded-[60px] relative overflow-hidden backdrop-blur-3xl group/header transition-all duration-700 hover:border-white/10">
                        
                        {/* ФОНОВАЯ ПАПКА: Дорогой декор */}
                        <div className="absolute -right-20 -bottom-20 opacity-[0.03] text-white rotate-12 pointer-events-none transition-all duration-1000 group-hover/header:scale-110 group-hover/header:rotate-[20deg] group-hover/header:opacity-[0.05]">
                            <Folder size={400} strokeWidth={1} />
                        </div>

                        <div className="relative z-10">
                            {/* ВЕРХНИЙ РЯД: Автор и Кнопки */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                                
                                {/* БЛОК АВТОРА: Теперь всё четко выровнено влево */}
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50" />
                                        {activeBlog?.user?.role === 'admin' 
                                            ? <ShieldCheck size={32} className="text-blue-500 relative z-10" /> 
                                            : <UserIcon size={32} className="text-gray-500 relative z-10" />
                                        }
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-4xl font-black text-white tracking-tighter">
                                                {activeBlog?.user?.name || 'Загрузка...'}
                                            </h2>
                                            <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md font-black uppercase tracking-widest">
                                                {activeBlog?.user?.role || 'member'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase text-gray-600 tracking-[0.4em]">Автор блога</span>
                                    </div>
                                </div>

                                {/* КНОПКИ ДЕЙСТВИЯ: Раздельные, без общего фона, с "дорогим" свечением */}
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => handleToggleLike(activeBlog!.id, 'blog')}
                                        className={`flex items-center gap-3 px-8 py-4 rounded-[24px] border transition-all duration-500 active:scale-95
                                            ${activeBlog?.is_liked 
                                                ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.15)]' 
                                                : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'}`}
                                    >
                                        <Heart size={20} fill={activeBlog?.is_liked ? "currentColor" : "none"} className={activeBlog?.is_liked ? "animate-pulse" : ""} />
                                        <span className="text-sm font-black">{activeBlog?.likes_count || 0}</span>
                                    </button>

                                    <button 
                                        onClick={() => handleToggleFavorite(activeBlog!.id, 'blog')}
                                        className={`p-4 rounded-[24px] border transition-all duration-500 active:scale-95
                                            ${activeBlog?.is_favorited 
                                                ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.15)]' 
                                                : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'}`}
                                    >
                                        <Star size={20} fill={activeBlog?.is_favorited ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>

                            {/* ОПИСАНИЕ: Стильная цитата */}
                            <div className="max-w-2xl mb-12">
                                <span className="text-[10px] font-black uppercase text-gray-700 block mb-4 tracking-[0.2em]">Описание / О себе</span>
                                <p className="text-[15px] text-gray-400/80 leading-relaxed font-medium border-l-2 border-blue-500/20 pl-8 italic">
                                    {activeBlog?.description || "Автор еще не добавил описание..."}
                                </p>
                            </div>

                            {/* ТЕГИ: Компактный ряд внизу */}
                            {activeBlog?.top_tags && activeBlog.top_tags.length > 0 && (
                                <div className="flex flex-col gap-4 mt-10">
                                    <span className="text-[10px] font-black uppercase text-gray-700 block italic tracking-[0.2em]">Популярные теги автора</span>
                                    
                                    <div className="flex items-center justify-between gap-4">
                                        {/* ИСПОЛЬЗУЕМ MASK-IMAGE ДЛЯ ПЛАВНОГО ИСЧЕЗНОВЕНИЯ СПРАВА */}
                                        <div className="flex-grow overflow-hidden h-10 flex items-center [mask-image:linear-gradient(to_right,white_80%,transparent_100%)]">
                                            <div className="flex flex-nowrap gap-2.5 items-center">
                                                {activeBlog.top_tags.map((tag: string) => (
                                                    <span 
                                                        key={tag} 
                                                        className="px-4 py-2 bg-white/[0.03] border border-white/5 text-gray-500 text-[9px] font-black uppercase rounded-xl tracking-widest hover:text-blue-400 hover:border-blue-400/30 transition-all cursor-default whitespace-nowrap shrink-0"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {activeBlog.top_tags.length > 4 && (
                                            <button 
                                                onClick={() => setTagsModal({ 
                                                    isOpen: true, 
                                                    tags: activeBlog.top_tags || [], 
                                                    title: `Все теги: ${activeBlog.user?.name}` 
                                                })}
                                                className="flex items-center justify-center px-4 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[10px] font-black shrink-0 active:scale-90 shadow-lg shadow-blue-500/5 z-30"
                                            >
                                                Все Теги
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
                            {viewMode === 'blogs' && pagination?.data.map((blog: BlogWithUser) => (
                                <div 
                                    key={blog.id} 
                                    onClick={() => navigate(`/blogs/${blog.id}`)} 
                                    className="group p-8 bg-white/[0.02] border border-white/5 rounded-[45px] hover:border-blue-500/30 transition-all duration-500 cursor-pointer h-80 flex flex-col relative overflow-hidden backdrop-blur-sm"
                                >
                                    {/* 1. ВЕРХНЯЯ ПАНЕЛЬ: АВТОР И КНОПКИ */}
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                {blog.user?.role === 'admin' 
                                                    ? <ShieldCheck size={18} className="text-blue-500" /> 
                                                    : <UserIcon size={18} className="text-gray-500" />
                                                }
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[11px] font-black uppercase text-white/90 leading-tight">
                                                    {blog.user?.name || 'User'}
                                                </p>
                                                <p className="text-[8px] font-black uppercase tracking-[0.1em] text-gray-500/80">
                                                    {blog.user?.role || 'member'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleToggleLike(blog.id, 'blog'); }}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all active:scale-90
                                                    ${blog.is_liked 
                                                        ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-red-400'}`}
                                            >
                                                <Heart size={14} fill={blog.is_liked ? "currentColor" : "none"} />
                                                <span className="text-[10px] font-black">{blog.likes_count || 0}</span>
                                            </button>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(blog.id, 'blog'); }}
                                                className={`p-2 rounded-xl border transition-all active:scale-90
                                                    ${blog.is_favorited 
                                                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' 
                                                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-yellow-400'}`}
                                            >
                                                <Star size={14} fill={blog.is_favorited ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. КОНТЕНТ: ЗАГОЛОВОК И ОПИСАНИЕ */}
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black mb-3 tracking-tighter group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {blog.title}
                                        </h3>
                                        <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed italic font-medium">
                                            {blog.description || "Автор еще не добавил описание..."}
                                        </p>
                                    </div>

                                    {/* 3. НИЖНЯЯ ПАНЕЛЬ: ТЕГИ (Умное скрытие и просмотр всех) */}
                                    <div className="mt-auto pt-6 border-t border-white/5 relative z-10 flex items-center justify-between gap-4">
                                        <div className="flex flex-wrap gap-2 h-7 overflow-hidden flex-grow">
                                            {blog.top_tags && blog.top_tags.length > 0 ? (
                                                blog.top_tags.map((tag: string) => (
                                                    <span 
                                                        key={tag} 
                                                        className="text-[8px] px-2.5 py-1.5 bg-blue-500/5 border border-blue-500/10 text-blue-400/70 rounded-lg uppercase font-black whitespace-nowrap tracking-wider"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[8px] text-gray-700 uppercase font-bold tracking-widest text-white/20">Нет тегов</span>
                                            )}
                                        </div>

                                        {/* Кнопка "Ещё", если тегов больше 3 (или можно просто сделать кнопку всегда, если нужно) */}
                                        {blog.top_tags && blog.top_tags.length > 3 && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Чтобы не сработал переход в блог
                                                    setTagsModal({ isOpen: true, tags: blog.top_tags || [], title: `Теги: ${blog.title}` });
                                                }}
                                                className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all text-[10px] font-black shrink-0 active:scale-90"
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>

                                    {/* 4. ДЕКОР: БОЛЬШАЯ ПАПКА С АНИМАЦИЕЙ */}
                                    <div className="absolute -right-12 -bottom-12 opacity-[0.03] transform rotate-12 pointer-events-none transition-all duration-700 ease-out group-hover:scale-125 group-hover:rotate-[20deg] group-hover:opacity-[0.06] text-white">
                                        <Folder size={280} strokeWidth={1} />
                                    </div>
                                </div>
                            ))}

                            {/* РЕЖИМ ПУБЛИКАЦИЙ */}
                            {viewMode === 'posts' && pagination?.data.map((article: any) => (
                                <div 
                                    key={article.id} 
                                    onClick={() => onArticleSelect(article)} 
                                    className="group p-8 bg-white/[0.01] border border-white/5 rounded-[45px] hover:border-blue-500/20 transition-all duration-500 cursor-pointer h-[420px] flex flex-col relative overflow-hidden backdrop-blur-sm"
                                >
                                    {/* 1. ВЕРХНЯЯ ПАНЕЛЬ: АВТОР + КНОПКИ (В ОДНУ ЛИНИЮ) */}
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                                        {/* Левая часть: Автор */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                                {article.user?.role === 'admin' 
                                                    ? <ShieldCheck size={18} className="text-blue-500"/> 
                                                    : <UserIcon size={18} className="text-gray-400"/>
                                                }
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black uppercase text-white/90 leading-none tracking-tight">
                                                    {article.user?.name || 'Anonymous'}
                                                </span>
                                                <span className="text-[8px] font-bold uppercase text-gray-600 tracking-widest mt-1">
                                                    {article.user?.role || 'member'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Правая часть: Умные кнопки (без лишних рамок) */}
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleToggleLike(article.id, 'article'); }}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 active:scale-90
                                                    ${article.is_liked 
                                                        ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                                                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-red-400 hover:border-red-400/20'}`}
                                            >
                                                <Heart size={14} fill={article.is_liked ? "currentColor" : "none"} />
                                                <span className="text-[10px] font-black">{article.likes_count || 0}</span>
                                            </button>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(article.id, 'article'); }}
                                                className={`p-2.5 rounded-xl border transition-all duration-300 active:scale-90
                                                    ${article.is_favorited 
                                                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                                                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-yellow-400 hover:border-yellow-400/20'}`}
                                            >
                                                <Star size={14} fill={article.is_favorited ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. КОНТЕНТ */}
                                    <div className="relative z-10 flex-grow">
                                        <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors line-clamp-2 tracking-tighter leading-tight">
                                            {article.title}
                                        </h3>
                                        <p className="text-[13px] text-gray-500 line-clamp-3 leading-relaxed font-medium">
                                            {article.content?.replace(/<[^>]*>/g, '').substring(0, 140)}...
                                        </p>
                                    </div>

                                    {/* 3. ТЕГИ ПОСТА: Однострочный режим с Masking */}
                                    <div className="mt-auto pt-6 border-t border-white/5 relative z-10 flex items-center justify-between gap-4">
                                        
                                        {/* Маскируем контейнер, чтобы теги плавно уходили в прозрачность */}
                                        <div className="flex-grow overflow-hidden h-8 flex items-center [mask-image:linear-gradient(to_right,white_75%,transparent_100%)]">
                                            <div className="flex flex-nowrap gap-2 items-center">
                                                {article.tech_stack?.split(',').map((t: string, i: number) => (
                                                    <span 
                                                        key={i} 
                                                        className="text-[8px] px-2.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-gray-500 uppercase font-black tracking-widest whitespace-nowrap shrink-0"
                                                    >
                                                        {t.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {article.tech_stack && article.tech_stack.split(',').length > 3 && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const postTags = article.tech_stack.split(',').map((t: string) => t.trim());
                                                    setTagsModal({ isOpen: true, tags: postTags, title: article.title });
                                                }}
                                                className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[12px] font-black shrink-0 active:scale-90 shadow-lg shadow-blue-500/5 z-30"
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>

                                    {/* ДЕКОР */}
                                    <div className="absolute -right-8 -bottom-8 opacity-[0.02] transform -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                        <FileText size={200} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ЧИСЛОВАЯ ПАГИНАЦИЯ */}
                        {pagination && pagination.last_page > 1 && (
                            <Pagination 
                                currentPage={currentPage} 
                                lastPage={pagination.last_page} 
                                onPageChange={(p) => {
                                    setCurrentPage(p);
                                    // Плавный скролл к началу контента при смене страницы
                                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                                }} 
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
                    setSelectedTag(tag); // Теперь теги внутри окна тоже работают как фильтры!
                    setCurrentPage(1);
                }}
            />
        </div>
    );
}