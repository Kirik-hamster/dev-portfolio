import React from 'react';
import { MailSettings } from '@/types/types';

interface Props {
    mailConfig: MailSettings;
    setMailConfig: (config: MailSettings) => void;
    testEmail: string;
    setTestEmail: (email: string) => void;
    onSave: () => void;
    onTest: () => void;
}

export const ConfigTab: React.FC<Props> = ({ 
    mailConfig, setMailConfig, testEmail, setTestEmail, onSave, onTest 
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-4">
            <input 
                placeholder="SMTP Host (e.g. smtp.gmail.com)" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500/50 text-white"
                value={mailConfig.mail_host}
                onChange={e => setMailConfig({...mailConfig, mail_host: e.target.value})}
            />
            <input 
                placeholder="SMTP Port (465 or 587)" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none text-white"
                value={mailConfig.mail_port}
                onChange={e => setMailConfig({...mailConfig, mail_port: e.target.value})}
            />
            <input 
                placeholder="Username (email)" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none text-white"
                value={mailConfig.mail_username}
                onChange={e => setMailConfig({...mailConfig, mail_username: e.target.value})}
            />
            <input 
                type="password"
                placeholder="Password (App Password)" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none text-white"
                value={mailConfig.mail_password || ''}
                onChange={e => setMailConfig({...mailConfig, mail_password: e.target.value})}
            />
            <input 
                placeholder="Имя отправителя (например, Kirill Portfolio)" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none text-white"
                value={mailConfig.mail_from_name}
                onChange={e => setMailConfig({...mailConfig, mail_from_name: e.target.value})}
            />
            <button onClick={onSave} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                Сохранить конфигурацию
            </button>
        </div>

        <div className="p-6 sm:p-10 bg-blue-500/5 border border-blue-500/10 rounded-[30px] flex flex-col justify-center gap-4">
            <h4 className="text-white font-bold uppercase text-[10px] sm:text-xs">Проверка связи</h4>
            <input 
                placeholder="Куда отправить тест?" 
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm outline-none mb-4 text-white"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
            />
            <button className="w-full py-4 bg-white text-black rounded-xl sm:rounded-2xl font-black uppercase text-[10px] active:scale-95">
                Тест
            </button>
        </div>
    </div>
);