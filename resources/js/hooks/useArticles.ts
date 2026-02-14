
import { useState, useEffect, useCallback } from 'react';
import { Article } from '../types';
import { ArticleApiService } from '../services/ArticleApiService';

/**
 * Хук для управления статьями.
 * Инкапсулирует всю логику по загрузке, созданию, обновлению,
 * удалению и поиску статей. Предоставляет простой API для компонентов.
 * @returns \{ articles, loading, fetchArticles, deleteArticle \}
 */
export function useArticles(searchQuery: string) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchArticles = useCallback((query = '') => {
        setLoading(true);
        ArticleApiService.fetchAll(query)
            .then(data => {
                setArticles(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        // Дебаунс для поискового запроса, чтобы не слать запросы на каждое нажатие
        const timer = setTimeout(() => fetchArticles(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchArticles]);

    const deleteArticle = async (id: number) => {
        const res = await ArticleApiService.delete(id);
        if (res.ok) {
            // Перезагружаем список статей после успешного удаления
            fetchArticles(searchQuery);
        }
    };

    return { articles, loading, fetchArticles, deleteArticle };
}
