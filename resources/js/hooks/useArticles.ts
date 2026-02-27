// resources/js/hooks/useArticles.ts
import { useState, useEffect, useCallback } from 'react';
import { Article, BlogPagination } from '../types';
import { ArticleApiService } from '../services/ArticleApiService';

export function useArticles(searchQuery: string, blogId?: number) {
    // Явно указываем тип для пагинации
    const [pagination, setPagination] = useState<BlogPagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchArticles = useCallback(async (query = '', page = 1) => {
        setLoading(true);
        try {
            const data = blogId 
                ? await ArticleApiService.fetchByBlog(blogId, query, page) 
                : await ArticleApiService.fetchPortfolio(query, page);
            
            setPagination(data);
        } catch (err) {
            console.error("Ошибка при получении статей:", err);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [blogId]);

    useEffect(() => {
        fetchArticles(searchQuery, currentPage);
    }, [fetchArticles, searchQuery, currentPage]);

    const deleteArticle = async (id: number) => {
        const res = await ArticleApiService.delete(id);
        if (res.ok) fetchArticles(searchQuery, currentPage);
    };

    return { 
        // Безопасно достаем массив статей
        articles: (pagination?.data as unknown as Article[]) || [], 
        pagination, 
        currentPage, 
        setCurrentPage, 
        loading, 
        deleteArticle 
    };
}