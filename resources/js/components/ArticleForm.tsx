import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { 
    Bold, Italic, List, ListOrdered, Quote, Code, 
    Heading1, Heading2, Undo, Redo, Type, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight, Link as LinkIcon
} from 'lucide-react'; 
import { Article } from '../types';
import { ArticleApiService } from '../services/ArticleApiService';

// ОБЯЗАТЕЛЬНО: Описание пропсов должно быть тут
interface Props {
    article: Article | undefined;
    onSave: () => void;
    onCancel: () => void;
}

const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
        onClick={(e) => { e.preventDefault(); onClick(); }}
        title={title}
        className={`p-2.5 rounded-xl transition-all duration-200 ${
            isActive 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
        {children}
    </button>
);

export const ArticleForm: React.FC<Props> = ({ article, onSave, onCancel }) => {
    const [title, setTitle] = useState(article?.title || '');
    const [type, setType] = useState<'blog' | 'portfolio'>(article?.type || 'blog');
    const [techStack, setTechStack] = useState(article?.tech_stack || '');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-400 underline cursor-pointer',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: article?.content || '',
        editorProps: {
            attributes: {
                // Класс 'prose-invert' — ключ к красивому тексту на темном фоне
                class: 'prose-editor focus:outline-none max-w-none min-h-[450px] p-10 text-xl leading-relaxed selection:bg-blue-500/30',
            },
        },
    });

    const setLink = () => {
        const url = window.prompt('Введите URL ссылки:');
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        } else if (url === '') {
            editor?.chain().focus().unsetLink().run();
        }
    };

    const handleSave = async () => {
        if (!editor || !title.trim()) return;
        const payload = { 
            title, 
            content: editor.getHTML(), 
            type, 
            tech_stack: techStack, 
            slug: title.toLowerCase().split(' ').join('-') 
        };
        const res = await ArticleApiService.save(payload, article?.id);
        if (res.ok) onSave();
    };

    if (!editor) return null;

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Секция метаданных (оставляем твою верстку) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-8 space-y-2">
                    <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Название записи</label>
                    <input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Заголовок истории..."
                        className="w-full bg-transparent text-5xl font-semibold outline-none border-none p-0 placeholder:text-white/10 focus:ring-0"
                    />
                </div>
                {/* Твой блок с категорией и стеком */}
                <div className="md:col-span-4 space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Категория</label>
                        <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-white/5 rounded-xl border-none text-sm outline-none focus:ring-1 focus:ring-blue-500/50">
                            <option value="blog">Journal / Blog</option>
                            <option value="portfolio">Case Study / Portfolio</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Стек</label>
                        <input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Three.js..." className="w-full bg-transparent border-b border-white/10 text-sm outline-none py-1 focus:border-blue-500/50 transition-colors" />
                    </div>
                </div>
            </div>

            {/* ГУИД ДЛЯ РЕДАКТОРА (Rich Editor Container) */}
            <div className="group relative bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-sm transition-all duration-500 hover:border-blue-500/20">
                
                {/* ПАНЕЛЬ ИНСТРУМЕНТОВ */}
                <div className="flex flex-wrap items-center gap-1 p-3 border-b border-white/5 bg-white/[0.01]">
                    {/* Заголовки */}
                    <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Заголовок 1"><Heading1 size={20}/></MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Заголовок 2"><Heading2 size={20}/></MenuButton>

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    {/* Текст */}
                    <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Жирный"><Bold size={18}/></MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Курсив"><Italic size={18}/></MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Подчеркнутый"><UnderlineIcon size={18}/></MenuButton>

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    {/* Выравнивание */}
                    <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="По левому краю"><AlignLeft size={18}/></MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="По центру"><AlignCenter size={18}/></MenuButton>

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    {/* Списки и Ссылки */}
                    <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Список"><List size={18}/></MenuButton>
                    <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Ссылка"><LinkIcon size={18}/></MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Код"><Code size={18}/></MenuButton>

                    <div className="flex-grow" />

                    <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Назад"><Undo size={18}/></MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Вперед"><Redo size={18}/></MenuButton>
                </div>

                <EditorContent editor={editor} />
            </div>

            {/* КНОПКИ ДЕЙСТВИЯ */}
            <div className="flex justify-between items-center pt-8">
                <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">Discard</button>
                <button 
                    onClick={handleSave} 
                    disabled={!title.trim()}
                    className="px-12 py-5 bg-white text-black rounded-full font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                >
                    {article ? 'Update Entry' : 'Publish to World'}
                </button>
            </div>
        </div>
    );
};