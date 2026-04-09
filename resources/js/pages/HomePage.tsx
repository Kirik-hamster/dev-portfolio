import React, { useEffect, useState } from 'react';
import { ScrollToTop } from '../components/ui/ScrollToTop';
import { User } from '../types/types';

// Импорт кусочков
import { AdminBar } from '../components/HomePage/AdminBar';
import { HeroSection } from '../components/HomePage/HeroSection';
import { TechStack } from '../components/HomePage/TechStack';
import { EditModal } from '../components/ui/HomePage/EditModal';
import { BioSection } from '@/components/HomePage/BioSection';
import { HomeApiService } from '@/services/HomeApiService';
import { PremiumLoader } from '@/components/PremiumLoader';
import { StatusModal } from '@/components/ui/StatusModal';


interface HomePageProps {
    onNavigateToPortfolio: () => void;
    user: User | null;
}

export function HomePage({ onNavigateToPortfolio, user }: HomePageProps) {
    const isAdmin = user?.role === 'admin';
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        type: 'success' as 'success' | 'error',
        title: '',
        message: ''
    });

    const [data, setData] = useState({ name: "", specialization: "", aboutText: "", photoUrl: "" });
    const [stack, setStack] = useState({ current: "", learning: "" });

    // ЗАГРУЗКА ИЗ БД
    useEffect(() => {
        HomeApiService.fetchSettings().then(res => {
            setData({
                name: res.name || "",
                specialization: res.specialization || "",
                aboutText: res.about_text || "", // ⚡️ Гарантируем строку вместо undefined
                photoUrl: res.photo_url || ""
            });
            setStack({
                current: res.stack_current || "",
                learning: res.stack_learning || ""
            });
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        const success = await HomeApiService.updateSettings({
            name: data.name,
            specialization: data.specialization,
            about_text: data.aboutText,
            photo_url: data.photoUrl,
            stack_current: stack.current,
            stack_learning: stack.learning
        });

        if (success) {
            setIsEditing(false);
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Обновлено',
                message: 'Данные главной страницы успешно синхронизированы с базой данных.'
            });
        } else {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Ошибка',
                message: 'Не удалось сохранить изменения. Проверьте соединение или права доступа.'
            });
        }
    };

    if (loading) return <PremiumLoader />;

    return (
        <div className="max-w-5xl mx-auto px-6 relative selection:bg-blue-500/30">
            <ScrollToTop />

            {/* ADMIN BAR (Зона управления) */}
            <AdminBar isAdmin={isAdmin} onEdit={() => setIsEditing(true)} />

            {/* CONTENT */}
            <div className="pt-0 pb-32">
                <HeroSection 
                    name={data.name} 
                    specialization={data.specialization} 
                    photoUrl={data.photoUrl} 
                    onNavigate={onNavigateToPortfolio} 
                />

                <BioSection aboutText={data.aboutText} />

                <TechStack current={stack.current} learning={stack.learning} />
            </div>

            {/* MODALS */}
            <EditModal 
                isOpen={isEditing} 
                onClose={() => setIsEditing(false)} 
                onSave={handleSave}
                data={data} setData={setData}
                stack={stack} setStack={setStack}
            />
            {/* МОДАЛКА СТАТУСА */}
            <StatusModal 
                {...statusModal} 
                onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))} 
            />
        </div>
    );
}