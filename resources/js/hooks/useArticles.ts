// resources/js/hooks/useArticles.ts
import { useState, useEffect, useCallback } from 'react';
import { Article } from '../types';
import { ArticleApiService } from '../services/ArticleApiService';

export function useArticles(searchQuery: string, blogId?: number) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Оборачиваем в useCallback, чтобы функция не создавалась заново зря
    const fetchArticles = useCallback(async (query = '') => {
        setLoading(true);
        try {
            // Решаем, куда стучаться
            const data = blogId 
                ? await ArticleApiService.fetchByBlog(blogId, query) 
                : await ArticleApiService.fetchPortfolio(query);
            
            setArticles(data);
        } catch (err) {
            console.error("Ошибка при получении статей:", err);
            setArticles([]); // Если ошибка — считаем, что пусто
        } finally {
            // ВЫКЛЮЧАЕМ ЗАГРУЗКУ В ЛЮБОМ СЛУЧАЕ!
            setLoading(false);
        }
    }, [blogId]);

    // ОСНОВНОЙ ТРИГГЕР: срабатывает при входе в папку или поиске
    useEffect(() => {
        fetchArticles(searchQuery);
    }, [fetchArticles, searchQuery]);

    const deleteArticle = async (id: number) => {
        const res = await ArticleApiService.delete(id);
        if (res.ok) fetchArticles(searchQuery);
    };

    return { articles, loading, fetchArticles, deleteArticle };
}