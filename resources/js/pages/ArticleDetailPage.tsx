// resources/js/pages/ArticleDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Article, User } from '../types';
import { ArticleApiService } from '../services/ArticleApiService';
import { CommentSection } from '../components/comments/CommentSection';
import { 
    ArrowLeft, User as UserIcon, Clock, Eye, MessageSquare, Heart,
    ShieldCheck,
    Pencil
} from 'lucide-react';
import { PremiumLoader } from '../components/PremiumLoader';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { ArticleNavigation } from '@/components/ArticlePage/ArticleNavigation';
import { MobileTocToggle } from '@/components/ui/MobileTocToggle';
import { MobileTocDrawer } from '@/components/ui/MobileTocDrawer';

export function ArticleDetailPage({ articleId, onBack, user, onNavigateToLogin }: any) {
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
    const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleToggleLike = async () => {
        // Если юзер не залогинен — отправляем на вход
        if (!user) return onNavigateToLogin();
        if (!article) return;

        try {
            const res = await ArticleApiService.toggleLike(article.id);
            if (res.ok) {
                const data = await res.json();
                // Обновляем состояние статьи локально, чтобы цифра изменилась мгновенно
                setArticle(prev => prev ? { 
                    ...prev, 
                    is_liked: data.is_liked, 
                    likes_count: data.likes_count 
                } : null);
            }
        } catch (err) {
            console.error("Ошибка при попытке поставить лайк:", err);
        }
    };

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else if (article) {
            onBack(article); 
        }
    };

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        ArticleApiService.fetchOne(articleId).then((data: Article) => {
            if (!isMounted) return;
            const htmlString = data.content ?? "";
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const headings = Array.from(doc.querySelectorAll('h1, h2, h3')).map((h, i) => {
                const id = `section-${i}`;
                h.id = id;
                return { id, text: h.textContent || "", level: parseInt(h.tagName.charAt(1), 10) };
            });

            setToc(headings);
            setArticle({ ...data, content: doc.body.innerHTML });
            setLoading(false);
        });
        return () => { isMounted = false; };
    }, [articleId]);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 100;
            const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
            setIsMobileTocOpen(false);
        }
    };

    if (loading || !article) return <PremiumLoader />;

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative animate-in fade-in duration-700">
            <ScrollToTop hasOffset={toc.length > 0 && isMobile} />
            
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-8 xl:gap-16 items-start">
                <main className="min-w-0 py-6">
                    
                    {/* ВЕРХНЯЯ НАВИГАЦИЯ */}
                    <div className="flex flex-col gap-8 mb-16">
                        
                        {/* СТРОКА 1: СИСТЕМНАЯ ПАНЕЛЬ (НАЗАД + СТАТИСТИКА) */}
                        <div className="flex items-center justify-between w-full h-6">
                            <button 
                                onClick={handleBack} 
                                className="flex items-center gap-2 text-gray-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.2em] group"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                                <span>Назад</span>
                            </button>

                            <div className="flex items-center gap-5 text-gray-500">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight opacity-50">
                                    <Eye size={14} strokeWidth={2.5} /> 
                                    <span>{article.views_count || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight opacity-50">
                                    <MessageSquare size={14} strokeWidth={2.5} /> 
                                    <span>{article.comments_count || 0}</span>
                                </div>
                                <button 
                                    onClick={handleToggleLike} 
                                    className={`
                                        flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight transition-all active:scale-90
                                        ${article.is_liked ? 'text-red-500' : 'text-blue-500 hover:text-red-400'}
                                    `}
                                >
                                    <Heart 
                                        size={14} 
                                        strokeWidth={2.5}
                                        fill={article.is_liked ? "currentColor" : "none"} 
                                    /> 
                                    <span>{article.likes_count || 0}</span>
                                </button>
                            </div>
                        </div>

                        {/* СТРОКА 2: ИНФО-ПАНЕЛЬ (АВТОР + ДАТЫ) */}
                        <div className="flex flex-wrap items-center justify-between gap-y-6 border-b border-white/5 pb-8">
                            {/* БЛОК АВТОРА */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl">
                                        <UserIcon size={20} />
                                    </div>
                                    {article.user?.role === 'admin' && (
                                        <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-[#050505] flex items-center justify-center">
                                            <ShieldCheck size={10} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-[11px] font-black text-white uppercase tracking-wider leading-none mb-1.5">
                                        {article.user?.name}
                                    </span>
                                    <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest leading-none">
                                        {article.user?.role || 'Contributor'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* БЛОК ДАТ (ВЫРОВНЕН ПО ВЫСОТЕ С АВТОРОМ) */}
                            <div className="flex flex-col items-end justify-center">
                                <div className="grid grid-cols-[auto_12px] lg:grid-cols-[auto_auto_12px] gap-x-2 lg:gap-x-4 gap-y-1.5 items-center text-[9px] uppercase font-black tracking-[0.1em]">
                                    
                                    {/* СТРОКА 1: ДАТА СОЗДАНИЯ */}
                                    <span className="hidden lg:block opacity-40 text-left text-gray-500">Опубликовано</span>
                                    <span className="text-gray-300 text-right lg:text-left lg:min-w-[110px]">
                                        {new Date(article.created_at).toLocaleDateString('ru-RU', { 
                                            day: 'numeric', 
                                            month: window.innerWidth < 1024 ? 'short' : 'long', // Короткий месяц на мобилках
                                            year: 'numeric' 
                                        })}
                                    </span>
                                    <Clock size={12} className="opacity-30 justify-self-end" />
                                    
                                    {/* СТРОКА 2: ДАТА ОБНОВЛЕНИЯ */}
                                    {article.updated_at && article.updated_at !== article.created_at && (
                                        <>
                                            <span className="hidden lg:block opacity-50 text-left text-blue-400/80">Обновлено</span>
                                            <span className="text-blue-400/80 text-right lg:text-left lg:min-w-[110px]">
                                                {new Date(article.updated_at).toLocaleDateString('ru-RU', { 
                                                    day: 'numeric', 
                                                    month: window.innerWidth < 1024 ? 'short' : 'long',
                                                    year: 'numeric' 
                                                })}
                                            </span>
                                            <Pencil size={11} className="text-blue-500/50 justify-self-center" />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ТИТУЛЬНЫЙ БЛОК */}
                    <div className="mb-20">
                        {/* ПОДПИСЬ НАД НАЗВАНИЕМ */}
                        <label className="text-[10px] font-black uppercase text-blue-500/50 tracking-[0.4em] mb-4 block italic">Название поста</label>
                        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1] text-white uppercase mb-12">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap gap-2">
                            {article.tech_stack?.split(',').map((tag: string) => (
                                <span key={tag} className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-gray-400 font-bold hover:text-blue-400 transition-colors">
                                    #{tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    <article className="prose-editor w-full mb-40" dangerouslySetInnerHTML={{ __html: article.content }} />

                    <div id="discussion-area" className="mt-32 border-t border-white/5 pt-20">
                        <CommentSection articleId={article.id} comments={article.comments || []} user={user} onNavigateToLogin={onNavigateToLogin} targetCommentId={0} />
                    </div>
                </main>

                {/* СОДЕРЖАНИЕ (Desktop) */}
                <ArticleNavigation toc={toc} onItemClick={(h) => scrollTo(h.id!)} />
            </div>

            {/* МОБИЛЬНОЕ СОДЕРЖАНИЕ (Кнопка) */}
            {toc.length > 0 && (
                <MobileTocToggle 
                    onClick={() => setIsMobileTocOpen(!isMobileTocOpen)} 
                    isOpen={isMobileTocOpen} 
                />
            )}

            {/* Mobile TOC Drawer */}
            <MobileTocDrawer 
                isOpen={isMobileTocOpen} 
                onClose={() => setIsMobileTocOpen(false)} 
                toc={toc} 
                onScrollTo={scrollTo} 
            />
        </div>
    );
}