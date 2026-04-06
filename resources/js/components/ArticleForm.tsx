import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Gapcursor from '@tiptap/extension-gapcursor';
import { Editor } from '@tiptap/react';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
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
import { MediaApiService } from '@/services/MediaApiService';
import { StatusModal } from './ui/StatusModal';
import { ConfirmModal } from './ui/ConfirmModel';

interface ArticleFormProps {
    article: Article | undefined; 
    onSave: (data: ArticleInput) => void;
    onCancel: () => void;
    user: User | null;
}

interface TocItem {
    level: number;
    text: string;
    pos: number;
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
    const [toc, setToc] = useState<TocItem[]>([]);

    const [isUploading, setIsUploading] = useState(false);

    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

    const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

    const [imageUrl, setImageUrl] = useState(article?.image_url || '');

    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

    const [status, setStatus] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

    const initialImagesRef = React.useRef<string[]>([]);
    const sessionUploadedRef = React.useRef<string[]>([]);

    

    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
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

    const scrollToPos = (target: string | number) => {
        if (!editor || typeof target !== 'number') return;
        const pos = target;

        try {
            // 1. Сначала ставим фокус
            editor.commands.focus(pos);
            
            // 2. Получаем координаты этой позиции в окне
            // coordsAtPos возвращает { top, bottom, left, right }
            const coords = editor.view.coordsAtPos(pos);

            if (coords) {
                const yOffset = -220;
                const y = coords.top + window.pageYOffset + yOffset;

                window.scrollTo({
                    top: y,
                    behavior: 'smooth'
                });
            }
        } catch (e) {
            // Если что-то пошло совсем не так, просто используем стандартный скролл Tiptap
            editor.commands.scrollIntoView();
            console.warn("Мягкий скролл не удался, применен стандартный:", e);
        } finally {
            setIsMobileTocOpen(false);
        }
    };


