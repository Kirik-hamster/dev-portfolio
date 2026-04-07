import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, ExternalLink, MessageSquare, FileText, Folder, Check } from 'lucide-react';
import { ModerationApiService } from '@/services/ModerationApiService';
import { PremiumLoader } from '../../PremiumLoader';

export const UserReportsModal = ({ isOpen, onClose, userId, userName }: any) => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showResolved, setShowResolved] = useState(false);

    // 1. Функция загрузки
    const loadReports = async () => {
        setLoading(true);
        setReports([]); // Очищаем список перед загрузкой новых данных
        try {
            const data = await ModerationApiService.getUserReports(userId, showResolved);
            setReports(data);
        } catch (error) {
            console.error("Ошибка загрузки жалоб", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && userId) loadReports();
    }, [isOpen, userId, showResolved]);

    // 2. Функция "решить жалобу"
    const handleResolve = async (id: number) => {
        const res = await ModerationApiService.resolveReport(id);
        if (res.ok) {
            // Мгновенно убираем из списка на текущем экране
            setReports(prev => prev.filter(r => r.id !== id));
        }
    };

    // 3. Хелпер для иконок (был потерян)
    const getReportContext = (report: any) => {
        const type = report.reportable_type.split('\\').pop().toLowerCase();
        if (type === 'article') return { name: 'Статья', icon: <FileText size={14}/> };
        if (type === 'comment') return { name: 'Комментарий', icon: <MessageSquare size={14}/> };
        if (type === 'blog') return { name: 'Блог', icon: <Folder size={14}/> };
        return { name: 'Объект', icon: <AlertCircle size={14}/> };
    };

    // 4. Хелпер для ссылок (был потерян)
    const getReportLink = (report: any) => {
        const type = report.reportable_type.split('\\').pop().toLowerCase();
        if (type === 'article') return `/article/${report.reportable_id}`;
        if (type === 'comment' && report.reportable) {
            return `/article/${report.reportable.article_id}#comment-${report.reportable_id}`;
        }
        if (type === 'blog') return `/blogs/${report.reportable_id}`;
        return '#';
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
            <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[40px] flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in-95">
                
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-1 block">
                            {showResolved ? 'Архив решений' : 'Активные жалобы'}
                        </span>
                        <h3 className="text-xl font-black uppercase text-white tracking-tighter truncate">{userName}</h3>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                        <button 
                            onClick={() => setShowResolved(!showResolved)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                                ${showResolved ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                        >
                            {showResolved ? 'К активным' : 'Архив'}
                        </button>
                        <button onClick={onClose} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 text-gray-500 transition-all"><X size={20}/></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="py-20"><PremiumLoader /></div>
                    ) : reports.length > 0 ? (
                        reports.map((report: any) => {
                            const ctx = getReportContext(report);
                            return (
                                <div key={report.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl group hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                                {ctx.icon}
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{ctx.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-600 uppercase">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {!showResolved && (
                                            <button 
                                                onClick={() => handleResolve(report.id)}
                                                className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-90"
                                                title="Пометить как решенное"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-300 leading-relaxed mb-6 italic bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                                        "{report.reason}"
                                    </p>
                                    
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Автор жалобы</span>
                                            <span className="text-[10px] font-black uppercase text-white">{report.reporter?.name}</span>
                                        </div>
                                        
                                        <a 
                                            href={getReportLink(report)} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            Исследовать <ExternalLink size={12}/>
                                        </a>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center opacity-20 uppercase font-black tracking-widest">
                            <AlertCircle size={40} className="mb-4" />
                            <span className="text-xs">{showResolved ? 'Архив решений пуст' : 'Нет активных жалоб'}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};