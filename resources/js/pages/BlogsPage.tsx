// resources/js/pages/BlogsPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { User, Article, Blog } from '../types';
import { LayoutGrid, List, Tag, Folder, X, User as UserIcon, ShieldCheck, ArrowRight, FileText } from 'lucide-react';

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
    // Почему мы добавили эти два пропса?
    // Чтобы App.tsx мог синхронизировать состояние навигации
    initialBlogId?: number | null;
    onBlogSelect?: (id: number | null) => void;
}

export function BlogsPage({ user, onNavigateToProfile, onArticleSelect, initialBlogId, onBlogSelect }: BlogsPageProps) {
    const [viewMode, setViewMode] = useState<'blogs' | 'posts'>('blogs');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedBlogId, setSelectedBlogId] = useState<number | null>(initialBlogId || null);
    
    const [blogs, setBlogs] = useState<BlogWithUser[]>([]);
    const [articles, setArticles] = useState<ArticleWithBlog[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. ПОЧЕМУ ЭТОТ EFFECT СЛЕДИТ ЗА initialBlogId?
    // Чтобы если ты вернулся со статьи, страница знала, какую папку открыть.
    useEffect(() => {
        if (initialBlogId) {
            setSelectedBlogId(initialBlogId);
            setViewMode('posts');
        }
    }, [initialBlogId]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [bRes, aRes] = await Promise.all([
                    fetch('/api/blogs'),
                    fetch('/api/community-articles') 
                ]);
                setBlogs(await bRes.json());
                setArticles(await aRes.json());
            } catch (err) {
                console.error("Data error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // 2. ПОЧЕМУ ТУТ ТЕПЕРЬ ФУНКЦИЯ getTopTagsForBlog?
    // Она позволяет вычислить теги динамически для каждой папки отдельно.
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

    // Общий ТОП-5 тегов для хедера
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

    // 3. ПОЧЕМУ МЫ ИЗМЕНИЛИ ФИЛЬТР БЛОГОВ?
    // Теперь, если выбран тег, мы показываем только те блоги, внутри которых есть статьи с этим тегом.
    const filteredBlogs = blogs.filter(b => {
        if (!selectedTag) return true;
        return articles.some(a => Number(a.blog_id) === b.id && a.tech_stack?.toLowerCase().includes(selectedTag.toLowerCase()));
    });

    const filteredArticles = articles.filter(a => {
        const matchesTag = !selectedTag || a.tech_stack?.toLowerCase().includes(selectedTag.toLowerCase());
        const matchesBlog = !selectedBlogId || Number(a.blog_id) === Number(selectedBlogId);
        return matchesTag && matchesBlog;
    });

    return (
        <div className="pb-20 animate-in fade-in duration-700">
            {/* ТЕГ-КАПСУЛА */}
            <div className="sticky top-24 z-40 mb-16 px-6">
                <div className="max-w-2xl mx-auto bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 px-8 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-6">
                        <Tag size={12} className="text-blue-500 shrink-0" />
                        <div className="flex items-center gap-4">
                            <button onClick={() => {setSelectedTag(null); setSelectedBlogId(null); onBlogSelect?.(null);}} className={`text-[9px] font-black uppercase tracking-widest ${!selectedTag ? 'text-white' : 'text-gray-500'}`}>All</button>
                            {topTags.map(tag => (
                                <button key={tag} onClick={() => setSelectedTag(tag)} className={`text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ${selectedTag === tag ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}>{tag}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-6 pl-6 border-l border-white/10">
                        <button onClick={() => setViewMode('blogs')} className={`p-2 rounded-full transition-all ${viewMode === 'blogs' ? 'bg-white text-black' : 'text-gray-500'}`}><LayoutGrid size={14} /></button>
                        <button onClick={() => setViewMode('posts')} className={`p-2 rounded-full transition-all ${viewMode === 'posts' ? 'bg-white text-black' : 'text-gray-500'}`}><List size={14} /></button>
                    </div>

                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <h1 className="text-5xl font-black uppercase tracking-tighter">
                        {selectedBlogId ? `Блог: ${blogs.find(b => b.id === selectedBlogId)?.title}` : (viewMode === 'blogs' ? 'Блоги' : 'Публикации')}
                    </h1>
                    {/* Кнопка НАЗАД (Requirement: только возвращает из папки) */}
                    {selectedBlogId && (
                        <button 
                            onClick={() => {
                                setSelectedBlogId(null); 
                                onBlogSelect?.(null); // Сообщаем App.tsx, что папка закрыта
                                setViewMode('blogs'); // Возвращаемся к сетке папок
                            }} 
                            className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 border border-white/5 bg-white/[0.02] px-5 py-2.5 rounded-xl hover:text-white hover:bg-white/5 transition-all"
                        >
                            Назад к блогам
                        </button>
                    )}
                </div>

                {selectedBlogId && viewMode === 'posts' && (
                    <div className="mb-16 p-12 bg-white/[0.02] border border-white/5 rounded-[60px] relative overflow-hidden backdrop-blur-3xl">
                        {/* Фоновый декор */}
                        <div className="absolute -right-10 -top-10 opacity-[0.03] transform rotate-12">
                            <Folder size={320} />
                        </div>

                        <div className="relative z-10">
                            {/* 1. ИНФО ОБ АВТОРЕ (Сверху, как просил) */}
                            <div className="mb-12">
                                <span className="text-[9px] font-black uppercase text-gray-600 block mb-6 tracking-widest">
                                    Автор блога
                                </span>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        {blogs.find(b => b.id === selectedBlogId)?.user?.role === 'admin' 
                                            ? <ShieldCheck size={24} className="text-blue-500" /> 
                                            : <UserIcon size={24} className="text-gray-500" />
                                        }
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded w-fit font-black uppercase">
                                            {blogs.find(b => b.id === selectedBlogId)?.user?.role}
                                        </span>
                                        <p className="text-2xl font-black text-white tracking-tighter">
                                            {blogs.find(b => b.id === selectedBlogId)?.user?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* СЕКЦИЯ: ОПИСАНИЕ */}
                            <div className="max-w-3xl mb-12">
                                <span className="text-[9px] font-black uppercase text-gray-600 block mb-4 tracking-widest">
                                    Описание блога
                                </span>
                                <p className="text-[13px] text-gray-400/80 leading-7 font-medium border-l border-white/10 pl-6 max-w-2xl whitespace-pre-line">
                                    {blogs.find(b => b.id === selectedBlogId)?.description || "Автор еще не добавил описание..."}
                                </p>
                            </div>
                            {/* 3. ТЕГИ (Улучшение: без полоски, цветные, маленькие) */}
                            <div className="flex flex-col gap-4 mt-10">
                                <span className="text-[10px] font-black uppercase text-gray-600 block italic">Теги постов</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {selectedBlogId && getTopTagsForBlog(selectedBlogId).slice(0, 10).map(tag => (
                                        <span 
                                            key={tag} 
                                            className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/10 text-blue-400/80 text-[8px] font-black uppercase rounded-lg hover:bg-blue-500/10 hover:text-blue-400 transition-all cursor-default"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="py-40 text-center opacity-20"><div className="w-10 h-10 border-2 border-t-blue-500 border-white/10 rounded-full animate-spin mx-auto" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* РЕЖИМ БЛОГОВ С ТЕГАМИ */}
                        {viewMode === 'blogs' && filteredBlogs.map(blog => {
                            const tags = getTopTagsForBlog(blog.id);
                            return (
                                <div key={blog.id} onClick={() => {setSelectedBlogId(blog.id); onBlogSelect?.(blog.id); setViewMode('posts');}} className="group p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden flex flex-col h-80">
                                    <div className="p-4 bg-white/5 w-14 h-14 rounded-2xl mb-6 text-gray-400 group-hover:text-blue-500 transition-colors"><Folder size={24}/></div>
                                    <h3 className="text-xl font-bold mb-4">{blog.title}</h3>
                                    {/* Добавляем описание (Requirement 1) */}
                                    <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 italic">
                                        {blog.description || "Нет описания..."}
                                    </p>
                                    {/* ТЕГИ ПАПКИ (Улучшение 1) */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {tags.map(t => <span key={t} className="text-[7px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded uppercase font-bold">{t}</span>)}
                                    </div>

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

                        {/* РЕЖИМ ПУБЛИКАЦИЙ (Улучшение 2 и 5) */}
                        {viewMode === 'posts' && filteredArticles.map(article => (
                            <div key={article.id} onClick={() => onArticleSelect(article)} 
                                className="group p-8 bg-white/[0.01] border border-white/5 rounded-[40px] hover:border-blue-500/20 transition-all cursor-pointer relative overflow-hidden flex flex-col h-80">
                                
                                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all"><ArrowRight size={20} className="text-blue-500" /></div>
                                
                                <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-blue-400 transition-colors pr-10">{article.title}</h3>
                                
                                {/* Краткое содержимое */}
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
                                    <div className="flex flex-wrap gap-1">
                                        {article.tech_stack?.split(',').slice(0, 2).map(t => (
                                            <span key={t} className="text-[7px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500 uppercase font-bold">{t.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}