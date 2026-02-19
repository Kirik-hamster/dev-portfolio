import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart, ShieldCheck, User as UserIcon, Lock } from 'lucide-react';
import { ArticleApiService } from '../services/ArticleApiService';
import { User } from '../types';

export const CommentSection = ({ articleId, comments, onCommentAdded, user, onNavigateToLogin }: any) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 1. ЛОКАЛЬНОЕ СОСТОЯНИЕ: Чтобы список не прыгал при лайках
    const [localComments, setLocalComments] = useState(comments);

    // Синхронизируем, если пришли новые комменты от родителя (например, при заходе в статью)
    useEffect(() => {
        setLocalComments(comments);
    }, [comments]);

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) return;
        setIsSubmitting(true);
        const res = await ArticleApiService.addComment(articleId, content);
        if (res.ok) {
            setContent('');
            onCommentAdded(); // Тут полная перезагрузка ок — новый коммент должен появиться
        }
        setIsSubmitting(false);
    };

    const handleLike = async (commentId: number) => {
        if (!user) return onNavigateToLogin();

        const response = await ArticleApiService.toggleLike(commentId);
        if (response.ok) {
            const data = await response.json();
            
            // ОБНОВЛЯЕМ ТОЛЬКО ЦИФРУ: Порядок в массиве localComments остается прежним!
            setLocalComments((prev: any) => prev.map((c: any) => 
                c.id === commentId ? { ...c, likes_count: data.likes_count } : c
            ));
        }
    };

    return (
        <div className="space-y-12">
            {/* ХЕДЕР */}
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5"></div>
                <h3 className="text-xl font-bold flex items-center gap-3 uppercase tracking-tighter">
                    <MessageSquare size={18} className="text-blue-500" /> 
                    Комментарии <span className="text-blue-500/30 font-mono text-sm">{localComments.length}</span>
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
                {localComments.map((comment: any) => (
                    <div key={comment.id} className="group bg-white/[0.01] border border-white/5 p-8 rounded-[35px] hover:border-white/10 transition-all relative">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    {comment.user?.role === 'admin' ? <ShieldCheck size={18} className="text-blue-500" /> : <UserIcon size={18} className="text-gray-500" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[11px] font-black uppercase text-white/90">{comment.user?.name || 'User'}</span>
                                        <span className={`text-[7px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest border ${comment.user?.role === 'admin' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                            {comment.user?.role || 'member'}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-gray-600 uppercase font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <button onClick={() => handleLike(comment.id)} className="flex flex-col items-center gap-1 group/like">
                                <Heart size={16} className={`transition-all ${comment.likes_count > 0 ? 'fill-blue-500 text-blue-500 scale-110' : 'text-gray-600 group-hover/like:text-blue-400'}`} />
                                <span className="text-[10px] font-mono text-gray-600 group-hover/like:text-white transition-colors">{comment.likes_count || 0}</span>
                            </button>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-[13px] font-medium pl-14 pr-4 border-l border-white/5 italic">
                            {comment.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};