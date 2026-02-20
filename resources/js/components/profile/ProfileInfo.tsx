import React from 'react';
import { UserCircle, Shield } from 'lucide-react';
import { User as UserType } from '../../types';

interface ProfileInfoProps {
    user: UserType;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
    return (
        <div className="max-w-6xl animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Карточка данных */}
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] shadow-2xl shadow-black/20 backdrop-blur-3xl relative overflow-hidden group">
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                    <h3 className="text-xl font-black mb-10 uppercase tracking-tighter text-white/90 border-b border-white/5 pb-6 flex items-center gap-3">
                        <UserCircle size={20} className="text-blue-500/50" /> Личные данные
                    </h3>
                    <div className="space-y-6 text-sm relative z-10">
                        <div className="flex justify-between items-center border-b border-white/5 pb-5">
                            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Имя</span>
                            <span className="text-white font-medium text-lg tracking-tight">{user.name}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-5">
                            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Email</span>
                            <span className="text-gray-300 font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Роль</span>
                            <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-tighter">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Карточка безопасности */}
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[40px] shadow-2xl shadow-black/20 backdrop-blur-3xl relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                            <Shield className="text-blue-500" size={24}/>
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight text-white/90">Безопасность</h3>
                    </div>
                    <div className="space-y-6">
                        <p className="text-[12px] text-gray-500 leading-relaxed italic">Управляйте доступом к вашему аккаунту. Мы рекомендуем регулярно обновлять пароль.</p>
                        <button className="w-full py-5 bg-white/5 border border-white/10 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                            Сбросить текущий пароль
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};