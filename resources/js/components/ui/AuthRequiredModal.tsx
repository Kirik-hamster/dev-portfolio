import React from 'react';
import { User, X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthRequiredModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div 
                className="absolute inset-0 bg-[#050505]/60 backdrop-blur-md transition-opacity" 
                onClick={onClose} 
            />
            
            <div className="relative bg-[#0a0a0a] border border-white/5 p-12 rounded-[50px] max-w-sm w-full shadow-2xl overflow-hidden">
                {/* Декор */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px]" />
                
                <button onClick={onClose} className="absolute right-8 top-8 text-gray-600 hover:text-white transition-colors"><X size={20} /></button>

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-[30px] flex items-center justify-center mb-8 text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                        <LogIn size={36} />
                    </div>

                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Нужен аккаунт</h3>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed mb-12 italic">
                        Чтобы ставить лайки и участвовать в обсуждении, пожалуйста, зарегистрируйтесь или войдите  в свою учетную запись.
                    </p>
                    
                    <div className="flex flex-col w-full gap-3">
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                        >
                            Войти
                        </button>
                        <button 
                            onClick={() => navigate('/register')}
                            className="w-full py-4 bg-white/5 border border-white/5 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:text-white hover:bg-white/10 transition-all"
                        >
                            Регистрация
                        </button>
                        <button 
                            onClick={onClose}
                            className="mt-4 text-[8px] font-black uppercase text-gray-700 hover:text-gray-400 transition-colors tracking-widest"
                        >
                            Позже
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};