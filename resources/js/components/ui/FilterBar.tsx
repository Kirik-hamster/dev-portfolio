import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Star, Activity, Clock, User as UserIcon, Type, RotateCcw } from 'lucide-react';

interface FilterBarProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    searchType: 'title' | 'author';
    setSearchType: (val: 'title' | 'author') => void;
    sort: 'latest' | 'popular';
    setSort: (val: 'latest' | 'popular') => void;
    favoritesOnly: boolean;
    setFavoritesOnly: (val: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    searchQuery, setSearchQuery, searchType, setSearchType, sort, setSort, favoritesOnly, setFavoritesOnly
}) => {
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    
    const typeRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (typeRef.current && !typeRef.current.contains(e.target as Node)) setIsTypeOpen(false);
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasActiveFilters = searchQuery !== '' || favoritesOnly || sort !== 'latest' || searchType !== 'title';

    return (
        <div className="flex flex-wrap gap-3 mb-12 relative items-stretch">
            
            {/* БЛОК 1: ПОИСК + СЕЛЕКТОР ТИПА */}
            {/* Динамический z-index: если меню открыто, этот блок становится выше всех */}
            <div className={`flex-grow flex-[2] min-w-[280px] flex bg-white/5 border border-white/10 rounded-2xl backdrop-blur-2xl h-12 sm:h-14 relative transition-all focus-within:border-blue-500/30 shadow-2xl ${isTypeOpen ? 'z-[100]' : 'z-20'}`}>
                
                <div className="relative h-full border-r border-white/10" ref={typeRef}>
                    <button 
                        onClick={() => { setIsTypeOpen(!isTypeOpen); setIsSortOpen(false); }}
                        className={`h-full px-4 sm:px-6 flex items-center gap-2.5 text-[9px] sm:text-[10px] font-black uppercase transition-all rounded-l-2xl
                            ${isTypeOpen ? 'bg-white/5 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        {searchType === 'title' ? <Type size={14} className="text-blue-500" /> : <UserIcon size={14} className="text-blue-400" />}
                        <span className="hidden xs:inline">{searchType === 'title' ? 'Текст' : 'Автор'}</span>
                        <ChevronDown size={10} className={`transition-transform duration-300 ${isTypeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isTypeOpen && (
                        <div className="absolute top-[calc(100%+8px)] left-0 w-44 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl">
                            <div className="p-1 flex flex-col gap-0.5">
                                <button 
                                    onClick={() => { setSearchType('title'); setIsTypeOpen(false); }} 
                                    className={`flex items-center gap-3 w-full p-3 rounded-lg text-[9px] font-bold uppercase transition-all ${searchType === 'title' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <Type size={14} /> По названию
                                </button>
                                <button 
                                    onClick={() => { setSearchType('author'); setIsTypeOpen(false); }} 
                                    className={`flex items-center gap-3 w-full p-3 rounded-lg text-[9px] font-bold uppercase transition-all ${searchType === 'author' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <UserIcon size={14} /> По автору
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-grow relative h-full flex items-center group">
                    <Search size={16} className="absolute left-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchType === 'title' ? "Поиск контента..." : "Имя автора..."}
                        className="w-full h-full bg-transparent pl-11 pr-4 outline-none text-[10px] sm:text-xs font-bold text-white placeholder:text-gray-700"
                    />
                </div>
            </div>

            {/* БЛОК 2: УПРАВЛЕНИЕ */}
            {/* Если открыта сортировка, этот блок становится выше поиска */}
            <div className={`flex flex-grow lg:flex-none w-full lg:w-auto gap-2 sm:gap-3 h-12 sm:h-14 relative ${isSortOpen ? 'z-[100]' : 'z-10'}`}>
                
                <div className="flex-grow lg:w-48 relative h-full" ref={sortRef}>
                    <button 
                        onClick={() => { setIsSortOpen(!isSortOpen); setIsTypeOpen(false); }}
                        className={`w-full h-full px-4 rounded-2xl border flex items-center justify-between gap-2 transition-all duration-300 text-[8px] sm:text-[10px] font-black uppercase tracking-widest
                            ${sort === 'popular' ? 'border-blue-500/40 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}
                    >
                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            {sort === 'popular' ? <Activity size={14} /> : <Clock size={14} />}
                            <span className="truncate">{sort === 'popular' ? 'Популярные' : 'Новые'}</span>
                        </div>
                        <ChevronDown size={10} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSortOpen && (
                        <div className="absolute top-[calc(100%+8px)] right-0 lg:left-0 w-full min-w-[180px] bg-[#0d0d0d] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl">
                            <div className="p-1 flex flex-col gap-0.5">
                                <button onClick={() => { setSort('latest'); setIsSortOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-lg text-[9px] font-bold uppercase transition-all ${sort === 'latest' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <Clock size={14} /> Сначала новые
                                </button>
                                <button onClick={() => { setSort('popular'); setIsSortOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-lg text-[9px] font-bold uppercase transition-all ${sort === 'popular' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <Activity size={14} /> Самые популярные
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ИЗБРАННОЕ */}
                <button 
                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                    className={`h-full w-12 sm:w-14 rounded-2xl border flex items-center justify-center transition-all duration-300 shrink-0
                        ${favoritesOnly ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'}`}
                >
                    <Star size={16} fill={favoritesOnly ? "currentColor" : "none"} className={favoritesOnly ? "animate-pulse" : ""} />
                </button>

                {/* СБРОС */}
                <button 
                    onClick={() => { setSearchQuery(''); setSearchType('title'); setSort('latest'); setFavoritesOnly(false); }}
                    className={`h-full w-12 sm:w-14 rounded-2xl border flex items-center justify-center transition-all duration-300 shrink-0
                        ${hasActiveFilters ? 'border-red-500/40 bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/10 bg-white/5 text-gray-600 hover:text-white'}`}
                >
                    <RotateCcw size={16} className={hasActiveFilters ? "animate-spin-slow" : ""} />
                </button>
            </div>
        </div>
    );
};