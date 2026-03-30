import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Heart, ShieldCheck, User as UserIcon, Trash2, Pencil, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { User, Comment } from '../../types';
import { CommentApiService } from '@/services/CommentApiService';
import { ConfirmModal } from '../ui/ConfirmModel';

const GLOW_DURATION = 3000;
const FADE_DURATION = "3s";

interface ItemProps {
    comment: Comment;
    user: User | null;
    depth: number;
    sort: string;
    onAuthRequired: () => void;
    targetCommentId?: number | null | undefined;
    ancestorIds?: number[];
    onAction: () => void;
    handleLike: (id: number) => void;
    onDelete: (id: number) => void
}

const hasTargetChild = (comment: Comment, targetId: number): boolean => {
    if (comment.id === targetId) return true;
    if (!comment.replies || comment.replies.length === 0) return false;
    return comment.replies.some(reply => hasTargetChild(reply, targetId));
};

// Рекурсивно считаем все вложенные ответы
const getTotalRepliesCount = (c: Comment): number => {
    if (!c.replies || c.replies.length === 0) {
        return c.replies_count || 0;
    }
    // Считаем прямых детей + рекурсивно вызываем для каждого ребенка
    return c.replies.reduce((acc, reply) => acc + 1 + getTotalRepliesCount(reply), 0);
};

