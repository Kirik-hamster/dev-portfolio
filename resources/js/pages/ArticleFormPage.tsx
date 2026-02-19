// resources/js/pages/ArticleFormPage.tsx
import { ArticleForm } from '@/components/ArticleForm';
import { PremiumLoader } from '@/components/PremiumLoader';
import { ArticleApiService } from '@/services/ArticleApiService';
import { Article } from '@/types';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Добавь эти импорты

export function ArticleFormPage({ user, onSave, onCancel }: any) {
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
                    setArticle(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                    navigate('/portfolio'); // Если статьи нет, уходим
                });
        }
    }, [articleId]);

    const handleSave = async (data: any) => {
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