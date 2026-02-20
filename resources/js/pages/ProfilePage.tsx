import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserCircle, BookOpen, Shield, Database, Plus, Folder, ChevronRight, X, Users, Activity, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { User as UserType, Blog, Article } from '../types';
import { UserArticlesList } from '../components/UserArticlesList';
import { PremiumLoader } from '../components/PremiumLoader';
import { AdminPanel } from '@/components/AdminPanel';

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
    onNavigateToPortfolio, 
    onTriggerCreate,
    onEditArticle,
    onArticleSelect
}: ProfilePageProps) {
    const navigate = useNavigate();
    const location = useLocation();
    
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
        const res = await fetch('/api/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getXsrfToken() },
            body: JSON.stringify(newBlog)
        });
        if (res.ok) {
            setIsCreating(false);
            setNewBlog({ title: '', description: '' });
            fetchBlogs(); 
        }
    };

    const handleUpdateSubmit = async () => {
        if (!editingBlog) return;
        const res = await fetch(`/api/blogs/${editingBlog.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': getXsrfToken() },
            body: JSON.stringify(editingBlog)
        });
        if (res.ok) {
            setEditingBlog(null);
            fetchBlogs();
        }
    };

    const handleDeleteBlog = async (id: number) => {
        if (!window.confirm("Удалить папку и ВСЕ статьи внутри?")) return;
        const res = await fetch(`/api/blogs/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': getXsrfToken() }
        });
        if (res.ok) fetchBlogs();
    };

    if (!user) return <div className="text-center py-20 text-gray-600 uppercase text-[10px] font-black tracking-widest">Доступ запрещен</div>;

    const isAdmin = user.role === 'admin';

    // --- 5. РЕНДЕР КОНТЕНТА ---
    const renderContent = () => {
        if (loading) return <PremiumLoader />;

        switch (activeTab) {
            case 'profile':
                return (
                    <div className="max-w-6xl animate-in fade-in duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Карточка данных */}
                            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] shadow-2xl shadow-black/20 backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                                <h3 className="text-xl font-black mb-10 uppercase tracking-tighter text-white/90 border-b border-white/5 pb-6 flex items-center gap-3">
                                    <UserCircle size={20} className="text-blue-500/50" /> Личные данные
                                </h3>
                                <div className="space-y-6 text-sm relative z-10">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-5">
                                        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Имя</span>
                                        <span className="text-white font-medium text-lg tracking-tight">{user.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-5">
                                        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Email</span>
                                        <span className="text-gray-300 font-medium">{user.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Роль</span>
                                        <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-tighter">{user.role}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Карточка безопасности */}
                            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] shadow-2xl shadow-black/20 backdrop-blur-3xl relative overflow-hidden">
                                <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                                        <Shield className="text-blue-500" size={24}/>
                                    </div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight text-white/90">Безопасность</h3>
                                </div>
                                <div className="space-y-6">
                                    <p className="text-[12px] text-gray-500 leading-relaxed italic">Управляйте доступом к вашему аккаунту. Мы рекомендуем регулярно обновлять пароль.</p>
                                    <button className="w-full py-5 bg-white/5 border border-white/10 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">Сбросить текущий пароль</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
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
                // ЕСЛИ МЫ ВНУТРИ ПАПКИ
                if (insideBlogId) {
                    const currentBlog = blogs.find(b => b.id === Number(insideBlogId));
                    return (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[50px] relative overflow-hidden backdrop-blur-3xl">
                                <div className="absolute -right-10 -top-10 opacity-[0.02] transform rotate-12 pointer-events-none"><Folder size={300} /></div>
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

                // СПИСОК ВСЕХ ПАПОК
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-xl font-bold uppercase tracking-tight">Ваши блоги</h3>
                            {!isCreating && (
                                <button 
                                    onClick={() => { 
                                        setEditingBlog(null);
                                        setIsCreating(true);  
                                    }} 
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase hover:scale-105 transition-all"
                                >
                                    <Plus size={14}/> Создать папку
                                </button>
                            )}
                        </div>

                        {(isCreating || editingBlog) && (
                            <div className="relative group mb-12 animate-in zoom-in-95 duration-500">
                                {/* Фоновое "дорогое" свечение */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[45px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                                
                                <div className="relative bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-3xl p-10 rounded-[40px] shadow-2xl">
                                    {/* Хедер формы */}
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                                {editingBlog ? <Pencil size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-400" />}
                                            </div>
                                            <div>
                                                <h4 className="font-black uppercase text-[11px] text-blue-500 tracking-[0.2em]">
                                                    {editingBlog ? 'Управление категорией' : 'Новое пространство'}
                                                </h4>
                                                <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mt-1">
                                                    {editingBlog ? 'Редактирование существующих данных' : 'Создание нового раздела в вашем блоге'}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => { setIsCreating(false); setEditingBlog(null); }} 
                                            className="p-3 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"
                                        >
                                            <X size={20}/>
                                        </button>
                                    </div>

                                    {/* Поля ввода */}
                                    <div className="space-y-8">
                                        <div className="relative group/input">
                                            <label className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#0d0d0d] rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 shadow-sm z-10">
                                                Название
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="Назовите вашу папку..." 
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/40 focus:bg-white/[0.04] transition-all text-sm font-medium placeholder:text-gray-800" 
                                                value={isCreating ? newBlog.title : editingBlog?.title} 
                                                onChange={e => isCreating 
                                                    ? setNewBlog({...newBlog, title: e.target.value}) 
                                                    : setEditingBlog({...editingBlog!, title: e.target.value})
                                                }
                                            />
                                        </div>

                                        <div className="relative group/input">
                                            <label className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#0d0d0d] rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 shadow-sm z-10">
                                                Описание
                                            </label>
                                            <textarea 
                                                placeholder="О чем этот раздел? Краткое описание для читателей..." 
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/40 focus:bg-white/[0.04] transition-all text-sm font-medium min-h-[120px] placeholder:text-gray-800 leading-relaxed" 
                                                value={isCreating ? newBlog.description : editingBlog?.description || ''} 
                                                onChange={e => isCreating 
                                                    ? setNewBlog({...newBlog, description: e.target.value}) 
                                                    : setEditingBlog({...editingBlog!, description: e.target.value})
                                                }
                                            />
                                        </div>

                                        {/* Кнопки действий */}
                                        <div className="flex gap-4 pt-4">
                                            <button 
                                                onClick={editingBlog ? handleUpdateSubmit : handleCreateSubmit} 
                                                className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[22px] font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                {editingBlog ? 'Сохранить изменения' : 'Создать раздел'}
                                            </button>
                                            <button 
                                                onClick={() => { setIsCreating(false); setEditingBlog(null); }} 
                                                className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white rounded-[22px] font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Сетка папок */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {blogs.map(blog => (
                                <div key={blog.id} onClick={() => onBlogSelect(blog.id)} className="group p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:border-blue-500/30 cursor-pointer transition-all flex flex-col gap-6 relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-[0.02] transform rotate-6 pointer-events-none text-white"><Folder size={120} /></div>
                                    <div className="flex items-start justify-between relative z-10 w-full gap-4">
                                        
                                        {/* ЛЕВАЯ ЧАСТЬ: Иконка + Текст */}
                                        <div className="flex items-center gap-5 min-w-0"> 
                                            {/* shrink-0 чтобы иконку не сжимало при длинном тексте */}
                                            <div className="p-4 bg-white/5 rounded-3xl text-gray-400 group-hover:text-blue-500 transition-colors border border-white/5 shrink-0">
                                                <Folder size={24}/>
                                            </div>
                                            
                                            {/* min-w-0 критически важен для работы line-clamp внутри флекса */}
                                            <div className="min-w-0">
                                                {/* line-clamp-2 перенесет на 2 строку и добавит "..." */}
                                                <h4 className="font-bold text-xl tracking-tight text-white/90 leading-tight break-words line-clamp-2">
                                                    {blog.title}
                                                </h4>
                                                <p className="text-[8px] text-blue-500/50 uppercase font-black tracking-widest mt-1">
                                                    {blog.is_portfolio ? 'Системный раздел' : 'Ваш блог'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ПРАВАЯ ЧАСТЬ: Кнопки (shrink-0 чтобы кнопки всегда были видны) */}
                                        {!blog.is_portfolio && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 relative z-20 shrink-0">
                                                <button onClick={(e) => { e.stopPropagation(); setEditingBlog(blog); }} className="p-3 bg-white/5 hover:bg-blue-500/20 text-gray-500 hover:text-blue-500 rounded-2xl border border-white/5 transition-all">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteBlog(blog.id); }} className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-2xl border border-white/5 transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[12px] text-gray-500 leading-relaxed italic border-l border-white/5 pl-4 line-clamp-2 h-9 overflow-hidden relative z-10">
                                        {blog.description || "Описание не добавлено..."}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
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
        </div>
    );
}