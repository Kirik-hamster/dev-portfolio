import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<Props> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            {/* BACKDROP: Размытие фона как в премиум интерфейсах */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCancel} />
            
            {/* ОКНО: Стиль твоих карточек */}
            <div className="relative bg-[#0a0a0a] border border-white/10 p-10 rounded-[45px] max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t-white/10">
                <button onClick={onCancel} className="absolute right-6 top-6 text-gray-600 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mb-6 text-red-500">
                        <AlertCircle size={32} />
                    </div>

                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-3">{title}</h3>
                    <p className="text-gray-500 text-[13px] font-medium leading-relaxed mb-10">{message}</p>
                    
                    <div className="flex w-full gap-3">
                        <button 
                            onClick={onConfirm} 
                            className="flex-1 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                        >
                            Удалить
                        </button>
                        <button 
                            onClick={onCancel} 
                            className="flex-1 py-4 bg-white/5 border border-white/5 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};