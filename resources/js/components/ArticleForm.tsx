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
    AlignLeft, AlignCenter, Link as LinkIcon, ListTree, UploadCloud, ChevronRight,
    X
} from 'lucide-react'; 
import { Article, ArticleInput, User } from '../types';
import { ArticleNavigation } from './ArticlePage/ArticleNavigation';
import { MobileTocDrawer } from './ui/MobileTocDrawer';
import { MobileTocToggle } from './ui/MobileTocToggle';
import { ScrollToTop } from './ui/ScrollToTop';
import { ArticleMetaModal } from './ui/ArticleForm/ArticleMetaModal';

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

    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

    const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleHeading = (level: 1 | 2 | 3) => {
        if (!editor) return;

        const { from, to } = editor.state.selection;
        const isCollapsed = from === to; // Просто курсор или выделение?

        if (editor.isActive('heading', { level })) {
            editor.chain().focus().setParagraph().run();
            return;
        }

        if (!isCollapsed) {
            // Если выделен текст внутри параграфа:
            // 1. Копируем выделенный текст
            // 2. Удаляем его
            // 3. Вставляем новый блок заголовка с этим текстом
            const selectedText = editor.state.doc.textBetween(from, to);
            editor.chain()
                .focus()
                .deleteSelection()
                .insertContent(`<h${level}>${selectedText}</h${level}>`)
                .run();
        } else {
            // Если просто курсор: разрезаем блок и делаем новую строку заголовком
            editor.chain().focus().splitBlock().toggleHeading({ level }).run();
        }
    };

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 100;
            const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
            setIsMobileTocOpen(false);
        }
    };


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
        <>
            <ScrollToTop hasOffset={toc.length > 0 && isMobile} />
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 w-full space-y-8 animate-in fade-in duration-700 relative z-10">
            
                {/* ВЕРХНЯЯ ЧАСТЬ: TITLE + META */}
                <div className="flex flex-col lg:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название проекта..." className="w-full bg-transparent text-5xl sm:text-8xl font-black uppercase tracking-tighter outline-none border-none p-0 placeholder:text-white/5 focus:ring-0 text-white" />
                    </div>
                    
                    {/* КНОПКА МЕТАДАННЫХ: Теперь аккуратно и с подписями */}
                    <div className="w-full lg:w-[450px]">
                        <div 
                            onClick={() => setIsMetaModalOpen(true)}
                            className="bg-white/[0.02] border border-white/5 p-6 rounded-[35px] backdrop-blur-md cursor-pointer hover:bg-white/[0.05] transition-all group flex items-center justify-between"
                        >
                            <div className="space-y-3 flex-1 min-w-0">
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-black uppercase text-blue-500/50 tracking-widest">Теги</span>
                                    <p className="text-xs text-gray-300 font-bold truncate pr-4">{techStack || 'Не указано'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-black uppercase text-blue-500/50 tracking-widest">Ссылка</span>
                                    <p className="text-xs text-blue-400/80 font-bold truncate pr-4">{githubUrl || 'Ссылка отсутствует'}</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-8 items-start">
                    <div className="min-w-0 bg-white/[0.01] border border-white/10 rounded-[45px] backdrop-blur-sm shadow-3xl relative">                       
                        <div className="sticky top-[64px] sm:top-[72px] z-[40] p-4 bg-[#080808] border-b border-white/10 rounded-t-[45px] flex flex-wrap gap-1 shadow-2xl">
                            <ToolbarButton onClick={() => toggleHeading(1)} isActive={editor.isActive('heading', { level: 1 })}><Heading1 size={18}/></ToolbarButton>
                            <ToolbarButton onClick={() => toggleHeading(2)} isActive={editor.isActive('heading', { level: 2 })}><Heading2 size={18}/></ToolbarButton>
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
                        <div className="flex-1 overflow-y-auto sm:p-14 custom-scrollbar">
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                    <aside className="hidden lg:block sticky top-32 z-10">
                        <ArticleNavigation 
                            title="Содержание"
                            toc={toc} 
                            onItemClick={(h) => editor.commands.focus(h.pos)} 
                        />
                    </aside>
                </div>

                <div className="flex justify-between items-center bg-white/[0.01] border border-white/10 p-6 rounded-[40px] backdrop-blur-md relative z-20">
                    <button onClick={onCancel} className="px-8 py-4 text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-white transition-all">Отмена</button>
                    <button onClick={handleSave} disabled={!title.trim()} className="px-12 py-4 bg-white text-black rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
                        {article ? 'Сохранить изменения' : 'Опубликовать пост'}
                    </button>
                </div>
            </div>

            {/* КОМПОНЕНТЫ МОДАЛОК И ПОРТАЛОВ */}
            <ArticleMetaModal 
                isOpen={isMetaModalOpen} 
                onClose={() => setIsMetaModalOpen(false)}
                techStack={techStack} setTechStack={setTechStack}
                githubUrl={githubUrl} setGithubUrl={setGithubUrl}
            />
            {/* МОБИЛЬНЫЕ КОМПОНЕНТЫ СОДЕРЖАНИЯ (Порталы) */}
            {toc.length > 0 && (
                <MobileTocToggle 
                    onClick={() => setIsMobileTocOpen(!isMobileTocOpen)} 
                    isOpen={isMobileTocOpen} 
                />
            )}

            {/* Mobile TOC Drawer */}
            <MobileTocDrawer 
                isOpen={isMobileTocOpen} 
                onClose={() => setIsMobileTocOpen(false)} 
                toc={toc} 
                onScrollTo={scrollTo} 
            />
        </>

    );
};

const ToolbarButton: React.FC<{ onClick: () => void; isActive?: boolean; children: React.ReactNode }> = ({ onClick, isActive, children }) => (
    <button onClick={(e) => { e.preventDefault(); onClick(); }} className={`p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
        {children}
    </button>
);