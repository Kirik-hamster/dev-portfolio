import React from 'react';
import { User } from '../types';
import { Plus, ArrowRight } from 'lucide-react';

interface BlogsPageProps {
    user: User | null;
    onNavigateToProfile: () => void;
}

export function BlogsPage({ user, onNavigateToProfile }: BlogsPageProps) {
    const popularTags = ['Architecture', 'React', 'Laravel', 'DevOps', 'UI Design'];

    return (
        <div className="pb-20 animate-in fade-in duration-700">
            {/* ВТОРОЙ ХЕДЕР — МИНИМАЛИСТИЧНАЯ КАПСУЛА */}
            <div className="sticky top-24 z-40 mb-16 px-6">
                <div className="max-w-2xl mx-auto bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full p-2 px-6 flex items-center justify-between shadow-2xl shadow-black">
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest border-r border-white/10 pr-4">Trends</span>
                        {popularTags.map(tag => (
                            <button key={tag} className="text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors whitespace-nowrap">
                                {tag}
                            </button>
                        ))}
                    </div>
                    {user && (
                        <button 
                            onClick={onNavigateToProfile}
                            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-[9px] font-black uppercase text-white transition-all whitespace-nowrap flex items-center gap-2"
                        >
                            Написать <Plus size={10} />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {/* ЗАГОЛОВОК + НОВАЯ КНОПКА */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Блоги сообщества</h1>
                        <p className="text-gray-500 uppercase text-[10px] tracking-[0.4em] font-medium">Читайте и делитесь знаниями</p>
                    </div>
                    
                    {/* Кнопка рядом с заголовком */}
                    <button 
                        onClick={onNavigateToProfile}
                        className="flex items-center gap-3 px-6 py-3 border border-white/5 bg-white/[0.02] hover:bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all group"
                    >
                        Мои публикации <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                
                {/* СЕТКА (БЕЗ КАРТОЧКИ СТАТЬ АВТОРОМ) */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-20 border border-white/5 bg-white/[0.01] rounded-[40px] flex items-center justify-center text-center relative overflow-hidden group">
                        {/* Очень слабое синее свечение в центре, как на главной */}
                        <div className="absolute inset-0 bg-blue-500/[0.02] blur-[100px]" />
                        
                        <p className="relative z-10 text-gray-600 uppercase text-[10px] font-black tracking-[0.5em] italic opacity-40">
                            Waiting for the first story...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}