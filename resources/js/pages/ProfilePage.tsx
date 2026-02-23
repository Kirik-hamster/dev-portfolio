import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserCircle, BookOpen, Shield, Database, Plus, Folder, ChevronRight, X, Users, Activity, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { User as UserType, Blog, Article } from '../types';
import { PremiumLoader } from '../components/PremiumLoader';
import { AdminPanel } from '@/components/profile/AdminPanel';
import { BlogApiService } from '../services/BlogApiService';
import { UserBlogsList } from '../components/profile/UserBlogsList';
import { ProfileInfo } from '../components/profile/ProfileInfo';
import { ConfirmModal } from '@/components/ui/ConfirmModel';

interface ProfilePageProps {
    user: UserType | null;
    onBlogSelect: (id: number) => void; 
    onNavigateToPortfolio: () => void;
    onTriggerCreate: (blogId: number | null) => void;
    onEditArticle: (article: Article) => void;
    onArticleSelect: (article: Article) => void;
}

export function ProfilePage({ 
    user, 
    onBlogSelect, 
    onTriggerCreate,
    onEditArticle,
    onArticleSelect
}: ProfilePageProps) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

    // --- 1. СИНХРОНИЗАЦИЯ С URL (Источник правды) ---
    const getActiveTabFromUrl = () => {
        const path = location.pathname;
        if (path.includes('/blog')) return 'blog';
        if (path.includes('/admin')) return 'admin';
        if (path.includes('/comments')) return 'comments';
        return 'profile';
    };

    const activeTab = getActiveTabFromUrl();

    // Извлекаем ID блога из пути /profile/blog/ID
    const pathParts = location.pathname.split('/');
    const insideBlogId = activeTab === 'blog' && pathParts[3] ? Number(pathParts[3]) : null;

    // --- 2. СОСТОЯНИЯ ---
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [allBlogsCount, setAllBlogsCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newBlog, setNewBlog] = useState({ title: '', description: '' });
    const [insideBlogTitle, setInsideBlogTitle] = useState('');

    // Лаборатория лоадера
    const [demoLoading, setDemoLoading] = useState(false);
    const [demoDuration, setDemoDuration] = useState(3);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    const startDemo = () => {
        if (timerId) clearTimeout(timerId);
        setDemoLoading(true);
        const id = setTimeout(() => setDemoLoading(false), demoDuration * 1000);
        setTimerId(id);
    };

    const cancelDemo = () => {
        if (timerId) clearTimeout(timerId);
        setDemoLoading(false);
    };

    // --- 3. ЭФФЕКТЫ ---
    useEffect(() => {
        if (insideBlogId && blogs.length > 0) {
            const current = blogs.find(b => b.id === insideBlogId);
            if (current) setInsideBlogTitle(current.title);
        }
    }, [blogs, insideBlogId]);

    const fetchBlogs = () => {
        setLoading(true);
        fetch('/api/blogs?my_only=1') 
            .then(res => res.json())
            .then(data => {
                setAllBlogsCount(data.length);
                setBlogs(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (activeTab === 'blog' || activeTab === 'admin') fetchBlogs();
    }, [activeTab]);

    // --- 4. ОБРАБОТЧИКИ ---
    const switchTab = (tab: string) => {
        navigate(`/profile/${tab === 'profile' ? '' : tab}`);
    };

    const getXsrfToken = () => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; XSRF-TOKEN=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        return '';
    };

    const handleCreateSubmit = async () => {
        if (!newBlog.title) return alert("Введите название папки!");
        const res = await BlogApiService.save(newBlog);
        if (res.ok) {
            setIsCreating(false);
            setNewBlog({ title: '', description: '' });
            fetchBlogs(); 
        }
    };

    const handleUpdateSubmit = async () => {
        if (!editingBlog) return;
        const res = await BlogApiService.save({
            title: editingBlog.title,
            description: editingBlog.description ?? '' 
        }, editingBlog.id);
        if (res.ok) {
            setEditingBlog(null);
            fetchBlogs();
        }
    };

    // 1. Эта функция передается в UserBlogsList и просто открывает модалку
    const handleDeleteBlog = (id: number) => {
        setBlogToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // 2. Эта функция вызывается кнопкой "Удалить" в самой модалке
    const confirmDeleteBlog = async () => {
        if (!blogToDelete) return;

        const res = await fetch(`/api/blogs/${blogToDelete}`, {
            method: 'DELETE',
            headers: { 
                'Accept': 'application/json', 
                'X-XSRF-TOKEN': getXsrfToken() 
            }
        });

        if (res.ok) {
            setIsDeleteModalOpen(false);
            setBlogToDelete(null);
            fetchBlogs(); // Обновляем список после удаления
        }
    };

    if (!user) return <div className="text-center py-20 text-gray-600 uppercase text-[10px] font-black tracking-widest">Доступ запрещен</div>;

    const isAdmin = user.role === 'admin';

    // --- 5. РЕНДЕР КОНТЕНТА ---
    const renderContent = () => {
        if (loading) return <PremiumLoader />;

        switch (activeTab) {
            case 'profile':
                return <ProfileInfo user={user!} />;
            
            case 'comments':
                return (
                    <div className="bg-white/[0.02] border border-white/5 rounded-[50px] relative overflow-hidden animate-in fade-in duration-500 min-h-[500px] flex flex-col items-center justify-center text-center p-10">
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none transform -rotate-12"><MessageSquare size={400} /></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-28 h-28 bg-blue-500/10 rounded-full flex items-center justify-center mb-10 border border-blue-500/20 shadow-2xl shadow-blue-500/10"><MessageSquare size={48} className="text-blue-500" /></div>
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-6">Раздел в разработке</h3>
                            <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-10 font-medium">Скоро здесь появится история всех ваших комментариев.</p>
                            <span className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 cursor-wait hover:bg-white/10 transition-colors">Coming Soon</span>
                        </div>
                    </div>
                );

            case 'blog':
                return (
                    <UserBlogsList 
                        user={user!}
                        blogs={blogs}
                        insideBlogId={insideBlogId}
                        insideBlogTitle={insideBlogTitle}
                        isCreating={isCreating}
                        editingBlog={editingBlog}
                        newBlog={newBlog}
                        setIsCreating={setIsCreating}
                        setEditingBlog={setEditingBlog}
                        setNewBlog={setNewBlog}
                        handleCreateSubmit={handleCreateSubmit}
                        handleUpdateSubmit={handleUpdateSubmit}
                        handleDeleteBlog={handleDeleteBlog}
                        onBlogSelect={onBlogSelect}
                        onArticleSelect={onArticleSelect}
                        onEditArticle={onEditArticle}
                        onTriggerCreate={onTriggerCreate}
                    />
                );

            case 'admin':
                return <AdminPanel 
                    allBlogsCount={allBlogsCount} 
                    demoDuration={demoDuration} 
                    setDemoDuration={setDemoDuration}
                    startDemo={startDemo}
                    cancelDemo={cancelDemo}
                    demoLoading={demoLoading}
                />;

            default: return null;
        }
    };

    return (
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row gap-10 lg:gap-16 pt-10 px-6 md:px-12 pb-20">
            {/* САЙДБАР */}
            <aside className="w-full md:w-72 flex-shrink-0 space-y-12">
                <div className="flex flex-col items-start px-6">
                    <div className="w-20 h-20 bg-white/5 rounded-[28px] border border-white/10 flex items-center justify-center mb-6 relative shadow-2xl shadow-black/50">
                        <UserCircle size={40} className="text-white/20" />
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-[#050505]" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-1.5 leading-none text-white/90">{user.name}</h2>
                    <span className="text-[7px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-500 uppercase font-black tracking-widest">{user.role}</span>
                </div>

                <nav className="flex flex-col gap-1.5">
                    {[
                        { id: 'profile', label: 'Профиль', icon: UserCircle },
                        { id: 'blog', label: 'Мой блог', icon: BookOpen },
                        { id: 'comments', label: 'Мои комментарии', icon: MessageSquare },
                        ...(isAdmin ? [{ id: 'admin', label: 'Управление', icon: Database }] : []),
                    ].map((tab) => (
                        <button 
                            key={tab.id} 
                            onClick={() => switchTab(tab.id)} 
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border ${activeTab === tab.id ? 'bg-white/5 text-blue-500 border-white/10 shadow-xl shadow-blue-500/5' : 'text-gray-500 hover:text-white hover:bg-white/[0.02] border-transparent'}`}
                        >
                            {/* Иконка теперь стоит ровно под аватаром */}
                            <tab.icon size={16} className={activeTab === tab.id ? 'text-blue-500' : 'text-gray-600'} /> 
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ОСНОВНОЙ КОНТЕНТ */}
            <main className="flex-1 min-h-[400px]">
                <div className="mb-10 border-b border-white/5 pb-10 flex justify-between items-end">
                    <h2 className="text-5xl font-black uppercase tracking-tighter">
                        {activeTab === 'profile' && 'Профиль'}
                        {activeTab === 'blog' && (insideBlogId ? 'Записи' : 'Мои блоги')}
                        {activeTab === 'admin' && 'Управление'}
                        {activeTab === 'comments' && 'Комментарии'}
                    </h2>
                </div>
                {renderContent()}
            </main>
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Удаление папки"
                message="Вы уверены? Это действие безвозвратно удалит папку и ВСЕ статьи, которые в ней находятся."
                onConfirm={confirmDeleteBlog}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
}