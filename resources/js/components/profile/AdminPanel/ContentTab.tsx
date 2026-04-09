import React, { useState } from 'react';
import { ExternalLink, FileText, Layout, Trash2, UploadCloud, X } from 'lucide-react';
import { PremiumLoader } from '../../PremiumLoader';
import { SettingsApiService } from '@/services/SettingsApiService';
import { Settings } from '@/types/types';

interface Props {
    settings: Settings;
    setSettings: (s: Settings) => void;
    demoDuration: number;
    setDemoDuration: (d: number) => void;
    startDemo: () => void;
    cancelDemo: () => void;
    demoLoading: boolean;
}

export const ContentTab: React.FC<Props> = ({ 
    settings, setSettings, demoDuration, setDemoDuration, 
    startDemo, cancelDemo, demoLoading 
}) => {
    const [isUploadingResume, setIsUploadingResume] = useState(false);

    const [status, setStatus] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingResume(true);
            const res = await SettingsApiService.uploadResume(file);
            if (res.url) {
                // ⚡️ Обновляем ГЛОБАЛЬНЫЙ стейт, чтобы футер сразу увидел ссылку
                setSettings({ ...settings, resumeUrl: res.url });
                setStatus({
                    isOpen: true,
                    type: 'success',
                    title: 'Обновлено',
                    message: 'Файл резюме успешно загружен в облако.'
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploadingResume(false);
        }
    };

    const handleResumeDelete = async () => {
        
        try {
            await SettingsApiService.deleteResume();
            const updated = { ...settings };
            delete updated.resumeUrl; 
            setSettings(updated);
            setIsConfirmDeleteOpen(false); // Закрываем модалку подтверждения
        
            setStatus({
                isOpen: true,
                type: 'success',
                title: 'Удалено',
                message: 'Файл резюме стерт из хранилища.'
            });
        } catch (error) {
            setIsConfirmDeleteOpen(false);
            setStatus({
                isOpen: true,
                type: 'error',
                title: 'Ошибка',
                message: 'Не удалось удалить файл. Попробуйте позже.'
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* РЕЗЮМЕ */}
            <div className="bg-white/[0.02] border border-white/5 p-6 sm:p-10 rounded-[40px] backdrop-blur-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-xl font-bold text-white uppercase flex items-center justify-center md:justify-start gap-3">
                            <FileText size={20} className="text-blue-500" /> Твоё резюме
                        </h4>
                        <p className="text-gray-500 text-xs">Загрузи PDF для отображения в футере сайта.</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        {settings.resumeUrl && (
                            <button 
                                onClick={() => setIsConfirmDeleteOpen(true)}
                                className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                title="Удалить файл"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}

                        <label className="relative flex items-center gap-4 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-blue-500 transition-all active:scale-95 shadow-xl shadow-blue-600/10">
                            {isUploadingResume ? (
                                <div className="animate-spin"><UploadCloud size={16} /></div>
                            ) : (
                                <UploadCloud size={16} />
                            )}
                            {isUploadingResume ? 'Загрузка...' : (settings.resumeUrl ? 'Заменить PDF' : 'Загрузить PDF')}
                            <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={isUploadingResume} />
                        </label>
                    </div>
                </div>

                {/* ПРЕВЬЮ СТАТУСА */}
                {settings.resumeUrl && (
                    <div className="mt-8 p-5 bg-white/[0.01] border border-white/5 rounded-3xl flex items-center justify-between group">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-white uppercase tracking-wider">resume_kirill.pdf</p>
                                <p className="text-[9px] text-gray-600 truncate uppercase mt-0.5 tracking-tighter">S3 Storage • Yandex Cloud</p>
                            </div>
                        </div>
                        <a 
                            href={settings.resumeUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:text-white transition-all"
                        >
                            Открыть <ExternalLink size={12} />
                        </a>
                    </div>
                )}
            </div>
        {/* РЕДАКТИРОВАНИЕ КОНТАКТОВ */}
        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] backdrop-blur-xl">
            <h4 className="text-xl font-bold text-white uppercase mb-10 flex items-center gap-3">
                <Layout size={20} className="text-blue-500" /> Контакты в футере
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative group/input">
                    <label className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#0a0a0a] border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-focus-within/input:text-blue-500 transition-all z-10 shadow-sm">
                        Email для связи
                    </label>
                    <input 
                        type="email" 
                        className="w-full bg-white/[0.01] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/30 transition-all text-sm font-medium text-white"
                        value={settings.email || ''}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                    />
                </div>
                <div className="relative group/input">
                    <label className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#0a0a0a] border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-focus-within/input:text-blue-500 transition-all z-10 shadow-sm">
                        Ссылка на GitHub
                    </label>
                    <input 
                        type="text" 
                        className="w-full bg-white/[0.01] border border-white/5 rounded-[22px] px-8 py-5 outline-none focus:border-blue-500/30 transition-all text-sm font-medium text-white"
                        value={settings.githubUrl || ''}
                        onChange={(e) => setSettings({...settings, githubUrl: e.target.value})}
                    />
                </div>
            </div>
        </div>

        {/* ЛАБОРАТОРИЯ ЗАГРУЗКИ */}
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
                    {!demoLoading ? (
                        <button onClick={startDemo} className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px]">Запустить</button>
                    ) : (
                        <button onClick={cancelDemo} className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-2"><X size={14}/> Отменить</button>
                    )}
                </div>
            </div>
        </div>
        {demoLoading && <div className="bg-white/[0.01] border border-dashed border-white/5 rounded-[50px] p-20 animate-in zoom-in-95"><PremiumLoader /></div>}
        <ConfirmModal 
            isOpen={isConfirmDeleteOpen}
            title="Удаление резюме"
            message="Вы уверены, что хотите удалить файл резюме? Ссылка в футере исчезнет."
            onConfirm={handleResumeDelete} // Сюда передаем функцию удаления
            onCancel={() => setIsConfirmDeleteOpen(false)}
        />

        <StatusModal 
            isOpen={status.isOpen}
            type={status.type}
            title={status.title}
            message={status.message}
            onClose={() => setStatus(prev => ({ ...prev, isOpen: false }))}
        />            
    </div>
);
}