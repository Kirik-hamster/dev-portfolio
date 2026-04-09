import React from 'react';
import { Users, Mail, ShieldCheck, Gavel, Unlock, AlertTriangle, Clock } from 'lucide-react';
import { User } from '@/types/types';
import { Pagination } from '@/components/ui/Pagination';

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
    users, searchQuery, onSearch, onToggleAccess, onBan, onUnban, currentPage, lastPage, onPageChange 
}) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        {/* ПОИСК */}
        <div className="relative group">
            <input 
                type="text"
                placeholder="Поиск по имени или почте..."
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 pl-12 sm:pl-14 outline-none focus:border-blue-500/30 transition-all text-sm text-white"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)} 
            />
            <Users className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
        </div>

        {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ (Карточки) */}
        <div className="md:hidden space-y-4">
            {users.map(u => {
                const banTimeLeft = getBanStatus(u.banned_until);
                return (
                    <div key={u.id} className={`bg-white/[0.02] border border-white/10 p-5 rounded-[30px] backdrop-blur-md space-y-5 ${banTimeLeft ? 'opacity-60' : ''}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${banTimeLeft ? 'border-rose-500/20 bg-rose-500/5 text-rose-500' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                    {u.role === 'admin' ? <ShieldCheck size={16} /> : <Users size={16} />}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-white uppercase tracking-tight truncate">{u.name}</div>
                                    <div className="text-[10px] text-gray-600 truncate">{u.email}</div>
                                </div>
                            </div>
                            {/* Жалобы в углу */}
                            {u.reports_count && u.reports_count > 0 && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-rose-500/10 rounded-lg text-rose-500">
                                    <AlertTriangle size={10} />
                                    <span className="text-[10px] font-black">{u.reports_count}</span>
                                </div>
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
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500">
                                            <AlertTriangle size={10} />
                                            <span className="text-[10px] font-black">{u.reports_count}</span>
                                        </div>
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
    </div>
);