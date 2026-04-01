import React, { useEffect, useState } from 'react';
import { ShieldCheck, User as UserIcon, AlertTriangle, X, Gavel, Clock } from 'lucide-react';
import { UserApiService } from '@/services/UserApiService';
import { ModerationApiService } from '@/services/ModerationApiService';
import { User } from '@/types';

// 1. Описываем структуру статистики
interface ProfileStats {
    articles_count: number;
    blogs_count: number;
    comments_count: number;
    total_likes: number;
    likes_split: {
        articles: number;
        blogs: number;
        comments: number;
    };
}

// 2. Описываем ответ от сервера для публичного профиля
interface PublicProfileData {
    id: number;
    name: string;
    role: string;
    banned_until: string | null;
    stats: ProfileStats;
}

// 3. Описываем контекст жалобы
interface ReportContext {
    id: number;
    type: 'article' | 'comment' | 'blog';
}

interface UserPublicModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    currentUser: User | null; // Заменяем any на User из твоих типов
    context?: ReportContext;   // Заменяем any на четкий тип
}

export function UserPublicModal({ isOpen, onClose, userId, currentUser, context }: UserPublicModalProps) {
    const [data, setData] = useState<PublicProfileData | null>(null); // Никаких any
    const [loading, setLoading] = useState<boolean>(true);
    const [reportMode, setReportMode] = useState<boolean>(false);
    const [reason, setReason] = useState<string>('');
    
    // Используем строку для инпута, чтобы корректно обрабатывать точки (0.01)
    const [banHours, setBanHours] = useState<string>('24');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            setError(null);
            UserApiService.getPublicProfile(userId)
                .then((res: PublicProfileData) => setData(res))
                .catch(() => setError("Не удалось загрузить данные"))
                .finally(() => setLoading(false));
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;
    if (error) return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"><div className="bg-[#0a0a0a] p-10 rounded-[40px] border border-rose-500/30 text-rose-500 font-black uppercase text-[10px] tracking-widest">{error} <button onClick={onClose} className="ml-4 text-white underline">Закрыть</button></div></div>;

    const handleSendReport = async () => {
        if (!context || !reason.trim()) return;
        const res = await ModerationApiService.sendReport({
            reported_id: userId,
            reason: reason,
            reportable_id: context.id,
            reportable_type: context.type
        });
        if (res.ok) {
            alert('Жалоба отправлена');
            setReportMode(false);
            onClose();
        }
    };

    const handleBan = async () => {
        const hoursNum = parseFloat(banHours);
        if (isNaN(hoursNum)) return;
        
        if (!window.confirm(`Забанить пользователя на ${hoursNum === 0 ? 'вечность' : hoursNum + ' ч.'}?`)) return;
        
        const res = await ModerationApiService.banUser(userId, hoursNum);
        if (res.ok) {
            alert('Пользователь заблокирован');
            onClose();
        }
    };

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[45px] shadow-2xl overflow-hidden backdrop-blur-3xl">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[80px] pointer-events-none" />
                
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors z-50">
                    <X size={20} />
                </button>

                {loading ? (
                    <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 animate-pulse">Инициализация...</div>
                ) : data && (
                    <div className="p-8 sm:p-12 relative z-10">
                        {/* ШАПКА */}
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                {data.role === 'admin' ? <ShieldCheck size={32} className="text-blue-500" /> : <UserIcon size={32} className="text-gray-600" />}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter truncate">{data.name}</h3>
                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">{data.role}</span>
                            </div>
                        </div>

                        {/* СТАТИСТИКА */}
                        <div className="grid grid-cols-3 gap-4 mb-10">
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
                                <span className="block text-xl font-black text-white">{data.stats.articles_count}</span>
                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Статьи</span>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
                                <span className="block text-xl font-black text-white">{data.stats.blogs_count}</span>
                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Блоги</span>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
                                <span className="block text-xl font-black text-white text-blue-500">{data.stats.total_likes}</span>
                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Лайки</span>
                            </div>
                        </div>

                        {/* КНОПКИ ДЕЙСТВИЯ */}
                        <div className="space-y-4">
                            {!reportMode ? (
                                <button 
                                    onClick={() => setReportMode(true)}
                                    className="w-full py-4 bg-white/[0.03] border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
                                >
                                    <AlertTriangle size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Пожаловаться</span>
                                </button>
                            ) : (
                                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                                    <textarea 
                                        autoFocus
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        placeholder="Опишите причину нарушения..."
                                        className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-rose-500/50 min-h-[100px]"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleSendReport} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Отправить</button>
                                        <button onClick={() => setReportMode(false)} className="px-6 py-3 bg-white/5 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest">Отмена</button>
                                    </div>
                                </div>
                            )}

                            {/* АДМИН ПАНЕЛЬ */}
                            {isAdmin && (
                                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                                            <Gavel size={14} className="text-blue-500" />
                                            <input 
                                                type="number" 
                                                step="any"
                                                value={banHours} 
                                                onChange={e => setBanHours(e.target.value)}
                                                className="bg-transparent border-none outline-none text-white text-xs w-full font-black"
                                            />
                                            <span className="text-[8px] text-gray-600 uppercase font-bold">Часов</span>
                                        </div>
                                        <button 
                                            onClick={handleBan}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95"
                                        >
                                            Забанить
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}