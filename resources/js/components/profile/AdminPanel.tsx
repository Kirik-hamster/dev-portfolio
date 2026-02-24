import React, { useEffect, useState } from 'react';
import { Database, Settings, Layout, X, Activity, Users } from 'lucide-react';
import { PremiumLoader } from '../PremiumLoader';
import { useSettings } from '../../context/SettingsContext';
import { SettingsApiService } from '@/services/SettingsApiService';
import { MailSettings } from '@/types';

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

    const [mailConfig, setMailConfig] = useState<MailSettings>({
        mail_host: '',
        mail_port: '465',
        mail_username: '',
        mail_password: '',
        mail_from_name: ''
    });
    const [testEmail, setTestEmail] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await SettingsApiService.getMail();
                setMailConfig(data);
            } catch (error) {
                console.error("Не удалось загрузить настройки SMTP");
            }
        };

        fetchSettings();
    }, []);

    // 2. Функции обработки
    const handleSave = async () => {
        const res = await SettingsApiService.updateMail(mailConfig);
        if (res.ok) alert("Настройки зашифрованы и сохранены!");
    };

    const handleTest = async () => {
        const res = await SettingsApiService.testMail(testEmail);
        const data = await res.json();
        alert(res.ok ? "Письмо улетело!" : "Ошибка: " + data.error);
    };

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                        <input 
                            placeholder="SMTP Host (e.g. smtp.mail.ru)" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500/50"
                            value={mailConfig.mail_host}
                            onChange={e => setMailConfig({...mailConfig, mail_host: e.target.value})}
                        />
                        <input 
                            placeholder="SMTP Port (465 or 587)" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none"
                            value={mailConfig.mail_port}
                            onChange={e => setMailConfig({...mailConfig, mail_port: e.target.value})}
                        />
                        <input 
                            placeholder="Username (email)" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none"
                            value={mailConfig.mail_username}
                            onChange={e => setMailConfig({...mailConfig, mail_username: e.target.value})}
                        />
                        <input 
                            type="password"
                            placeholder="Password (App Password)" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none"
                            value={mailConfig.mail_password}
                            onChange={e => setMailConfig({...mailConfig, mail_password: e.target.value})}
                        />
                        <input 
                            placeholder="Имя отправителя (например, Kirill Portfolio)" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none"
                            value={mailConfig.mail_from_name}
                            onChange={e => setMailConfig({...mailConfig, mail_from_name: e.target.value})}
                        />
                        <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
                            Сохранить конфигурацию
                        </button>
                    </div>

                    {/* Блок теста */}
                    <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[30px] flex flex-col justify-center">
                        <h4 className="text-white font-bold mb-4 uppercase text-xs">Проверка связи</h4>
                        <input 
                            placeholder="Куда отправить тест?" 
                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm outline-none mb-4"
                            value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                        />
                        <button onClick={handleTest} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest">
                            Отправить тест
                        </button>
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