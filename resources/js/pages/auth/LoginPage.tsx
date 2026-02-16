import React, { useState } from 'react';

// 1. Вспомогательная функция для чтения куки
function getCookie(name: string) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || '');
}

export function LoginPage({ 
        onLoginSuccess, 
        onNavigateToRegister
    }: { 
        onLoginSuccess: (user: any) => void,
        onNavigateToRegister: () => void
    }) {
    const [email, setEmail] = useState('kir.myak@bk.ru');
    const [password, setPassword] = useState('qwerty12345678');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '' 
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            // Запрашиваем данные юзера после входа
            const userResponse = await fetch('/api/user', { credentials: 'include' });
            if (userResponse.ok) {
                const userData = await userResponse.json();
                onLoginSuccess(userData);
            }
        } else {
            alert('Ошибка 419 или 401. Проверь консоль и куки.');
        }
    };

    return (
        <div className="max-w-md mx-auto py-20 animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tighter">Вход</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white/[0.02] p-8 rounded-[30px] border border-white/5">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all" placeholder="Email" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-blue-500 transition-all" placeholder="Пароль" />
                <button type="submit" className="w-full py-4 bg-white text-black rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all">Авторизоваться</button>
            </form>
            <div className="mt-6 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Нет аккаунта?</p>
                <button 
                    onClick={onNavigateToRegister} 
                    className="mt-2 text-blue-500 hover:text-white transition-colors text-xs font-black uppercase tracking-tighter"
                >
                    Создать аккаунт
                </button>
            </div>
        </div>
    );
}