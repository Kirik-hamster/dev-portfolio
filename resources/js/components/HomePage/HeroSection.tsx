import React from 'react';
import { ArrowUpRight, Image as ImageIcon } from 'lucide-react';

interface HeroSectionProps {
    name: string;
    specialization: string;
    photoUrl?: string;
    onNavigate: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ name, specialization, photoUrl, onNavigate }) => (
    <header className="flex flex-row items-start gap-4 sm:gap-12 mb-6 sm:mb-10 animate-in fade-in duration-1000 w-full">
        <div className="relative flex-shrink-0">
            <div className="w-28 h-28 sm:w-44 sm:h-44 rounded-[28px] sm:rounded-[45px] bg-[#111] border border-white/10 p-1 shadow-2xl overflow-hidden group">
                <div className="w-full h-full bg-[#050505] rounded-[24px] sm:rounded-[38px] flex items-center justify-center border border-white/5 overflow-hidden">
                    {photoUrl ? (
                        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={32} className="text-white/5 sm:w-12 sm:h-12" />
                    )}
                </div>
            </div>
        </div>

        <div className="text-left flex-1 min-w-0 pt-0"> 
            <div className="space-y-0.5 sm:space-y-2 mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-6xl font-black tracking-tighter text-white uppercase italic leading-[0.9] break-words">
                    {name}
                </h1>
                <p className="text-[8px] sm:text-sm text-blue-500 font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] opacity-90">
                    {specialization}
                </p>
            </div>
            
            <button 
                onClick={onNavigate} 
                className="px-4 py-2 sm:px-10 sm:py-4 bg-white text-black rounded-lg sm:rounded-2xl font-black text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 shadow-xl active:scale-95 whitespace-nowrap"
            >
                Моё портфолио <ArrowUpRight size={14} className="w-3 h-3 sm:w-5 sm:h-5" />
            </button>
        </div>
    </header>
);