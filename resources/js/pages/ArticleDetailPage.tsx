import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Article, User } from '../types';
import { ArticleApiService } from '../services/ArticleApiService';
import { CommentSection } from '../components/comments/CommentSection';
import { ArrowLeft, ArrowUpRight, ListTree, ChevronRight } from 'lucide-react';
import { PremiumLoader } from '../components/PremiumLoader';
import { ScrollToTop } from '../components/ui/ScrollToTop';

export function ArticleDetailPage({ articleId, onBack, user, onNavigateToLogin }: any) {
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
    const [targetCommentId, setTargetCommentId] = useState<number | null>(null);

    // Обработка кнопки Назад
    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else if (article) {
            onBack(article); 
        }
    };

    // Хеш комментариев
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#comment-')) {
            const id = parseInt(hash.replace('#comment-', ''), 10);
            if (!isNaN(id)) setTargetCommentId(id);
        }
    }, []);

    // ЕДИНСТВЕННЫЙ эффект загрузки
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        
        ArticleApiService.fetchOne(articleId)
            .then((data: Article) => {
                if (!isMounted) return;
                
                const htmlString = data.content ?? "";
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');
                
                const headings = Array.from(doc.querySelectorAll('h1, h2, h3')).map((h, i) => {
                    const id = `section-${i}`;
                    h.id = id;
                    const levelChar = h.tagName.charAt(1); 
                    return { 
                        id, 
                        text: h.textContent || "Untitled", 
                        level: levelChar ? parseInt(levelChar, 10) : 1 
                    };
                });

                setToc(headings);
                setArticle({ ...data, content: doc.body.innerHTML });
                setLoading(false);
            })
            .catch(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [articleId]);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 120;
            const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        }
    };

    if (loading || !article) return <PremiumLoader />;

    return (
        <div className="max-w-[1600px] mx-auto px-6 relative animate-in fade-in duration-1000">
            <ScrollToTop />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12 xl:gap-24 items-start">
                <div className="min-w-0 order-2 lg:order-1">
                    <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-white mb-12 transition-all group font-black uppercase text-[10px] tracking-[0.2em]">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад
                    </button>
                    <h1 className="text-6xl sm:text-9xl font-black tracking-tighter leading-[0.8] mb-16 uppercase text-white drop-shadow-2xl">{article.title}</h1>
                    <div className="prose prose-invert prose-2xl max-w-none prose-headings:text-white prose-p:text-gray-400" dangerouslySetInnerHTML={{ __html: article.content }} />
                    <div id="discussion-area" className="mt-32 border-t border-white/5 pt-20">
                        <CommentSection articleId={article.id} comments={article.comments || []} user={user} onNavigateToLogin={onNavigateToLogin} onCommentAdded={() => {}} targetCommentId={targetCommentId || 0} />
                    </div>
                </div>
                <aside className="hidden lg:block sticky top-32 order-2">
                    <div className="p-10 bg-white/[0.01] border border-white/10 rounded-[50px] backdrop-blur-3xl shadow-3xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/5 rounded-full blur-[80px]" />
                        <div className="flex items-center gap-3 mb-12"><ListTree size={16} className="text-blue-500" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Navigation</span></div>
                        <nav className="flex flex-col gap-8">
                            {toc.map((item) => (
                                <button key={item.id} onClick={() => scrollTo(item.id)} className={`text-left text-[11px] font-black uppercase tracking-tight transition-all hover:text-blue-400 leading-tight ${item.level === 1 ? 'text-white/90' : 'text-gray-500 pl-4 border-l border-white/5'}`}>{item.text}</button>
                            ))}
                        </nav>
                    </div>
                </aside>
            </div>
        </div>
    );
}