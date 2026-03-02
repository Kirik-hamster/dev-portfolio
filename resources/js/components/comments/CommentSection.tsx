import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User, Comment } from '../../types';
import { CommentApiService } from '@/services/CommentApiService';
import { CommentItem } from './CommentItem';
import { AuthRequiredModal } from '../ui/AuthRequiredModal';

interface CommentSectionProps {
    articleId: number;
    comments: Comment[];
    targetCommentId: number | null;
    onCommentAdded: () => void;
    user: User | null;
    onNavigateToLogin: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ 
    articleId, 
    comments, 
    targetCommentId, 
    onCommentAdded, 
    user, 
    onNavigateToLogin 
}) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
 
    const [localComments, setLocalComments] = useState<Comment[]>(comments);

    const [sort, setSort] = useState<'new' | 'popular' | 'discussed'>('popular');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const loadRootComments = async (isInitial = false) => {
        setLoading(true);
        const targetPage = isInitial ? 1 : page;
        const res = await CommentApiService.fetchComments(articleId, sort, targetPage);
        
        setLocalComments(prev => isInitial ? res.data : [...prev, ...res.data]);
        setTotal(res.total);
        setHasMore(res.current_page < res.last_page);
        setPage(res.current_page + 1);
        setLoading(false);
    };

    useEffect(() => { loadRootComments(true); }, [sort, articleId]);

    // Синхронизируем, если пришли новые комменты от родителя (например, при заходе в статью)
    useEffect(() => {
        setLocalComments(comments);
    }, [comments]);

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await CommentApiService.add(articleId, content);
            if (res.ok) {
                const newComment = await res.json();
                setContent('');
                setLocalComments(prev => [newComment, ...prev]);
                setTotal(prev => prev + 1);
            }
        } catch (e) {
            console.error("Ошибка при создании:", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const countTotal = (list: Comment[]): number => {
        return list.reduce((acc, c) => acc + 1 + (c.replies ? countTotal(c.replies) : 0), 0);
    };

    const totalCount = countTotal(localComments);

    const handleLike = async (commentId: number) => {
        if (!user) return setIsAuthModalOpen(true);

        try {
            const data = await CommentApiService.toggleLike(commentId);
            
            // МГНОВЕННОЕ ОБНОВЛЕНИЕ ЦИФРЫ БЕЗ СДВИГА КОНТЕНТА
            const updateCountOnly = (list: Comment[]): Comment[] => {
                return list.map((c) => {
                    // Если это тот самый коммент — обновляем только лайки
                    if (c.id === commentId) {
                        return { ...c, likes_count: data.likes_count };
                    }
                    // Если есть ответы — идем вглубь
                    if (c.replies && c.replies.length > 0) {
                        return { ...c, replies: updateCountOnly(c.replies) };
                    }
                    return c;
                });
            };

            // Обновляем локальное состояние
            setLocalComments((prev) => updateCountOnly(prev));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-12">

            {/* ФОРМА ДЛЯ ОСТАВЛЕНИЯ КОММЕНТАРИЯ */}
            {!user ? (
                <div className="bg-white/[0.01] border border-dashed border-white/10 p-12 rounded-[40px] text-center">
                    <button onClick={onNavigateToLogin} className="px-8 py-3 bg-white text-black rounded-full font-black uppercase text-[9px] tracking-widest">Войти в аккаунт</button>
                </div>
            ) : (
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] relative">
                    <textarea 
                        value={content} onChange={e => setContent(e.target.value)}
                        placeholder={`${user.name}, что думаете?`}
                        className="w-full bg-transparent border-none text-white outline-none text-sm min-h-[100px] resize-none pb-12"
                    />
                    <div className="absolute bottom-6 right-8 left-8 flex justify-between items-center pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                {user.role === 'admin' ? <ShieldCheck size={12} className="text-blue-500"/> : <UserIcon size={12} className="text-gray-500"/>}
                            </div>
                            <span className="text-[9px] font-black uppercase text-gray-500">{user.name}</span>
                        </div>
                        <button 
                            onClick={handleSubmit} 
                            // Условие остается прежним — оно верное
                            disabled={!content.trim() || isSubmitting} 
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-[9px] uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:shadow-none"
                        >
                            <Send size={12} /> Post
                        </button>
                    </div>
                </div>
            )}

            {/* Твои табы фильтров (Новые / Топ / Обсуждаемые) */}
            <div className="flex gap-6 border-b border-white/5 pb-4">
                {['popular', 'new', 'discussed'].map(s => (
                    <button key={s} onClick={() => setSort(s as any)} 
                        className={`text-[10px] font-black uppercase tracking-widest ${sort === s ? 'text-blue-500' : 'text-gray-600'}`}>
                        {s === 'popular' ? 'Залайканные' : s === 'new' ? 'Новые' : 'Обсуждаемые'}
                    </button>
                ))}
            </div>

            {/* СПИСОК (Используем localComments) */}
            <div className="space-y-6">
                <AuthRequiredModal 
                    isOpen={isAuthModalOpen} 
                    onClose={() => setIsAuthModalOpen(false)} 
                />
                {localComments.map((comment) => (
                    <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        sort={sort}
                        user={user} 
                        depth={0}
                        targetCommentId={targetCommentId}
                        onAction={() => loadRootComments(true)}
                        handleLike={handleLike} 
                        onAuthRequired={() => setIsAuthModalOpen(true)}
                    />
                ))}
            </div>
            {/* КНОПКА СМОТРЕТЬ ЕЩЕ КОРНИ */}
            {hasMore && (
                <button onClick={() => loadRootComments()} disabled={loading} className="w-full py-4 text-[9px] font-black uppercase text-gray-500 hover:text-white transition-all bg-white/[0.02] rounded-2xl border border-white/5">
                    {loading ? 'Загрузка...' : 'Показать больше'}
                </button>
            )}
        </div>
    );
};