import React, { useMemo, useRef } from 'react';
import { TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { StatsSummary } from '@/types/stats';

interface Props {
    summary: StatsSummary | null;
    period: number;
    setPeriod: (p: number) => void;
    dateRange: { from: string; to: string };
    setDateRange: (range: { from: string; to: string }) => void;
}

export const StatsChart: React.FC<Props> = ({ summary, period, setPeriod, dateRange, setDateRange }) => {
    const views = summary?.daily_views || [];
    const maxViews = Math.max(...(views.map(d => d.count) || [1]), 1);
    const yAxisLabels = [Math.round(maxViews), Math.round(maxViews / 2), 0];

    // 🛡 Исправление ошибки 2345: Указываем | null в типе рефа
    const fromRef = useRef<HTMLInputElement | null>(null);
    const toRef = useRef<HTMLInputElement | null>(null);

    const visibleLabels = useMemo(() => {
        const total = views.length;
        if (total === 0) return [];
        const skip = window.innerWidth < 640 ? Math.ceil(total / 4) : Math.ceil(total / 8);
        return views.map((d, i) => {
            if (i === 0 || i === total - 1 || i % skip === 0) {
                return new Date(d.viewed_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
            }
            return '';
        });
    }, [views]);

    // 🛡 Исправление ошибки 2345: Принимаем RefObject с возможным null
    const handleTriggerCalendar = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (ref.current) {
            if ('showPicker' in HTMLInputElement.prototype) {
                try { ref.current.showPicker(); } catch (e) { ref.current.focus(); }
            } else {
                ref.current.focus();
                ref.current.click();
            }
        }
    };

    return (
        <div className="bg-white/[0.01] border border-white/5 rounded-[30px] sm:rounded-[40px] p-5 sm:p-10 shadow-inner relative overflow-hidden text-white">
            
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <TrendingUp size={20} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-[0.2em]">Активность платформы</h3>
                        <span className="text-[8px] sm:text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">Визуализация трафика</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                    {/* Кнопки периода */}
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 justify-between sm:justify-start">
                        {[7, 14, 30].map(d => (
                            <button 
                                key={d} 
                                onClick={() => { setPeriod(d); setDateRange({from: '', to: ''}); }} 
                                className={`px-5 sm:px-8 py-2 rounded-xl text-[9px] font-black uppercase transition-all
                                    ${period === d ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                {d}д
                            </button>
                        ))}
                    </div>

                    <div className="hidden sm:block h-4 w-px bg-white/10 mx-1" />

                    {/* Календарь: Увеличена зона клика для десктопа */}
                    <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5 px-4 h-[50px] sm:h-[46px] group/cal cursor-pointer hover:border-blue-500/30 transition-all">
                        <Calendar size={16} className="text-blue-500 shrink-0 group-hover/cal:scale-110 transition-transform" />
                        
                        <div className="flex items-center flex-1 gap-2 sm:gap-4">
                            {/* Инпут ОТ */}
                            <div className="relative flex-1 min-w-[80px]" onClick={() => handleTriggerCalendar(fromRef)}>
                                <input 
                                    ref={fromRef}
                                    type="date" 
                                    className="absolute inset-0 opacity-0 z-20 cursor-pointer"
                                    value={dateRange.from} 
                                    onChange={e => { setDateRange({...dateRange, from: e.target.value}); setPeriod(0); }} 
                                />
                                <div className={`text-[10px] sm:text-xs font-black uppercase transition-colors text-center sm:text-left ${dateRange.from ? 'text-white' : 'text-gray-600 group-hover/cal:text-gray-400'}`}>
                                    {dateRange.from ? new Date(dateRange.from).toLocaleDateString('ru-RU') : 'От'}
                                </div>
                            </div>

                            <ChevronRight size={12} className="text-gray-700 shrink-0" />

                            {/* Инпут ДО */}
                            <div className="relative flex-1 min-w-[80px]" onClick={() => handleTriggerCalendar(toRef)}>
                                <input 
                                    ref={toRef}
                                    type="date" 
                                    className="absolute inset-0 opacity-0 z-20 cursor-pointer"
                                    value={dateRange.to} 
                                    onChange={e => { setDateRange({...dateRange, to: e.target.value}); setPeriod(0); }} 
                                />
                                <div className={`text-[10px] sm:text-xs font-black uppercase transition-colors text-center sm:text-left ${dateRange.to ? 'text-white' : 'text-gray-600 group-hover/cal:text-gray-400'}`}>
                                    {dateRange.to ? new Date(dateRange.to).toLocaleDateString('ru-RU') : 'До'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHART AREA */}
            <div className="relative flex gap-3 sm:gap-6 h-64 sm:h-80">
                <div className="flex flex-col justify-between text-[8px] sm:text-[9px] font-black text-gray-700 uppercase h-48 sm:h-64 pb-2 border-r border-white/5 pr-2 sm:pr-4">
                    {yAxisLabels.map(label => <span key={label}>{label}</span>)}
                </div>

                <div className="flex-1 flex flex-col h-full">
                    <div className="flex-1 flex items-end gap-1.5 sm:gap-4 h-48 sm:h-64 border-b border-white/5 relative group/chart">
                        {views.map((d, i) => (
                            <div key={i} className="flex-1 h-full flex flex-col justify-end group/bar relative">
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-3 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all z-30 shadow-[0_10px_25px_rgba(37,99,235,0.4)] pointer-events-none whitespace-nowrap mb-2">
                                    <div className="text-[7px] opacity-60 mb-0.5">{new Date(d.viewed_at).toLocaleDateString()}</div>
                                    <div>{d.count.toLocaleString()} просмотров</div>
                                </div>
                                <div 
                                    className="w-full bg-gradient-to-t from-blue-600/40 to-blue-400/10 rounded-t-lg sm:rounded-t-xl group-hover/bar:from-blue-500 group-hover/bar:to-cyan-400 transition-all duration-500 relative" 
                                    style={{ height: `${(d.count / maxViews) * 100}%`, minHeight: d.count > 0 ? '4px' : '0px' }} 
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between mt-6 px-1 sm:px-2 h-6">
                        {visibleLabels.map((label, i) => (
                            <div key={i} className="flex-1 text-center">
                                {label && <span className="text-[8px] sm:text-[9px] font-black text-gray-600 uppercase tracking-tighter sm:tracking-widest">{label}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};