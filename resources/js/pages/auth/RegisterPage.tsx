import { User } from '@/types';
import React, { useState } from 'react';
import { AuthApiService } from '@/services/AuthApiService';
import { StatusModal } from '@/components/ui/StatusModal';
import { Eye, EyeOff } from 'lucide-react';

export function RegisterPage({ 
    onRegisterSuccess, 
    onNavigateToLogin
}: {
    onRegisterSuccess: (user: User) => void,
    onNavigateToLogin: () => void
}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
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
            const response = await AuthApiService.register({ name, email, password, password_confirmation });

            if (response.ok) {
                const userResponse = await AuthApiService.getUser();
                if (userResponse.ok) {
                    onRegisterSuccess(await userResponse.json());
                }
            } else {
                const errorData = await response.json();
                setModal({
                    isOpen: true,
                    type: 'error',
                    title: 'Ошибка регистрации',
                    message: errorData.message || 'Проверьте правильность введенных данных.'
                });
            }
        } catch (e) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Ошибка связи',
                message: 'Сервер недоступен. Попробуйте позже.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-20 animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tighter">Регистрация</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white/[0.02] p-8 rounded-[30px] border border-white/5">
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all" placeholder="Имя" required />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all" placeholder="Email" required />
                <div className="relative group">
                    <input 
                        type={showPasswords ? "text" : "password"} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white outline-none focus:border-blue-500 transition-all" 
                        placeholder="Пароль" 
                        required 
                    />
                    <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="relative group">
                    <input 
                        type={showPasswords ? "text" : "password"} 
                        value={password_confirmation} 
                        onChange={e => setPasswordConfirmation(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white outline-none focus:border-blue-500 transition-all" 
                        placeholder="Подтвердите пароль" 
                        required 
                    />
                    <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-white text-black rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all">
                    {isLoading ? 'Создание...' : 'Создать аккаунт'}
                </button>
            </form>
            <StatusModal 
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
            <div className="mt-6 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Уже есть аккаунт?</p>
                <button 
                    onClick={onNavigateToLogin} 
                    className="mt-2 text-blue-500 hover:text-white transition-colors text-xs font-black uppercase tracking-tighter"
                >
                    Войти
                </button>
            </div>
        </div>
    );
}