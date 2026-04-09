import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, ExternalLink, User as UserIcon, Mail, Fingerprint, 
    Shield, Ghost, Calendar, Clock, ArrowUpDown, Filter, Hash
} from 'lucide-react';
import { PremiumLoader } from '../../PremiumLoader';
import { ModalUserInfo, RawLog } from '@/types/stats';

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

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-[#080808] border-x sm:border border-white/10 sm:rounded-[40px] flex flex-col max-h-screen sm:max-h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* 1. HEADER: Блок пользователя */}
                <div className={`relative p-6 sm:p-10 border-b border-white/5 ${userInfo?.isGuest ? 'bg-orange-500/5' : 'bg-blue-600/5'}`}>
                    <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-white hover:text-black text-white rounded-full transition-all z-50 active:scale-90">
                        <X size={20} />
                    </button>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                        {/* Аватар */}
                        <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center border-2 shrink-0 ${userInfo?.isGuest ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]'}`}>
                            {userInfo?.isGuest ? <Ghost size={40} /> : <UserIcon size={40} />}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate">
                                    {userInfo?.name || 'Анонимный гость'}
                                </h3>
                                {!userInfo?.isGuest && userInfo?.role && (
                                    <span className="inline-flex px-3 py-1 bg-blue-600 text-[9px] font-black uppercase rounded-lg tracking-widest text-white shadow-lg shadow-blue-600/20 w-fit mx-auto sm:mx-0">
                                        {userInfo.role}
                                    </span>
                                )}
                                {userInfo?.isGuest && (
                                    <span className="inline-flex px-3 py-1 bg-orange-600/20 border border-orange-500/30 text-[9px] font-black uppercase rounded-lg tracking-widest text-orange-500 w-fit mx-auto sm:mx-0">
                                        GUEST_VISITOR
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                {userInfo?.email && (
                                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                        <Mail size={12} className="text-blue-500" /> {userInfo.email}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                    <Fingerprint size={12} className={userInfo?.isGuest ? 'text-orange-500' : 'text-blue-500'} /> {userInfo?.ip}
                                </div>
                                {userInfo?.id && (
                                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                        <Hash size={12} /> ID: {userInfo.id}
                                    </div>
                                )}
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