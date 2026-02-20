import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, ChevronRight, Plus, Pencil, Trash2, X } from 'lucide-react';
import { Blog, User, Article, BlogInput } from '../../types';
import { UserArticlesList } from './UserArticlesList';

interface UserBlogsListProps {
    user: User;
    blogs: Blog[];
    insideBlogId: number | null;
    insideBlogTitle: string;
    isCreating: boolean;
    editingBlog: Blog | null;
    newBlog: BlogInput;
    setIsCreating: (v: boolean) => void;
    setEditingBlog: (b: Blog | null) => void;
    setNewBlog: (b: BlogInput) => void;
    handleCreateSubmit: () => void;
    handleUpdateSubmit: () => void;
    handleDeleteBlog: (id: number) => void;
    onBlogSelect: (id: number) => void;
    onArticleSelect: (a: Article) => void;
    onEditArticle: (a: Article) => void;
    onTriggerCreate: (blogId: number | null) => void;
}

export const UserBlogsList: React.FC<UserBlogsListProps> = (props) => {
    const navigate = useNavigate();
    const { 
        user, blogs, insideBlogId, insideBlogTitle, isCreating, editingBlog, 
        newBlog, setIsCreating, setEditingBlog, setNewBlog, 
        handleCreateSubmit, handleUpdateSubmit, handleDeleteBlog,
        onBlogSelect, onArticleSelect, onEditArticle, onTriggerCreate 
    } = props;

    // --- 1. ВИД ВНУТРИ ПАПКИ ---
    if (insideBlogId) {
        const currentBlog = blogs.find(b => b.id === insideBlogId);
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[50px] relative overflow-hidden backdrop-blur-3xl">
                    <div className="absolute -right-10 -top-10 opacity-[0.02] transform rotate-12 transition-transform duration-700 pointer-events-none text-white">
                        <Folder size={300} />
                    </div>
                    <div className="relative z-10">
                        <button onClick={() => navigate('/profile/blog')} className="mb-10 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all border border-white/5">
                            <ChevronRight size={20} className="rotate-180"/>
                        </button>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div>
                                <span className="text-[8px] font-black uppercase text-blue-500/60 block mb-4 tracking-[0.2em]">Название категории:</span>
                                <h3 className="text-5xl font-black uppercase tracking-tighter text-white mb-8">{insideBlogTitle}</h3>
                                <span className="text-[8px] font-black uppercase text-gray-600 block mb-4 tracking-[0.2em]">Описание:</span>
                                <p className="text-[14px] text-gray-400/80 leading-7 font-medium border-l border-white/10 pl-6 whitespace-pre-line italic">
                                    {currentBlog?.description || "Описание пока не добавлено."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <UserArticlesList 
                    user={user}
                    blogId={insideBlogId}
                    onArticleSelect={onArticleSelect}
                    onEditArticle={onEditArticle}
                    onCreateArticle={() => onTriggerCreate(insideBlogId)}
                />
            </div>
        );
    }

    // --- 2. ОБЩИЙ СПИСОК ПАПОК ---
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-bold uppercase tracking-tight">Ваши блоги</h3>
                {!isCreating && (
                    <button 
                        onClick={() => { setEditingBlog(null); setIsCreating(true); }} 
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase hover:scale-105 transition-all"
                    >
                        <Plus size={14}/> Создать папку
                    </button>
                )}
            </div>

            {/* ФОРМА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ */}
            {(isCreating || editingBlog) && (
                <div className="relative group mb-12 animate-in zoom-in-95 duration-500">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[45px] blur-2xl opacity-50" />
                    <div className="relative bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-3xl p-10 rounded-[40px]">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="font-black uppercase text-[11px] text-blue-500 tracking-[0.2em]">
                                {editingBlog ? 'Управление категорией' : 'Новое пространство'}
                            </h4>
                            <button onClick={() => { setIsCreating(false); setEditingBlog(null); }} className="p-3 hover:bg-white/5 rounded-full text-gray-500"><X size={20}/></button>
                        </div>
                        <div className="space-y-8">
                            <input 
                                type="text" 
                                placeholder="Название..." 
                                className="w-full bg-white/[0.02] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/40 transition-all text-sm" 
                                value={isCreating ? newBlog.title : editingBlog?.title || ''} 
                                onChange={e => isCreating ? setNewBlog({...newBlog, title: e.target.value}) : setEditingBlog({...editingBlog!, title: e.target.value})}
                            />
                            <textarea 
                                placeholder="Описание..." 
                                className="w-full bg-white/[0.02] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/40 transition-all text-sm min-h-[120px]" 
                                value={isCreating ? newBlog.description : editingBlog?.description || ''} 
                                onChange={e => isCreating ? setNewBlog({...newBlog, description: e.target.value}) : setEditingBlog({...editingBlog!, description: e.target.value})}
                            />
                            <div className="flex gap-4">
                                <button onClick={editingBlog ? handleUpdateSubmit : handleCreateSubmit} className="flex-1 py-5 bg-blue-600 text-white rounded-[22px] font-black uppercase text-[10px] tracking-[0.2em]">
                                    {editingBlog ? 'Сохранить изменения' : 'Создать раздел'}
                                </button>
                                <button onClick={() => { setIsCreating(false); setEditingBlog(null); }} className="px-10 py-5 bg-white/5 text-gray-400 rounded-[22px] font-black uppercase text-[10px]">Отмена</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* СЕТКА КАРТОЧЕК */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {blogs.map(blog => (
                    <div 
                        key={blog.id} 
                        onClick={() => onBlogSelect(blog.id)} 
                        className="group p-7 bg-white/[0.02] border border-white/5 rounded-[35px] hover:border-blue-500/30 cursor-pointer transition-all duration-300 flex flex-col gap-5 relative overflow-hidden hover:scale-[1.02]"
                    >
                        <div className="absolute -right-6 -bottom-6 opacity-[0.03] transform rotate-12 transition-transform duration-500 group-hover:scale-125 group-hover:opacity-[0.06] pointer-events-none text-white">
                            <Folder size={180} />
                        </div>
                        <div className="flex items-start justify-between relative z-10 w-full gap-4">
                            <div className="min-w-0 flex-1"> 
                                <h4 className="font-black text-xl tracking-tighter text-white/90 leading-none break-words line-clamp-1 mb-2 group-hover:text-blue-400 transition-colors">
                                    {blog.title}
                                </h4>
                                <p className="text-[8px] text-blue-500/40 uppercase font-black tracking-widest">
                                    {blog.is_portfolio ? 'System Section' : 'Personal Blog'}
                                </p>
                            </div>
                            {!blog.is_portfolio && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 shrink-0">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingBlog(blog); }} className="p-2.5 bg-white/5 hover:bg-blue-500/20 text-gray-500 hover:text-blue-500 rounded-xl border border-white/5 transition-all"><Pencil size={13} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteBlog(blog.id); }} className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-xl border border-white/5 transition-all"><Trash2 size={13} /></button>
                                </div>
                            )}
                        </div>
                        <p className="text-[12px] text-gray-500/80 leading-relaxed italic border-l border-white/5 pl-4 line-clamp-2 h-9 overflow-hidden relative z-10 font-medium">
                            {blog.description || "No description yet..."}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};