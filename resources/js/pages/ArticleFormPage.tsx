import React from 'react';
import { ArticleForm } from '../components/ArticleForm';
import { Article, User } from '../types'; // ДОБАВИЛИ User В ИМПОРТ
import { ArticleApiService } from '../services/ArticleApiService';

interface ArticleFormPageProps {
    user: User | null; 
    article?: Article;
    onSave: () => void;
    onCancel: () => void;
}

/**
 * Страница-обертка для формы создания/редактирования статьи.
 * Теперь эта страница отвечает за вызов API для сохранения данных.
 */
export function ArticleFormPage({ user, article, onSave, onCancel }: ArticleFormPageProps) {
    
    // Новая функция, которая будет передана в форму
    const handleSave = async (data: any) => {
        const res = await ArticleApiService.save(data, article?.id);
        if (res.ok) {
            onSave(); // Вызываем onSave, который пришел от App.tsx для навигации
        } else {
            // Здесь можно добавить обработку ошибок, например, показать уведомление
            console.error("Failed to save the article");
            alert("Ошибка: не удалось сохранить статью!");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ArticleForm
                article={article}
                onSave={handleSave} // Передаем новую функцию
                onCancel={onCancel}
            />
        </div>
    );
}
