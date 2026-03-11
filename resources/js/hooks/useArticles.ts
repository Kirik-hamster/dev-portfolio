import { useState, useEffect, useCallback } from 'react';
import { Article, BlogPagination } from '../types';
import { ArticleApiService } from '../services/ArticleApiService';

export function useArticles(
    searchQuery: string, 
    blogId: number | null, 
    searchType: string = 'title', 
    sort: string = 'latest', 
    favoritesOnly: boolean = false
) {
    const [pagination, setPagination] = useState<BlogPagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            // Собираем все параметры для твоего сервиса
            const params = {
                page: currentPage,
                search: searchQuery,
                search_type: searchType,
                sort: sort,
                favorites_only: favoritesOnly
            };

            let data;
            if (blogId) {
                // Вызываем твой fetchByBlog(blogId, params)
                data = await ArticleApiService.fetchByBlog(blogId, params);
            } else {
                data = await ArticleApiService.fetchPortfolio(searchQuery, currentPage);
            }
            
            setPagination(data);
        } catch (err) {
            console.error("Ошибка при получении статей:", err);
            setPagination(null);
        } finally {
            setLoading(false);
        }
        // Добавляем все новые фильтры в зависимости useCallback
    }, [blogId, searchQuery, currentPage, searchType, sort, favoritesOnly]); 

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const deleteArticle = async (id: number) => {
        const res = await ArticleApiService.delete(id);
        if (res.ok) fetchArticles();
    };

    return { 
        articles: (pagination?.data as unknown as Article[]) || [], 
        pagination, 
        currentPage, 
        setCurrentPage, 
        loading, 
        deleteArticle 
    };
}