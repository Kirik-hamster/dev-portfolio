import { User } from '@/types/types';
import React, { useState } from 'react';
import { AuthApiService } from '@/services/AuthApiService';
import { StatusModal } from '@/components/ui/StatusModal';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoginPage({ 
    onLoginSuccess, 
    onNavigateToRegister
}: { 
    onLoginSuccess: (user: User) => void,
    onNavigateToRegister: () => void
}) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Возможность посмотреть пароль
    const [showPasswords, setShowPasswords] = useState(false);

    const [modal, setModal] = useState({
        isOpen: false,
        type: 'error' as 'success' | 'error',
        title: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await AuthApiService.login({ email, password });

            if (response.ok) {
                const userResponse = await AuthApiService.getUser();
                if (userResponse.ok) {
                    onLoginSuccess(await userResponse.json());
                }
            } else {
                setModal({
                    isOpen: true,
                    type: 'error',
                    title: 'Ошибка доступа',
                    message: 'Неверный логин или пароль. Проверьте данные и попробуйте снова.'
                });
            }
        } catch (error: unknown) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Ошибка связи',
                message: 'Не удалось связаться с сервером. Проверьте интернет.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-10 sm:py-20 px-4 animate-in fade-in zoom-in duration-500">
            <h1 className="text-3xl sm:text-4xl font-black mb-6 sm:mb-8 text-center uppercase tracking-tighter">Вход</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white/[0.02] p-6 sm:p-8 rounded-[30px] border border-white/5">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all" placeholder="Email" />
                <div className="relative group">
                    <input 
                        type={showPasswords ? "text" : "password"} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 outline-none focus:border-blue-500 transition-all text-white" 
                        placeholder="Пароль" 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                        {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-white text-black rounded-full font-bold uppercase text-xs tracking-widest active:scale-95 sm:hover:scale-105 transition-all">
                    {isLoading ? 'Загрузка...' : 'Авторизоваться'}
                </button>
            </form>
            <StatusModal 
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
            {/* ФУТЕР ФОРМЫ С РАЗДЕЛИТЕЛЕМ */}
            <div className="mt-12 relative flex items-start">
                {/* Вертикальная линия-разделитель ровно по центру */}
                <div className="absolute left-1/2 top-1 bottom-1 w-px bg-white/10 -translate-x-1/2" />

                {/* ЛЕВАЯ ПОЛОВИНА: Пароль */}
                <div className="flex-1 flex flex-col items-center gap-2 text-center px-2">
                    <p className="text-gray-600 text-[8px] sm:text-[9px] uppercase font-black tracking-[0.2em]">Проблема?</p>
                    <button 
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-blue-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-tight"
                    >
                        Забыли пароль?
                    </button>
                </div>

                {/* ПРАВАЯ ПОЛОВИНА: Регистрация */}
                <div className="flex-1 flex flex-col items-center gap-2 text-center px-2">
                    <p className="text-gray-600 text-[8px] sm:text-[9px] uppercase font-black tracking-[0.2em]">Нет аккаунта?</p>
                    <button 
                        onClick={onNavigateToRegister} 
                        className="text-blue-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-tight"
                    >
                        Создать аккаунт
                    </button>
                </div>
            </div>
        </div>
    );
}