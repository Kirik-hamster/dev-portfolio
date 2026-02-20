import { Github, Mail, ArrowUpRight } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation, NavigateFunction } from 'react-router-dom';
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
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SettingsProvider } from './context/SettingsContext'

interface WrapperProps {
    user: User | null;
    navigate: NavigateFunction;
}

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

            <Header user={user} onLogout={handleLogout} navigate={navigate} />

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

                    <Route path="/blogs" element={<BlogsPageWrapper user={user} navigate={navigate} />}>
                        <Route path=":blogId" element={<BlogsPageWrapper user={user} navigate={navigate} />} />
                    </Route>

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
            <Footer />
        </div>
    );
}

/**
 * Вспомогательные обертки для передачи параметров из URL в компоненты
 */
function BlogsPageWrapper({ user, navigate }: WrapperProps) {
    const { blogId } = useParams(); // Здесь хук вызывается ПРАВИЛЬНО
    
    return (
        <BlogsPage 
            user={user} 
            onNavigateToProfile={() => navigate('/profile')}
            onArticleSelect={(a) => navigate(`/article/${a.id}`)}
            initialBlogId={blogId ? Number(blogId) : null}
        />
    );
}
function ArticleDetailPageWrapper({ user, navigate }: WrapperProps) {
    const { id } = useParams();

    return (
        <ArticleDetailPage 
            articleId={Number(id)} 
            onBack={() => navigate(-1)} 
            user={user} 
            onNavigateToLogin={() => navigate('/login')} 
        />
    );
}

function App() {
    return (
        <SettingsProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </SettingsProvider>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
}