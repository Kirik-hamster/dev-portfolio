import React from 'react';
import {
  Eye, Layout, Briefcase, MessageSquare, ChevronDown,
  User as UserIcon, Ghost, Filter, Shield, Key, UserCircle
} from 'lucide-react';
import { StatsSummary, UserStatRow, HistoryItem } from '@/types/stats';

interface StatsTableProps {
  details: UserStatRow[];
  summary: StatsSummary | null;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  openDetails: (userId: number | null, ip: string, date: string) => void;
}

export const StatsTable: React.FC<StatsTableProps> = ({
  details, summary, expandedId, setExpandedId, openDetails
}) => {
  return (
    <div className="bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
      {/* Общий заголовок */}
      <div className="p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
          <Filter size={14} className="text-blue-500" /> Подробная статистика активности
        </h3>
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
            {details.map((row) => {
              const rid = row.user_id ? `u-${row.user_id}` : `g-${row.ip_address}`;
              const isEx = expandedId === rid;
              return (
                <React.Fragment key={rid}>
                  <tr className="group hover:bg-white/[0.02] transition-all border-l-2 border-transparent hover:border-blue-500">
                    <td className="p-6 cursor-pointer" onClick={() => setExpandedId(isEx ? null : rid)}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${row.is_guest ? 'bg-orange-500/5 border-orange-500/20 text-orange-500' : 'bg-blue-500/5 border-blue-500/20 text-blue-500'}`}>
                          {row.is_guest ? <Ghost size={18} /> : <UserIcon size={18} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-white uppercase tracking-tight truncate">
                            {row.user?.name || 'Гость'}
                          </span>
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
          <tfoot className="bg-white/[0.05] border-t border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
            <tr>
              <td className="p-8">ИТОГО ПО СИСТЕМЕ</td>
              <td className="p-8 text-center border-x border-white/5 text-blue-500 text-sm shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]">
                {summary?.total_views ?? 0}
              </td>
              <td className="p-8 text-center text-gray-500">{summary?.column_totals?.home ?? 0}</td>
              <td className="p-8 text-center text-gray-500">{summary?.column_totals?.portfolio ?? 0}</td>
              <td className="p-8 text-center text-gray-500">{summary?.column_totals?.blogs ?? 0}</td>
              <td className="p-8 text-center text-gray-500">{summary?.column_totals?.profile ?? 0}</td>
              <td className="p-8 text-center text-gray-500">{summary?.column_totals?.admin ?? 0}</td>
              <td className="p-8 text-center text-gray-500">{summary?.column_totals?.auth ?? 0}</td>
              <td className="p-8"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ========== МОБИЛЬНОЕ ПРЕДСТАВЛЕНИЕ (меньше sm) ========== */}
      <div className="block sm:hidden p-4 space-y-4">
        {details.map((row) => {
          const rid = row.user_id ? `u-${row.user_id}` : `g-${row.ip_address}`;
          const isEx = expandedId === rid;

          return (
            <div key={rid} className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
              {/* Заголовок карточки */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${row.is_guest ? 'bg-orange-500/5 border-orange-500/20 text-orange-500' : 'bg-blue-500/5 border-blue-500/20 text-blue-500'}`}>
                  {row.is_guest ? <Ghost size={18} /> : <UserIcon size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white uppercase truncate">
                      {row.user?.name || 'Гость'}
                    </span>
                    <button
                      onClick={() => setExpandedId(isEx ? null : rid)}
                      className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest"
                    >
                      {new Date(row.last_visit).toLocaleDateString()}
                      <ChevronDown size={14} className={`transition-transform duration-300 ${isEx ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-600 font-bold block mt-0.5">{row.ip_address}</span>
                </div>
              </div>

              {/* Сетка метрик */}
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                  <span className="text-gray-500 flex items-center gap-1"><Eye size={12} /> Всего</span>
                  <button
                    onClick={() => openDetails(row.user_id, row.ip_address, row.last_visit)}
                    className="font-black text-blue-500"
                  >
                    {row.total}
                  </button>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                  <span className="text-gray-500 flex items-center gap-1"><Layout size={12} /> Главная</span>
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

        {/* Итоговая карточка (мобильная) */}
        {summary && (
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white uppercase tracking-widest">ИТОГО ПО СИСТЕМЕ</span>
              <span className="text-sm font-black text-blue-500">{summary.total_views}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
              <div className="flex justify-between"><span className="text-gray-500">Главная</span> <span className="font-bold text-white">{summary.column_totals?.home ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Кейсы</span> <span className="font-bold text-white">{summary.column_totals?.portfolio ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Блоги</span> <span className="font-bold text-white">{summary.column_totals?.blogs ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Профиль</span> <span className="font-bold text-white">{summary.column_totals?.profile ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Админ</span> <span className="font-bold text-white">{summary.column_totals?.admin ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Auth</span> <span className="font-bold text-white">{summary.column_totals?.auth ?? 0}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};