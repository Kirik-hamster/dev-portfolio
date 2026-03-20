import React from 'react';
import { Shield, Edit3 } from 'lucide-react';

interface AdminBarProps {
    isAdmin: boolean;
    onEdit: () => void;
}

export const AdminBar: React.FC<AdminBarProps> = ({ isAdmin, onEdit }) => {
    if (!isAdmin) return <div className="h-8" />; // Заглушка для "воздуха" у юзера

    return (
        <div className="h-12 flex items-center mb-6">
            <div className="w-full bg-blue-600/5 border border-blue-500/10 py-1.5 px-5 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2">
                    <Shield size={12} className="text-blue-500/50" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-500/50">System Operator Active</span>
                </div>
                <button 
                    onClick={onEdit} 
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-95"
                >
                    <Edit3 size={10} className="inline mr-1" /> Edit Content
                </button>
            </div>
        </div>
    );
};