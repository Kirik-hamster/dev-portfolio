import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, Shield, CheckCircle, Lock, Key, EyeOff, Eye } from 'lucide-react';
import { User as UserType } from '../../types';
import { AuthApiService } from '../../services/AuthApiService';
import { StatusModal } from '../ui/StatusModal';

interface ProfileInfoProps {
    user: UserType;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
    // Состояния процесса
    const [step, setStep] = useState<'idle' | 'otp' | 'password' | 'success'>('idle');
    const [isLoading, setIsLoading] = useState(false);
    
    // Данные формы
    const [formData, setFormData] = useState({ code: '', password: '', password_confirmation: '' });
    
    // Таймер и модалка
    const [timeLeft, setTimeLeft] = useState(0);
    const [modal, setModal] = useState({ isOpen: false, type: 'error' as 'success' | 'error', title: '', message: '' });
    
    // Возможность посмотреть вводимы пароль
    const [showPasswords, setShowPasswords] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);

    // Логика таймера
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // 1. Запрос кода
    const handleStartReset = async () => {
        setIsLoading(true);
        try {
            const res = await AuthApiService.requestPasswordCode();
            if (res.ok) {
                setStep('otp');
                setTimeLeft(60);
                setTimeout(() => inputRef.current?.focus(), 100);
            } else if (res.status === 429) {
                setModal({ isOpen: true, type: 'error', title: 'Лимит превышен', message: 'Слишком много запросов. Подождите минуту.' });
            }
        } catch (e) {
            setModal({ isOpen: true, type: 'error', title: 'Ошибка', message: 'Не удалось связаться с сервером.' });
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Переход к паролю (когда введено 6 цифр)
    useEffect(() => {
        if (formData.code.length === 6 && step === 'otp') {
            // Мы не проверяем код отдельно, а просто "пропускаем" к вводу пароля. 
            // Финальная проверка будет при отправке всей формы на бэкенд.
            setStep('password');
        }
    }, [formData.code, step]);

    // 3. Финальное обновление
    const handleFinalUpdate = async () => {
        setIsLoading(true);
        try {
            const res = await AuthApiService.updatePassword(formData);
            const data = await res.json();
            
            if (res.ok) {
                setStep('success');
                setModal({ isOpen: true, type: 'success', title: 'Готово!', message: 'Ваш пароль успешно обновлен.' });
                setFormData({ code: '', password: '', password_confirmation: '' });
                setTimeout(() => setStep('idle'), 3000);
            } else {
                setModal({ isOpen: true, type: 'error', title: 'Ошибка', message: data.message || 'Проверьте данные.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Карточка данных */}
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                    <h3 className="text-xl font-black mb-10 uppercase tracking-tighter text-white/90 border-b border-white/5 pb-6 flex items-center gap-3">
                        <UserCircle size={20} className="text-blue-500/50" /> Личные данные
                    </h3>
                    <div className="space-y-6 text-sm relative z-10">
                        <div className="flex justify-between items-center border-b border-white/5 pb-5">
                            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Имя</span>
                            <span className="text-white font-medium text-lg tracking-tight">{user.name}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-5">
                            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Email</span>
                            <span className="text-gray-300 font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Роль</span>
                            <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-tighter">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Карточка безопасности (Многошаговая) */}
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] shadow-2xl backdrop-blur-3xl relative overflow-hidden transition-all duration-500">
                    <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                            <Shield className={step === 'success' ? "text-emerald-500" : "text-blue-500"} size={24}/>
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight text-white/90">
                            {step === 'password' ? 'Новый пароль' : step === 'otp' ? 'Подтверждение' : 'Безопасность'}
                        </h3>
                    </div>

                    <div className="min-h-[220px] flex flex-col justify-center">
                        {step === 'idle' && (
                            <div className="space-y-8 animate-in fade-in duration-500 text-center">
                                <div className="space-y-3">
                                    {/* Яркий, крупный заголовок по делу */}
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                                        Изменить пароль
                                    </h3>
                                    {/* Прямая инструкция без воды */}
                                    <p className="text-[13px] text-gray-400 leading-relaxed max-w-[300px] mx-auto">
                                        Для смены пароля необходимо подтвердить владение аккаунтом. 
                                        Мы отправим <span className="text-blue-400 font-bold">6-значный код</span> на вашу почту.
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={handleStartReset}
                                    disabled={isLoading}
                                    className="w-full py-5 bg-white text-black rounded-[22px] text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-white/5"
                                >
                                    {isLoading ? 'Запрос отправлен...' : 'Запросить код подтверждения'}
                                </button>
                            </div>
                        )}

                        {step === 'otp' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-center">
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Введите код из письма</p>
                                <div className="relative group mx-auto">
                                    <input
                                        ref={inputRef}
                                        value={formData.code}
                                        onChange={e => setFormData({...formData, code: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                                        className="absolute inset-0 opacity-0 z-20 cursor-text"
                                        type="tel"
                                    />
                                    <div className="flex gap-2 justify-center">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className={`w-10 h-14 flex items-center justify-center rounded-xl border transition-all duration-300 
                                                ${formData.code[i] ? 'border-blue-500 text-white bg-blue-500/10' : 'border-white/10 bg-white/5 text-white/20'}`}>
                                                {formData.code[i] || '•'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${timeLeft > 0 ? 'text-blue-400' : 'text-gray-600'}`}>
                                    {timeLeft > 0 ? `Повтор через ${timeLeft}с` : 'Можно отправить снова'}
                                </p>
                                <button onClick={() => setStep('idle')} className="text-[9px] text-gray-600 uppercase font-bold hover:text-gray-400">Отмена</button>
                            </div>
                        )}

                        {step === 'password' && (
                            <div className="space-y-4 animate-in zoom-in duration-500">
                            {/* Поле: Новый пароль */}
                            <div className="relative group">
                                <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input 
                                    type={showPasswords ? "text" : "password"} // Единое состояние
                                    placeholder="Новый пароль"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 pr-12 text-white outline-none focus:border-blue-500/50 transition-all"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)} // Переключает оба
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Поле: Повторите пароль */}
                            <div className="relative group">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input 
                                    type={showPasswords ? "text" : "password"} // Единое состояние
                                    placeholder="Повторите пароль"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 pr-12 text-white outline-none focus:border-blue-500/50 transition-all"
                                    value={formData.password_confirmation}
                                    onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)} // Переключает оба
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button 
                                onClick={handleFinalUpdate}
                                disabled={isLoading || !formData.password}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all"
                            >
                                {isLoading ? 'Обновление...' : 'Обновить пароль'}
                            </button>
                            <button 
                                onClick={() => {
                                    setStep('idle'); // Возвращаемся к начальному состоянию
                                    setFormData({ code: '', password: '', password_confirmation: '' }); // Очищаем форму
                                }} 
                                className="w-full text-[9px] text-gray-600 uppercase font-bold hover:text-gray-400 text-center transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                        )}

                        {step === 'success' && (
                            <div className="py-10 text-center animate-in zoom-in duration-500">
                                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                                <p className="text-white font-bold uppercase text-[10px] tracking-widest">Безопасность усилена</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Глобальная модалка статуса */}
            <StatusModal 
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
        </div>
    );
};