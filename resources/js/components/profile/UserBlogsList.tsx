import React, { useState, useMemo, useRef, useEffect } from 'react'; // Убрали лишний useEffect, оставили useMemo
import { useNavigate } from 'react-router-dom';
import { Plus,X } from 'lucide-react';
import { Blog, User, Article, BlogInput, BlogPagination } from '../../types';
import { UserArticlesList } from './UserArticlesList';
import { Pagination } from '../ui/Pagination';
import { FilterBar } from '../ui/FilterBar';
import { BlogHeader } from '../blog/BlogHeader';
import { BlogCard } from '../blog/BlogCard';

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
    blogPagination: BlogPagination | null; 
    onPageChange: (page: number) => void; 
    onFilterChange?: (params: { search: string; sort: string; favorites: boolean }) => void;
    onOpenTags: (tags: string[], title: string) => void;
}

export const UserBlogsList: React.FC<UserBlogsListProps> = (props) => {
    const navigate = useNavigate();
    const { 
        user, blogs, insideBlogId, insideBlogTitle, isCreating, editingBlog, 
        newBlog, setIsCreating, setEditingBlog, setNewBlog, 
        handleCreateSubmit, handleUpdateSubmit, handleDeleteBlog,
        onBlogSelect, onArticleSelect, onEditArticle, onTriggerCreate,
        blogPagination, onPageChange, onOpenTags
    } = props;

    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState<'latest' | 'popular'>('latest');
    const [favoritesOnly, setFavoritesOnly] = useState(false);

    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingBlog && formRef.current) {
            // Плавный скролл именно к форме
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [editingBlog]);

    // --- ЛОГИКА ФИЛЬТРАЦИИ (Тут магия!) --- 
    const filteredBlogs = useMemo(() => {
        let result = [...blogs];

        // 1. Поиск (по названию или описанию)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b => 
                b.title.toLowerCase().includes(q) || 
                (b.description && b.description.toLowerCase().includes(q))
            );
        }

        // 2. Избранное
        if (favoritesOnly) {
            result = result.filter(b => b.is_favorited);
        }

        // 3. Сортировка
        result.sort((a, b) => {
            if (sort === 'popular') return (b.likes_count || 0) - (a.likes_count || 0);
            return b.id - a.id; // Latest
        });

        return result;
    }, [blogs, searchQuery, sort, favoritesOnly]);

    // --- 1. ВИД ВНУТРИ ПАПКИ ---
    if (insideBlogId) {
        const currentBlog = blogs.find(b => b.id === insideBlogId);
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <BlogHeader 
                    activeBlog={currentBlog || null}
                    mode="profile" // Указываем режим профиля
                    onOpenTags={onOpenTags} // Передаем функцию открытия модалки
                />
                <UserArticlesList 
                    user={user}
                    blogId={insideBlogId}
                    onArticleSelect={onArticleSelect}
                    onEditArticle={onEditArticle}
                    onCreateArticle={() => onTriggerCreate(insideBlogId)}
                    onOpenTags={onOpenTags}
                />
            </div>
        );
    }

    // --- 2. ОБЩИЙ СПИСОК ПАПОК ---
    return (
        /* УБРАЛИ animate-in отсюда, чтобы FilterBar не моргал! */
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-bold uppercase tracking-tight">Ваши блоги</h3>
                {!isCreating && (
                    <button onClick={() => { setEditingBlog(null); setIsCreating(true); }} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase hover:scale-105 transition-all">
                        <Plus size={14}/> Создать папку
                    </button>
                )}
            </div>

            {/* Форма создания/редактирования */}
            {(isCreating || editingBlog) && (
                <div ref={formRef} className="relative group mb-12 animate-in zoom-in-95 duration-500">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[40px] blur-2xl opacity-50" />
                    <div className="relative bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-3xl p-10 rounded-[40px]">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="font-black uppercase text-[11px] text-blue-500 tracking-[0.2em]">{editingBlog ? 'Управление категорией' : 'Новое пространство'}</h4>
                            <button onClick={() => { setIsCreating(false); setEditingBlog(null); }} className="p-3 hover:bg-white/5 rounded-full text-gray-500"><X size={20}/></button>
                        </div>
                        <div className="space-y-8">
                            <input type="text" placeholder="Название..." className="w-full bg-white/[0.02] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/40 transition-all text-sm" value={isCreating ? newBlog.title : editingBlog?.title || ''} onChange={e => isCreating ? setNewBlog({...newBlog, title: e.target.value}) : setEditingBlog({...editingBlog!, title: e.target.value})} />
                            <textarea placeholder="Описание..." className="w-full bg-white/[0.02] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/40 transition-all text-sm min-h-[120px]" value={isCreating ? newBlog.description : editingBlog?.description || ''} onChange={e => isCreating ? setNewBlog({...newBlog, description: e.target.value}) : setEditingBlog({...editingBlog!, description: e.target.value})} />
                            <div className="flex gap-4">
                                <button onClick={editingBlog ? handleUpdateSubmit : handleCreateSubmit} className="flex-1 py-5 bg-blue-600 text-white rounded-[22px] font-black uppercase text-[10px] tracking-[0.2em]">{editingBlog ? 'Сохранить изменения' : 'Создать раздел'}</button>
                                <button onClick={() => { setIsCreating(false); setEditingBlog(null); }} className="px-10 py-5 bg-white/5 text-gray-400 rounded-[22px] font-black uppercase text-[10px]">Отмена</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ПАНЕЛЬ ФИЛЬТРОВ (теперь работает!) */}
            <div className="mb-10 px-2">
                <FilterBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchType="title"
                    setSearchType={() => {}}
                    sort={sort}
                    setSort={setSort}
                    favoritesOnly={favoritesOnly}
                    setFavoritesOnly={setFavoritesOnly}
                    isProfileMode={true}
                />
            </div>

            {/* СЕТКА КАРТОЧЕК: Анимация теперь только тут! */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {filteredBlogs.map(blog => ( // ИСПОЛЬЗУЕМ ОТФИЛЬТРОВАННЫЙ СПИСОК
                    <BlogCard 
                        key={blog.id}
                        blog={blog}
                        mode="profile"
                        onNavigate={onBlogSelect}
                        onOpenTags={onOpenTags}
                        onEdit={setEditingBlog} 
                        onDelete={handleDeleteBlog}
                    />
                ))}
            </div>

            {/* Сообщение, если ничего не найдено */}
            {filteredBlogs.length === 0 && (
                <div className="py-20 text-center opacity-30 italic">Ничего не найдено...</div>
            )}

            {blogPagination && (
                <Pagination 
                    currentPage={blogPagination.current_page} 
                    lastPage={blogPagination.last_page} 
                    onPageChange={onPageChange} 
                />
            )}
        </div>
    );
};