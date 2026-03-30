import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User, Comment, CommentSort, ErrorModalState, PaginatedResponse } from '../../types';
import { CommentApiService } from '@/services/CommentApiService';
import { CommentItem } from './CommentItem';
import { AuthRequiredModal } from '../ui/AuthRequiredModal';
import { StatusModal } from '../ui/StatusModal';

interface CommentSectionProps {
    articleId: number;
    comments: Comment[];
    targetCommentId: number | null;
    user: User | null;
    onNavigateToLogin: () => void;
    ancestorIds?: number[];
}

const MAX_CHARS = 1000;

export const CommentSection: React.FC<CommentSectionProps> = ({ 
    articleId, 
    comments, 
    targetCommentId, 
    user, 
    onNavigateToLogin, 
    ancestorIds = []
}) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
 
    const [localComments, setLocalComments] = useState<Comment[]>(comments);

    const [sort, setSort] = useState<CommentSort>('popular');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [errorModal, setErrorModal] = useState<ErrorModalState>({ 
        isOpen: false, 
        title: '', 
        message: '' 
    });

    const loadRootComments = async (isInitial = false) => {
        setLoading(true);
        const targetPage = isInitial ? 1 : page;
        try {
            const res: PaginatedResponse<Comment> = await CommentApiService.fetchComments(articleId, sort, targetPage);
            setLocalComments(prev => isInitial ? res.data : [...prev, ...res.data]);
            setTotal(res.total);
            setHasMore(res.current_page < res.last_page);
            setPage(res.current_page + 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        setLocalComments(prev => prev.filter(c => c.id !== id));
        setTotal(prev => prev - 1);
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Этот эффект будет срабатывать при каждом изменении контента
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Сбрасываем высоту, чтобы вычислить новую
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Ставим высоту равную контенту
        }
    }, [content]);

    useEffect(() => { loadRootComments(true); }, [sort, articleId]);

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
            } else {
                // Если сервер вернул ошибку (например, 422 - превышен лимит)
                const errorData = await res.json();
                setErrorModal({
                    isOpen: true,
                    title: 'Ошибка публикации',
                    // Берем сообщение от бэкенда или ставим стандартное
                    message: errorData.message || 'Возможно, комментарий слишком длинный или содержит недопустимые символы.'
                });
            }
        } catch (e) {
            console.error("Ошибка сети:", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const countTotal = (list: Comment[]): number => {
        return list.reduce((acc, c) => acc + 1 + (c.replies ? countTotal(c.replies) : 0), 0);
    };

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
                <div className="bg-white/[0.01] border border-dashed border-white/10 p-8 sm:p-12 rounded-[24px] sm:rounded-[40px] text-center">
                    <button onClick={onNavigateToLogin} className="px-6 sm:px-8 py-3 bg-white text-black rounded-full font-black uppercase text-[8px] sm:text-[9px] tracking-widest transition-all active:scale-95">Войти в аккаунт</button>
                </div>
            ) : (
                /* 2. Форма ввода */
                <div className="bg-white/[0.02] border border-white/5 p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] flex flex-col">
                    <textarea 
                        ref={textareaRef}
                        value={content} 
                        onChange={e => setContent(e.target.value)}
                        placeholder={`${user.name}, что думаете?`}
                        /* ⚡️ Убрали pb-16, так как плашка больше не абсолютная и не перекрывает текст */
                        className="w-full bg-transparent border-none text-white outline-none text-sm min-h-[100px] resize-none pb-6 placeholder:text-gray-600 overflow-hidden transition-[height] duration-200"
                    />
                    
                    {/* Нижняя плашка формы (Теперь она в потоке, а не absolute) */}
                    <div className="flex justify-between items-center pt-4 sm:pt-6 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                            {/* Аватар */}
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                                {user.role === 'admin' ? <ShieldCheck size={10} className="text-blue-500"/> : <UserIcon size={10} className="text-gray-500"/>}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0">
                                
                                
                                {/* Имя автора */}
                                <span className="text-[8px] sm:text-[9px] font-black uppercase text-gray-500 truncate">{user.name}</span>
                                {/* ⚡️ Счётчик символов слева от имени */}
                                <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest whitespace-nowrap 
                                    ${content.length > MAX_CHARS ? 'text-red-500 animate-pulse' : 'text-white/20'}`}>
                                    {content.length > (MAX_CHARS - 50) ? `Осталось: ${MAX_CHARS - content.length}` : `Символов: ${content.length}/${MAX_CHARS}`}
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            /* ⚡️ Блокируем кнопку, если текст пустой ИЛИ превышен лимит */
                            disabled={!content.trim() || isSubmitting || content.length > MAX_CHARS} 
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full font-bold text-[8px] sm:text-[9px] uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                        >
                            <Send size={10} /> Post
                        </button>
                    </div>
                </div>
            )}

            {/* Твои табы фильтров (Новые / Топ / Обсуждаемые) */}
            <div className="flex gap-6 border-b border-white/5 pb-4">
                {(['popular', 'new', 'discussed'] as const).map(s => (
                    <button key={s} onClick={() => setSort(s)} 
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
                <StatusModal 
                    isOpen={errorModal.isOpen}
                    type="error"
                    title={errorModal.title}
                    message={errorModal.message}
                    onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
                />
                {localComments.map((comment) => (
                    <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        sort={sort}
                        user={user} 
                        depth={0}
                        targetCommentId={targetCommentId}
                        ancestorIds={ancestorIds}
                        onAction={() => loadRootComments(true)}
                        handleLike={handleLike} 
                        onAuthRequired={() => setIsAuthModalOpen(true)}
                        onDelete={handleDelete}
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