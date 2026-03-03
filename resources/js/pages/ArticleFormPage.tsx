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
    const { articleId, blogId } = useParams(); // Берем ID прямо из URL
    const navigate = useNavigate();
    const [article, setArticle] = React.useState<Article | undefined>(undefined);
    const [loading, setLoading] = React.useState(false);

    const [modalConfig, setModalConfig] = React.useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'error',
        title: '',
        message: ''
    });

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
        const targetBlogId = blogId ? Number(blogId) : article?.blog_id;

        const res = await ArticleApiService.save(data, targetBlogId, article?.id);

        if (res.ok) {
            onSave();
        } else if (res.status === 422) {
            const errorData = await res.json();
            const errorMessage = errorData.errors?.slug?.[0] 
                || errorData.errors?.title?.[0] 
                || "Проверьте правильность введенных данных";

            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Дубликат данных',
                message: `К сожалению, запись с таким названием или адресом уже существует.\n\nОшибка: ${errorMessage}`
            });
        } else {
            // Любая другая ошибка сервера
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Упс!',
                message: 'Что-то пошло не так на сервере. Попробуйте еще раз позже.'
            });
        }
    };

    if (loading) return <PremiumLoader />;

    return (
        <>
            <ScrollToTop />
            <ArticleForm 
                article={article} 
                onSave={handleSave} 
                onCancel={onCancel} 
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