import React from 'react';
import { Github, Mail, ArrowUpRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer = () => {
    const { settings } = useSettings();
    return (
        <footer className="relative z-50 border-t border-white/5 bg-black/40 backdrop-blur-xl py-20">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-4 text-center md:text-left">
                    <div className="text-xl font-bold tracking-tighter">Мякотин<span className="text-blue-500">Кирилл</span></div>
                    <p className="text-gray-500 text-xs tracking-widest uppercase font-medium">Портфолио резюме блог</p>
                </div>
                <div className="flex flex-col items-center md:items-end gap-6">
                    <div className="flex gap-3">
                        <a href={settings.githubUrl} target="_blank" rel="noreferrer" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all duration-500"><Github size={20} /></a>
                        <a href={`mailto:${settings.email}`} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 transition-all duration-500"><Mail size={20} /></a>
                    </div>
                    <div className="flex items-center gap-6 text-[9px] font-black tracking-[0.4em] text-gray-600 uppercase">
                        <span className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">Resume <ArrowUpRight size={10}/></span>
                        <span>© 2026 KIRILL MYAKOTIN</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};