import { BrowserRouter, useNavigate } from 'react-router-dom';
import './bootstrap';
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { User, Blog } from './types';

// Импортируем наши новые компоненты страниц
import { PremiumLoader } from './components/PremiumLoader';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SettingsProvider } from './context/SettingsContext';
import { AppRoutes } from './router/AppRoutes';


/**
 * Обертка для логики приложения, чтобы использовать хуки роутера (useNavigate и др.)
 */
function AppContent() {
    const navigate = useNavigate();
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
        navigate('/');
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
                <AppRoutes 
                    user={user} 
                    portfolioBlogId={portfolioBlogId} 
                    setUser={setUser} 
                />
            </main>
            <Footer />
        </div>
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