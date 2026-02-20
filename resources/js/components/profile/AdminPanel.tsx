import React, { useState } from 'react';
import { Database, Settings, Layout, X, Activity, Users } from 'lucide-react';
import { PremiumLoader } from '../PremiumLoader';
import { useSettings } from '../../context/SettingsContext';

export const AdminPanel = ({ 
    allBlogsCount, 
    demoDuration, 
    setDemoDuration, 
    startDemo, 
    cancelDemo, 
    demoLoading
}: any) => {
    const [activeSubTab, setActiveSubTab] = useState<'config' | 'content'>('config');
    const { settings, setSettings } = useSettings();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Переключатель вкладок админки */}
            <div className="flex gap-4 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit">
                <button onClick={() => setActiveSubTab('config')} 
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'config' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                    Конфигурация
                </button>
                <button onClick={() => setActiveSubTab('content')} 
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'content' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                    Наполнение
                </button>
            </div>

            {activeSubTab === 'config' ? (
                <div className="bg-blue-600/[0.03] border border-blue-500/10 p-10 rounded-[40px] relative overflow-hidden">
                    <Settings className="absolute -right-6 -bottom-6 text-blue-500/5 w-48 h-48" />
                    <h3 className="text-2xl font-black mb-6 uppercase text-blue-400">Системные настройки</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl opacity-50">
                            <label className="text-[8px] font-black uppercase text-gray-500 block mb-2">SMTP Host</label>
                            <div className="text-sm font-mono">smtp.mail.ru (заглушка)</div>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl opacity-50">
                            <label className="text-[8px] font-black uppercase text-gray-500 block mb-2">Pattern</label>
                            <div className="text-sm font-mono">RESTful API Architecture</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* РЕДАКТИРОВАНИЕ КОНТАКТОВ (НОВОЕ) */}
                    <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] backdrop-blur-xl">
                        <h4 className="text-xl font-bold text-white uppercase mb-10 flex items-center gap-3">
                            <Layout size={20} className="text-blue-500" /> Контакты в футере
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Поле Почта */}
                            <div className="relative group/input">
                                <label className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#0a0a0a] border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-focus-within/input:text-blue-500 transition-all z-10 shadow-sm">
                                    Email для связи
                                </label>
                                <input 
                                    type="email" 
                                    className="w-full bg-white/[0.01] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all text-sm font-medium"
                                    value={settings.email}
                                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                                />
                            </div>

                            {/* Поле GitHub */}
                            <div className="relative group/input">
                                <label className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#0a0a0a] border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-focus-within/input:text-blue-500 transition-all z-10 shadow-sm">
                                    Ссылка на GitHub
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white/[0.01] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all text-sm font-medium"
                                    value={settings.githubUrl}
                                    onChange={(e) => setSettings({...settings, githubUrl: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Твоя прошлая панель управления */}
                    <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] backdrop-blur-xl">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                            <div className="space-y-2 text-center lg:text-left">
                                <h4 className="text-xl font-bold text-white uppercase">Лаборатория загрузки</h4>
                                <p className="text-gray-500 text-xs max-w-sm">Настройте информацию в футере или проверьте лоадер.</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-6">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Время: {demoDuration} сек.</span>
                                    <input type="range" min="1" max="10" value={demoDuration} onChange={(e) => setDemoDuration(Number(e.target.value))} className="w-40 accent-blue-600" />
                                </div>
                                {!demoLoading ? <button onClick={startDemo} className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px]">Запустить</button>
                                : <button onClick={cancelDemo} className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-2"><X size={14}/> Отменить</button>}
                            </div>
                        </div>
                    </div>
                    {demoLoading && <div className="bg-white/[0.01] border border-dashed border-white/5 rounded-[50px] p-20 animate-in zoom-in-95"><PremiumLoader /></div>}
                </div>
            )}
        </div>
    );
};