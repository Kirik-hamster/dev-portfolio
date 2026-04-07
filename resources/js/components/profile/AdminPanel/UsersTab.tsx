import React, { useState } from 'react';
import { Users, Mail, ShieldCheck, Gavel, Unlock, AlertTriangle, Clock } from 'lucide-react';
import { User } from '@/types';
import { Pagination } from '@/components/ui/Pagination';
import { UserReportsModal } from '@/components/ui/moderation/UserReportModal';

interface Props {
    users: User[];
    searchQuery: string;
    onSearch: (val: string) => void;
    onToggleAccess: (u: User) => void;
    onBan: (u: User) => void;
    onUnban: (u: User) => void;
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    filterReported: boolean;
    onFilterReported: (val: boolean) => void;
}

const getBanStatus = (bannedUntil: string | null) => {
    if (!bannedUntil) return null;
    const now = new Date();
    const end = new Date(bannedUntil);
    if (end <= now) return null;

    const diffMs = end.getTime() - now.getTime();
    const totalMinutes = Math.ceil(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 3000) return 'Навсегда'; // Для нашего 2037 года
    if (days > 0) return `${days}д ${hours % 24}ч`;
    if (hours > 0) return `${hours}ч ${totalMinutes % 60}м`;
    return `${totalMinutes}м`; // Покажет "3м" для 0.05ч
};

export const UsersTab: React.FC<Props> = ({ 
    users, 
    searchQuery, 
    onSearch, 
    onToggleAccess, 
    onBan, 
    onUnban, 
    currentPage, 
    lastPage, 
    onPageChange,
    filterReported,
    onFilterReported
}) => {
    const [selectedUserForReports, setSelectedUserForReports] = useState<User | null>(null);
    return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
{/* ПАНЕЛЬ УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ */}
<div className="flex flex-col lg:flex-row gap-4 mb-10 items-stretch">
    
    {/* ПОИСКОВАЯ СТРОКА */}
    <div className="relative flex-1 group h-[64px]"> {/* Фиксируем высоту обертки */}
        {/* Мягкий фон-свечение */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[22px] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
        
        <div className="relative h-full">
            <input 
                type="text"
                placeholder="Поиск резидента по имени или email..."
                // Добавили h-full, чтобы инпут занял всю высоту [64px]
                className="w-full h-full bg-[#0a0a0a]/80 border border-white/5 backdrop-blur-xl rounded-[20px] px-5 pl-14 outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm text-white placeholder:text-gray-600 font-medium"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)} 
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 pointer-events-none">
                <Users 
                    className="text-gray-600 group-focus-within:text-blue-500 transition-colors duration-300" 
                    size={20} 
                    strokeWidth={2.2}
                />
            </div>
        </div>
    </div>

    {/* ФИЛЬТР ЖАЛОБ */}
    <button 
        onClick={() => onFilterReported(!filterReported)} 
        // Добавили h-[64px], чтобы высота точно совпала с инпутом
        className={`relative shrink-0 h-[64px] px-8 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border flex items-center justify-center gap-3 overflow-hidden group/btn
            ${filterReported 
                ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)]' 
                : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-white hover:bg-white/5 hover:border-white/10'}`}
    >
        {/* Анимированный блик */}
        {filterReported && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        )}
        
        <div className={`p-1.5 rounded-lg transition-colors ${filterReported ? 'bg-white/20' : 'bg-rose-500/10'}`}>
            <AlertTriangle 
                size={14} 
                className={filterReported ? 'text-white' : 'text-rose-500'} 
                strokeWidth={2.5}
            />
        </div>
        
        <span className="relative z-10">
            {filterReported ? 'Активные нарушения' : 'Все резиденты'}
        </span>
    </button>
