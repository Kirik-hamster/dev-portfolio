import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    onClose: () => void;
}

export const StatusModal: React.FC<Props> = ({ isOpen, type, title, message, onClose }) => {
    if (!isOpen) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            {/* BACKDROP */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            
            {/* ОКНО */}
            <div className="relative bg-[#0a0a0a] border border-white/10 p-10 rounded-[45px] max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t-white/10 overflow-hidden">
                {/* Декоративное свечение внутри */}
                <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-[80px] pointer-events-none ${isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
                
                <button onClick={onClose} className="absolute right-6 top-6 text-gray-600 hover:text-white transition-colors z-10">
                    <X size={20} />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* ИКОНКА */}
                    <div className={`w-16 h-16 border rounded-3xl flex items-center justify-center mb-6 
                        ${isSuccess 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                            : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                    >
                        {isSuccess ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                    </div>

                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-3">{title}</h3>
                    <p className="text-gray-500 text-[13px] font-medium leading-relaxed mb-10">{message}</p>
                    
                    {/* КНОПКА */}
                    <button 
                        onClick={onClose} 
                        className={`w-full py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 
                            ${isSuccess 
                                ? 'bg-white text-black hover:bg-emerald-500 hover:text-white' 
                                : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'}`}
                    >
                        Понятно
                    </button>
                </div>
            </div>
        </div>
    );
};