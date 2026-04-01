import React, { useEffect, useState } from 'react';
import { SettingsApiService } from '@/services/SettingsApiService';
import { MailSettings, PaginatedResponse, User } from '@/types';

// Импортируем наши новые кусочки
import { ConfigTab } from './ConfigTab';
import { UsersTab } from './UsersTab';
import { AdminTabs } from './AdmintPanel';
import { ContentTab } from './ContentTab';
import { useSettings } from '@/context/SettingsContext';
import { ModerationApiService } from '@/services/ModerationApiService';

export interface AdminPanelProps {
    allBlogsCount: number; 
    demoDuration: number;
    setDemoDuration: (d: number) => void;
    startDemo: () => void;
    cancelDemo: () => void;
    demoLoading: boolean;
}

export const AdminPanel = ({ 
    demoDuration, setDemoDuration, startDemo, cancelDemo, demoLoading 
}: AdminPanelProps) => {
    const [activeSubTab, setActiveSubTab] = useState<'config' | 'content' | 'users'>('config');
    const { settings, setSettings } = useSettings();

    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [mailConfig, setMailConfig] = useState<MailSettings>({
        mail_host: '', mail_port: '465', mail_username: '', mail_from_name: ''
    });
    const [testEmail, setTestEmail] = useState('');

    // --- LOGIC: USERS ---
    const fetchUsers = async (page: number = 1) => {
        const res: PaginatedResponse<User> = await SettingsApiService.getUsers(searchQuery, page);
        setUsers(res.data);
        setCurrentPage(res.current_page);
        setLastPage(res.last_page);
    };

    useEffect(() => {
        if (activeSubTab === 'users') fetchUsers(currentPage);
    }, [activeSubTab, searchQuery, currentPage]);

    const toggleMediaAccess = async (targetUser: User) => {
        const newRole = targetUser.role.includes('-img') 
            ? targetUser.role.replace('-img', '') 
            : `${targetUser.role}-img`;

        const res = await SettingsApiService.updateUserRole(targetUser.id, newRole);
        if (res.ok) setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
    };

    // --- Ban/Unban

    const handleBan = async (targetUser: User) => {
        const input = window.prompt(`На сколько часов забанить ${targetUser.name}? (0.016 ≈ 1 мин, 0 = навсегда)`, "24");
        
        if (input !== null) {
            // Заменяем запятую на точку, если ввели по-русски, и превращаем в число
            const hours = parseFloat(input.replace(',', '.'));
            
            if (isNaN(hours)) {
                alert("Введите корректное число");
                return;
            }

            const res = await ModerationApiService.banUser(targetUser.id, hours);
            if (res.ok) {
                fetchUsers(currentPage);
            } else {
                alert("Ошибка при блокировке");
            }
        }
    };

    const handleUnban = async (targetUser: User) => {
        if (window.confirm(`Разблокировать пользователя ${targetUser.name}?`)) {
            // Мы прописали роут в api.php, давай вызовем его
            // Можно добавить метод в ModerationApiService или вызвать напрямую:
            const res = await fetch(`/api/admin/users/${targetUser.id}/unban`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('XSRF-TOKEN=')[1]?.split(';')[0] || '')
                },
                credentials: 'include'
            });

            if (res.ok) {
                fetchUsers(currentPage);
            }
        }
    };

    // --- LOGIC: SMTP ---
    useEffect(() => {
        SettingsApiService.getMail().then(setMailConfig).catch(() => {});
    }, []);

    const handleSaveMail = async () => {
        const res = await SettingsApiService.updateMail(mailConfig);
        if (res.ok) alert("Настройки сохранены!");
    };

    return (
        <div className="space-y-6 sm:space-y-12 animate-in fade-in duration-500">
            <AdminTabs activeTab={activeSubTab} onTabChange={setActiveSubTab} />

            {activeSubTab === 'users' && (
                <UsersTab 
                    users={users} searchQuery={searchQuery} onSearch={setSearchQuery}
                    onToggleAccess={toggleMediaAccess} currentPage={currentPage}
                    lastPage={lastPage} onPageChange={setCurrentPage}
                    onBan={handleBan} onUnban={handleUnban}
                />
            )}

            {activeSubTab === 'config' && (
                <ConfigTab 
                    mailConfig={mailConfig} setMailConfig={setMailConfig}
                    testEmail={testEmail} setTestEmail={setTestEmail}
                    onSave={handleSaveMail} onTest={() => SettingsApiService.testMail(testEmail)}
                />
            )}

            {activeSubTab === 'content' && (
                <ContentTab 
                    settings={settings} setSettings={setSettings}
                    demoDuration={demoDuration} setDemoDuration={setDemoDuration}
                    startDemo={startDemo} cancelDemo={cancelDemo} demoLoading={demoLoading}
                />
            )}
        </div>
    );
};