import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Описываем, какие данные будут лежать в "облаке"
interface Settings {
    email: string;
    githubUrl: string;
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