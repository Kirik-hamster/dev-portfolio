// resources/js/components/comments/CommentItem.tsx
import React, { useState } from 'react';
import { Heart, ShieldCheck, User as UserIcon, Trash2, Pencil, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { User, Comment } from '../../types';
import { CommentApiService } from '@/services/CommentApiService';

interface ItemProps {
    comment: Comment;
    user: User | null;
    depth: number;
    onAction: () => void;
    handleLike: (id: number) => void;
}

export const CommentItem: React.FC<ItemProps> = ({ comment, user, depth, onAction, handleLike }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [replyText, setReplyText] = useState('');

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
        const res = await CommentApiService.add(comment.article_id, replyText, comment.id);
        if (res.ok) { 
            setReplyText(''); 
            setIsReplying(false); 
            setShowReplies(true);
            onAction(); 
        }
    };

    return (
        <div className="w-full">
            <div className={`group relative p-6 rounded-[35px] bg-[#0a0a0a]/60 border border-white/5 hover:border-white/10 transition-all duration-300 mb-2`}>
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 ${isAdminAuthor ? 'border-blue-500/30' : ''}`}>
                            {isAdminAuthor ? <ShieldCheck size={18} className="text-blue-500" /> : <UserIcon size={18} className="text-gray-600" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-black uppercase tracking-tight ${isAdminAuthor ? 'text-blue-400' : 'text-white/90'}`}>{comment.user?.name}</span>
                                {isAdminAuthor && <span className="text-[7px] px-1.5 py-0.5 border border-blue-500/20 text-blue-500/50 rounded font-black uppercase tracking-widest">Admin</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-gray-700 font-medium uppercase">{new Date(comment.created_at).toLocaleDateString()}</span>
                                {!!comment.is_edited && (
                                    <span className="text-[8px] text-blue-500/30 font-black italic uppercase tracking-tighter">(изменено)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* БЛОК КНОПОК: БЕЗ ФОНА, ВЫРОВНЕНЫ */}
                    <div className="flex items-center gap-1 h-10"> 
                        {user && (
                            <>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                    {isOwner && (
                                        <button onClick={() => setIsEditing(true)} className="p-2 text-gray-600 hover:text-blue-400 transition-all">
                                            <Pencil size={15} />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button onClick={() => { if(window.confirm("Delete?")) CommentApiService.delete(comment.id).then(() => onAction()) }} 
                                            className={`p-2 transition-all ${user.role === 'admin' && !isOwner ? 'text-red-500/40 hover:text-red-500' : 'text-gray-600 hover:text-red-500'}`}>
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                                
                                {/* НОВАЯ ИКОНКА ОТВЕТА (Undo2) */}
                                <button onClick={() => setIsReplying(!isReplying)} title="Reply" className="p-2 text-gray-500 hover:text-blue-500 transition-all">
                                    <Undo2 size={16} />
                                </button>
                            </>
                        )}

                        <button onClick={() => handleLike(comment.id)} className="flex items-center gap-2 px-3 h-full hover:bg-white/[0.03] rounded-2xl transition-all group/heart">
                            <Heart size={16} className={`${comment.likes_count > 0 ? 'fill-blue-600 text-blue-600 scale-110' : 'text-gray-800 group-hover/heart:text-blue-500'} transition-all`} />
                            <span className="text-[10px] font-black font-mono text-gray-700 group-hover/heart:text-blue-400">{comment.likes_count}</span>
                        </button>
                    </div>
                </div>
                
                {/* ... контент (textarea / p) остается как был ... */}
                {isEditing ? (
                    <div className="space-y-4">
                        <textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-2xl p-4 text-sm outline-none text-white focus:border-blue-500/20 min-h-[80px] resize-none" />
                        <div className="flex gap-3">
                            <button onClick={handleUpdate} className="px-5 py-2 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase">Save</button>
                            <button onClick={() => setIsEditing(false)} className="px-5 py-2 bg-white/5 text-gray-600 rounded-full text-[9px] font-black uppercase">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400/80 text-[13px] leading-relaxed font-medium pl-1 italic">{comment.content}</p>
                )}
            </div>

            {/* ФОРМА ОТВЕТА */}
            {isReplying && (
                <div className="mt-2 mb-6 flex gap-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="w-px h-8 bg-white/10 ml-5" />
                    <input autoFocus value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 bg-[#050505] border border-white/5 rounded-full px-6 py-2.5 text-sm outline-none focus:border-blue-500/10 text-white" />
                    <button onClick={handleReply} disabled={!replyText.trim()} className="px-6 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase transition-all active:scale-95">Reply</button>
                </div>
            )}

            {/* ВЛОЖЕННОСТЬ: Свернуто по умолчанию (showReplies=false выше) */}
            {comment.replies && comment.replies.length > 0 && (
                <div className={`mt-4 ${depth < 5 ? 'ml-5 border-l border-white/10 pl-5' : 'ml-0 pl-0'}`}>
                    <button onClick={() => setShowReplies(!showReplies)} className="mb-4 flex items-center gap-2 text-[8px] font-black uppercase text-gray-700 hover:text-blue-500 transition-colors tracking-[0.2em]">
                        <div className="w-4 h-px bg-current opacity-20" />
                        {showReplies ? `Скрыть ответы` : `Показать ответы (${comment.replies.length})`}
                        {showReplies ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </button>

                    {showReplies && comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} user={user} depth={depth + 1} onAction={onAction} handleLike={handleLike} />
                    ))}
                </div>
            )}
        </div>
    );
};