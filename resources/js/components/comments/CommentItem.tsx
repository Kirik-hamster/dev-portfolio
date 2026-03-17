import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Heart, ShieldCheck, User as UserIcon, Trash2, Pencil, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { User, Comment } from '../../types';
import { CommentApiService } from '@/services/CommentApiService';
import { ConfirmModal } from '../ui/ConfirmModel';

const GLOW_DURATION = 3000; // 3 секунды светит ярко
const FADE_DURATION = "3s"; // 3 секунды плавно затухает

interface ItemProps {
    comment: Comment;
    user: User | null;
    depth: number;
    sort: string;
    onAuthRequired: () => void;
    targetCommentId?: number | null | undefined;
    onAction: () => void;
    handleLike: (id: number) => void;
}

const hasTargetChild = (comment: Comment, targetId: number): boolean => {
    if (comment.id === targetId) return true;
    if (!comment.replies || comment.replies.length === 0) return false;
    return comment.replies.some(reply => hasTargetChild(reply, targetId));
};

export const CommentItem: React.FC<ItemProps> = ({ 
    comment, user, depth, onAction, handleLike, targetCommentId, sort, onAuthRequired
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replies, setReplies] = useState<Comment[]>([]);
    const [replyPage, setReplyPage] = useState(1);
    const [hasMoreReplies, setHasMoreReplies] = useState(false);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [replyText, setReplyText] = useState('');
    const [isActiveGlow, setIsActiveGlow] = useState(false);
    const commentRef = useRef<HTMLDivElement>(null);

    const isTarget = targetCommentId === comment.id;

    const isTargetInside = targetCommentId && hasTargetChild(comment, targetCommentId);

    const loadReplies = async (isInitial = false) => {
        setRepliesLoading(true);
        const targetPage = isInitial ? 1 : replyPage;
        const res = await CommentApiService.fetchReplies(comment.id, targetPage, sort);
        
        setReplies(prev => isInitial ? res.data : [...prev, ...res.data]);
        setHasMoreReplies(res.current_page < res.last_page);
        setReplyPage(res.current_page + 1);
        setRepliesLoading(false);
        setShowReplies(true);
    };

    const handleReplyLike = async (id: number) => {
        if (!user) return onAuthRequired();

        try {
            const data = await CommentApiService.toggleLike(id);
            
            // Обновляем только локальный стейт ответов этого компонента
            setReplies(prev => {
                const updateRecursive = (list: Comment[]): Comment[] => {
                    return list.map(c => {
                        if (c.id === id) {
                            return { ...c, likes_count: data.likes_count };
                        }
                        if (c.replies && c.replies.length > 0) {
                            return { ...c, replies: updateRecursive(c.replies) };
                        }
                        return c;
                    });
                };
                return updateRecursive(prev);
            });
        } catch (err) {
            console.error("Ошибка лайка ответа:", err);
        }
    };

    // Логика автораскрытия (если цель внутри)
    useEffect(() => {
        if (isTargetInside && !showReplies && !repliesLoading) {
            loadReplies(true);
        }
    }, [targetCommentId, isTargetInside]);

    // Логика скролла (только если ЭТОТ комментарий — цель)
    useLayoutEffect(() => {
        if (isTarget && commentRef.current) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    commentRef.current?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    setIsActiveGlow(true);
                    setTimeout(() => setIsActiveGlow(false), GLOW_DURATION);
                });
            });
        }
    }, [isTarget, showReplies]);

    const isAdminAuthor = comment.user?.role === 'admin';
    const isOwner = user?.id === comment.user_id;
    const canDelete = isOwner || user?.role === 'admin';

    const handleUpdate = async () => {
        if (!editText.trim()) return;
        const res = await CommentApiService.update(comment.id, editText);
        if (res.ok) { setIsEditing(false); onAction(); }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        
        try {
            const res = await CommentApiService.add(comment.article_id, replyText, comment.id);
            if (res.ok) {
                const newReply = await res.json();
                
                setReplyText(''); 
                setIsReplying(false); 
                setShowReplies(true);
                
                setReplies(prev => [newReply, ...prev]);
            }
        } catch (e) {
            console.error("Ошибка ответа:", e);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await CommentApiService.delete(comment.id);
            if (res.ok) {
                setIsDeleteModalOpen(false);
                onAction(); // Вызываем обновление списка
            }
        } catch (e) {
            console.error("Delete error:", e);
        }
    };

    return (
        // ⚡️ ГЛАВНОЕ: Убираем любые центрирования. Всё дерево строго w-full.
        <div className="w-full flex flex-col mb-2 sm:mb-4" ref={commentRef}>
            
            {/* 1. МОБИЛЬНОЕ "УШКО" — Стиль Liquid Glass */}
            <div className="sm:hidden self-end bg-white/[0.05] border border-white/10 rounded-t-[18px] px-4 py-1 flex items-center gap-3 backdrop-blur-md relative z-10 translate-y-[1px]">
                {user && (
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <button onClick={() => setIsEditing(true)} className="p-1 text-white/40 active:scale-75 transition-all">
                                <Pencil size={13} />
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={() => setIsDeleteModalOpen(true)} className="p-1 text-white/40 active:scale-75 transition-all">
                                <Trash2 size={13} />
                            </button>
                        )}
                        <button onClick={() => setIsReplying(!isReplying)} className="p-1 text-white/40 active:scale-75 transition-all">
                            <Undo2 size={14} />
                        </button>
                        
                        {/* Тонкий разделитель */}
                        <div className="w-px h-3 bg-white/10 mx-1" />
                    </div>
                )}

                {/* Лайк */}
                <div onClick={() => handleLike(comment.id)} className="flex items-center gap-1.5 px-1 text-white/60">
                    <Heart size={14} className={comment.likes_count > 0 ? 'fill-blue-600 text-blue-600' : ''} />
                    <span className="text-[10px] font-black">{comment.likes_count}</span>
                </div>
            </div>

            {/* 2. ОСНОВНОЙ КОНТЕЙНЕР КОММЕНТАРИЯ */}
            <div
                id={`comment-${comment.id}`}
                /* ⚡️ Вернули bg-white/[0.01] и border-white/5 для деликатного вида */
                className="group w-full relative bg-white/[0.01] border border-white/10 backdrop-blur-md shadow-xl transition-all
                    p-5 sm:p-7 rounded-[28px] sm:rounded-[35px] rounded-tr-none sm:rounded-tr-[35px]"
                style={{
                    borderColor: isActiveGlow ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    boxShadow: isActiveGlow ? '0 0 40px rgba(37, 99, 235, 0.1)' : 'none',
                    transition: isActiveGlow ? 'none' : `all ${FADE_DURATION} ease-in-out`,
                }}
            >
                {/* --- ШАПКА ДЛЯ ДЕСКТОПА --- */}
                <div className="hidden sm:flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 shrink-0 ${isAdminAuthor ? 'border-blue-500/30' : ''}`}>
                            {isAdminAuthor ? <ShieldCheck size={18} className="text-blue-500" /> : <UserIcon size={18} className="text-gray-600" />}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-black uppercase text-white/90">{comment.user?.name}</span>
                                {isAdminAuthor && <span className="text-[7px] px-1.5 py-0.5 border border-blue-500/20 text-blue-500/50 rounded font-black uppercase">Admin</span>}
                            </div>
                            <span className="text-[10px] text-gray-700 uppercase">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {user && (
                            <div className="flex items-center">
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    {(isOwner || user.role === 'admin') && (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-2 text-white/30 hover:text-blue-400 active:scale-75 transition-all"><Pencil size={15} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }} className="p-2 text-white/30 hover:text-red-500 active:scale-75 transition-all"><Trash2 size={15} /></button>
                                        </>
                                    )}
                                </div>
                                <button onClick={() => setIsReplying(!isReplying)} className="p-2 text-gray-500 hover:text-blue-400 active:scale-75 transition-all"><Undo2 size={16} /></button>
                                <div className="w-px h-3 bg-white/10 mx-2" />
                            </div>
                        )}
                        <button onClick={() => handleLike(comment.id)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-xl transition-all group/heart active:scale-90">
                            <Heart size={16} className={`${comment.likes_count > 0 ? 'fill-blue-600 text-blue-600 scale-110' : 'text-gray-700 group-hover/heart:text-blue-500'}`} />
                            <span className="text-[11px] font-black text-gray-700 group-hover/heart:text-blue-400">{comment.likes_count}</span>
                        </button>
                    </div>
                </div>

                {/* --- ШАПКА ДЛЯ МОБИЛКИ --- */}
                <div className="sm:hidden flex items-center gap-4 mb-6 px-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 shrink-0`}>
                        {isAdminAuthor ? <ShieldCheck size={22} className="text-blue-500" /> : <UserIcon size={22} className="text-gray-600" />}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[14px] font-black uppercase text-white/90 truncate">{comment.user?.name}</span>
                            {isAdminAuthor && <span className="text-[8px] px-2 py-0.5 border border-blue-500/20 text-blue-500/50 rounded font-black uppercase">Admin</span>}
                        </div>
                        <span className="text-[10px] text-gray-700 uppercase font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* КОНТЕНТ */}
                <div className="px-2 sm:px-0">
                    {isEditing ? (
                        <div className="space-y-3">
                            <textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm outline-none text-white min-h-[80px] resize-none focus:border-blue-500/20" />
                            <div className="flex gap-2">
                                <button onClick={handleUpdate} className="px-5 py-2 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase">Save</button>
                                <button onClick={() => setIsEditing(false)} className="px-5 py-2 bg-white/5 text-gray-600 rounded-full text-[9px] font-black uppercase">Exit</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400/80 text-[13px] sm:text-[15px] leading-relaxed font-medium italic break-words">
                            {comment.content}
                        </p>
                    )}
                </div>
            </div>

            {/* 3. ВЛОЖЕННОСТЬ (ОТВЕТЫ) */}
            {(comment.replies_count > 0 || replies.length > 0) && (
                /* ⚡️ items-start гарантирует, что вертикальная линия будет СЛЕВА */
                <div className="w-full mt-4 flex flex-col items-start">
                    
                    {/* Контейнер ответов: ширина уменьшается на 12px (моб) / 40px (десктоп) с левой стороны */}
                    <div className="w-[calc(100%-12px)] sm:w-[calc(100%-40px)] ml-auto border-l border-white/5 sm:border-white/10 pl-4 sm:pl-10">
                        
                        {!showReplies ? (
                            /* ⚡️ КНОПКА "ОТВЕТЫ" СПРАВА С ГОРИЗОНТАЛЬНОЙ ЛИНИЕЙ */
                            <div className="flex items-center gap-4 w-full mb-4 translate-y-2 sm:translate-y-3">
                                {/* Горизонтальная линия от вертикального гида до текста */}
                                <div className="flex-grow h-px bg-white/5" /> 
                                <button 
                                    onClick={() => loadReplies(true)} 
                                    disabled={repliesLoading} 
                                    className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-500/40 hover:text-blue-400 tracking-widest transition-all shrink-0 active:scale-95"
                                >
                                    {repliesLoading ? '...' : `Показать ответы (${comment.replies_count})`}
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {/* Список ответов */}
                                <div className="space-y-6">
                                    {replies.map(reply => (
                                        <CommentItem 
                                            key={reply.id} 
                                            comment={reply} 
                                            sort={sort}
                                            onAuthRequired={onAuthRequired}
                                            user={user} 
                                            depth={depth + 1}
                                            targetCommentId={targetCommentId} 
                                            onAction={onAction} 
                                            handleLike={handleReplyLike} 
                                        />
                                    ))}
                                </div>

                                {/* ⚡️ КНОПКА "СВЕРНУТЬ" СПРАВА С ЛИНИЕЙ */}
                                <div className="flex items-center gap-4 w-full py-6">
                                    <div className="flex-grow h-px bg-white/5" />
                                    <button 
                                        onClick={() => setShowReplies(false)} 
                                        className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-800 hover:text-red-500/60 transition-colors tracking-widest shrink-0 active:scale-95"
                                    >
                                        Свернуть ветку
                                        <ChevronUp size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Удалить комментарий?"
                message="Это действие нельзя отменить. Все ответы будут удалены."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};