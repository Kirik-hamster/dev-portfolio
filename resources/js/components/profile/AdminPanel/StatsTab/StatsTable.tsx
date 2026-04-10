import React, { useEffect, useRef } from 'react';
import {
  Eye, Layout, Briefcase, MessageSquare, ChevronDown,
  User as UserIcon, Ghost, Skull, Filter, Shield, Key, UserCircle,
  Plus,
  Minus,
  AlertTriangle
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { StatsSummary, UserStatRow, HistoryItem } from '@/types/stats'; 


interface StatsTableProps {
  details: UserStatRow[];
  summary: StatsSummary | null;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  openDetails: (userId: number | null, ip: string, date: string) => void;
  currentPage: number;
  lastPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (count: number) => void;
}

export const StatsTable: React.FC<StatsTableProps> = ({
  details, summary, expandedId, setExpandedId, openDetails,
  currentPage, lastPage, perPage, onPageChange, onPerPageChange
}) => {
  const tableTopRef = useRef<HTMLDivElement>(null);
  // Локальный стейт для текста в инпуте, чтобы можно было стирать всё
  const [inputValue, setInputValue] = React.useState(perPage.toString());

  const isFirstRender = useRef(true);

  useEffect(() => {
      if (isFirstRender.current) {
          isFirstRender.current = false;
          window.scrollTo(0, 0); 
          return; 
      }

      if (tableTopRef.current) {
          const yOffset = -80; 
          const element = tableTopRef.current;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({ top: y, behavior: 'smooth' });
      }
}, [currentPage]);
  React.useEffect(() => {
      setInputValue(perPage.toString());
  }, [perPage]);
  return (
    <div ref={tableTopRef} className="bg-white/[0.01] border border-white/5 rounded-[40px] shadow-2xl flex flex-col">
      
      {/* 1. ШАПКА: Заголовок слева, инпут справа */}
      <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
          <Filter size={14} className="text-blue-500" /> Подробная статистика активности
        </h3>

        {/* Настройка количества строк */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5">
          <Layout size={12} className="text-gray-500" />
          
          <button
            onClick={() => onPerPageChange(Math.max(1, perPage - 1))}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Minus size={12} />
          </button>
          
          <input
            type="text"
            inputMode="numeric"
            value={inputValue} // Используем локальный стейт
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, ''); // Только цифры
              setInputValue(raw);

              const val = parseInt(raw, 10);
              if (!isNaN(val) && val > 0) {
                onPerPageChange(val); 
              }
            }}
            onBlur={() => {
              setInputValue(perPage.toString());
            }}
            className="w-8 bg-transparent border-none outline-none text-blue-500 text-xs font-black text-center p-0"
          />
          
          <button
            onClick={() => onPerPageChange(perPage + 1)}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Plus size={12} />
          </button>
          
          <span className="text-[9px] text-gray-600 font-black uppercase ml-1">Строк</span>
        </div>
      </div>

      {/* ========== ДЕСКТОП (sm и выше) ========== */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-white/[0.03] text-[8px] font-black uppercase text-gray-500 tracking-[0.2em]">
            <tr>
              <th className="p-6">Субъект</th>
              <th className="p-6 text-center border-x border-white/5 bg-blue-500/5">
                <div className="flex flex-col items-center gap-1"><Eye size={12} className="text-blue-500" />Всего</div>
              </th>
              <th className="p-6 text-center"><div className="flex flex-col items-center gap-1"><Layout size={12} />Главная</div></th>
              <th className="p-6 text-center"><div className="flex flex-col items-center gap-1"><Briefcase size={12} />Кейсы</div></th>
              <th className="p-6 text-center"><div className="flex flex-col items-center gap-1"><MessageSquare size={12} />Блоги</div></th>
              <th className="p-6 text-center"><div className="flex flex-col items-center gap-1"><UserCircle size={12} />Профиль</div></th>
              <th className="p-6 text-center"><div className="flex flex-col items-center gap-1"><Shield size={12} />Админ</div></th>
              <th className="p-6 text-center"><div className="flex flex-col items-center gap-1"><Key size={12} />Auth</div></th>
              <th className="p-6 text-right">Последний визит</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {details.map((row, index) => {
              // 🛡 УНИКАЛЬНЫЙ КЛЮЧ: добавляем индекс, чтобы не было дублей ключей React
              const rid = row.user_id 
                ? `u-${row.user_id}-${index}` 
                : `g-${row.ip_address}-${index}`;
              const isEx = expandedId === rid;

              // 🛡 ЛОГИКА ОПРЕДЕЛЕНИЯ ЦВЕТА И УГРОЗЫ
              const score = row.suspicion_score || 0;
              const isDanger = score >= 80; // Красный (Бот)
              const isGuest = row.is_guest && !isDanger; // Желтый (Гость)
              const isUser = !row.is_guest && !isDanger; // Синий (Юзер)

              return (
                <React.Fragment key={rid}>
                  <tr className={`group transition-all border-l-2 ${
                    isDanger ? 'bg-red-500/[0.03] border-red-500' : 
                    isGuest ? 'hover:bg-orange-500/[0.01] border-transparent hover:border-orange-500' :
                    'hover:bg-blue-500/[0.02] border-transparent hover:border-blue-500'
                  }`}>
                    <td className="p-6 cursor-pointer" onClick={() => setExpandedId(isEx ? null : rid)}>
                      <div className="flex items-center gap-4">
                        {/* ИКОНКА СУБЪЕКТА */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                          isDanger ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                          isGuest ? 'bg-orange-500/5 border-orange-500/20 text-orange-500' :
                          'bg-blue-500/5 border-blue-500/20 text-blue-500'
                        }`}>
                          {isDanger ? <Skull size={18} className="animate-pulse" /> : 
                          row.is_guest ? <Ghost size={18} /> : <UserIcon size={18} />}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black uppercase tracking-tight truncate ${
                              isDanger ? 'text-red-500' : isGuest ? 'text-orange-500' : 'text-blue-500'
                            }`}>
                              {row.user?.name || (isDanger ? 'Threat Bot' : 'Гость')}
                            </span>
                            {score > 0 && score < 80 && <AlertTriangle size={12} className="text-orange-500" />}
                          </div>
                          <span className="text-[10px] text-gray-600 font-bold">{row.ip_address}</span>
                        </div>
                      </div>
                    </td>
                    <td
                      onClick={() => openDetails(row.user_id, row.ip_address, row.last_visit)}
                      className="p-6 text-center font-black text-blue-500 text-sm border-x border-white/5 cursor-help hover:bg-blue-600 hover:text-white transition-all"
                    >
                      {row.total}
                    </td>
                    <td className="p-6 text-center text-gray-400 font-bold text-xs">{row.home}</td>
                    <td className="p-6 text-center text-gray-400 font-bold text-xs">{row.portfolio}</td>
                    <td className="p-6 text-center text-gray-400 font-bold text-xs">{row.blogs}</td>
                    <td className="p-6 text-center text-gray-400 font-bold text-xs">{row.profile}</td>
                    <td className="p-6 text-center text-gray-400 font-bold text-xs">{row.admin}</td>
                    <td className="p-6 text-center text-gray-400 font-bold text-xs">{row.auth}</td>
                    <td className="p-6 text-right cursor-pointer" onClick={() => setExpandedId(isEx ? null : rid)}>
                      <div className="flex items-center justify-end gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {new Date(row.last_visit).toLocaleDateString()}
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isEx ? 'rotate-180' : ''}`} />
                      </div>
                    </td>
                  </tr>
                  {isEx && row.history.map((day: HistoryItem, idx: number) => (
                    <tr key={idx} className="bg-blue-500/[0.02] border-l-4 border-blue-600 animate-in slide-in-from-left-2 duration-300">
                      <td className="p-4 pl-20 text-[10px] font-black text-gray-500 uppercase">
                        {new Date(day.viewed_at).toLocaleDateString()}
                      </td>
                      <td
                        onClick={() => openDetails(row.user_id, row.ip_address, day.viewed_at)}
                        className="p-4 text-center text-[10px] font-black text-blue-400/50 border-x border-white/5 cursor-help hover:text-white transition-all"
                      >
                        {day.total}
                      </td>
                      <td className="p-4 text-center text-[10px] font-bold text-gray-600/50">{day.home}</td>
                      <td className="p-4 text-center text-[10px] font-bold text-gray-600/50">{day.portfolio}</td>
                      <td className="p-4 text-center text-[10px] font-bold text-gray-600/50">{day.blogs}</td>
                      <td className="p-4 text-center text-[10px] font-bold text-gray-600/50">{day.profile}</td>
                      <td className="p-4 text-center text-[10px] font-bold text-gray-600/50">{day.admin}</td>
                      <td className="p-4 text-center text-[10px] font-bold text-gray-600/50">{day.auth}</td>
                      <td className="p-4"></td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========== МОБИЛЬНОЕ ПРЕДСТАВЛЕНИЕ (меньше sm) ========== */}
      <div className="block sm:hidden p-4 space-y-4">
        {details.map((row) => {
          const rid = row.user_id ? `u-${row.user_id}` : `g-${row.ip_address}`;
          const isEx = expandedId === rid;

          // 🛡 ЛОГИКА УГРОЗЫ
          const score = row.suspicion_score || 0;
          const isDanger = score >= 80;
          const isWarning = score > 0 && score < 80;

          return (
            <div 
              key={rid} 
              className={`border transition-all duration-300 rounded-3xl p-5 ${
                isDanger 
                  ? 'bg-red-500/[0.05] border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              {/* Заголовок карточки */}
              <div className="flex items-start gap-4">
                {/* ИКОНКА (Skull / Ghost / User) */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-all ${
                  isDanger 
                    ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-lg shadow-red-500/20' 
                    : isWarning ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                    : row.is_guest ? 'bg-white/5 border-white/10 text-gray-500' 
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                }`}>
                  {isDanger ? <Skull size={22} className="animate-pulse" /> : row.is_guest ? <Ghost size={22} /> : <UserIcon size={22} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-sm font-black uppercase truncate ${isDanger ? 'text-red-500' : 'text-white'}`}>
                        {row.user?.name || (isDanger ? 'Threat Client' : 'Гость')}
                      </span>
                      {isWarning && <AlertTriangle size={12} className="text-orange-500" />}
                    </div>
                    
                    <button
                      onClick={() => setExpandedId(isEx ? null : rid)}
                      className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg"
                    >
                      {new Date(row.last_visit).toLocaleDateString()}
                      <ChevronDown size={14} className={`transition-transform duration-300 ${isEx ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* IP + WHOIS */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-600 font-bold">{row.ip_address}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <a 
                      href={`https://whois.domaintools.com/${row.ip_address}`} 
                      target="_blank" 
                      className="text-[9px] text-blue-500/60 font-black uppercase tracking-tighter hover:text-blue-400 transition-colors"
                    >
                      Whois
                    </a>
                  </div>
                </div>
              </div>

              {/* Сетка метрик (как была) */}
              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-500 flex items-center gap-2"><Eye size={12} /> Всего</span>
                  <button
                    onClick={() => openDetails(row.user_id, row.ip_address, row.last_visit)}
                    className={`font-black ${isDanger ? 'text-red-400' : 'text-blue-500'}`}
                  >
                    {row.total}
                  </button>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-500 flex items-center gap-2"><Layout size={12} /> Главная</span>
                  <span className="font-bold text-white">{row.home}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                  <span className="text-gray-500 flex items-center gap-1"><Briefcase size={12} /> Кейсы</span>
                  <span className="font-bold text-white">{row.portfolio}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                  <span className="text-gray-500 flex items-center gap-1"><MessageSquare size={12} /> Блоги</span>
                  <span className="font-bold text-white">{row.blogs}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                  <span className="text-gray-500 flex items-center gap-1"><UserCircle size={12} /> Профиль</span>
                  <span className="font-bold text-white">{row.profile}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                  <span className="text-gray-500 flex items-center gap-1"><Shield size={12} /> Админ</span>
                  <span className="font-bold text-white">{row.admin}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                  <span className="text-gray-500 flex items-center gap-1"><Key size={12} /> Auth</span>
                  <span className="font-bold text-white">{row.auth}</span>
                </div>
              </div>

              {/* Раскрытая история (мобильная) */}
              {isEx && row.history.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-white/10 pt-3">
                  {row.history.map((day: HistoryItem, idx: number) => (
                    <div key={idx} className="pl-2 border-l-2 border-blue-600">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase">
                          {new Date(day.viewed_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => openDetails(row.user_id, row.ip_address, day.viewed_at)}
                          className="text-[10px] font-black text-blue-400/70"
                        >
                          {day.total} просмотров
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                        <span className="text-gray-500">Главная: <span className="text-white font-bold">{day.home}</span></span>
                        <span className="text-gray-500">Кейсы: <span className="text-white font-bold">{day.portfolio}</span></span>
                        <span className="text-gray-500">Блоги: <span className="text-white font-bold">{day.blogs}</span></span>
                        <span className="text-gray-500">Профиль: <span className="text-white font-bold">{day.profile}</span></span>
                        <span className="text-gray-500">Админ: <span className="text-white font-bold">{day.admin}</span></span>
                        <span className="text-gray-500">Auth: <span className="text-white font-bold">{day.auth}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. ПАГИНАЦИЯ (Ниже списка) */}
      {lastPage > 1 && (
        <div className="p-8 border-t border-white/5 flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            lastPage={lastPage} 
            onPageChange={onPageChange} 
          />
        </div>
      )}

      {/* 5. ИТОГИ (Всегда внизу) */}
      {summary && (
        <div className="bg-white/[0.04] border-t border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40">Итоговые показатели системы</span>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center"><span className="text-[8px] text-gray-500 uppercase font-black">Всего</span><span className="text-sm font-black text-blue-500">{summary.total_views}</span></div>
            <div className="flex flex-col items-center"><span className="text-[8px] text-gray-500 uppercase font-black">Главная</span><span className="text-sm font-black text-white">{summary.column_totals?.home}</span></div>
            <div className="flex flex-col items-center"><span className="text-[8px] text-gray-500 uppercase font-black">Кейсы</span><span className="text-sm font-black text-white">{summary.column_totals?.portfolio}</span></div>
            <div className="flex flex-col items-center"><span className="text-[8px] text-gray-500 uppercase font-black">Блоги</span><span className="text-sm font-black text-white">{summary.column_totals?.blogs}</span></div>
            <div className="flex flex-col items-center"><span className="text-[8px] text-gray-500 uppercase font-black">Профиль</span><span className="text-sm font-black text-white">{summary.column_totals?.profile}</span></div>
            <div className="flex flex-col items-center"><span className="text-[8px] text-gray-500 uppercase font-black">Админ</span><span className="text-sm font-black text-white">{summary.column_totals?.admin}</span></div>
            <div className="flex flex-col items-center"><span className="text-[8px] text-gray-500 uppercase font-black">Auth</span><span className="text-sm font-black text-white">{summary.column_totals?.auth}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};