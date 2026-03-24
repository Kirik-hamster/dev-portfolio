import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// 1. Описываем, какие данные будут лежать в "облаке"
interface Settings {
    email: string;
    githubUrl: string;
    resumeUrl?: string;
}

// 2. Описываем структуру самого контекста (данные + функция их смены)
interface SettingsContextType {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<Settings>({
        email: 'kir.myak@bk.ru',
        githubUrl: 'https://github.com/Kirik-hamster'
    });

    useEffect(() => {
        fetch('/api/home-settings')
            .then(res => res.json())
            .then(data => {
                setSettings({
                    email: data.email,
                    githubUrl: data.githubUrl,
                    resumeUrl: data.resumeUrl // ⚡️ Проверь, что это поле записывается!
                });
            });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Удобный хук, чтобы не писать useContext(SettingsContext) каждый раз
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
};