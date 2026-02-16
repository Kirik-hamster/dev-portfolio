import React, { useState } from 'react';
import { User, Settings, Shield, BookOpen, Database, UserCircle } from 'lucide-react';
import { User as UserType } from '../types';

export function ProfilePage({ user }: { user: UserType | null }) {
    const [activeTab, setActiveTab] = useState<'general' | 'blog' | 'security' | 'admin'>('general');

    if (!user) return <div className="text-center py-20 text-gray-600 uppercase text-[10px] font-black tracking-widest">Доступ запрещен</div>;

    const isAdmin = user.role === 'admin';

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[30px]">
                            <h3 className="text-xl font-bold mb-6 uppercase tracking-tight text-white/90">Личные данные</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-white/5 pb-4">
                                    <span className="text-[10px] uppercase font-bold text-gray-500">Имя</span>
                                    <span className="text-sm font-medium">{user.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-4">
                                    <span className="text-[10px] uppercase font-bold text-gray-500">Email</span>
                                    <span className="text-sm font-medium">{user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] uppercase font-bold text-gray-500">Роль</span>
                                    <span className="text-[10px] font-black uppercase text-blue-500">{user.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'blog':
                return (
                    <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] text-center animate-in fade-in zoom-in-95 duration-500">
                        <BookOpen className="mx-auto mb-6 text-blue-500/20" size={48} />
                        <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter text-white">Ваш блог</h3>
                        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto tracking-tight">Настройте карточку своего блога, чтобы делиться контентом с сообществом.</p>
                        <button className="px-8 py-3 bg-white text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                            Настроить блог
                        </button>
                    </div>
                );
            case 'security':
                return (
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[30px] animate-in fade-in duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <Shield className="text-gray-500" size={24} />
                            <h3 className="text-xl font-bold uppercase tracking-tight">Защита аккаунта</h3>
                        </div>
                        <button className="w-full py-4 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                            Изменить пароль
                        </button>
                    </div>
                );
            case 'admin':
                return (
                    <div className="bg-blue-600/[0.03] border border-blue-500/10 p-10 rounded-[40px] animate-in fade-in duration-500">
                        <h3 className="text-2xl font-bold mb-4 uppercase tracking-tighter text-blue-400">Модерация</h3>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">Инструменты управления всеми блогами и статьями системы.</p>
                        <button className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                            Открыть базу данных
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 pt-10 px-6">
            {/* САЙДБАР (Слева) */}
            <aside className="w-full md:w-72 flex-shrink-0 space-y-10">
                {/* Информация профиля (Над кнопками) */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mb-6 relative group">
                        <UserCircle size={40} className="text-white/20 group-hover:text-blue-500 transition-colors" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505]" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{user.name}</h2>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">ID: {user.id} • {user.role}</p>
                </div>

                {/* Навигация */}
                <nav className="flex flex-col gap-1.5">
                    {[
                        { id: 'general', label: 'Общее', icon: UserCircle },
                        ...(!isAdmin ? [{ id: 'blog', label: 'Мой блог', icon: BookOpen }] : []),
                        ...(isAdmin ? [{ id: 'admin', label: 'Управление', icon: Database }] : []),
                        { id: 'security', label: 'Защита', icon: Shield },
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border ${
                                activeTab === tab.id 
                                ? 'bg-white/5 text-blue-500 border-white/10' 
                                : 'text-gray-500 hover:text-white hover:bg-white/[0.02] border-transparent'
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ */}
            <main className="flex-1">
                <div className="mb-10 border-b border-white/5 pb-10 flex justify-between items-end">
                    <h2 className="text-5xl font-black uppercase tracking-tighter">
                        {activeTab === 'general' && 'Общее'}
                        {activeTab === 'blog' && 'Мой блог'}
                        {activeTab === 'admin' && 'Админ-панель'}
                        {activeTab === 'security' && 'Безопасность'}
                    </h2>
                    <span className="text-[9px] font-bold text-gray-800 uppercase tracking-[0.5em]">Section / {activeTab}</span>
                </div>
                
                {renderContent()}
            </main>
        </div>
    );
}