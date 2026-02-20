// resources/js/pages/ArticleFormPage.tsx
import { ArticleForm } from '@/components/ArticleForm';
import { PremiumLoader } from '@/components/PremiumLoader';
import { ArticleApiService } from '@/services/ArticleApiService';
import { Article, ArticleInput, User } from '@/types';
import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';

interface ArticleFormPageProps {
    user: User | null;
    onSave: () => void;
    onCancel: () => void;
}

export function ArticleFormPage({ user, onSave, onCancel }: ArticleFormPageProps) {
    if (!user) return <Navigate to="/login" replace />;
    const { articleId, blogId } = useParams(); // Берем ID прямо из URL
    const navigate = useNavigate();
    const [article, setArticle] = React.useState<Article | undefined>(undefined);
    const [loading, setLoading] = React.useState(false);

    // Если в URL есть articleId, значит мы РЕДАКТИРУЕМ
    React.useEffect(() => {
        if (articleId) {
            setLoading(true);
            ArticleApiService.fetchOne(Number(articleId))
                .then(data => {
                    const isOwner = data.user_id === user.id;
                    const isAdmin = user.role === 'admin';

                    if (!isAdmin && !isOwner) {
                        navigate('/');
                        return;
                    }
                    setArticle(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                    navigate('/portfolio'); // Если статьи нет, уходим
                });
        }
    }, [articleId]);

    const handleSave = async (data: ArticleInput) => {
        // Если создаем новую — берем blogId из URL (/form/new/:blogId)
        // Если редактируем — берем оригинальный blog_id из статьи
        const targetBlogId = blogId ? Number(blogId) : article?.blog_id;

        const res = await ArticleApiService.save(data, targetBlogId, article?.id);
        if (res.ok) onSave();
    };

    if (loading) return <PremiumLoader />;

    return (
        <ArticleForm 
            article={article} 
            onSave={handleSave} 
            onCancel={onCancel} 
        />
    );
}