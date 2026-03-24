import React, { useState } from 'react';
import { ChevronDown, Settings, Users, Layout } from 'lucide-react';
import { MailSettings, User, PaginatedResponse } from '@/types';
import { useSettings } from '@/context/SettingsContext';

export type Tab = 'config' | 'users' | 'content';

interface AdminTabsProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const TAB_MAP = {
    config: { label: 'Конфигурация', icon: Settings },
    users: { label: 'Пользователи', icon: Users },
    content: { label: 'Наполнение', icon: Layout },
};

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (tab: Tab) => {
        onTabChange(tab);
        setIsOpen(false);
    };

    const ActiveIcon = TAB_MAP[activeTab].icon;

    return (
        <div className="relative w-full sm:w-fit">
            
            {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ: Выпадающее меню */}
            <div className="sm:hidden w-full">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-[22px] text-white transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                            <ActiveIcon size={18} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            {TAB_MAP[activeTab].label}
                        </span>
                    </div>
                    <ChevronDown 
                        size={18} 
                        className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>

                {/* Список вкладок (Выпадает вниз) */}
                {isOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0f0f0f] border border-white/10 rounded-[28px] p-2 z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {(['config', 'users', 'content'] as const).map((tab) => {
                            const Icon = TAB_MAP[tab].icon;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => handleSelect(tab)}
                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                                        activeTab === tab 
                                            ? 'bg-blue-600 text-white' 
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {TAB_MAP[tab].label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 💻 ДЕСКТОП ВЕРСИЯ: Обычные кнопки (как были) */}
            <div className="hidden sm:flex gap-4 p-1 bg-white/5 border border-white/10 rounded-2xl">
                {(['config', 'users', 'content'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === tab 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {TAB_MAP[tab].label}
                    </button>
                ))}
            </div>

            {/* Фон-заглушка для закрытия меню при клике вне его (опционально) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[90] sm:hidden" 
                    onClick={() => setIsOpen(false)} 
                />
            )}
        </div>
    );
};