    const updateToc = (editor: Editor) => {
        const headings: { level: number; text: string; pos: number }[] = [];
        editor.state.doc.descendants((node: ProsemirrorNode, pos: number) => {
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

    const getAllImages = (editor: Editor) => {
        const images: string[] = [];
        editor.state.doc.descendants((node: ProsemirrorNode) => {
            if (node.type.name === 'image') {
                images.push(node.attrs.src);
            }
        });
        return images;
    };

    const editor = useEditor({
        extensions: EDITOR_EXTENSIONS,
        content: article?.content || '',
        editorProps: {
            attributes: {
                class: 'prose-editor focus:outline-none min-h-[600px] p-10 selection:bg-blue-500/30',
            },
        },
        onCreate: ({ editor }) => {
            updateToc(editor);
            initialImagesRef.current = getAllImages(editor);
        },
        onUpdate: ({ editor }) => {
            updateToc(editor);
            // Здесь удалили старую логику удаления — она мешала!
        },

        onFocus: ({ editor }) => {
            // Получаем текущую позицию курсора
            const pos = editor.state.selection.from;
            
            // Даем небольшую задержку (100мс), чтобы мобильная клавиатура 
            // успела начать выезжать и viewport изменился
            setTimeout(() => {
                scrollToPos(pos);
            }, 100);
        }
    });

    const setLink = () => {
        if (!editor) return;
        const url = window.prompt('URL:', editor.getAttributes('link').href);
        if (url) editor.chain().focus().setLink({ href: url }).run();
        else editor.chain().focus().unsetLink().run();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        try {
            setIsUploading(true);
            const result = await MediaApiService.uploadImage(file);
            sessionUploadedRef.current.push(result.url);
            editor.chain().focus().setImage({ src: result.url }).run();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Произошла непредвиденная ошибка';
            setStatus({
                isOpen: true,
                type: 'error',
                title: 'Ошибка медиа',
                message: errorMessage
            });
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleSave = async () => {
        if (!editor || !title.trim()) return;
        setIsUploading(true);

        try {
            const finalImages = getAllImages(editor);
            const allEverBeenImages = [...initialImagesRef.current, ...sessionUploadedRef.current];
            const imagesToDelete = allEverBeenImages.filter(url => !finalImages.includes(url));

            if (imagesToDelete.length > 0) {
                for (const url of imagesToDelete) {
                    if (url.includes('yandexcloud.net') || url.includes('localhost')) {
                        await MediaApiService.deleteImage(url);
                    }
                }
            }

            await onSave({ 
                title, 
                content: editor.getHTML(), 
                tech_stack: techStack, 
                github_url: githubUrl,
                image_url: imageUrl,
                slug: title.toLowerCase().replace(/[^\w\sа-яё-]/gi, "").replace(/\s+/g, "-") 
            });

            // Если сохранение прошло успешно, можно либо редиректить, 
            // либо показать успех (в твоем ArticleFormPage скорее всего идет редирект)
        } catch (error) {
            setStatus({
                isOpen: true,
                type: 'error',
                title: 'Ошибка сохранения',
                message: 'Что-то пошло не так при синхронизации с базой данных.'
            });
        } finally {
            setIsUploading(false);
        }
    };

    if (!editor) return null;

    return (
        <>
            <ScrollToTop hasOffset={toc.length > 0 && isMobile} />
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 w-full space-y-8 animate-in fade-in duration-700 relative z-10">
            
                {/* ВЕРХНЯЯ ЧАСТЬ: TITLE + META */}
                <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center mb-16">
                    {/* ЛЕВАЯ ЧАСТЬ: ЗАГОЛОВОК */}
                    <div className="flex-1 w-full group/title">
                        <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/40 mb-4 ml-2">Назнвание поста</span>
                        <input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Название..." 
                            className="w-full bg-transparent text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter outline-none border-none p-0 placeholder:text-white/5 focus:ring-0 text-white transition-all focus:placeholder:opacity-0" 
                        />
                    </div>
                    
                    {/* ПРАВАЯ ЧАСТЬ: ПРЕМИУМ ПАНЕЛЬ МЕТАДАННЫХ */}
                    <div className="w-full lg:w-[480px] shrink-0">
                        <div 
                            onClick={() => setIsMetaModalOpen(true)}
                            className="relative overflow-hidden bg-white/[0.01] border border-white/5 hover:border-blue-500/30 p-1 rounded-[40px] backdrop-blur-3xl cursor-pointer transition-all duration-500 group/meta shadow-2xl"
                        >
                            <div className="flex items-center p-4 gap-5">
                                {/* 1. ПРЕВЬЮ ОБЛОЖКИ (Кинематографичный вид) */}
                                <div className="relative w-32 h-20 rounded-[28px] overflow-hidden border border-white/10 shrink-0 bg-black shadow-2xl transition-transform duration-500 group-hover/meta:scale-[1.02]">
                                    {imageUrl ? (
                                        <img 
                                            src={imageUrl} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/meta:scale-110" 
                                            alt="Preview" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                            <ImageIcon size={20} className="text-white/10" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/meta:opacity-100 transition-opacity" />
                                </div>

                                {/* 2. ИНФО-ДАННЫЕ */}
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Tag size={10} className="text-blue-500 opacity-50" />
                                                <span className="text-[8px] font-black uppercase text-blue-500/40 tracking-[0.2em]">Keywords</span>
                                            </div>
                                            <p className="text-[11px] text-gray-300 font-bold truncate max-w-[200px]">
                                                {techStack ? techStack.split(',').map(t => `#${t.trim()}`).join(' ') : 'No tags assigned'}
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <LinkIcon size={10} className="text-blue-500 opacity-50" />
                                                <span className="text-[8px] font-black uppercase text-blue-500/40 tracking-[0.2em]">Source Path</span>
                                            </div>
                                            <p className="text-[11px] text-blue-400/60 font-medium truncate max-w-[200px] italic">
                                                {githubUrl || 'private-repository.git'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. КНОПКА-ИНДИКАТОР */}
                                <div className="w-14 h-14 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover/meta:bg-blue-600 group-hover/meta:border-blue-500 transition-all duration-500 group-hover/meta:shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                    <ChevronRight size={20} className="text-white/20 group-hover/meta:text-white group-hover/meta:translate-x-0.5 transition-all" />
                                </div>
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
                            {(user?.role === 'admin' || user?.role?.includes('-img')) && (
                                <label className="p-2.5 rounded-xl cursor-pointer text-gray-500 hover:text-white hover:bg-white/5 transition-all group relative">
                                    {isUploading ? (
                                        <div className="animate-spin"><UploadCloud size={18} /></div>
                                    ) : (
                                        <ImageIcon size={18} />
                                    )}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleImageUpload} 
                                        disabled={isUploading}
                                    />
                                </label>
                            )}
                            <div className="flex-grow" />
                            <ToolbarButton onClick={() => editor.chain().focus().undo().run()}><Undo size={18}/></ToolbarButton>
                            <ToolbarButton onClick={() => editor.chain().focus().redo().run()}><Redo size={18}/></ToolbarButton>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
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

            <StatusModal 
                isOpen={status.isOpen}
                type={status.type}
                title={status.title}
                message={status.message}
                onClose={() => setStatus(prev => ({ ...prev, isOpen: false }))}
            />

            <ConfirmModal 
                isOpen={isConfirmCancelOpen}
                title="Отменить правки?"
                message="Все незавершенные изменения будут потеряны. Вы уверены?"
                onConfirm={onCancel}
                onCancel={() => setIsConfirmCancelOpen(false)}
            />

            {/* КОМПОНЕНТЫ МОДАЛОК И ПОРТАЛОВ */}
            <ArticleMetaModal 
                isOpen={isMetaModalOpen} 
                onClose={() => setIsMetaModalOpen(false)}
                techStack={techStack} setTechStack={setTechStack}
                githubUrl={githubUrl} setGithubUrl={setGithubUrl}
                imageUrl={imageUrl} 
                user={user}
                setImageUrl={setImageUrl}
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
                onScrollTo={scrollToPos} 
            />
        </>

    );
};

const ToolbarButton: React.FC<{ onClick: () => void; isActive?: boolean; children: React.ReactNode }> = ({ onClick, isActive, children }) => (
    <button onClick={(e) => { e.preventDefault(); onClick(); }} className={`p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
        {children}
    </button>
);