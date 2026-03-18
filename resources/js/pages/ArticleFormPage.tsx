// resources/js/pages/ArticleFormPage.tsx
import { ArticleForm } from '@/components/ArticleForm';
import { PremiumLoader } from '@/components/PremiumLoader';
import { StatusModal } from '@/components/ui/StatusModal';
import { ArticleApiService } from '@/services/ArticleApiService';
import { Article, ArticleInput, User } from '@/types';
import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ScrollToTop } from '../components/ui/ScrollToTop';

interface ArticleFormPageProps {
    user: User | null;
    onSave: () => void;
    onCancel: () => void;
}

export function ArticleFormPage({ user, onSave, onCancel }: ArticleFormPageProps) {
    if (!user) return <Navigate to="/login" replace />;
    
    const { articleId, blogId } = useParams();
    const navigate = useNavigate();
    
    // Тип стейта совпадает с пропсом в ArticleForm
    const [article, setArticle] = React.useState<Article | undefined>(undefined);
    const [loading, setLoading] = React.useState(false);

    const [modalConfig, setModalConfig] = React.useState({
        isOpen: false,
        type: 'error' as 'success' | 'error',
        title: '',
        message: ''
    });

    React.useEffect(() => {
        if (articleId) {
            setLoading(true);
            ArticleApiService.fetchOne(Number(articleId))
                .then(data => {
                    if (user.role !== 'admin' && data.user_id !== user.id) {
                        navigate('/');
                        return;
                    }
                    setArticle(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                    navigate('/portfolio');
                });
        }
    }, [articleId, user.id, user.role, navigate]);

    const handleSave = async (data: ArticleInput) => {
        const targetBlogId = blogId ? Number(blogId) : article?.blog_id;
        const res = await ArticleApiService.save(data, targetBlogId, article?.id);

        if (res.ok) {
            onSave();
        } else {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Ошибка сохранения',
                message: 'Не удалось опубликовать запись. Проверьте уникальность заголовка.'
            });
        }
    };

    if (loading || (articleId && !article)) {
        return <PremiumLoader />;
    }

    return (
        <>
            <ArticleForm 
                article={article} // Теперь TS не ругается, типы идентичны!
                onSave={handleSave} 
                onCancel={onCancel} 
                user={user} 
            />
            <StatusModal 
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
}