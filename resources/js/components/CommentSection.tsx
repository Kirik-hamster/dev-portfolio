import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export const CommentSection = ({ articleId, comments, onCommentAdded }: any) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async () => {
        if (!name.trim() || !content.trim()) return;
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const res = await fetch(`/api/articles/${articleId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token || '' },
            body: JSON.stringify({ author_name: name, content: content })
        });

        if (res.ok) {
            setName(''); setContent('');
            onCommentAdded();
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5"></div>
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <MessageSquare className="text-blue-500" size={20} /> 
                    Discussion <span className="opacity-30 text-sm font-mono">{comments.length}</span>
                </h3>
                <div className="h-px flex-1 bg-white/5"></div>
            </div>

            {/* Форма */}
            <div className="bg-white/[0.02] p-8 rounded-[32px] border border-white/5 space-y-4">
                <input 
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
                <textarea 
                    value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Join the conversation..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 outline-none focus:border-blue-500/50 transition-all text-sm h-32 resize-none"
                />
                <button 
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                >
                    <Send size={14} /> Post Comment
                </button>
            </div>

            {/* Список */}
            <div className="space-y-8">
                {comments.map((comment: any) => (
                    <div key={comment.id} className="group pl-6 border-l border-white/5">
                        <div className="text-[10px] font-black text-blue-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                            {comment.author_name}
                            <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                            <span className="text-gray-600">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300 transition-colors">
                            {comment.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};