</div>

        {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ (Карточки) */}
        <div className="md:hidden space-y-4">
            {users.map(u => {
                const banTimeLeft = getBanStatus(u.banned_until);
                return (
                    <div key={u.id} className={`bg-white/[0.02] border border-white/10 p-5 rounded-[30px] backdrop-blur-md space-y-5 ${banTimeLeft ? 'opacity-60' : ''}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div onClick={() => setSelectedUserForReports(u)} className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${banTimeLeft ? 'border-rose-500/20 bg-rose-500/5 text-rose-500' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                    {u.role === 'admin' ? <ShieldCheck size={16} /> : <Users size={16} />}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-white uppercase tracking-tight truncate">{u.name}</div>
                                    <div className="text-[10px] text-gray-600 truncate">{u.email}</div>
                                </div>
                            </div>
                            {/* КНОПКА-ЖАЛОБА ДЛЯ МОБИЛКИ */}
                            {u.reports_count && u.reports_count > 0 && (
                                <button 
                                    onClick={() => setSelectedUserForReports(u)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 active:scale-95 transition-all"
                                >
                                    <AlertTriangle size={12} />
                                    <span className="text-[10px] font-black">{u.reports_count}</span>
                                </button>
                            )}
                        </div>

                        {/* Статус бана для мобилки */}
                        {banTimeLeft && (
                            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-3 flex items-center justify-between">
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                    <Gavel size={12} /> Заблокирован
                                </span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase">{banTimeLeft}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <button 
                                onClick={() => onToggleAccess(u)}
                                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                                    ${u.role?.includes('-img') ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}
                            >
                                IMG: {u.role?.includes('-img') ? 'OK' : 'NO'}
                            </button>
                            
                            {banTimeLeft ? (
                                <button onClick={() => onUnban(u)} className="px-4 py-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                    <Unlock size={14} />
                                </button>
                            ) : (
                                <button onClick={() => onBan(u)} className="px-4 py-3 bg-rose-500/10 text-rose-500 rounded-xl">
                                    <Gavel size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* 💻 ДЕСКТОП ВЕРСИЯ (Таблица) */}
        <div className="hidden md:block bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <tr>
                        <th className="p-6">Пользователь</th>
                        <th className="p-6 text-center">Жалобы</th>
                        <th className="p-6">Статус</th>
                        <th className="p-6 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map(u => {
                        const banTimeLeft = getBanStatus(u.banned_until);
                        return (
                            <tr key={u.id} className={`group hover:bg-white/[0.01] transition-colors ${banTimeLeft ? 'opacity-60' : ''}`}>
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${banTimeLeft ? 'border-rose-500/20 bg-rose-500/5 text-rose-500' : 'border-white/5 bg-white/5 text-gray-500'}`}>
                                            {u.role === 'admin' ? <ShieldCheck size={18} /> : <Users size={18} />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-black text-white uppercase tracking-tight truncate">{u.name}</span>
                                            <span className="text-[10px] text-gray-600 truncate">{u.email}</span>
                                        </div>
                                    </div>
                                </td>
                                
                                <td className="p-6 text-center">
                                    {u.reports_count && u.reports_count > 0 ? (
                                        <button 
                                            onClick={() => setSelectedUserForReports(u)} // 👈 ОТКРЫВАЕМ МОДАЛКУ
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                        >
                                            <AlertTriangle size={10} />
                                            <span className="text-[10px] font-black">{u.reports_count}</span>
                                        </button>
                                    ) : <span className="text-[10px] font-bold text-gray-700">0</span>}
                                </td>

                                <td className="p-6">
                                    {banTimeLeft ? (
                                        <div className="flex flex-col gap-1 text-rose-500">
                                            <span className="text-[9px] font-black uppercase flex items-center gap-1"><Gavel size={10} /> Бан</span>
                                            <span className="text-[8px] font-bold uppercase flex items-center gap-1"><Clock size={10} /> {banTimeLeft}</span>
                                        </div>
                                    ) : <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Активен</span>}
                                </td>

                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onToggleAccess(u)} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${u.role?.includes('-img') ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-500'}`}>
                                            IMG
                                        </button>
                                        {banTimeLeft ? (
                                            <button onClick={() => onUnban(u)} className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><Unlock size={14} /></button>
                                        ) : (
                                            <button onClick={() => onBan(u)} className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Gavel size={14} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* ПАГИНАЦИЯ */}
        <div className="p-4 sm:p-6 bg-white/[0.01] rounded-[30px] border border-white/5">
            <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={onPageChange} />
        </div>
        <UserReportsModal 
                isOpen={!!selectedUserForReports}
                userId={selectedUserForReports?.id || 0}
                userName={selectedUserForReports?.name || ''}
                onClose={() => setSelectedUserForReports(null)}
        />
    </div>
    );
};