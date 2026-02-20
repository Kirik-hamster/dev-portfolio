import React from 'react';
import { User } from '../types';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
    user: User | null;
    navigate: (path: string) => void;
    onLogout: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ user, navigate, onLogout }) => {
    const location = useLocation();
    return (
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
                            <button onClick={onLogout} className="text-[10px] font-bold uppercase text-gray-600 hover:text-red-500 transition-colors">Выход</button>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="px-5 py-2 border border-white/10 rounded-full text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all">Вход</button>
                    )}
                </nav>
            </div>
        </header>
    );
};