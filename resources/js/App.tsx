import { Github, Mail, ArrowUpRight } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import './bootstrap';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { Article, User, Blog } from './types';

// Импортируем наши новые компоненты страниц
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ArticleFormPage } from './pages/ArticleFormPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { BlogsPage } from './pages/BlogsPage'; 
import { ProfilePage } from './pages/ProfilePage';
import { PremiumLoader } from './components/PremiumLoader';

/**
 * Обертка для логики приложения, чтобы использовать хуки роутера (useNavigate и др.)
 */
function AppContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [portfolioBlogId, setPortfolioBlogId] = useState<number | null>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    // 1. Помощник для получения токена из куки
    const getXsrfToken = () => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; XSRF-TOKEN=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        return '';
    };

    // 2. Функция выхода
    const handleLogout = async () => {
        await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getXsrfToken()
            },
            credentials: 'include'
        });
        
        setUser(null);
        navigate('/'); // Используем роутер вместо window.location.reload
        window.location.reload();
    };

    // Проверка авторизации
    useEffect(() => {
        fetch('/api/user', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(userData => {
                setUser(userData);
                if (userData?.role === 'admin') {
                    fetch('/api/blogs?my_only=1')
                        .then(res => res.json())
                        .then(blogs => {
                            const p = blogs.find((b: Blog) => b.is_portfolio);
                            if (p) setPortfolioBlogId(p.id);
                        });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Эффект для "магического" свечения за курсором
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (glowRef.current) {
                glowRef.current.style.left = `${e.clientX}px`;
                glowRef.current.style.top = `${e.clientY}px`;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Если всё еще грузим данные пользователя — не показываем черный экран
    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <PremiumLoader />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-blue-500/30 overflow-x-hidden">
            <div ref={glowRef} className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] z-0" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

            {/* --- HEADER --- */}
            <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
                    <h2 className="text-lg font-medium tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent cursor-pointer" 
                        onClick={() => navigate('/')}>
                        Kirill Myakotin
                    </h2>
                    <nav className="flex items-center gap-6">
                        <button onClick={() => navigate('/portfolio')} 
                            className={`text-[11px] font-bold uppercase transition-colors ${location.pathname === '/portfolio' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}>
                            Портфолио
                        </button>
                        
                        <button onClick={() => navigate('/blogs')} 
                            className={`text-[11px] font-bold uppercase transition-colors ${location.pathname.startsWith('/blogs') ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}>
                            Блоги
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                                <div onClick={() => navigate('/profile')} className="flex items-center gap-3 cursor-pointer group">
                                    <span className={`text-[11px] font-black uppercase transition-colors ${location.pathname.startsWith('/profile') ? 'text-blue-500' : 'text-white group-hover:text-blue-400'}`}>
                                        {user.name}
                                    </span>
                                    <span className="text-[8px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-500 uppercase font-black tracking-wider">
                                        {user.role}
                                    </span>
                                </div>
                                <button onClick={handleLogout} className="text-[10px] font-bold uppercase text-gray-600 hover:text-red-500 transition-colors">Выход</button>
                            </div>
                        ) : (
                            <button onClick={() => navigate('/login')} className="px-5 py-2 border border-white/10 rounded-full text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all">Вход</button>
                        )}
                    </nav>
                </div>
            </header>

            {/* --- MAIN CONTENT (Роутинг через Routes) --- */}
            <main className="relative z-10 flex-grow pt-32 pb-20 w-full">
                <Routes>
                    <Route path="/" element={<HomePage onNavigateToPortfolio={() => navigate('/portfolio')} />} />
                    
                    <Route path="/portfolio" element={
                        <PortfolioPage 
                            user={user} 
                            blogId={portfolioBlogId} // Это ID системной папки с твоими проектами
                            onArticleSelect={(a) => navigate(`/article/${a.id}`)}
                            onEditArticle={(a) => navigate(`/form/edit/${a.id}`)} 
                            onCreateArticle={() => navigate(`/form/new/${portfolioBlogId}`)} 
                        />
                    } />

                    <Route path="/profile/*" element={
                        <ProfilePage 
                            user={user}
                            onBlogSelect={(id) => navigate(`/profile/blog/${id}`)} // Теперь путь чистый
                            onNavigateToPortfolio={() => navigate('/portfolio')}
                            onTriggerCreate={(blogId) => navigate(`/form/new/${blogId}`)}
                            onEditArticle={(a) => navigate(`/form/edit/${a.id}`)}
                            onArticleSelect={(a) => navigate(`/article/${a.id}`)}
                        />
                    } />

                    <Route path="/blogs" element={
                        <BlogsPage 
                            user={user} 
                            onNavigateToProfile={() => navigate('/profile')}
                            onArticleSelect={(a) => navigate(`/article/${a.id}`)}
                        />
                    } />

                    <Route path="/blogs/:blogId" element={
                        <BlogsPage 
                            user={user} 
                            onNavigateToProfile={() => navigate('/profile')}
                            onArticleSelect={(a) => navigate(`/article/${a.id}`)}
                            initialBlogId={Number(useParams().blogId)}
                        />
                    } />

                    <Route path="/article/:id" element={
                        <ArticleDetailPageWrapper user={user} navigate={navigate} />
                    } />

                    <Route path="/form/new/:blogId" element={<ArticleFormPage user={user} onSave={() => navigate(-1)} onCancel={() => navigate(-1)} />} />
                    <Route path="/form/edit/:articleId" element={<ArticleFormPage user={user} onSave={() => navigate(-1)} onCancel={() => navigate(-1)} />} />
                    
                    <Route path="/login" element={<LoginPage onLoginSuccess={(u) => { setUser(u); navigate('/'); }} onNavigateToRegister={() => navigate('/register')} />} />
                    <Route path="/register" element={<RegisterPage onRegisterSuccess={(u) => { setUser(u); navigate('/'); }} onNavigateToLogin={() => navigate('/login')} />} />
                    
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
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
                            <a href="https://github.com/Kirik-hamster" target="_blank" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all duration-500"><Github size={20} /></a>
                            <a href="mailto:kir.myak@bk.ru" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 transition-all duration-500"><Mail size={20} /></a>
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

/**
 * Вспомогательные обертки для передачи параметров из URL в компоненты
 */
function ArticleDetailPageWrapper({ user, navigate }: any) {
    const { id } = useParams();
    return <ArticleDetailPage articleId={Number(id)} onBack={() => navigate(-1)} user={user} onNavigateToLogin={() => navigate('/login')} />;
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
}