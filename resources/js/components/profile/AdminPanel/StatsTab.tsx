import React, { useEffect, useState } from 'react';
import { Users, Eye, TrendingUp, Calendar, AlertCircle } from 'lucide-react'; // Добавил AlertCircle
import { StatsApiService } from '@/services/StatsApiService';
import { PremiumLoader } from '@/components/PremiumLoader';

interface StatsSummary {
    total_users: number;
    total_views: number;
    daily_views: { viewed_at: string; count: number }[];
}

export const StatsTab = () => {
    const [data, setData] = useState<StatsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        StatsApiService.getSummary()
            .then(res => {
                // Если бэкенд прислал ошибку, setData не вызываем
                if (res && !res.error) {
                    setData(res);
                }
            })
            .catch(err => console.error("Ошибка API:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="py-24 flex flex-col items-center justify-center">
            <PremiumLoader />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/50 mt-4">Сбор аналитики...</span>
        </div>
    );

    // 🛡 ЗАЩИТА: Создаем пустой массив, если данных нет
    const dailyViews = data?.daily_views || [];
    const maxViews = dailyViews.length > 0 
        ? Math.max(...dailyViews.map(d => Number(d.count)), 1) 
        : 1;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            
            {/* КАРТОЧКИ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[35px] flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-[22px] flex items-center justify-center text-blue-500">
                        <Users size={32} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Резидентов</span>
                        <span className="text-4xl font-black text-white">{data?.total_users || 0}</span>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[35px] flex items-center gap-6">
                    <div className="w-16 h-16 bg-purple-600/10 rounded-[22px] flex items-center justify-center text-purple-500">
                        <Eye size={32} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Просмотров</span>
                        <span className="text-4xl font-black text-white">{data?.total_views || 0}</span>
                    </div>
                </div>
            </div>

            {/* ГРАФИК */}
            <div className="bg-white/[0.01] border border-white/5 rounded-[40px] p-8 sm:p-10">
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={20} className="text-blue-500" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Активность</h3>
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
                    {dailyViews.length > 0 ? dailyViews.map((day, i) => {
                        const heightPercent = (Number(day.count) / maxViews) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                <div className="w-full relative flex flex-col justify-end h-full">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-20">
                                        {day.count}
                                    </div>
                                    <div 
                                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl transition-all duration-500"
                                        style={{ height: `${heightPercent}%`, minHeight: Number(day.count) > 0 ? '4px' : '0px' }}
                                    />
                                </div>
                                <span className="text-[8px] font-black text-gray-600 uppercase">
                                    {new Date(day.viewed_at).toLocaleDateString('ru-RU', { weekday: 'short' })}
                                </span>
                            </div>
                        );
                    }) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-20 uppercase font-black text-[10px] tracking-[0.4em]">
                             <AlertCircle size={32} className="mb-4" />
                             Нет данных для графика
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};