export const CommentItem: React.FC<ItemProps> = ({ 
    comment, user, depth, onAction, handleLike, targetCommentId, sort, onAuthRequired, onDelete,
    ancestorIds = []
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

    const [displayContent, setDisplayContent] = useState(comment.content);

    // Инициализируем значением из пропсов
    const [localRepliesCount, setLocalRepliesCount] = useState(comment.replies_count);

    const isTarget = targetCommentId === comment.id;

    const isTargetInside = ancestorIds.includes(comment.id);

    const loadReplies = async (isInitial = false) => {
        if (repliesLoading) return;
        setRepliesLoading(true);
        try {
            const targetPage = isInitial ? 1 : replyPage;
            const res = await CommentApiService.fetchReplies(comment.id, targetPage, sort);

            setReplies(prev => isInitial ? res.data : [...prev, ...res.data]);
            setHasMoreReplies(res.current_page < res.last_page);
            setReplyPage(res.current_page + 1);
            setShowReplies(true);
        } catch (e) {
            console.error(e);
        } finally {
            setRepliesLoading(false);
        }
    };

    const handleReplyLike = async (id: number) => {
        if (!user) return onAuthRequired();

        try {
            const data = await CommentApiService.toggleLike(id);

            setReplies(prev => {
                const updateRecursive = (list: Comment[]): Comment[] => {
                    return list.map(c => {
                        if (c.id === id) return { ...c, likes_count: data.likes_count };
                        if (c.replies?.length) return { ...c, replies: updateRecursive(c.replies) };
                        return c;
                    });
                };
                return updateRecursive(prev);
            });
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        setDisplayContent(comment.content);
    }, [comment.content]);

    // Синхронизируем, если пропсы обновятся (например, при смене сортировки)
    useEffect(() => {
        setLocalRepliesCount(comment.replies_count);
    }, [comment.replies_count]);

    useEffect(() => {
        if (isTargetInside && !showReplies && !repliesLoading) loadReplies(true);
    }, [targetCommentId, ancestorIds]);

    useLayoutEffect(() => {
        // Если этот коммент — цель, скроллим и включаем сияние
        if (isTarget && commentRef.current) {
            // Небольшая задержка, чтобы страница успела отрисовать контент
            const timer = setTimeout(() => {
                commentRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' // Центрируем коммент на экране
                });
                setIsActiveGlow(true);
                setTimeout(() => setIsActiveGlow(false), GLOW_DURATION);
            }, 300); // Даем 300мс на стабилизацию DOM
            
            return () => clearTimeout(timer);
        }
    }, [isTarget]);

    const isAdminAuthor = comment.user?.role === 'admin';
    const isOwner = user?.id === comment.user_id;
    const canDelete = isOwner || user?.role === 'admin';

    const handleUpdate = async () => {
        if (!editText.trim()) return;
        const res = await CommentApiService.update(comment.id, editText);
        if (res.ok) { 
            setDisplayContent(editText);
            setIsEditing(false); 
            onAction(); 
        }
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
                setLocalRepliesCount(prev => prev + 1);
            }
        } catch (e) { console.error(e); }
    };


    const handleConfirmDelete = async () => {
        const res = await CommentApiService.delete(comment.id);
        if (res.ok) { 
            setIsDeleteModalOpen(false); 
            onDelete(comment.id);
        }
    };

    // Константа для ограничения вложенности
    const isMaxDepth = depth >= 3;

    return (
        <div className="w-full flex flex-col mb-2 sm:mb-4" ref={commentRef}>
            
            {/* 1. МОБИЛЬНОЕ "УШКО" */}
            <div className="sm:hidden self-end bg-white/[0.05] border border-white/10 rounded-t-[18px] px-4 py-1 flex items-center gap-3 backdrop-blur-md relative z-10 translate-y-[1px]">
                {user && (
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <button onClick={() => setIsEditing(true)} className="p-1 text-white/40">
                                <Pencil size={13} />
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={() => setIsDeleteModalOpen(true)} className="p-1 text-white/40">
                                <Trash2 size={13} />
                            </button>
                        )}
                        <button onClick={() => setIsReplying(!isReplying)} className="p-1 text-white/40">
                            <Undo2 size={14} />
                        </button>

                        <div className="w-px h-3 bg-white/10 mx-1" />
                    </div>
                )}
                <div onClick={() => handleLike(comment.id)} className="flex items-center gap-1.5 px-1 text-white/60">
                    <Heart size={14} className={comment.likes_count > 0 ? 'fill-blue-600 text-blue-600' : ''} />
                    <span className="text-[10px] font-black">{comment.likes_count}</span>
                </div>
            </div>

            {/* 2. ТЕЛО КОММЕНТАРИЯ */}
            <div
                id={`comment-${comment.id}`}
                className="group w-full relative bg-white/[0.01] border border-white/10 backdrop-blur-md shadow-xl transition-all
                    p-5 sm:p-7 rounded-[28px] sm:rounded-[35px] rounded-tr-none sm:rounded-tr-[35px]"
                style={{
                    borderColor: isActiveGlow ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    boxShadow: isActiveGlow ? '0 0 40px rgba(37, 99, 235, 0.1)' : 'none',
                    transition: isActiveGlow ? 'none' : `all ${FADE_DURATION} ease-in-out`,
                }}
            >
                {/* ШАПКА */}
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
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                                {isOwner && <button onClick={() => setIsEditing(true)} className="p-2 text-white/30 hover:text-blue-400"><Pencil size={15} /></button>}
                                {canDelete && <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-white/30 hover:text-red-500"><Trash2 size={15} /></button>}
                                <button onClick={() => setIsReplying(!isReplying)} className="p-2 text-gray-500 hover:text-blue-400"><Undo2 size={16} /></button>
                                <div className="w-px h-3 bg-white/10 mx-2" />
                            </div>
                        )}
                        <button onClick={() => handleLike(comment.id)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-xl transition-all active:scale-90">
                            <Heart size={16} className={comment.likes_count > 0 ? 'fill-blue-600 text-blue-600' : 'text-gray-700'} />
                            <span className="text-[11px] font-black text-gray-700">{comment.likes_count}</span>
                        </button>
                    </div>
                </div>

                {/* КОНТЕНТ / РЕДАКТИРОВАНИЕ */}
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
                <div className="px-2 sm:px-0">
                    {isEditing ? (
                        <div className="space-y-3">
                            <textarea autoFocus value={editText} onChange={e => setEditText(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-white min-h-[80px] outline-none" />
                            <div className="flex gap-2">
                                <button onClick={handleUpdate} className="px-5 py-2 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase">Save</button>
                                <button onClick={() => setIsEditing(false)} className="px-5 py-2 bg-white/5 text-gray-600 rounded-full text-[9px] font-black uppercase">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400/80 text-[13px] sm:text-[15px] leading-relaxed font-medium italic break-words">{displayContent}</p>
                    )}
                </div>

                {/* ФОРМА ОТВЕТА (Внутри блока родителя) */}
                {isReplying && (
                    <div className="mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-2">
                        <div className="relative">
                            <textarea 
                                autoFocus 
                                value={replyText} 
                                onChange={e => setReplyText(e.target.value)} 
                                placeholder={`Ответ для ${comment.user?.name}...`}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-[24px] p-6 pr-20 text-sm text-white min-h-[120px] outline-none focus:border-blue-500/30 transition-all"
                            />
                            {/* Счётчик в углу */}
                            <div className={`absolute bottom-5 right-6 text-[9px] font-black uppercase tracking-widest ${replyText.length > 1000 ? 'text-red-500' : 'text-white/20'}`}>
                                {replyText.length} / 1000
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button onClick={handleReply} disabled={!replyText.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase active:scale-95 disabled:opacity-20">Ответить</button>
                            <button onClick={() => setIsReplying(false)} className="px-6 py-2 bg-white/5 text-gray-500 rounded-full text-[10px] font-black uppercase">Отменить</button>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. ВЛОЖЕННОСТЬ */}
            {(localRepliesCount > 0 || replies.length > 0) && (
                <div className={`flex flex-col ${!isMaxDepth ? 'ml-4 sm:ml-10 border-l pt-3 border-white/5 pl-4 sm:pl-10' : 'ml-0 mt-4'}`}>
                    
                    {/* Показываем кнопку загрузки только если ветка не раскрыта и есть что грузить */}
                    {!showReplies && localRepliesCount > 0 && (
                        <div className="flex items-center gap-4 w-full my-4">
                            <div className="w-8 h-px bg-white/5" />
                            <button 
                                onClick={() => loadReplies(true)} 
                                disabled={repliesLoading} 
                                className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-500/40 hover:text-blue-400 tracking-widest active:scale-95"
                            >
                                {repliesLoading ? '...' : `Показать ответы (${getTotalRepliesCount(comment)})`}
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    )}

                    {/* Список ответов */}
                    {showReplies && (
                        <div className="w-full space-y-4">
                            {replies.map(reply => (
                                <CommentItem 
                                    key={reply.id} 
                                    comment={reply} 
                                    sort={sort}
                                    user={user} 
                                    depth={depth + 1}
                                    onAuthRequired={onAuthRequired}
                                    targetCommentId={targetCommentId}
                                    ancestorIds={ancestorIds}
                                    onAction={onAction} 
                                    handleLike={handleReplyLike} 
                                    onDelete={(id) => {
                                        setReplies(prev => prev.filter(r => r.id !== id));
                                        setLocalRepliesCount(prev => Math.max(0, prev - 1));
                                    }}
                                />
                            ))}
                            
                            {/* Единственная кнопка "Свернуть" в конце ветки */}
                            <div className="flex items-center gap-4 w-full py-4">
                                <div className="flex-grow h-px bg-white/5" />
                                <button onClick={() => setShowReplies(false)} className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-800 hover:text-red-500/60 transition-colors">
                                    Свернуть <ChevronUp size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Удалить комментарий?"
                message="Это действие нельзя отменить. Все вложенные ответы также будут удалены."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};