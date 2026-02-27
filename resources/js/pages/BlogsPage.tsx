// resources/js/pages/BlogsPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { User, Article, Blog, BlogPagination } from '../types';
import { LayoutGrid, List, Tag, Folder, X, User as UserIcon, ShieldCheck, ArrowRight, FileText, Search } from 'lucide-react';
import { PremiumLoader } from '../components/PremiumLoader';
import { useNavigate } from 'react-router-dom';
import { BlogApiService } from '../services/BlogApiService';

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

    const navigate = useNavigate();

    // Вспомогательная функция для числовой пагинации
    const getPages = (current: number, last: number): (number | string)[] => {
        const pages: (number | string)[] = [];
        for (let i = 1; i <= last; i++) {
            if (i === 1 || i === last || (i >= current - 1 && i <= current + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    // Загружаем статьи один раз только для формирования облака тегов (topTags)
    useEffect(() => {
        const loadTagsData = async () => {
            try {
                const res = await fetch('/api/community-articles');
                const responseData = await res.json();
                // ВАЖНО: Если сервер включил пагинацию, берем .data, если нет - берем как есть
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
            if (viewMode === 'blogs') {
                data = await BlogApiService.fetchAll(currentPage, selectedTag);
            } else if (selectedBlogId) {
                const res = await fetch(`/api/blogs/${selectedBlogId}/articles?page=${currentPage}`);
                data = await res.json();
            } else {
                const tagParam = selectedTag ? `&tag=${selectedTag}` : '';
                const res = await fetch(`/api/community-articles?page=${currentPage}${tagParam}`);
                data = await res.json();
            }
            setPagination(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContent();
    }, [currentPage, selectedTag, viewMode, selectedBlogId]);

    useEffect(() => {
        setPagination(null); 
        setCurrentPage(1);
        setActiveBlog(null); // Сбрасываем старую шапку при переходе

        if (initialBlogId) {
            const bId = Number(initialBlogId);
            setSelectedBlogId(bId);
            setViewMode('posts');
            

            BlogApiService.fetchOne(bId)
                .then(data => setActiveBlog(data))
                .catch(err => console.error("Ошибка загрузки шапки:", err));
        } else {
            setSelectedBlogId(null);
            setViewMode('blogs');
        }
    }, [initialBlogId]);

    const getTopTagsForBlog = (blogId: number) => {
        const blogArticles = articles.filter(a => Number(a.blog_id) === blogId);
        const counts: Record<string, number> = {};
        blogArticles.forEach(a => {
            a.tech_stack?.split(',').forEach(t => {
                const tag = t.trim();
                if (tag) counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
    };

    //FIXIT
    const topTags = useMemo(() => {
        const counts: Record<string, number> = {};
        articles.forEach(a => {
            a.tech_stack?.split(',').forEach(t => {
                const tag = t.trim();
                if (tag) counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
    }, [articles]);
    //FIXIT

    return (
        <div className="pb-20 animate-in fade-in duration-700">
            {/* ТЕГ-КАПСУЛА */}
            <div className="sticky top-24 z-40 mb-16 px-6">
                <div className="max-w-2xl mx-auto bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 px-8 flex items-center justify-between shadow-2xl transition-all duration-500">
                    <div className="flex items-center gap-6 flex-grow">
                        <Tag size={12} className="text-blue-500 shrink-0" />
                        <div className="flex items-center justify-between flex-grow pr-6 border-r border-white/10">
                            <div className="flex items-center gap-4 overflow-hidden">
                                {isSearchMode ? (
                                    <input 
                                        autoFocus type="text" placeholder="Поиск тега..." value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setSelectedTag(e.target.value || null); setCurrentPage(1); }}
                                        className="bg-transparent border-none outline-none text-[10px] font-bold uppercase text-white w-full placeholder:text-gray-600"
                                    />
                                ) : (
                                    <>
                                        <button onClick={() => {setSelectedTag(null); setCurrentPage(1);}} className={`text-[9px] font-black uppercase tracking-widest ${!selectedTag ? 'text-white' : 'text-gray-500'}`}>All</button>
                                        {topTags.map(tag => (
                                            <button key={tag} onClick={() => {setSelectedTag(tag); setCurrentPage(1);}} className={`text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${selectedTag === tag ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}>{tag}</button>
                                        ))}
                                    </>
                                )}
                            </div>
                            <button onClick={() => { setIsSearchMode(!isSearchMode); if (isSearchMode) { setSelectedTag(null); setSearchQuery(''); } }} className="text-gray-500 hover:text-blue-500 ml-4 transition-colors">
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
                                navigate('/blogs'); }} 
                                className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 border border-white/5 bg-white/[0.02] px-5 py-2.5 rounded-xl hover:text-white transition-all"
                            >
                                Назад к блогам
                        </button>
                    )}
                </div>

                {/* ШАПКА ИНФОРМАЦИИ О БЛОГЕ (Замени этот блок полностью) */}
                {selectedBlogId && viewMode === 'posts' && (
                    <div className="mb-16 p-12 bg-white/[0.02] border border-white/5 rounded-[60px] relative overflow-hidden backdrop-blur-3xl">
                        <div className="absolute -right-10 -top-10 opacity-[0.03] transform rotate-12"><Folder size={320} /></div>
                        <div className="relative z-10">
                            <div className="mb-12">
                                <span className="text-[9px] font-black uppercase text-gray-600 block mb-6 tracking-widest">Автор блога</span>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        {/* Используем ТОЛЬКО currentBlogInfo для иконки */}
                                        {activeBlog?.user?.role === 'admin' 
                                            ? <ShieldCheck size={24} className="text-blue-500" /> 
                                            : <UserIcon size={24} className="text-gray-500" />
                                        }
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded w-fit font-black uppercase">
                                            {/* Используем ТОЛЬКО currentBlogInfo для роли */}
                                            {activeBlog?.user?.role || 'member'}
                                        </span>
                                        <p className="text-2xl font-black text-white tracking-tighter">
                                            {/* Теперь имя не исчезнет на 2-й странице пагинации */}
                                            {activeBlog?.user?.name || 'Загрузка...'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-3xl mb-12">
                                <span className="text-[9px] font-black uppercase text-gray-600 block mb-4 tracking-widest">Описание блога</span>
                                <p className="text-[13px] text-gray-400/80 leading-7 font-medium border-l border-white/10 pl-6 max-w-2xl whitespace-pre-line italic">
                                    {/* Описание берем именно из вложенного объекта blog */}
                                    {activeBlog?.description || "Автор еще не добавил описание..."}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 mt-10">
                                <span className="text-[10px] font-black uppercase text-gray-600 block italic">Теги постов</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {selectedBlogId && getTopTagsForBlog(selectedBlogId).map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/10 text-blue-400/80 text-[8px] font-black uppercase rounded-lg">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? 
                    <PremiumLoader /> 
                : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* РЕЖИМ БЛОГОВ */}
                            {viewMode === 'blogs' && pagination?.data.map((blog: BlogWithUser) => {
                                const tags = getTopTagsForBlog(blog.id);
                                return (
                                    <div 
                                        key={blog.id} 
                                        onClick={() => 
                                            navigate(`/blogs/${blog.id}`)
                                        } 
                                        className="group p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:border-blue-500/30 transition-all cursor-pointer h-80 flex flex-col relative overflow-hidden"
                                    >
                                        <div className="p-4 bg-white/5 w-14 h-14 rounded-2xl mb-6 text-gray-400 group-hover:text-blue-500 transition-colors"><Folder size={24}/></div>
                                        <h3 className="text-xl font-bold mb-4">{blog.title}</h3>
                                        <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 italic">{blog.description || "Нет описания..."}</p>
                                        {/*FIXIT*/}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {tags.map(t => <span key={t} className="text-[7px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded uppercase font-bold">{t}</span>)}
                                        </div>
                                        {/*FIXIT*/}
                                        <div className="absolute -right-6 -bottom-6 opacity-[0.03] transform rotate-12"><Folder size={160} /></div>
                                        
                                        <div className="mt-auto flex items-center gap-3 pt-4 border-t border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                                {blog.user?.role === 'admin' ? <ShieldCheck size={14} className="text-blue-500" /> : <UserIcon size={14} className="text-gray-500" />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-white/90">{blog.user?.name || 'User'}</p>
                                                <p className="text-[7px] font-black uppercase tracking-widest text-gray-500">{blog.user?.role || 'member'}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* РЕЖИМ ПУБЛИКАЦИЙ */}
                            {viewMode === 'posts' && pagination?.data.map((article: any) => (
                                <div key={article.id} onClick={() => onArticleSelect(article)} className="group p-8 bg-white/[0.01] border border-white/5 rounded-[40px] hover:border-blue-500/20 transition-all cursor-pointer h-80 flex flex-col relative overflow-hidden">
                                    <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all"><ArrowRight size={20} className="text-blue-500" /></div>
                                    <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 pr-10">{article.title}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-3 mb-6 flex-grow">
                                        {article.content?.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                    </p>

                                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] transform -rotate-12"><FileText size={160} /></div>
                                    
                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                                {article.user?.role === 'admin' ? <ShieldCheck size={12} className="text-blue-500"/> : <UserIcon size={12} className="text-gray-400"/>}
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-gray-400">{article.user?.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {article.tech_stack?.split(',').slice(0, 2).map((t: string) => (
                                                <span key={t} className="text-[7px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500 uppercase font-bold">{t.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ЧИСЛОВАЯ ПАГИНАЦИЯ */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="mt-16 flex items-center justify-center gap-3">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 rounded-xl bg-white/5 hover:bg-blue-500/20 disabled:opacity-10 transition-all text-gray-500">
                                    <ArrowRight className="rotate-180" size={14} />
                                </button>
                                <div className="flex items-center gap-2">
                                    {getPages(currentPage, pagination.last_page).map((p: number | string, idx: number) => (
                                        p === '...' ? <span key={`dots-${idx}`} className="text-gray-600 px-2 font-black">...</span> :
                                        <button key={`pg-${p}`} onClick={() => setCurrentPage(Number(p))} className={`w-10 h-10 rounded-xl font-black text-[11px] transition-all border ${currentPage === p ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}>
                                            {String(p).padStart(2, '0')}
                                        </button>
                                    ))}
                                </div>
                                <button disabled={currentPage === pagination.last_page} onClick={() => setCurrentPage(p => p + 1)} className="p-3 rounded-xl bg-white/5 hover:bg-blue-500/20 disabled:opacity-10 transition-all text-gray-500">
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}