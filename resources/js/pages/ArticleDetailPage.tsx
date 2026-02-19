
import React, { useEffect, useState } from 'react';
import { Article, User } from '../types';
import { ArticleApiService } from '../services/ArticleApiService';
import { CommentSection } from '../components/CommentSection';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { PremiumLoader } from '../components/PremiumLoader';


interface ArticleDetailPageProps {
    articleId: number;
    onBack: () => void;
    user: User | null;       
    onNavigateToLogin: () => void; 
}

/**
 * Страница детального просмотра статьи.
 * Загружает и отображает полную информацию о статье и ее комментарии.
 */
export function ArticleDetailPage({ articleId, onBack, user, onNavigateToLogin }: ArticleDetailPageProps) {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchArticle = () => {
        setLoading(true);
        ArticleApiService.fetchOne(articleId)
            .then(data => {
                setArticle(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchArticle();
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Плавный скролл при открытии
    }, [articleId]);

    if (loading && !article) {
        return <PremiumLoader />;
    }

    if (!article) {
        return <p>Article not found.</p>;
    }

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-12 transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to entries
            </button>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-8">{article.title}</h1>

            <div className="flex items-center gap-4 mb-12">
                <button
                    onClick={() => document.getElementById('discussion-area')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-[10px] font-black uppercase text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                >
                    <MessageSquare size={12} />
                    {article.comments?.length || 0} Comments
                </button>
                <div className="h-px flex-1 bg-white/5"></div>
            </div>

            <div className="prose-editor shadow-2xl" dangerouslySetInnerHTML={{ __html: article.content }} />

            <div id="discussion-area" className="mt-20 pt-20 border-white/5">
                <CommentSection
                    articleId={article.id}
                    comments={article.comments || []}
                    onCommentAdded={fetchArticle}
                    user={user} // ПЕРЕДАЕМ ЮЗЕРА
                    onNavigateToLogin={onNavigateToLogin} // ПЕРЕДАЕМ ПЕРЕХОД
                />
            </div>
        </div>
    );
}
