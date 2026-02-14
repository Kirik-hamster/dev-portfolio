
import { Github, Mail, ArrowUpRight } from 'lucide-react';
import './bootstrap';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { Article } from './types';

// Импортируем наши новые компоненты страниц
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ArticleFormPage } from './pages/ArticleFormPage';

// Определяем состояния нашего простого роутера
type Page = 'home' | 'portfolio' | 'detail' | 'form';

/**
 * Главный компонент приложения.
 * Отвечает за роутинг, управление состоянием верхнего уровня и рендеринг
 * соответствующей страницы.
 */
function App() {
    // Состояние роутера
    const [page, setPage] = useState<Page>('home');
    const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
    const [editingArticle, setEditingArticle] = useState<Article | undefined>(undefined);
    
    const glowRef = useRef<HTMLDivElement>(null);

    // --- Логика навигации ---
    const navigateToHome = () => setPage('home');
    const navigateToPortfolio = () => setPage('portfolio');
    
    const handleSelectArticle = (article: Article) => {
        setSelectedArticleId(article.id);
        setPage('detail');
    };

    const handleEditArticle = (article: Article) => {
        setEditingArticle(article);
        setPage('form');
    };

    const handleCreateArticle = () => {
        setEditingArticle(undefined);
        setPage('form');
    };
    
    const handleFormSave = () => {
        setEditingArticle(undefined);
        setSelectedArticleId(null);
        setPage('portfolio');
    };

    const handleFormCancel = () => {
        setEditingArticle(undefined);
        setPage('portfolio');
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
        switch (page) {
            case 'portfolio':
                return <PortfolioPage 
                    onArticleSelect={handleSelectArticle}
                    onEditArticle={handleEditArticle}
                    onCreateArticle={handleCreateArticle}
                />;
            case 'detail':
                return selectedArticleId ? <ArticleDetailPage articleId={selectedArticleId} onBack={navigateToPortfolio} /> : <PortfolioPage onArticleSelect={handleSelectArticle} onEditArticle={handleEditArticle} onCreateArticle={handleCreateArticle} />;
            case 'form':
                return <ArticleFormPage 
                    onSave={handleFormSave} 
                    onCancel={handleFormCancel} 
                    // Условное добавление пропа, чтобы соответствовать `exactOptionalPropertyTypes`
                    {...(editingArticle && { article: editingArticle })}
                />;
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
                    <nav className="flex gap-2">
                        <button onClick={navigateToPortfolio} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${page === 'portfolio' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Портфолио</button>
                        <button className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:bg-white/10 text-gray-500 cursor-not-allowed">Блоги</button>
                    </nav>
                </div>
            </header>

            {/* --- MAIN CONTENT (с отступом сверху) --- */}
            <main className="relative z-10 flex-grow pt-32 pb-20 max-w-5xl mx-auto px-6 w-full">
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