import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart, ShieldCheck, User as UserIcon, Lock } from 'lucide-react';
import { User, Comment } from '../../types';
import { CommentApiService } from '@/services/CommentApiService';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
    articleId: number;
    comments: Comment[];
    onCommentAdded: () => void;
    user: User | null;
    onNavigateToLogin: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ 
    articleId, 
    comments, 
    onCommentAdded, 
    user, 
    onNavigateToLogin 
}) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
 
    const [localComments, setLocalComments] = useState<Comment[]>(comments);

    // Синхронизируем, если пришли новые комменты от родителя (например, при заходе в статью)
    useEffect(() => {
        setLocalComments(comments);
    }, [comments]);

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) return;
        setIsSubmitting(true);
        const res = await CommentApiService.add(articleId, content);
        if (res.ok) {
            setContent('');
            onCommentAdded(); // Тут полная перезагрузка ок — новый коммент должен появиться
        }
        setIsSubmitting(false);
    };

    const countTotal = (list: Comment[]): number => {
        return list.reduce((acc, c) => acc + 1 + (c.replies ? countTotal(c.replies) : 0), 0);
    };

    const totalCount = countTotal(localComments);

    const handleLike = async (commentId: number) => {
        if (!user) return onNavigateToLogin();

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
            {/* ХЕДЕР */}
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5"></div>
                <h3 className="text-xl font-bold flex items-center gap-3 uppercase tracking-tighter">
                    <MessageSquare size={18} className="text-blue-500" /> 
                    Комментарии <span className="text-blue-500/30 font-mono text-sm">{totalCount}</span>
                </h3>
                <div className="h-px flex-1 bg-white/5"></div>
            </div>

            {/* ФОРМА */}
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

            {/* СПИСОК (Используем localComments) */}
            <div className="space-y-6">
                {localComments.map((comment) => (
                    <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        user={user} 
                        depth={0}
                        onAction={onCommentAdded} 
                        handleLike={handleLike} 
                    />
                ))}
            </div>
        </div>
    );
};