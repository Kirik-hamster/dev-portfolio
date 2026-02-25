import React, { useEffect, useState, useRef } from 'react';

const VERIFY_CONFIG = {
    CODE_LENGTH: 6,
    TIMER_SECONDS: 60,
    API_RESEND: '/api/verify-resend',
    API_VERIFY: '/api/verify-code'
} as const;

function getCookie(name: string) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || '');
}

export function VerifyCodePage({ onVerified }: { onVerified: () => void }) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [status, setStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    

    const [timeLeft, setTimeLeft] = useState<number>(VERIFY_CONFIG.TIMER_SECONDS);
    const inputRef = useRef<HTMLInputElement>(null);
    const effectRan = useRef(false);

    // Логика обратного отсчета
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer); // Очистка при размонтировании
    }, [timeLeft]);

    useEffect(() => {
        if (effectRan.current) return;
        handleResend(true);
        effectRan.current = true;
        inputRef.current?.focus();
    }, []);

    const handleResend = async (isInitial = false) => {
        if (isResending || (!isInitial && timeLeft > 0)) return;
        setIsResending(true);
        setStatus(null);
        try {
            const response = await fetch(VERIFY_CONFIG.API_RESEND, {
                method: 'POST',
                headers: { 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '' },
                credentials: 'include'
            });

            // ПРОВЕРЯЕМ, ЧТО СЕРВЕР РЕАЛЬНО ОТПРАВИЛ КОД
            if (response.ok) {
                setTimeLeft(VERIFY_CONFIG.TIMER_SECONDS);
                setCode(''); 
                if (!isInitial) setStatus({ message: 'Код отправлен', type: 'success' });
            } else if (response.status === 429) {
                setStatus({ message: 'Слишком много запросов. Подождите минуту.', type: 'error' });
            } else {
                // Если ошибка 429 (Throttle), пишем об этом
                const error = await response.json();
                setStatus({ message: error.message || 'Ошибка отправки', type: 'error' });
            }
        } catch (e) {
            setStatus({ message: 'Ошибка связи', type: 'error' });
        } finally {
            setIsResending(false);
        }
    };

    const handleVerify = async () => {

        if (timeLeft <= 0) {
            setStatus({ message: 'Время истекло!', type: 'error' });
            return;
        }

        setIsLoading(true);
        setStatus(null);
        
        try {
            const response = await fetch(VERIFY_CONFIG.API_VERIFY, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || ''
                },
                credentials: 'include',
                body: JSON.stringify({ code })
            });

            if (response.ok) {
                onVerified();
            } else {
                const data = await response.json();
                setStatus({ message: data.message || 'Ошибка', type: 'error' });
                if (response.status === 422) setCode('');
                inputRef.current?.focus();
            }
        } catch (e) {
            setStatus({ message: 'Ошибка связи с сервером', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Обработчик клика по контейнеру с цифрами
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

return (
        <div className="max-w-md mx-auto py-20 animate-in fade-in zoom-in duration-700">
            <div className="relative p-12 bg-white/[0.01] rounded-[50px] border border-white/5 text-center backdrop-blur-3xl shadow-2xl overflow-hidden">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[80px] pointer-events-none" />
                <h2 className="relative z-10 text-4xl font-black mb-2 uppercase tracking-tighter text-white">
                    Верификация
                </h2>
                <p className="relative z-10 text-white/70 mb-10 text-[11px] font-bold uppercase tracking-[0.3em] leading-relaxed">
                    Введите 6-значный ключ, <br/> отправленный на почту
                </p>
                
                
                <div className="relative z-10 space-y-8">
                    <div className="relative group cursor-text" onClick={() => inputRef.current?.focus()}>
                        <input
                            ref={inputRef}
                            value={code}
                            onChange={e => {
                                if (status) setStatus(null)
                                setCode(e.target.value.replace(/\D/g, '').slice(0, VERIFY_CONFIG.CODE_LENGTH))
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-text caret-transparent"
                            type="tel"
                            disabled={timeLeft <= 0}
                        />

                        <div className="flex gap-3 justify-center">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className={`w-14 h-20 flex items-center justify-center rounded-2xl border text-4xl font-black transition-all duration-300
                                    ${index === code.length ? 'border-blue-500/50 bg-white/[0.07] scale-105' : 'border-white/10 bg-white/[0.03]'}
                                    ${code[index] ? 'text-white border-white/30' : 'text-white/20'}
                                    ${timeLeft <= 0 ? 'grayscale opacity-50' : ''}
                                `}>
                                    {code[index] || <div className="w-2 h-2 rounded-full bg-current opacity-50" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-4">
                        {status && (
                            <p className={`text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-1 ${status.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {status.message}
                            </p>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleVerify} 
                        disabled={isLoading || code.length !== VERIFY_CONFIG.CODE_LENGTH || timeLeft <= 0}
                        className="w-full py-6 bg-white text-black rounded-full font-black uppercase text-[12px] tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-10"
                    >
                        {isLoading ? 'Проверка...' : 'Подтвердить'}
                    </button>

                    <button 
                        onClick={() => handleResend()}
                        disabled={timeLeft > 0 || isResending}
                        className={`block w-full text-[10px] uppercase font-black tracking-[0.2em] transition-all
                            ${timeLeft > 0 ? 'text-blue-400 cursor-not-allowed drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-gray-400 hover:text-blue-400'}`}
                    >
                        {timeLeft > 0 ? `Повтор через ${timeLeft}с` : 'Отправить код повторно'}
                    </button>
                </div>
            </div>
        </div>
    );
}