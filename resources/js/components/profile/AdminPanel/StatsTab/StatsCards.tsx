import React from 'react';
import { Users, Eye } from 'lucide-react';
import { StatsSummary } from '@/types/stats';

interface StatsCardsProps {
    summary: StatsSummary | null;
    filter: 'all' | 'users' | 'guests';
    setFilter: (t: 'all' | 'users' | 'guests') => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ summary, filter, setFilter }) => {
    return (
        /* Сетка 4 колонки: 1 для юзеров (25%), 3 для просмотров (75%) */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* КАРТОЧКА 1: ПОЛЬЗОВАТЕЛИ (Минималистичная) */}
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 p-4 sm:p-6 rounded-[30px] flex items-center gap-4 shadow-2xl group hover:border-blue-500/20 transition-all">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/10 shrink-0">
                    <Users size={20} />
                </div>
                <div className="min-w-0">
                    <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-0.5 truncate">
                        Юзеры
                    </div>
                    <div className="text-2xl font-black text-white leading-none">
                        {summary?.total_users ?? 0}
                    </div>
                </div>
            </div>

            {/* КАРТОЧКА 2: ПРОСМОТРЫ + ФИЛЬТРЫ */}
            <div className="lg:col-span-3 bg-white/[0.02] border border-white/5 p-4 sm:p-6 rounded-[30px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl group hover:border-purple-500/20 transition-all overflow-hidden">
                
                {/* Группа: Иконка + Текст */}
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/10 shrink-0">
                        <Eye size={20} />
                    </div>
                    <div className="min-w-fit">
                        <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-0.5 truncate">
                            Всего просмотров
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                            {summary?.total_views ?? 0}
                        </div>
                    </div>
                </div>

                {/* Группа: Фильтры (Адаптивные) */}
                <div className="flex bg-black/40 p-1 rounded-xl sm:rounded-2xl border border-white/5 shrink-0 self-start md:self-center w-full md:w-auto">
                    {(['all', 'users', 'guests'] as const).map(t => (
                        <button 
                            key={t} 
                            onClick={() => setFilter(t)} 
                            className={`flex-1 md:flex-none px-3 sm:px-5 py-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase transition-all whitespace-nowrap
                                ${filter === t 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                    : 'text-gray-500 hover:text-white'}`}
                        >
                            {t === 'all' ? 'Все' : t === 'users' ? 'Юзеры' : 'Гости'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};