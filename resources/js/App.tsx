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
import { VerifyCodePage } from './pages/auth/VerifyCodePage';
import { AuthApiService } from './services/AuthApiService';
import { ConfirmModal } from './components/ui/ConfirmModel';


/**
 * Обертка для логики приложения, чтобы использовать хуки роутера (useNavigate и др.)
 */
function AppContent() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [portfolioBlogId, setPortfolioBlogId] = useState<number | null>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await AuthApiService.logout();
        } catch (e) {
            console.error("Ошибка при выходе:", e);
        } finally {
            setUser(null);
            navigate('/');
            window.location.reload();
        }
    };

    const handleConfirmCancel = async () => {
        setIsConfirmOpen(false);
        setLoading(true);
        try {
            const res = await AuthApiService.cancelRegistration();
            if (res.ok) {
                setUser(null);
                navigate('/');
                // Принудительно чистим куки, если нужно
                window.location.reload(); 
            }
        } catch (e) {
            console.error("Ошибка удаления");
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async (): Promise<void> => {
        try {
            const res = await fetch('/api/user', { credentials: 'include' });
            const userData = res.ok ? await res.json() : null;
            setUser(userData);
            
            if (userData?.role === 'admin' && userData.email_verified_at) {
                const blogRes = await fetch('/api/blogs?my_only=1');
                const responseData = await blogRes.json();
                const blogsArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                const p = blogsArray.find((b: Blog) => b.is_portfolio);
                
                if (p) setPortfolioBlogId(p.id);
            }
        } catch (e) {
            setUser(null);
        } finally {
            setLoading(false);
        }
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
                        .then(responseData => {
                            const blogsArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
                            const p = blogsArray.find((b: Blog) => b.is_portfolio);
                            if (p) setPortfolioBlogId(p.id);
                        });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Эффект для "магического" свечения за курсором
    useEffect(() => {
        refreshUser();
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

    if (user && !user.email_verified_at) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <div ref={glowRef} className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
                
                <main className="relative z-10 w-full max-w-md">
                    <VerifyCodePage onVerified={refreshUser} />
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-4">
                            <button 
                                onClick={() => setIsConfirmOpen(true)}
                                className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500/40 hover:text-rose-500 transition-colors"
                            >
                                Ошибка в почте? Начать заново
                            </button>
                            
                            <button 
                                onClick={handleLogout}
                                className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
                            >
                                Выйти из системы
                            </button>
                        </div>
                    </div>
                </main>

                {/* МОДАЛКА ПОДТВЕРЖДЕНИЯ (рендер в портал или просто тут) */}
                <ConfirmModal 
                    isOpen={isConfirmOpen}
                    title="Сброс регистрации"
                    message="Все ваши текущие данные будут удалены из системы. Вы уверены, что хотите начать регистрацию с нуля?"
                    onConfirm={handleConfirmCancel}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-blue-500/30">
            <div ref={glowRef} className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] z-0" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] z-0" />
            <Header user={user} onLogout={handleLogout} navigate={navigate} />
            <main className="relative z-10 flex-grow pt-32 pb-20 w-full">
                <AppRoutes 
                    user={user} 
                    portfolioBlogId={portfolioBlogId} 
                    setUser={setUser} 
                    refreshUser={refreshUser}
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