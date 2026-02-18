import React, { useState, useEffect } from 'react';
import { UserCircle, BookOpen, Shield, Database, Plus, Folder, ChevronRight, X, Users, Activity } from 'lucide-react';
import { User as UserType, Blog, Article } from '../types';
import { UserArticlesList } from '../components/UserArticlesList';

interface ProfilePageProps {
    user: UserType | null;
    onBlogSelect: (id: number) => void; 
    onNavigateToPortfolio: () => void;
    onTriggerCreate: () => void; 
    onEditArticle: (article: Article) => void;
    onArticleSelect: (article: Article) => void;
    initialBlogId?: number | null;
}

export function ProfilePage({ 
    user, 
    onBlogSelect, 
    onNavigateToPortfolio, 
    onTriggerCreate,
    onEditArticle,
    onArticleSelect,
    initialBlogId
}: ProfilePageProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'blog' | 'security' | 'admin'>(
        initialBlogId ? 'blog' : 'general'
    );
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [allBlogsCount, setAllBlogsCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [isCreating, setIsCreating] = useState(false);
    const [newBlog, setNewBlog] = useState({ title: '', description: '' });
    
    // Состояния для "погружения" в папку
    const [insideBlogId, setInsideBlogId] = useState<number | null>(initialBlogId || null);
    const [insideBlogTitle, setInsideBlogTitle] = useState('');


    useEffect(() => {
        if (insideBlogId && blogs.length > 0) {
            const current = blogs.find(b => b.id === insideBlogId);
            if (current) setInsideBlogTitle(current.title);
        }
    }, [blogs, insideBlogId]);

    if (!user) return <div className="text-center py-20 text-gray-600 uppercase text-[10px] font-black tracking-widest">Доступ запрещен</div>;

    const isAdmin = user.role === 'admin';

    const getXsrfToken = () => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; XSRF-TOKEN=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        return '';
    };

    const fetchBlogs = () => {
        setLoading(true);
        // Запрашиваем только свои блоги
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

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[30px] animate-in fade-in duration-500">
                         <h3 className="text-xl font-bold mb-6 uppercase tracking-tight text-white/90">Личные данные</h3>
                         <div className="space-y-4 text-sm">
                             <div className="flex justify-between border-b border-white/5 pb-4">
                                 <span className="text-gray-500 font-bold uppercase text-[10px]">Имя</span>
                                 <span>{user.name}</span>
                             </div>
                             <div className="flex justify-between border-b border-white/5 pb-4">
                                 <span className="text-gray-500 font-bold uppercase text-[10px]">Email</span>
                                 <span>{user.email}</span>
                             </div>
                             <div className="flex justify-between uppercase text-[10px] font-black">
                                 <span className="text-gray-500">Роль</span>
                                 <span className="text-blue-500">{user.role}</span>
                             </div>
                         </div>
                    </div>
                );

            case 'blog':
                // УРОВЕНЬ 2: ВНУТРИ ПАПКИ (СПИСОК СТАТЕЙ)
                if (insideBlogId) {
                    return (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={() => setInsideBlogId(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400">
                                    <ChevronRight size={20} className="rotate-180"/>
                                </button>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{insideBlogTitle}</h3>
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-2">Записи в этой категории</p>
                                </div>
                            </div>
                            
                            <UserArticlesList 
                                user={user}
                                blogId={insideBlogId}
                                onArticleSelect={onArticleSelect}
                                onEditArticle={onEditArticle}
                                onCreateArticle={() => {
                                    onBlogSelect(insideBlogId); 
                                    onTriggerCreate();
                                }}
                            />
                        </div>
                    );
                }

                // УРОВЕНЬ 1: СПИСОК ПАПОК
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-xl font-bold uppercase tracking-tight">Ваши блоги</h3>
                            {!isCreating && (
                                <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase hover:scale-105 transition-all">
                                    <Plus size={14}/> Создать папку
                                </button>
                            )}
                        </div>

                        {isCreating && (
                            <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[40px] mb-8 animate-in zoom-in-95">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-black uppercase text-[10px] text-blue-500">Новая категория</h4>
                                    <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-white"><X size={18}/></button>
                                </div>
                                <div className="space-y-4">
                                    <input type="text" placeholder="Название папки" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 text-sm" value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})}/>
                                    <textarea placeholder="Описание" className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 text-sm min-h-[100px]" value={newBlog.description} onChange={e => setNewBlog({...newBlog, description: e.target.value})}/>
                                    <button onClick={handleCreateSubmit} className="w-full py-4 bg-blue-600 rounded-full font-black uppercase text-[10px] tracking-[0.2em]">Создать</button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {blogs.map(blog => (
                                <div 
                                    key={blog.id} 
                                    onClick={() => {
                                        if (blog.is_portfolio) onNavigateToPortfolio(); // Админ уходит в общую систему
                                        else { onBlogSelect(blog.id); setInsideBlogId(blog.id); setInsideBlogTitle(blog.title); } // Проваливаемся в обычный блог
                                    }} 
                                    className="group p-8 bg-white/[0.02] border border-white/5 rounded-[40px] hover:border-blue-500/30 cursor-pointer transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-white/5 rounded-3xl text-gray-400 group-hover:text-blue-500 transition-colors"><Folder size={24}/></div>
                                        <div>
                                            <h4 className="font-bold text-lg tracking-tight">{blog.title}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">{blog.is_portfolio ? 'Система' : 'Личный блог'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-800 group-hover:text-white transition-colors"/>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'admin':
                return (
                    <div className="bg-blue-600/[0.03] border border-blue-500/10 p-10 rounded-[40px] relative overflow-hidden animate-in fade-in">
                        <Database className="absolute -right-6 -bottom-6 text-blue-500/5 w-48 h-48" />
                        <h3 className="text-3xl font-black mb-10 uppercase tracking-tighter text-blue-400 relative z-10">Системная панель</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                <Users className="text-gray-400 mb-2" size={18}/>
                                <div className="text-2xl font-bold italic tracking-tighter">Активные сессии</div>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                <Activity className="text-gray-400 mb-2" size={18}/>
                                <div className="text-2xl font-bold italic tracking-tighter">{allBlogsCount} Категорий</div>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] animate-in fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <Shield className="text-gray-500" size={24}/>
                            <h3 className="text-xl font-bold uppercase tracking-tight">Безопасность</h3>
                        </div>
                        <button className="w-full py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                            Сбросить текущий пароль
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 pt-10 px-6 pb-20">
            {/* САЙДБАР */}
            <aside className="w-full md:w-72 flex-shrink-0 space-y-10">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-24 h-24 bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center mb-6 relative">
                        <UserCircle size={48} className="text-white/20" />
                        <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-4 border-[#050505]" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-1 leading-none">{user.name}</h2>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">{user.role}</p>
                </div>

                <nav className="flex flex-col gap-1.5">
                    {[
                        { id: 'general', label: 'Общее', icon: UserCircle },
                        { id: 'blog', label: 'Мой блог', icon: BookOpen },
                        ...(isAdmin ? [{ id: 'admin', label: 'Управление', icon: Database }] : []),
                        { id: 'security', label: 'Защита', icon: Shield },
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setInsideBlogId(null); setIsCreating(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border ${activeTab === tab.id ? 'bg-white/5 text-blue-500 border-white/10 shadow-lg shadow-blue-500/5' : 'text-gray-500 hover:text-white hover:bg-white/[0.02] border-transparent'}`}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ОСНОВНОЙ КОНТЕНТ */}
            <main className="flex-1 min-h-[400px]">
                <div className="mb-10 border-b border-white/5 pb-10 flex justify-between items-end">
                    <h2 className="text-5xl font-black uppercase tracking-tighter">
                        {activeTab === 'general' && 'Профиль'}
                        {activeTab === 'blog' && (insideBlogId ? 'Записи' : 'Мои блоги')}
                        {activeTab === 'admin' && 'Управление'}
                        {activeTab === 'security' && 'Безопасность'}
                    </h2>
                </div>
                {renderContent()}
            </main>
        </div>
    );
}