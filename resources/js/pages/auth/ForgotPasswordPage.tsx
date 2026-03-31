import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, EyeOff, Eye, Loader2, User as UserIcon, ShieldCheck } from 'lucide-react';
import { AuthApiService } from '@/services/AuthApiService';
import { StatusModal } from '@/components/ui/StatusModal';
import { VerifyCodePage } from './VerifyCodePage';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    
    const [targetUser, setTargetUser] = useState<{name: string, email: string, role: string} | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        code: '',
        password: '',
        password_confirmation: ''
    });

    const [modal, setModal] = useState({ isOpen: false, type: 'error' as 'success' | 'error', title: '', message: '' });

    // 1. Запрос кода
    const handleSendCode = async () => {
        setIsLoading(true);
        try {
            const res = await AuthApiService.forgotPasswordRequest(formData.email);
            const data = await res.json();

            if (res.ok) {
                if (data.user) setTargetUser(data.user);
                setStep('otp');
            } else {
                setModal({ isOpen: true, type: 'error', title: 'Ошибка', message: data.message || 'Email не найден.' });
            }
        } catch (e) {
            setModal({ isOpen: true, type: 'error', title: 'Ошибка связи', message: 'Сервер недоступен.' });
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Финальный сброс
    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await AuthApiService.forgotPasswordUpdate(formData);
            if (res.ok) {
                setStep('success');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                const data = await res.json();
                setModal({ isOpen: true, type: 'error', title: 'Ошибка', message: data.message || 'Ошибка обновления.' });
            }
        } catch (e) {
            setModal({ isOpen: true, type: 'error', title: 'Ошибка', message: 'Сбой сети.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- ШАГ 2: ВЕРИФИКАЦИЯ (Возвращаем её отдельно, так как у неё свой бокс) ---
    if (step === 'otp') {
        return (
            <div className="animate-in fade-in duration-700">
                <VerifyCodePage 
                    email={formData.email}
                    title="Восстановление"
                    description="Подтвердите личность для сброса пароля"
                    skipApi={true}
                    onVerified={(code) => {
                        setFormData({ ...formData, code });
                        setStep('password');
                    }}
                />

                <div className="mt-8 flex flex-col items-center gap-4 animate-in slide-in-from-top-2 duration-1000">
                    <button 
                        onClick={() => setStep('email')}
                        className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/40 hover:text-blue-500 transition-colors"
                    >
                        Ошибка в почте? Изменить
                    </button>
                    
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
                    >
                        Вспомнил пароль? Назад
                    </button>
                </div>
            </div>
        );
    }

    // --- ОСТАЛЬНЫЕ ШАГИ (Email, Password, Success) ---
    return (
        <div className="max-w-md mx-auto py-10 sm:py-20 px-4 animate-in fade-in zoom-in duration-500">
            <h1 className="text-3xl sm:text-4xl font-black mb-6 sm:mb-8 text-center tracking-tighter text-white">
                {step === 'email' && 'Сброс пароля'}
                {step === 'password' && 'Новый пароль'}
                {step === 'success' && 'Готово'}
            </h1>

            {/* ПРОЗРАЧНЫЙ БОКС (Как в LoginPage) */}
            <div className="relative p-6 sm:p-8 bg-white/[0.02] rounded-[30px] border border-white/5 shadow-2xl overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

                {step === 'email' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }} className="space-y-4 relative z-10">
                        <input 
                            type="email" required placeholder="Email"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all text-white"
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        <button disabled={isLoading} className="w-full py-4 bg-white text-black rounded-full font-bold text-xs tracking-widest active:scale-95 sm:hover:scale-105 transition-all">
                            {isLoading ? 'Загрузка...' : 'Получить код'}
                        </button>
                    </form>
                )}

                {step === 'password' && (
                    <form onSubmit={handleResetSubmit} className="space-y-4 relative z-10">
                        {/* Инфо-карточка пользователя */}
                        {targetUser && (
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                    {targetUser.role === 'admin' ? <ShieldCheck size={18}/> : <UserIcon size={18}/>}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-white font-black text-[14px] truncate leading-tight">{targetUser.name}</span>
                                    <span className="text-gray-500 text-[10px] font-bold tracking-widest truncate">{targetUser.email}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <input 
                                    type={showPasswords ? "text" : "password"} required placeholder="Пароль"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white outline-none focus:border-blue-500 transition-all"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                    {showPasswords ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                            <div className="relative group">
                                <input 
                                    type={showPasswords ? "text" : "password"} required placeholder="Подтверждение"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-all"
                                    value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
                                />
                                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                        {showPasswords ? <EyeOff size={20}/> : <Eye size={20}/>}
                                </button>
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold text-xs tracking-widest active:scale-95 transition-all">
                            {isLoading ? 'Обновление...' : 'Сменить пароль'}
                        </button>
                    </form>
                )}

                {step === 'success' && (
                    <div className="py-6 text-center animate-in zoom-in">
                        <CheckCircle size={50} className="text-emerald-500 mx-auto mb-4" />
                        <p className="text-white font-black text-[10px] tracking-widest leading-relaxed">Готово!<br/>Возвращаемся ко входу...</p>
                    </div>
                )}
            </div>

            {/* ПОДВАЛ (Как в LoginPage) */}
            {(step === 'email' || step === 'password') && (
                <div className="mt-8 text-center">
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-gray-600 hover:text-white transition-colors text-[13px] font-black"
                    >
                        Вспомнили пароль? Войти
                    </button>
                </div>
            )}

            <StatusModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({...modal, isOpen: false})} />
        </div>
    );
}