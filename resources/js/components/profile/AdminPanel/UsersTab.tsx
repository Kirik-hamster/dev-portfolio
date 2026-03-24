import React from 'react';
import { Users, Mail, ShieldCheck } from 'lucide-react';
import { User } from '@/types';
import { Pagination } from '@/components/ui/Pagination';

interface Props {
    users: User[];
    searchQuery: string;
    onSearch: (val: string) => void;
    onToggleAccess: (u: User) => void;
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

export const UsersTab: React.FC<Props> = ({ 
    users, searchQuery, onSearch, onToggleAccess, currentPage, lastPage, onPageChange 
}) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        {/* ПОИСК (Универсальный) */}
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
            {users.map(u => (
                <div key={u.id} className="bg-white/[0.02] border border-white/10 p-5 rounded-[30px] backdrop-blur-md space-y-5">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                                <Users size={16} className="text-gray-500" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-black text-white uppercase tracking-tight truncate">{u.name}</div>
                                <div className="text-[10px] text-gray-600 flex items-center gap-1.5 mt-1">
                                    <Mail size={10} /> {u.email}
                                </div>
                            </div>
                        </div>
                        <span className="text-[8px] font-black uppercase px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md shrink-0">
                            {u.role}
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Доступ к медиа</span>
                        <button 
                            onClick={() => onToggleAccess(u)}
                            className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all active:scale-90
                                ${u.role?.includes('-img') 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-white/5 text-gray-400'}`}
                        >
                            {u.role?.includes('-img') ? 'Разрешено' : 'Запрещено'}
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* 💻 ДЕСКТОП ВЕРСИЯ (Таблица) */}
        <div className="hidden md:block bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <tr>
                        <th className="p-6">Пользователь</th>
                        <th className="p-6">Роль</th>
                        <th className="p-6 text-right">Доступ к медиа</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                        <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                            <td className="p-6">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">{u.name}</span>
                                    <span className="text-xs text-gray-600">{u.email}</span>
                                </div>
                            </td>
                            <td className="p-6">
                                <span className="text-[10px] font-black uppercase px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg">
                                    {u.role}
                                </span>
                            </td>
                            <td className="p-6 text-right">
                                <button 
                                    onClick={() => onToggleAccess(u)}
                                    className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all
                                        ${u.role?.includes('-img') 
                                            ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                                            : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                >
                                    {u.role?.includes('-img') ? 'Разрешено' : 'Запрещено'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* ПАГИНАЦИЯ (Общая) */}
        <div className="p-4 sm:p-6 bg-white/[0.01] rounded-[30px] border border-white/5">
            <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={onPageChange} />
        </div>
    </div>
);