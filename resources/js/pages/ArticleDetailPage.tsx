// resources/js/pages/ArticleDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Article, User } from '../types';
import { ArticleApiService } from '../services/ArticleApiService';
import { CommentSection } from '../components/comments/CommentSection';
import { 
    ArrowLeft, ArrowUpRight, ListTree, ChevronRight, 
    User as UserIcon, Clock, Eye, MessageSquare, Heart, AlignLeft, X 
} from 'lucide-react';
import { PremiumLoader } from '../components/PremiumLoader';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { ArticleNavigation } from '@/components/ArticlePage/ArticleNavigation';

export function ArticleDetailPage({ articleId, onBack, user, onNavigateToLogin }: any) {
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
    const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

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
            <ScrollToTop />
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 xl:gap-24 items-start">
                <main className="min-w-0 py-6">
                    
                    {/* ВЕРХНЯЯ НАВИГАЦИЯ */}
                    <div className="flex flex-col gap-8 mb-16">
                        <button onClick={handleBack} className="w-fit flex items-center gap-2 text-gray-500 hover:text-white transition-all font-bold uppercase text-[10px] tracking-widest group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Назад
                        </button>

                        <div className="flex flex-wrap items-center gap-6 text-gray-500 border-b border-white/5 pb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl">
                                    <UserIcon size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-white uppercase tracking-wider">{article.user?.name}</span>
                                    {/* РОЛЬ АВТОРА */}
                                    <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">{article.user?.role || 'Contributor'}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-[11px] opacity-60">
                                <Clock size={14} />
                                <span>{new Date(article.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>

                            <div className="flex items-center gap-6 ml-auto">
                                <div className="flex items-center gap-1.5 text-xs opacity-50"><Eye size={14} /> {article.views_count || 0}</div>
                                <div className="flex items-center gap-1.5 text-xs opacity-50"><MessageSquare size={14} /> {article.comments_count || 0}</div>
                                <div className="flex items-center gap-1.5 text-xs text-blue-500 font-black"><Heart size={14} fill={article.is_liked ? "currentColor" : "none"} /> {article.likes_count || 0}</div>
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
                        <CommentSection articleId={article.id} comments={article.comments || []} user={user} onNavigateToLogin={onNavigateToLogin} onCommentAdded={() => {}} targetCommentId={0} />
                    </div>
                </main>

                {/* 3. СОДЕРЖАНИЕ (Desktop) */}
                <ArticleNavigation toc={toc} onItemClick={(h) => scrollTo(h.id!)} />
            </div>

            {/* МОБИЛЬНОЕ СОДЕРЖАНИЕ (Кнопка) */}
            <div className="lg:hidden fixed bottom-6 right-6 z-[60]">
                <button 
                    onClick={() => setIsMobileTocOpen(true)}
                    className="p-5 bg-white text-black rounded-full shadow-2xl active:scale-95 transition-all border border-black/10"
                >
                    <AlignLeft size={24} />
                </button>
            </div>

            {/* Mobile TOC Drawer */}
            {isMobileTocOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] flex flex-col justify-end p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsMobileTocOpen(false)} />
                    <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[40px] p-8 max-h-[70vh] overflow-y-auto shadow-3xl animate-in slide-in-from-bottom-10 duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3 text-blue-500">
                                <ListTree size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Содержание</span>
                            </div>
                            <button onClick={() => setIsMobileTocOpen(false)} className="p-2 text-gray-500"><X size={20}/></button>
                        </div>
                        <nav className="flex flex-col gap-6">
                            {toc.map((h, i) => (
                                <button key={i} onClick={() => scrollTo(h.id!)} className={`text-left transition-all ${h.level === 1 ? 'text-sm font-black text-white uppercase' : 'text-xs font-bold text-gray-500 pl-4 border-l border-white/5'}`}>
                                    {h.text}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
}