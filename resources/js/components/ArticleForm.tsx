import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Gapcursor from '@tiptap/extension-gapcursor';
import { 
    Bold, Italic, List, Code, Tag, Image as ImageIcon,
    Heading1, Heading2, Undo, Redo, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, Link as LinkIcon, ListTree, UploadCloud, ChevronRight
} from 'lucide-react'; 
import { Article, ArticleInput, User } from '../types';
import { ArticleNavigation } from './ArticlePage/ArticleNavigation';

interface ArticleFormProps {
    article: Article | undefined; 
    onSave: (data: ArticleInput) => void;
    onCancel: () => void;
    user: User | null;
}

const EDITOR_EXTENSIONS = [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Underline,
    Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-400 underline' } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Image.configure({ HTMLAttributes: { class: 'rounded-3xl border border-white/10 shadow-2xl my-8 mx-auto' } }),
    Placeholder.configure({ placeholder: 'Начните писать...' }),
    Gapcursor, // Позволяет кликать между блоками, чтобы они не слипались
];

export const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSave, onCancel, user }) => {
    const [title, setTitle] = useState(article?.title || '');
    const [techStack, setTechStack] = useState(article?.tech_stack || '');
    const [githubUrl, setGithubUrl] = useState(article?.github_url || '');
    const [toc, setToc] = useState<{ level: number; text: string; pos: number }[]>([]);

    const updateToc = (editor: any) => {
        const headings: any[] = [];
        editor.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'heading') {
                headings.push({ 
                    level: node.attrs.level, 
                    text: node.textContent, 
                    pos: pos + 1 // +1 чтобы курсор вставал ВНУТРЬ заголовка
                });
            }
        });
        setToc(headings);
    };

    const editor = useEditor({
        extensions: EDITOR_EXTENSIONS,
        content: article?.content || '',
        editorProps: {
            attributes: {
                class: 'prose-editor focus:outline-none min-h-[600px] p-10 selection:bg-blue-500/30',
            },
        },
        // Срабатывает при создании редактора (важно для существующих постов)
        onCreate: ({ editor }) => {
            updateToc(editor);
        },
        // Срабатывает при каждом изменении текста
        onUpdate: ({ editor }) => {
            updateToc(editor);
        }
    });

    const setLink = () => {
        if (!editor) return;
        const url = window.prompt('URL:', editor.getAttributes('link').href);
        if (url) editor.chain().focus().setLink({ href: url }).run();
        else editor.chain().focus().unsetLink().run();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;
        const reader = new FileReader();
        reader.onload = () => editor.chain().focus().setImage({ src: reader.result as string }).run();
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!editor || !title.trim()) return;
        onSave({ 
            title, 
            content: editor.getHTML(), 
            tech_stack: techStack, 
            github_url: githubUrl,
            slug: title.toLowerCase().replace(/[^\w\sа-яё-]/gi, "").replace(/\s+/g, "-") 
        });
    };

    if (!editor) return null;

    return (
        <div className="max-w-[1500px] mx-auto px-6 w-full space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                    <input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Название проекта..."
                        className="w-full bg-transparent text-5xl sm:text-7xl font-black uppercase tracking-tighter outline-none border-none p-0 placeholder:text-white/5 focus:ring-0 text-white"
                    />
                </div>
                <div className="flex gap-4 w-full lg:w-96">
                    <div className="flex-1 bg-white/[0.02] border border-white/5 p-4 rounded-[25px] backdrop-blur-md">
                        <label className="text-[8px] font-black uppercase text-blue-500/50 block mb-1">Stack</label>
                        <input value={techStack} onChange={(e) => setTechStack(e.target.value)} className="bg-transparent outline-none text-xs w-full text-white" placeholder="React, Three.js..." />
                    </div>
                    <div className="flex-1 bg-white/[0.02] border border-white/5 p-4 rounded-[25px] backdrop-blur-md">
                        <label className="text-[8px] font-black uppercase text-blue-500/50 block mb-1">Source</label>
                        <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="bg-transparent outline-none text-xs w-full text-blue-400" placeholder="GitHub URL..." />
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8"> {/* Убрали items-start! */}
                <div className="flex-1 min-w-0 bg-white/[0.01] border border-white/10 rounded-[45px] overflow-hidden backdrop-blur-sm shadow-3xl">
                    <div className="sticky top-0 z-30 p-2.5 bg-[#080808]/90 backdrop-blur-2xl border-b border-white/5 flex flex-wrap gap-1">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}><Heading1 size={18}/></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 size={18}/></ToolbarButton>
                        <div className="w-px h-5 bg-white/10 mx-2 self-center" />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold size={18}/></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic size={18}/></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}><UnderlineIcon size={18}/></ToolbarButton>
                        <div className="w-px h-5 bg-white/10 mx-2 self-center" />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List size={18}/></ToolbarButton>
                        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')}><LinkIcon size={18}/></ToolbarButton>
                        <label className="p-2.5 rounded-xl cursor-pointer text-gray-500 hover:text-white hover:bg-white/5 transition-all"><UploadCloud size={18} /><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
                        <div className="flex-grow" />
                        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}><Undo size={18}/></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}><Redo size={18}/></ToolbarButton>
                    </div>
                    <EditorContent editor={editor} />
                </div>

                <ArticleNavigation 
                    title="Outline"
                    toc={toc} 
                    onItemClick={(h) => editor.commands.focus(h.pos)} 
                />
            </div>

            <div className="flex justify-between items-center bg-white/[0.01] border border-white/10 p-6 rounded-[40px] backdrop-blur-md">
                <button onClick={onCancel} className="px-8 py-4 text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-white transition-all">Discard</button>
                <button onClick={handleSave} disabled={!title.trim()} className="px-12 py-4 bg-white text-black rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl disabled:opacity-10 active:scale-95">
                    {article ? 'Save Changes' : 'Publish'}
                </button>
            </div>
        </div>
    );
};

const ToolbarButton: React.FC<{ onClick: () => void; isActive?: boolean; children: React.ReactNode }> = ({ onClick, isActive, children }) => (
    <button onClick={(e) => { e.preventDefault(); onClick(); }} className={`p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
        {children}
    </button>
);