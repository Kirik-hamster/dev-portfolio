import React, { useState } from 'react';
import { Gavel, Clock, Calendar, X } from 'lucide-react';

interface BanUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (hours: number, reason: string) => void;
    userName: string;
}

export const BanUserModal: React.FC<BanUserModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    const [reason, setReason] = useState<string>('');
    const [hours, setHours] = useState<string>('24');
    const [dateMode, setDateMode] = useState<boolean>(false);

    if (!isOpen) return null;

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = new Date(e.target.value);
        const now = new Date();
        const diffMs = selectedDate.getTime() - now.getTime();
        const diffHours = Math.max(0.1, diffMs / (1000 * 60 * 60));
        setHours(diffHours.toFixed(2));
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-[#0a0a0a] border border-white/10 p-8 rounded-[45px] max-w-md w-full shadow-2xl overflow-hidden backdrop-blur-3xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-500">
                            <Gavel size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-white">Блокировка</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Причина</label>
                        <textarea 
                            autoFocus
                            placeholder="Например: Нарушение правил общения..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-rose-500/30 transition-all min-h-[100px] resize-none"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Срок (часы)</label>
                            <button 
                                onClick={() => setDateMode(!dateMode)}
                                className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1.5 transition-colors"
                            >
                                {dateMode ? <Clock size={12}/> : <Calendar size={12}/>}
                                {dateMode ? "Ввести часы" : "Выбрать дату"}
                            </button>
                        </div>

                        {dateMode ? (
                            <input 
                                type="date" 
                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-blue-500/30 transition-all"
                                onChange={handleDateChange}
                            />
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 24, 168, 0].map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => setHours(v.toString())}
                                        className={`py-2.5 rounded-xl text-[10px] font-black border transition-all
                                            ${hours === v.toString() ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'}`}
                                    >
                                        {v === 0 ? '∞' : v === 168 ? '7д' : v === 24 ? '1д' : v + 'ч'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {!dateMode && (
                             <input 
                                type="number" 
                                step="any"
                                value={hours}
                                onChange={e => setHours(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-center text-xl font-black text-white outline-none focus:border-rose-500/30"
                            />
                        )}
                    </div>

                    <button 
                        onClick={() => onConfirm(parseFloat(hours), reason)}
                        disabled={!reason.trim() || isNaN(parseFloat(hours))}
                        className="w-full py-5 bg-rose-600 hover:bg-rose-500 disabled:opacity-20 text-white rounded-[22px] text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-rose-900/20"
                    >
                        Забанить
                    </button>
                </div>
            </div>
        </div>
    );
};