import React from 'react';
import { ArticleForm } from '../components/ArticleForm';
import { Article, User } from '../types'; 
import { ArticleApiService } from '../services/ArticleApiService';

interface ArticleFormPageProps {
    user: User | null; 
    blogId?: number | null; // ДОБАВЛЕНО: принимаем ID текущей папки из App.tsx
    article?: Article;
    onSave: () => void;
    onCancel: () => void;
}

/**
 * Страница-обертка для формы создания/редактирования статьи.
 */
export function ArticleFormPage({ user, blogId, article, onSave, onCancel }: ArticleFormPageProps) {
    
    const handleSave = async (data: any) => {
        // ПОРЯДОК: Данные, ID папки (блога), ID статьи (если редактируем)
        const res = await ArticleApiService.save(
            data, 
            blogId ?? undefined, // Берем из пропсов, исправляем null на undefined
            article?.id
        );

        if (res.ok) {
            onSave(); 
        } else {
            // Выводим текст ошибки, если сервер ответил 500 или 404
            const errorText = await res.text();
            alert("Ошибка сервера: " + errorText);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ArticleForm
                article={article}
                onSave={handleSave} 
                onCancel={onCancel}
            />
        </div>
    );
}