import React, { useEffect, useState, useCallback } from 'react';
import { StatsApiService } from '@/services/StatsApiService';
import { PremiumLoader } from '@/components/PremiumLoader';
import { ActivityDetailsModal } from '@/components/ui/moderation/ActivityDetailsModal';

import { StatsChart } from './StatsChart';
import { StatsCards } from './StatsCards';
import { StatsTable } from './StatsTable';

// Импортируем наши типы
import { StatsSummary, UserStatRow, ModalUserInfo, RawLog } from '@/types/stats';

export const StatsTab = () => {
    const [summary, setSummary] = useState<StatsSummary | null>(null);
    const [details, setDetails] = useState<UserStatRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'users' | 'guests'>('all');
    const [period, setPeriod] = useState<number>(14);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [expandedId, setExpandedId] = useState<string | null>(null);
    
    const [pathModal, setPathModal] = useState<{
        isOpen: boolean;
        data: RawLog[];
        loading: boolean;
        userInfo: ModalUserInfo | null;
    }>({ 
        isOpen: false, data: [], loading: false, userInfo: null 
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // 🛡 ФИНАЛЬНЫЙ ФИКС ОШИБКИ 2322: 
            // TS ругается на возможный undefined, поэтому делаем максимально жестко
            const fromField = dateRange.from || '';
            let finalFrom: string = fromField;

            if (period > 0 && !fromField) {
                const d = new Date();
                d.setDate(d.getDate() - period);
                const isoString = d.toISOString();
                // Гарантируем, что результат split — это строка
                finalFrom = isoString.split('T')[0] ?? '';
            }

            const [s, d] = await Promise.all([
                StatsApiService.getSummary(filter, finalFrom, dateRange.to || ''),
                StatsApiService.getUserStats(filter, finalFrom, dateRange.to || '')
            ]);
            
            setSummary(s);
            setDetails(Array.isArray(d) ? d : []);
        } catch (e) {
            console.error("Ошибка аналитики:", e);
            setDetails([]);
        } finally {
            setLoading(false);
        }
    }, [filter, period, dateRange]);

    useEffect(() => { loadData(); }, [loadData]);

    const openDetails = async (userId: number | null, ip: string, date: string) => {
        const found = details.find(d => userId ? d.user_id === userId : (d.ip_address === ip && d.is_guest));
        
        // 🛡 ИСПРАВЛЕНИЕ ОШИБКИ 2375: Явное соответствие ModalUserInfo
        const modalInfo: ModalUserInfo = {
            id: found?.user?.id ?? undefined,
            name: found?.user?.name ?? 'Анонимный гость',
            email: found?.user?.email ?? undefined,
            role: found?.user?.role ?? undefined,
            ip: ip,
            isGuest: !userId
        };

        setPathModal({
            isOpen: true,
            loading: true,
            data: [],
            userInfo: modalInfo
        });

        try {
            const res = await StatsApiService.getPathDetails(userId, ip, date);
            setPathModal(prev => ({ 
                ...prev, 
                data: Array.isArray(res) ? res : [], 
                loading: false 
            }));
        } catch (e) {
            setPathModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
    };

    if (loading && !summary) return (
        <div className="py-32 flex flex-col items-center justify-center">
            <PremiumLoader />
            <span className="mt-4 text-[10px] font-black uppercase text-blue-500/50 tracking-widest">Анализ данных...</span>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <StatsChart 
                summary={summary} 
                period={period} 
                setPeriod={setPeriod} 
                dateRange={dateRange} 
                setDateRange={setDateRange} 
            />
            
            <StatsCards 
                summary={summary} 
                filter={filter} 
                setFilter={setFilter} 
            />

            <StatsTable 
                details={details} 
                summary={summary} 
                expandedId={expandedId} 
                setExpandedId={setExpandedId} 
                openDetails={openDetails} 
            />

            <ActivityDetailsModal 
                isOpen={pathModal.isOpen}
                onClose={() => setPathModal(prev => ({ ...prev, isOpen: false }))}
                loading={pathModal.loading}
                data={pathModal.data}
                userInfo={pathModal.userInfo}
            />
        </div>
    );
};