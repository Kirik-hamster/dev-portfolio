import { useState } from 'react';
import { User } from '@/types';

export const useBanCheck = (user: User | null) => {
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);

    const checkBan = (): boolean => {
        if (user?.banned_until && new Date(user.banned_until) > new Date()) {
            setIsBanModalOpen(true);
            return true;
        }
        return false;
    };

    const closeBanModal = () => setIsBanModalOpen(false);

    return { 
        isBanModalOpen, 
        checkBan, 
        closeBanModal 
    };
};
