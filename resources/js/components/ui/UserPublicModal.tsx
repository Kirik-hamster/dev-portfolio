import React, { useEffect, useState } from 'react';
import { 
    ShieldCheck, User as UserIcon, AlertTriangle, X, Gavel, 
    FileText, Folder, Heart, ChevronRight, Info, Clock 
} from 'lucide-react';
import { UserApiService } from '@/services/UserApiService';
import { ModerationApiService } from '@/services/ModerationApiService';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';

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

interface PublicProfileData {
    id: number;
    name: string;
    role: string;
    banned_until: string | null;
    stats: ProfileStats;
}

interface ReportContext {
    id: number;
    type: 'article' | 'comment' | 'blog';
}

interface UserPublicModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    currentUser: User | null;
    context?: ReportContext;
}

// resources/js/components/ui/UserPublicModal.tsx

export function UserPublicModal({ isOpen, onClose, userId, currentUser, context }: UserPublicModalProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<PublicProfileData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [reportMode, setReportMode] = useState<boolean>(false);
    const [reason, setReason] = useState<string>('');
    const [banHours, setBanHours] = useState<string>('24');
    const [banReason, setBanReason] = useState<string>('Нарушение правил сообщества');
    const [showLikesSplit, setShowLikesSplit] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            setError(null);
            setReportMode(false);
            setShowLikesSplit(false);
            UserApiService.getPublicProfile(userId)
                .then((res: PublicProfileData) => setData(res))
                .catch(() => setError("Пользователь не найден"))
                .finally(() => setLoading(false));
        }
    }, [isOpen, userId]);

    const handleSendReport = async () => {
        if (!context || !reason.trim()) return;
        const res = await ModerationApiService.sendReport({
            reported_id: userId,
            reason: reason,
            reportable_id: context.id,
            reportable_type: context.type
        });
        if (res.ok) {
            setReportMode(false);
            onClose();
        }
    };

    // ФУНКЦИЯ ПЕРЕХОДА: закрывает модалку и меняет URL страницы
    const handleNavigateToUserContent = (view: 'blogs' | 'posts') => {
        if (!data) return;
        onClose();
        // Переходим на /blogs и прокидываем фильтры в URL
        navigate(`/blogs?view=${view}&search=${encodeURIComponent(data.name)}&search_type=author`);
    };

    const handleBan = async () => {
        const hoursNum = parseFloat(banHours);
        if (isNaN(hoursNum) || !data) return;
        if (!window.confirm(`Заблокировать ${data.name}?`)) return;
        const res = await ModerationApiService.banUser(userId, hoursNum, banReason); 
        if (res.ok) { alert('Блокировка применена'); onClose(); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-[#080808] border border-white/10 rounded-[45px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
                
                {/* 1. ГРАДИЕНТНЫЙ БАННЕР */}
                <div className="h-32 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-black/40 hover:bg-white hover:text-black text-white rounded-full transition-all z-50 backdrop-blur-md border border-white/10 active:scale-90">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="py-24 text-center">
                        <div className="inline-block w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/50">Протокол загрузки...</div>
                    </div>
                ) : data && (
                    <div className="px-8 pb-10 relative">
                        {/* 2. АВАТАР И СТАТУС */}
                        <div className="relative -mt-16 mb-8 flex justify-between items-end">
                            <div className="relative group/avatar">
                                <div className="w-28 h-28 rounded-[38px] bg-[#0a0a0a] border-[6px] border-[#080808] flex items-center justify-center shadow-2xl overflow-hidden relative transition-transform duration-500 group-hover/avatar:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                    {data.role === 'admin' ? <ShieldCheck size={44} className="text-blue-500" /> : <UserIcon size={44} className="text-gray-700" />}
                                </div>
                                {data.banned_until && new Date(data.banned_until) > new Date() && (
                                    <div className="absolute -right-1 -bottom-1 p-2.5 bg-rose-600 rounded-2xl border-4 border-[#080808] text-white shadow-xl animate-pulse">
                                        <Gavel size={16} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="pb-2">
                                <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase text-blue-400 tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                                    {data.role}
                                </div>
                            </div>
                        </div>

                        {/* 3. ИМЯ */}
                        <div className="mb-10">
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                                {data.name}
                            </h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-10">
                            {/* КАРТОЧКА: СТАТЬИ */}
                            <button 
                                onClick={() => handleNavigateToUserContent('posts')}
                                className="group/stat relative p-6 bg-white/[0.03] border border-white/5 rounded-[32px] text-center hover:bg-blue-600/10 hover:border-blue-500/30 transition-all active:scale-95 shadow-xl"
                            >
                                <FileText size={20} className="mx-auto mb-3 text-gray-500 group-hover/stat:text-blue-400 group-hover/stat:scale-110 transition-all duration-300" />
                                <span className="block text-2xl font-black text-white leading-none mb-1">{data.stats.articles_count}</span>
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Статьи</span>
                            </button>

                            {/* КАРТОЧКА: БЛОГИ */}
                            <button 
                                onClick={() => handleNavigateToUserContent('blogs')}
                                className="group/stat relative p-6 bg-white/[0.03] border border-white/5 rounded-[32px] text-center hover:bg-purple-600/10 hover:border-purple-500/30 transition-all active:scale-95 shadow-xl"
                            >
                                <Folder size={20} className="mx-auto mb-3 text-gray-500 group-hover/stat:text-purple-400 group-hover/stat:scale-110 transition-all duration-300" />
                                <span className="block text-2xl font-black text-white leading-none mb-1">{data.stats.blogs_count}</span>
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Блоги</span>
                            </button>

                            {/* КАРТОЧКА: ЛАЙКИ (С расшифровкой) */}
                            <div 
                                onMouseEnter={() => setShowLikesSplit(true)}
                                onMouseLeave={() => setShowLikesSplit(false)}
                                onClick={() => setShowLikesSplit(!showLikesSplit)}
                                className="group/stat relative p-6 bg-white/[0.03] border border-white/5 rounded-[32px] text-center cursor-help transition-all hover:border-red-500/20 shadow-xl"
                            >
                                <Heart size={20} className={`mx-auto mb-3 transition-all duration-300 ${showLikesSplit ? 'text-red-500 scale-110' : 'text-gray-500'}`} fill={showLikesSplit ? "currentColor" : "none"} />
                                
                                {showLikesSplit ? (
                                    <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex justify-between items-center text-[9px] font-black text-white px-1">
                                            <span className="opacity-40">Статьи: </span>
                                            <span className="text-blue-400">{data.stats.likes_split.articles}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-black text-white px-1">
                                            <span className="opacity-40">Блоги: </span>
                                            <span className="text-purple-400">{data.stats.likes_split.blogs}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="block text-2xl font-black text-blue-500 leading-none mb-1">{data.stats.total_likes}</span>
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Лайки</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 5. КНОПКИ ДЕЙСТВИЯ */}
                        <div className="space-y-4">
                            {!reportMode ? (
                                <button 
                                    onClick={() => setReportMode(true)}
                                    className="w-full py-4 bg-white/[0.03] border border-white/10 hover:border-rose-500/30 text-rose-500/70 hover:text-rose-500 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[9px] font-black uppercase tracking-[0.2em]"
                                >
                                    <AlertTriangle size={14} /> Отправить жалобу
                                </button>
                            ) : (
                                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                                    <textarea 
                                        autoFocus
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        placeholder="В чем заключается нарушение?"
                                        className="w-full bg-black border border-white/10 rounded-[25px] p-5 text-sm text-white outline-none focus:border-rose-500/50 min-h-[120px] resize-none placeholder:text-gray-700 shadow-inner"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleSendReport} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/20">Подтвердить</button>
                                        <button onClick={() => setReportMode(false)} className="px-8 py-4 bg-white/5 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Отмена</button>
                                    </div>
                                </div>
                            )}

                            {/* АДМИН ПАНЕЛЬ */}
                            {isAdmin && (
                                <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in">
                                    <div className="bg-black/50 border border-white/5 rounded-[30px] p-6 space-y-4 shadow-inner">
                                        <div className="flex items-center gap-3 mb-2 text-blue-500">
                                            <Gavel size={16} />
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Управление</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 bg-[#050505] rounded-xl px-4 py-3 border border-white/5">
                                                <Clock size={14} className="text-gray-600" />
                                                <input 
                                                    type="number" step="any" value={banHours} 
                                                    onChange={e => setBanHours(e.target.value)}
                                                    className="bg-transparent border-none outline-none text-white text-xs w-full font-black"
                                                    placeholder="Часы"
                                                />
                                                <span className="text-[8px] text-gray-600 font-black uppercase">Hrs</span>
                                            </div>
                                            <input 
                                                type="text" value={banReason} 
                                                onChange={e => setBanReason(e.target.value)}
                                                className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-blue-500/30"
                                                placeholder="Причина..."
                                            />
                                            <button 
                                                onClick={handleBan}
                                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-blue-900/30"
                                            >
                                                Заблокировать
                                            </button>
                                        </div>
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