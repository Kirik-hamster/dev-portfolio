import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw } from 'lucide-react';
import { 
    X, ExternalLink, User as UserIcon, Mail, Fingerprint, 
    Shield, Ghost, Calendar, Clock, ArrowUpDown, Filter, Hash,
    Skull
} from 'lucide-react';
import { PremiumLoader } from '../../PremiumLoader';
import { ModalUserInfo, RawLog } from '@/types/stats';
import { StatsApiService } from '@/services/StatsApiService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    data: RawLog[];
    userInfo: ModalUserInfo | null;
}

export const ActivityDetailsModal: React.FC<Props> = ({ isOpen, onClose, loading, data, userInfo }) => {
    const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const filteredData = useMemo(() => {
        let result = [...data];
        if (activeCategory !== 'all') {
            result = result.filter(log => {
                const path = log.page_path;
                if (activeCategory === 'home') return path === '/' || path.includes('/home');
                if (activeCategory === 'portfolio') return path.includes('/portfolio');
                if (activeCategory === 'blogs') return path.includes('/blog') || path.includes('/article');
                if (activeCategory === 'admin') return path.includes('/admin');
                return true;
            });
        }
        return result.sort((a, b) => {
            const timeA = new Date(a.updated_at).getTime();
            const timeB = new Date(b.updated_at).getTime();
            return sortOrder === 'new' ? timeB - timeA : timeA - timeB;
        });
    }, [data, activeCategory, sortOrder]);

    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        if (!confirm('Обнулить историю и рейтинг подозрительности?')) return;
        setIsResetting(true);
        try {
            await StatsApiService.resetSuspicion(userInfo?.id || null, userInfo?.ip || '');
            onClose(); // Закрываем, так как данных больше нет
            window.location.reload(); // Перезагружаем таблицу
        } catch (e) {
            console.error(e);
        } finally {
            setIsResetting(false);
        }
    };

    const suspicion = userInfo?.suspicion_score || 0;
    const isDanger = suspicion >= 80;
    const isGuest = userInfo?.isGuest && !isDanger;

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-[#080808] border-x sm:border border-white/10 sm:rounded-[40px] flex flex-col max-h-screen sm:max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* 🛡 HEADER: Улучшенная верстка чтобы ничего не перекрывало */}
                <div className={`relative p-6 sm:p-10 border-b border-white/5 transition-colors duration-500 ${
                    isDanger ? 'bg-red-500/10' : isGuest ? 'bg-orange-500/5' : 'bg-blue-600/5'
                }`}>
                    
                    {/* КНОПКА ЗАКРЫТИЯ (Теперь с фиксированным отступом и фоном) */}
                    <div className="absolute top-4 right-4 z-[210]">
                        <button 
                            onClick={onClose} 
                            className="p-3 bg-black/50 hover:bg-white hover:text-black text-white rounded-full border border-white/10 transition-all active:scale-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 pr-8"> {/* Добавили pr-8 чтобы текст не залез под X */}
                        <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center border-2 shrink-0 transition-all ${
                            isDanger ? 'bg-red-500/20 border-red-500/40 text-red-500 shadow-2xl' :
                            isGuest ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                            'bg-blue-600/10 border-blue-500/30 text-blue-500'
                        }`}>
                            {isDanger ? <Skull size={40} className="animate-pulse" /> : isGuest ? <Ghost size={40} /> : <UserIcon size={40} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-1 mb-4 text-center sm:text-left">
                                <h3 className={`text-2xl font-black uppercase tracking-tighter truncate ${isDanger ? 'text-red-500' : isGuest ? 'text-orange-500' : 'text-blue-500'}`}>
                                    {userInfo?.name || 'Visitor'}
                                </h3>
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${
                                        isDanger ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'bg-green-500/10 text-green-500'
                                    }`}>
                                        {suspicion}% RISK
                                    </div>
                                    
                                    {/* КНОПКА АМНИСТИИ */}
                                    <button 
                                        onClick={handleReset}
                                        disabled={isResetting}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-lg text-[8px] font-black uppercase transition-all border border-white/5"
                                    >
                                        <RotateCcw size={10} className={isResetting ? 'animate-spin' : ''} />
                                        {isResetting ? 'Сброс...' : 'Амнистия'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-center sm:justify-start gap-3 text-[10px] font-bold text-gray-500">
                                    <Fingerprint size={12} className="text-blue-500"/> {userInfo?.ip}
                                </div>
                                <div className="text-[10px] text-gray-500 font-medium italic opacity-40 bg-black/40 p-2 rounded-xl border border-white/5">
                                    {userInfo?.user_agent || 'UA String Empty'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TOOLBAR: Фильтры */}
                <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                            {(['all', 'home', 'portfolio', 'blogs', 'admin'] as const).map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap border
                                        ${activeCategory === cat 
                                            ? 'bg-white text-black border-white' 
                                            : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'}`}
                                >
                                    {cat === 'all' ? 'Все' : cat === 'home' ? 'Главная' : cat === 'portfolio' ? 'Кейсы' : cat === 'blogs' ? 'Блоги' : 'Админ'}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setSortOrder(sortOrder === 'new' ? 'old' : 'new')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-[9px] font-black uppercase border border-white/5 transition-all shrink-0"
                        >
                            <ArrowUpDown size={12} />
                            <span className="hidden sm:inline">{sortOrder === 'new' ? 'Новые' : 'Старые'}</span>
                        </button>
                    </div>
                </div>

                {/* 3. BODY: Список логов */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-[#050505]">
                    {loading ? (
                        <div className="py-20 text-center"><PremiumLoader /></div>
                    ) : filteredData.length > 0 ? filteredData.map((log: RawLog, i: number) => (
                        <div key={i} className="group relative flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-blue-500/30 transition-all">
                            <div className="flex flex-col min-w-0 gap-1.5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${log.page_path.includes('admin') ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                    <span className="text-[11px] font-mono text-blue-400 truncate">{log.page_path}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[8px] font-black text-gray-600 uppercase tracking-widest pl-3">
                                    <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md"><Clock size={10} className="text-gray-500"/> {new Date(log.updated_at).toLocaleTimeString()}</span>
                                    <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md"><Calendar size={10} className="text-gray-500"/> {new Date(log.viewed_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 shrink-0 pl-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-black text-white leading-none">{log.views_count}</div>
                                    <div className="text-[8px] text-gray-600 uppercase font-black">hits</div>
                                </div>
                                <a 
                                    href={log.page_path} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-3 bg-white/5 rounded-xl text-gray-500 hover:bg-blue-600 hover:text-white transition-all active:scale-90 shadow-xl"
                                >
                                    <ExternalLink size={14}/>
                                </a>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 flex flex-col items-center opacity-20">
                            <Filter size={48} className="mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">История пуста</span>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};