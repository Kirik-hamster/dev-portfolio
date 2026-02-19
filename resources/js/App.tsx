
import { Github, Mail, ArrowUpRight } from 'lucide-react';
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

// Определяем состояния нашего простого роутера
type Page = 'home' | 'portfolio' | 'detail' | 'form' | 'login' | 'register' | 'profile' | 'blogs';

/**
 * Главный компонент приложения.
 * Отвечает за роутинг, управление состоянием верхнего уровня и рендеринг
 * соответствующей страницы.
 */
function App() {
    const [page, setPage] = useState<Page>('home');
    const [fromPage, setFromPage] = useState<Page>('home');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
    const [currentBlogId, setCurrentBlogId] = useState<number | null>(null); // ID текущей "папки"
    const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);
    const [portfolioBlogId, setPortfolioBlogId] = useState<number | null>(null);

    const glowRef = useRef<HTMLDivElement>(null);

    // 1. Помощник для получения токена из куки
    const getXsrfToken = () => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; XSRF-TOKEN=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        return '';
    };

    // 2. Функция выхода внутри компонента App
    const handleLogout = async () => {
        await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getXsrfToken() // Даем серверу токен
            },
            credentials: 'include' // Передаем куки сессии
        });
        
        // Очищаем состояние и обновляемся
        setUser(null);
        setPage('home');
        window.location.reload();
    };

    // Проверка: кто зашел?
    useEffect(() => {
        // 1. СНАЧАЛА УЗНАЕМ, КТО ЗАЛОГИНЕН (ЭТОГО У ТЕБЯ НЕТ!)
        fetch('/api/user', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(userData => {
                setUser(userData);
                
                // 2. ЕСЛИ ЭТО АДМИН, СРАЗУ ГРУЗИМ ЕГО ПАПКИ
                if (userData?.role === 'admin') {
                    fetch('/api/blogs?my_only=1')
                        .then(res => res.json())
                        .then(blogs => {
                            // Ищем ту самую запись с ID 1 из твоей таблицы
                            const p = blogs.find((b: Blog) => b.is_portfolio);
                            if (p) {
                                setPortfolioBlogId(p.id);
                                // Если мы уже на странице портфолио — активируем ID
                                if (page === 'portfolio') setCurrentBlogId(p.id);
                            }
                        });
                }
                setLoading(false);
            });
    }, []);

    const handleBackFromDetail = () => {
        setSelectedArticleId(null);
        setPage(fromPage);
    };

    useEffect(() => {
        if (page === 'portfolio' && portfolioBlogId && !currentBlogId) {
            setCurrentBlogId(portfolioBlogId);
        }
    }, [page, portfolioBlogId]);

    // --- Логика навигации ---
    const navigateToHome = () => {
        setCurrentBlogId(null);
        setPage('home');
    };
    const navigateToPortfolio = () => {
        // Принудительно ставим ID системной папки при переходе
        if (portfolioBlogId) setCurrentBlogId(portfolioBlogId);
        setPage('portfolio');
    };

    const handleSelectBlog = (blogId: number) => {
        setCurrentBlogId(blogId);
        setPage('portfolio'); // Используем PortfolioPage как универсальный список статей
    };
    
    const handleSelectArticle = (article: Article) => {
        setFromPage(page);
        setSelectedArticleId(article.id);
        setPage('detail');
    };

    const handleEditArticle = (article: Article) => {
        setEditingArticle(article);
        setPage('form');
    };

    const handleCreateArticle = () => {
        setEditingArticle(undefined);
        if (page === 'portfolio' && portfolioBlogId) {
            setCurrentBlogId(portfolioBlogId);
        }
        setPage('form');
    };
    
    const handleFormSave = () => {
        setEditingArticle(undefined);
        setSelectedArticleId(null);
        
        // Если мы сохраняли в системное портфолио — идем на страницу портфолио
        // Если в личную папку — возвращаемся в профиль
        if (currentBlogId === portfolioBlogId) {
            setPage('portfolio');
        } else {
            setPage('profile');
        }
    };

    const handleFormCancel = () => {
        setEditingArticle(undefined);
        if (currentBlogId === portfolioBlogId) {
            setPage('portfolio');
        } else {
            setPage('profile');
        }
    };

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

    // Функция для рендеринга текущей страницы в зависимости от состояния
    const renderPage = () => {


        if (page === 'login') return (
            <LoginPage 
                onLoginSuccess={(u) => { setUser(u); setPage('home'); }} 
                onNavigateToRegister={() => setPage('register')}
            />
        );

        if (page === 'register') return (
            <RegisterPage 
                onRegisterSuccess={(u) => { setUser(u); setPage('home'); }} 
                onNavigateToLogin={() => setPage('login')} // Позволит вернуться назад
            />
        );
        switch (page) {
            case 'portfolio':
                return <PortfolioPage 
                    user={user}
                    blogId={currentBlogId} // Передаем напрямую number | null
                    onArticleSelect={handleSelectArticle}
                    onEditArticle={handleEditArticle}
                    onCreateArticle={handleCreateArticle}
                />;
            case 'detail':
                return selectedArticleId ? (
                    <ArticleDetailPage 
                        articleId={selectedArticleId} 
                        onBack={handleBackFromDetail}
                        user={user}                       // Проверь, что это тут есть
                        onNavigateToLogin={() => setPage('login')} // И это
                    />
                ) : (
                    <PortfolioPage 
                        user={user} 
                        onArticleSelect={handleSelectArticle} 
                        onEditArticle={handleEditArticle} 
                        onCreateArticle={handleCreateArticle} 
                    />
                );
            case 'form':
                return <ArticleFormPage 
                    user={user} 
                    // Если текущий выбор пуст, используем железный ID системной папки
                    blogId={currentBlogId || portfolioBlogId} 
                    onSave={handleFormSave} 
                    onCancel={handleFormCancel} 
                    {...(editingArticle && { article: editingArticle })}
                />;
            case 'blogs':
                return (
                    <BlogsPage 
                        user={user} 
                        onNavigateToProfile={() => setPage('profile')} 
                        onArticleSelect={handleSelectArticle} 
                        initialBlogId={currentBlogId}
                        onBlogSelect={(id) => setCurrentBlogId(id)}
                    />
                );
            case 'profile':
                return (
                <ProfilePage 
                    user={user} 
                    initialBlogId={currentBlogId !== portfolioBlogId ? currentBlogId : null}
                    onBlogSelect={(id: number) => setCurrentBlogId(id)} 
                    onNavigateToPortfolio={navigateToPortfolio}
                    onTriggerCreate={() => setPage('form')}
                    onEditArticle={handleEditArticle} 
                    onArticleSelect={handleSelectArticle}
                />
            );
            case 'home':
            default:
                return <HomePage onNavigateToPortfolio={navigateToPortfolio} />;
        }
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-blue-500/30 overflow-x-hidden">
            <div ref={glowRef} className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] z-0" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

            {/* --- HEADER --- */}
            <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
                    <h2 className="text-lg font-medium tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent cursor-pointer" onClick={navigateToHome}>
                        Kirill Myakotin
                    </h2>
                    <nav className="flex items-center gap-6">
                        {/* Основная навигация */}
                        <button 
                            onClick={navigateToPortfolio} 
                            className={`text-[11px] font-bold uppercase transition-colors ${page === 'portfolio' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
                        >
                            Портфолио
                        </button>
                        
                        <button 
                            onClick={() => { 
                                setCurrentBlogId(null);
                                setPage('blogs'); 
                            }}
                            className={`text-[11px] font-bold uppercase transition-colors ${page === 'blogs' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
                        >
                            Блоги
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                                {/* Блок пользователя: Имя + Роль */}
                                <div 
                                    onClick={() => setPage('profile')}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <span className={`text-[11px] font-black uppercase transition-colors ${page === 'profile' ? 'text-blue-500' : 'text-white group-hover:text-blue-400'}`}>
                                        {user.name}
                                    </span>
                                    <span className="text-[8px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-500 uppercase font-black tracking-wider">
                                        {user.role}
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={handleLogout} 
                                    className="text-[10px] font-bold uppercase text-gray-600 hover:text-red-500 transition-colors"
                                >
                                    Выход
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setPage('login')} 
                                className="px-5 py-2 border border-white/10 rounded-full text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all"
                            >
                                Вход
                            </button>
                        )}
                    </nav>
                </div>
            </header>

            {/* --- MAIN CONTENT (с отступом сверху) --- */}
            <main className="relative z-10 flex-grow pt-32 pb-20 w-full">
                {renderPage()}
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