import React, { useState } from 'react';
import { User } from '../types';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
    user: User | null;
    navigate: (path: string) => void;
    onLogout: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ user, navigate, onLogout }) => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-[100]">
            <div className="absolute inset-0 h-full bg-black/40 backdrop-blur-2xl border-b border-white/5 -z-10 transition-all duration-300" />
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center h-16 md:h-20">
                    <div 
                        className="group relative flex items-center px-4 py-2 cursor-pointer transition-all duration-500 select-none overflow-hidden"
                        onClick={() => handleNavigate('/')}
                    >
                        <div className="relative flex items-center whitespace-nowrap">
                            <span className="text-base md:text-lg font-black tracking-tighter text-white transition-all duration-500
                                /* Постоянное свечение */
                                drop-shadow-[0_0_11px_rgba(59,130,246,0.3)]
                                group-hover:drop-shadow-[0_0_11px_rgba(59,130,246,0.4)]
                                group-hover:text-blue-200">
                                Кирилл
                            </span>
                            <span className="text-base md:text-lg font-black tracking-tighter text-blue-500 transition-all duration-500
                                drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]
                                group-hover:drop-shadow-[0_0_11px_rgba(59,130,246,0.4)]
                                group-hover:text-blue-400">
                                Мякотин
                            </span>
                        </div>
                    </div>

                    {/* Десктоп навигация: md:flex гарантирует появление на больших экранах */}
                    <nav className="hidden md:flex items-center gap-6">
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
                                    <span className="text-[8px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-500 uppercase font-black">
                                        {user.role}
                                    </span>
                                </div>
                                <button onClick={onLogout} className="text-[10px] font-bold uppercase text-gray-600 hover:text-red-500 transition-colors">Выход</button>
                            </div>
                        ) : (
                            <button onClick={() => navigate('/login')} className="px-5 py-2 border border-white/10 rounded-full text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all">Вход</button>
                        )}
                    </nav>

                    {/* Бургер (виден только на мобилках) */}
                    <button onClick={toggleMenu} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* МОБИЛЬНОЕ МЕНЮ (Выпадает вниз внутри того же хэдера) */}
                {isMenuOpen && (
                    <div className="md:hidden pb-10 flex flex-col gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                        <button onClick={() => handleNavigate('/portfolio')} 
                            className={`text-sm font-bold uppercase text-left ${location.pathname === '/portfolio' ? 'text-blue-500' : 'text-gray-400'}`}>
                            Портфолио
                        </button>
                        <button onClick={() => handleNavigate('/blogs')} 
                            className={`text-sm font-bold uppercase text-left ${location.pathname.startsWith('/blogs') ? 'text-blue-500' : 'text-gray-400'}`}>
                            Блоги
                        </button>

                        <div className="pt-6 border-t border-white/5 flex flex-col gap-6">
                            {user ? (
                                <div className="flex flex-col gap-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black uppercase text-white">{user.name}</span>
                                        <span className="text-[10px] px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-500 font-black tracking-wider uppercase">{user.role}</span>
                                    </div>
                                    <button onClick={onLogout} className="text-sm font-bold uppercase text-red-500/80 text-left">Выход</button>
                                </div>
                            ) : (
                                <button onClick={() => handleNavigate('/login')} className="w-full py-4 border border-white/10 rounded-2xl text-sm font-bold uppercase text-center active:bg-white active:text-black transition-all">Вход</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};