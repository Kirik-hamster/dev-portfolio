import { User } from '@/types';
import React, { useState } from 'react';

// Используем ту же функцию для куки
function getCookie(name: string) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || '');
}

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Получаем CSRF-cookie
        await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
        
        // 2. Отправляем данные на регистрацию
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '' 
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, password, password_confirmation })
        });

        if (response.ok) {
            // После регистрации Laravel сразу логинит юзера. Запрашиваем данные.
            const userResponse = await fetch('/api/user', { credentials: 'include' });
            if (userResponse.ok) {
                const userData = await userResponse.json();
                onRegisterSuccess(userData);
            }
        } else {
            const errorData = await response.json();
            alert('Ошибка регистрации: ' + JSON.stringify(errorData.errors));
        }
    };

    return (
        <div className="max-w-md mx-auto py-20 animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tighter">Регистрация</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white/[0.02] p-8 rounded-[30px] border border-white/5">
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all" placeholder="Имя" required />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all" placeholder="Email" required />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all" placeholder="Пароль" required />
                <input type="password" value={password_confirmation} onChange={e => setPasswordConfirmation(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all" placeholder="Подтвердите пароль" required />
                <button type="submit" className="w-full py-4 bg-white text-black rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all">Создать аккаунт</button>
            </form>
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