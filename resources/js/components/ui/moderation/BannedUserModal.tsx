import React from 'react';
import { X, Gavel, Clock, ShieldAlert } from 'lucide-react';
import { createPortal } from 'react-dom';
import { User } from '@/types/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export const BannedUserModal: React.FC<Props> = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user || !user.banned_until) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-xl" onClick={onClose} />
            
            <div className="relative bg-[#0a0a0a] border border-rose-500/20 p-8 sm:p-12 rounded-[50px] max-w-lg w-full shadow-2xl overflow-hidden text-center">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-[80px]" />
                <button onClick={onClose} className="absolute right-8 top-8 text-gray-600 hover:text-white transition-colors"><X size={20} /></button>

                <div className="flex flex-col items-center relative z-10">
                    <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-[35px] flex items-center justify-center mb-8 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                        <ShieldAlert size={48} />
                    </div>

                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Доступ ограничен</h3>
                    <p className="text-rose-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Ваш аккаунт заблокирован</p>
                    
                    <div className="w-full space-y-4 mb-10 text-left">
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                            <span className="block text-[8px] font-black uppercase text-gray-600 tracking-widest mb-2 flex items-center gap-2">
                                <Gavel size={10} /> Причина
                            </span>
                            <p className="text-white text-sm italic">«{user.ban_reason || 'Нарушение правил сообщества'}»</p>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                            <span className="block text-[8px] font-black uppercase text-gray-600 tracking-widest mb-2 flex items-center gap-2">
                                <Clock size={10} /> Разблокировка
                            </span>
                            <p className="text-white font-bold text-sm">
                                {new Date(user.banned_until).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed mb-8 uppercase tracking-widest">
                        Вам временно запрещено: оставлять лайки, <br /> писать комментарии и создавать контент.
                    </p>

                    <button onClick={onClose} className="w-full py-5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all">
                        Понятно
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};