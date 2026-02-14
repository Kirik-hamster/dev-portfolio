import { Github, Mail, ArrowUpRight, MessageSquare, ArrowLeft, Trash2, Edit3, Search } from 'lucide-react';
import './bootstrap';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Article } from './types';
import { ArticleForm } from './components/ArticleForm';
import { CommentSection } from './components/CommentSection'; // Не забудь импорт!
import { ArticleApiService } from './services/ArticleApiService';

// Определяем типы для навигации
type ViewState = 'home' | 'portfolio' | 'create' | 'detail';

function App() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [view, setView] = useState<ViewState>('home');
    const [selectedArticle, setSelectedArticle] = useState<Article | undefined>(undefined);
    const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    const glowRef = useRef<HTMLDivElement>(null);
    

    // 1. Загрузка данных (согласно ТЗ GET /api/articles)
    const fetchArticles = useCallback((query = '') => {
        setLoading(true);
        ArticleApiService.fetchAll(query)
            .then(data => {
                setArticles(data);
                setLoading(false);
                setEditingArticle(undefined);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchArticles(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchArticles]);

    // 2. Удаление (CRUD требование)
    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm('Удалить статью?')) return;
        
        const res = await ArticleApiService.delete(id);
        if (res.ok) fetchArticles(searchQuery);
    };

    useEffect(() => {
        fetchArticles();
        const handleMouseMove = (e: MouseEvent) => {
            if (glowRef.current) {
                glowRef.current.style.left = `${e.clientX}px`;
                glowRef.current.style.top = `${e.clientY}px`;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [fetchArticles]);

    return (
        <div className="relative min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-blue-500/30 overflow-x-hidden">
            <div ref={glowRef} className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] z-0" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

            {/* --- HEADER --- */}
            <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
                    <h2 className="text-lg font-medium tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent cursor-pointer" onClick={() => setView('home')}>
                        Kirill Myakotin
                    </h2>

                    <nav className="flex gap-2">
                        <button onClick={() => setView('portfolio')} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${view === 'portfolio' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Портфолио</button>
                        <button className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/10 text-gray-500 cursor-not-allowed">Блоги</button>
                    </nav>
                </div>
            </header>

            {/* --- MAIN CONTENT (с отступом сверху) --- */}
            <main className="relative z-10 flex-grow pt-32 pb-20 max-w-5xl mx-auto px-6 w-full">
                
                {/* 0. HERO (HOME) */}
                {view === 'home' && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-1000">
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent leading-tight">
                            Solving Business<br/>Problems with Code.
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                            Fullstack-разработчик, специализирующийся на создании масштабируемых веб-приложений. 
                            Превращаю идеи в работающие продукты с помощью Laravel, React и современной инфраструктуры.
                        </p>
                        <button 
                            onClick={() => setView('portfolio')}
                            className="mt-4 px-10 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2"
                        >
                            Посмотреть портфолио
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                )}

                {/* 1. СПИСОК СТАТЕЙ (PORTFOLIO) */}
                {view === 'portfolio' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* --- NEW SEARCH AND CREATE CONTAINER --- */}
                        <div className="flex justify-between items-center gap-4 mb-8">
                            <div className="flex-1 max-w-md relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-full pl-12 pr-6 py-2.5 outline-none focus:bg-white/[0.07] focus:border-blue-500/50 transition-all text-sm"
                                />
                            </div>
                            <button onClick={() => { setEditingArticle(undefined); setView('create'); }} className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10">+ Создать</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {articles.map(article => (
                                <div 
                                    key={article.id} 
                                    onClick={() => {
                                        setLoading(true);
                                        ArticleApiService.fetchOne(article.id).then(fullArticle => {
                                            setSelectedArticle(fullArticle);
                                            setView('detail');
                                            setLoading(false);
                                            window.scrollTo(0, 0);
                                        });
                                    }}
                                    className="group cursor-pointer relative p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-500 backdrop-blur-sm"
                                >
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setEditingArticle(article); setView('create'); }} 
                                            className="p-2.5 bg-white text-black rounded-full hover:scale-110 transition"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(e, article.id)} 
                                            className="p-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-full transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-500 mb-4">{article.type}</div>
                                    <h3 className="text-2xl font-semibold mb-4 leading-tight group-hover:text-blue-400 transition-colors">{article.title}</h3>
                                    <div className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6" dangerouslySetInnerHTML={{ __html: article.content }} />
                                    <div className="pt-6 border-t border-white/5 flex gap-2 overflow-hidden">
                                        {article.tech_stack?.split(',').map(tag => (
                                            <span key={tag} className="text-[9px] px-2 py-1 bg-white/5 rounded-md text-gray-500 border border-white/5 uppercase font-bold"># {tag.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. DETAIL VIEW WITH COMMENTS */}
                {view === 'detail' && selectedArticle && (
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <button onClick={() => setView('portfolio')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-12 transition-colors group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to entries
                        </button>
                        
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-8">{selectedArticle.title}</h1>
                        
                        {/* НОВАЯ КНОПКА-ИНДИКАТОР */}
                        <div className="flex items-center gap-4 mb-12">
                            <button 
                                onClick={() => document.getElementById('discussion-area')?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-[10px] font-black uppercase text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                            >
                                <MessageSquare size={12} /> 
                                {selectedArticle.comments?.length || 0} Comments
                            </button>
                            <div className="h-px flex-1 bg-white/5"></div>
                        </div>

                        <div className="prose-editor shadow-2xl" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                        
                        {/* ОБЛАСТЬ ОБСУЖДЕНИЯ С ЯКОРЕМ */}
                        <div id="discussion-area" className="mt-20 pt-20 border-white/5">
                            <CommentSection 
                                articleId={selectedArticle.id} 
                                comments={selectedArticle.comments || []} 
                                onCommentAdded={() => {
                                    fetch(`/api/articles/${selectedArticle.id}`)
                                        .then(res => res.json())
                                        .then(setSelectedArticle);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* 3. ФОРМА СОЗДАНИЯ */}
                {view === 'create' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <ArticleForm 
                            article={editingArticle} 
                            onSave={() => { fetchArticles(); setView('portfolio'); }} 
                            onCancel={() => setView('portfolio')} 
                        />
                    </div>
                )}
            </main>

            {/* --- FOOTER --- */}
            <footer className="relative z-50 border-t border-white/5 bg-black/40 backdrop-blur-xl py-20">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="text-xl font-bold tracking-tighter">Мякотин<span className="text-blue-500">Кирилл</span></div>
                        <p className="text-gray-500 text-xs tracking-widest uppercase font-medium">Портфолио резюме блог</p>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end gap-6">
                        <div className="flex gap-3">
                            <a href="https://github.com/Kirik-hamster" target="_blank" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all duration-500">
                                <Github size={20} />
                            </a>
                            <a href="mailto:kir.myak@bk.ru" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 transition-all duration-500">
                                <Mail size={20} />
                            </a>
                        </div>
                        <div className="flex items-center gap-6 text-[9px] font-black tracking-[0.4em] text-gray-600 uppercase">
                            <span className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">Resume <ArrowUpRight size={10}/></span>
                            <span>© 2026 KIRILL MYAKOTIN</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
}