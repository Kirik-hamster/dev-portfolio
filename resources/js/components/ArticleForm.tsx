import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Article } from '../types';

interface Props {
    article: Article | undefined;
    onSave: () => void;
    onCancel: () => void;
}

export const ArticleForm: React.FC<Props> = ({ article, onSave, onCancel }) => {
    const [title, setTitle] = useState(article?.title || '');
    const [type, setType] = useState<'blog' | 'portfolio'>(article?.type || 'blog');
    const [techStack, setTechStack] = useState(article?.tech_stack || '');

    const editor = useEditor({
        extensions: [StarterKit],
        content: article?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-invert focus:outline-none max-w-none min-h-[400px] p-8 text-lg',
            },
        },
    });

    const handleSave = async () => {
        if (!editor || !title.trim()) return;
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const payload = { title, content: editor.getHTML(), type, tech_stack: techStack, slug: title.toLowerCase().split(' ').join('-') };
        
        const method = article ? 'PUT' : 'POST';
        // ДОБАВЬ /api ПЕРЕД /articles:
        const url = article ? `/api/articles/${article.id}` : '/api/articles';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken || '' },
            body: JSON.stringify(payload),
        });

        if (res.ok) onSave();
    };

    return (
        <div className="space-y-12">
            {/* Секция метаданных */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-8 space-y-2">
                    <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Название записи</label>
                    <input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Project X..."
                        className="w-full bg-transparent text-5xl font-semibold outline-none border-none p-0 placeholder:text-white/10 focus:ring-0"
                    />
                </div>
                <div className="md:col-span-4 space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Категория</label>
                        <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-white/5 rounded-xl border-none text-sm outline-none">
                            <option value="blog">Journal / Blog</option>
                            <option value="portfolio">Case Study / Portfolio</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Технологический стек</label>
                        <input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node, GLSL..." className="w-full bg-transparent border-b border-white/10 text-sm outline-none py-1" />
                    </div>
                </div>
            </div>

            {/* Редактор */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-sm">
                <EditorContent editor={editor} />
            </div>

            <div className="flex justify-between items-center pt-8">
                <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">Discard</button>
                <button 
                    onClick={handleSave} 
                    disabled={!title.trim()}
                    className="px-10 py-4 bg-white text-black rounded-full font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                >
                    {article ? 'Update Entry' : 'Publish to World'}
                </button>
            </div>
        </div>
    );
};