import React, { useEffect, useState } from 'react';
import { 
    ShieldCheck, User as UserIcon, AlertTriangle, X, Gavel, 
    FileText, Folder, Heart, ChevronRight, Info, Clock 
} from 'lucide-react';
import { createPortal } from 'react-dom';
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
            reported_id: userId, reason,
            reportable_id: context.id,
            reportable_type: context.type
        });
        if (res.ok) { setReportMode(false); onClose(); }
    };

    const handleNavigateToUserContent = (view: 'blogs' | 'posts') => {
        if (!data) return;
        onClose();
        navigate(`/blogs?view=${view}&search=${encodeURIComponent(data.name)}&search_type=author`);
    };

    const handleBan = async () => {
        const hoursNum = parseFloat(banHours);
        if (isNaN(hoursNum) || !data) return;
        if (!window.confirm(`Заблокировать ${data.name}?`)) return;
        const res = await ModerationApiService.banUser(userId, hoursNum, banReason); 
        if (res.ok) { onClose(); }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
            
            {/* ГЛАВНЫЙ КОНТЕЙНЕР: Скролл тут, всё внутри (включая баннер) скроллится */}
            <div className="relative w-full max-w-lg bg-[#080808] border border-white/10 rounded-[45px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto overflow-x-hidden 
                scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent 
                [&::-webkit-scrollbar]:w-1.5 
                [&::-webkit-scrollbar-thumb]:bg-white/10 
                [&::-webkit-scrollbar-thumb]:rounded-full"> 
                {/* Кнопка закрытия — sticky, чтобы всегда была под рукой */}
                <button onClick={onClose} className="sticky top-6 float-right mr-6 p-2.5 bg-black/40 hover:bg-white hover:text-black text-white rounded-full transition-all z-50 backdrop-blur-md border border-white/10 active:scale-90">
                    <X size={18} />
                </button>

                {/* 1. БАННЕР (теперь он часть общего скролла) */}
                <div className="h-32 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent relative shrink-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                </div>

                {loading ? (
                    <div className="py-24 text-center">
                        <div className="inline-block w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/50">Загрузка данных...</div>
                    </div>
                ) : data && (
                    <div className="px-8 sm:px-12 pb-12 relative">
                        
                        {/* 2. ГОРИЗОНТАЛЬНАЯ ШАПКА (Аватар слева, Ник справа) */}
                        <div className="flex items-end gap-6 -mt-12 mb-10 relative z-20">
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[38px] bg-[#0a0a0a] border-[6px] border-[#080808] flex items-center justify-center shadow-2xl overflow-hidden relative">
                                    {data.role === 'admin' ? <ShieldCheck size={44} className="text-blue-500" /> : <UserIcon size={44} className="text-gray-700" />}
                                </div>
                                {data.banned_until && new Date(data.banned_until) > new Date() && (
                                    <div className="absolute -right-1 -bottom-1 p-2 bg-rose-600 rounded-2xl border-4 border-[#080808] text-white shadow-xl animate-pulse">
                                        <Gavel size={14} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0 pb-2">
                                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter truncate leading-none mb-2">
                                    {data.name}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[8px] font-black uppercase text-blue-400 tracking-widest">
                                        {data.role}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[7px] font-black uppercase text-gray-600 tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. СТАТИСТИКА (ИКОНКИ 32px) */}
                        <div className="grid grid-cols-3 gap-3 mb-10">
                            <button onClick={() => handleNavigateToUserContent('posts')} className="group/stat relative p-6 bg-white/[0.03] border border-white/5 rounded-[32px] text-center hover:bg-blue-600/10 hover:border-blue-500/30 transition-all active:scale-95 shadow-xl">
                                <FileText size={32} className="mx-auto mb-3 text-gray-600 group-hover/stat:text-blue-500 transition-all" />
                                <span className="block text-2xl font-black text-white mb-1">{data.stats.articles_count}</span>
                                <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Статьи</span>
                            </button>

                            <button onClick={() => handleNavigateToUserContent('blogs')} className="group/stat relative p-6 bg-white/[0.03] border border-white/5 rounded-[32px] text-center hover:bg-purple-600/10 hover:border-purple-500/30 transition-all active:scale-95 shadow-xl">
                                <Folder size={32} className="mx-auto mb-3 text-gray-600 group-hover/stat:text-purple-500 transition-all" />
                                <span className="block text-2xl font-black text-white mb-1">{data.stats.blogs_count}</span>
                                <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Блоги</span>
                            </button>

                            <div 
                                onClick={() => setShowLikesSplit(!showLikesSplit)}
                                onMouseEnter={() => setShowLikesSplit(true)} 
                                onMouseLeave={() => setShowLikesSplit(false)}
                                className="group/stat relative p-6 bg-white/[0.03] border border-white/5 rounded-[32px] text-center cursor-help transition-all hover:border-red-500/20 shadow-xl"
                            >
                                <Heart size={32} className={`mx-auto mb-3 transition-all ${showLikesSplit ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                                {showLikesSplit ? (
                                    <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex justify-between items-center text-[9px] font-black text-white px-1">
                                            <span className="opacity-40">Статьи: </span><span className="text-blue-400">{data.stats.likes_split.articles}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-black text-white px-1">
                                            <span className="opacity-40">Блоги: </span><span className="text-purple-400">{data.stats.likes_split.blogs}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className="block text-2xl font-black text-blue-500 mb-1">{data.stats.total_likes}</span>
                                        <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Лайки</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 4. КНОПКИ ДЕЙСТВИЯ */}
                        <div className="space-y-4">
                            {!reportMode ? (
                                <button onClick={() => setReportMode(true)} className="w-full py-4 bg-white/[0.03] border border-white/5 hover:border-rose-500/30 text-rose-500 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[9px] font-black uppercase tracking-[0.2em]">
                                    <AlertTriangle size={14} /> Отправить жалобу
                                </button>
                            ) : (
                                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                                    <textarea autoFocus value={reason} onChange={e => setReason(e.target.value)} placeholder="В чем нарушение?" className="w-full bg-black border border-white/10 rounded-[25px] p-5 text-sm text-white outline-none focus:border-rose-500/50 min-h-[120px] resize-none" />
                                    <div className="flex gap-2">
                                        <button onClick={handleSendReport} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg">Отправить</button>
                                        <button onClick={() => setReportMode(false)} className="px-8 py-4 bg-white/5 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-widest">Отмена</button>
                                    </div>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in">
                                    <div className="bg-black/50 border border-white/5 rounded-[30px] p-6 space-y-4">
                                        <div className="flex items-center gap-3 mb-2 text-blue-500">
                                            <Gavel size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Control</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 bg-[#050505] rounded-xl px-4 py-3 border border-white/5">
                                                <Clock size={14} className="text-gray-600" />
                                                <input type="number" step="any" value={banHours} onChange={e => setBanHours(e.target.value)} className="bg-transparent border-none outline-none text-white text-xs w-full font-black" />
                                                <span className="text-[8px] text-gray-600 font-black uppercase">Hrs</span>
                                            </div>
                                            <input type="text" value={banReason} onChange={e => setBanReason(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white outline-none focus:border-blue-500/30" placeholder="Reason..." />
                                            <button onClick={handleBan} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Ban User</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body // ✅ Решение ошибки TS 2554
    );
}