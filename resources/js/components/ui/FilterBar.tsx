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

    const handleReset = () => {
        setSearchQuery('');
        setSearchType('title');
        setSort('latest');
        setFavoritesOnly(false);
    };

    const hasActiveFilters = searchQuery !== '' || favoritesOnly || sort !== 'latest' || searchType !== 'title';

    return (
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 mb-16 items-stretch relative z-50 animate-in fade-in slide-in-from-top-4 duration-700">
            
            {/* РЯД 1: ГЛОБАЛЬНЫЙ ПОИСК (Всегда тянется) */}
            <div className={`flex-grow lg:flex-[3] flex bg-white/[0.05] border border-white/10 rounded-[22px] backdrop-blur-3xl h-14 relative transition-all duration-500
                ${isTypeOpen ? 'z-[70] border-blue-500/50 ring-4 ring-blue-500/5' : 'z-40 focus-within:border-white/20 shadow-2xl'}`}
            >
                {/* СЕЛЕКТОР ТИПА */}
                <div className="relative border-r border-white/10" ref={typeRef}>
                    <button 
                        onClick={() => setIsTypeOpen(!isTypeOpen)}
                        className="h-full px-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-all group"
                    >
                        {searchType === 'title' ? <Type size={14} className="text-blue-500" /> : <UserIcon size={14} className="text-blue-500" />}
                        <span className="hidden sm:inline">{searchType === 'title' ? 'Название' : 'Автор'}</span>
                        <ChevronDown size={12} className={`transition-transform duration-300 ${isTypeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isTypeOpen && (
                        <div className="absolute top-[115%] left-0 w-52 bg-[#0d0d0d] border border-white/15 rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden z-[100] backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-2 flex flex-col gap-1">
                                <button onClick={() => { setSearchType('title'); setIsTypeOpen(false); }} className={`flex items-center gap-3 w-full p-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchType === 'title' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <Type size={14} /> По названию
                                </button>
                                <button onClick={() => { setSearchType('author'); setIsTypeOpen(false); }} className={`flex items-center gap-3 w-full p-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchType === 'author' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <UserIcon size={14} /> По автору
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ПОЛЕ ВВОДА */}
                <div className="flex-1 relative h-full group">
                    <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchType === 'title' ? "Что ищем сегодня?" : "Имя автора..."}
                        className="w-full h-full bg-transparent pl-16 pr-8 outline-none text-xs placeholder:text-gray-600 font-bold text-white/90"
                    />
                </div>
            </div>

            {/* РЯД 2: ПАНЕЛЬ ФИЛЬТРОВ (Тянется на всю ширину при переносе) */}
            <div className="flex flex-grow lg:flex-1 gap-3">
                
                {/* ШИРОКИЙ СЕЛЕКТОР СОРТИРОВКИ (Теперь он главный ширик) */}
                <div className="relative h-14 flex-grow min-w-[200px]" ref={sortRef}>
                    <button 
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className={`w-full h-full px-7 rounded-[22px] border flex items-center justify-between gap-4 transition-all duration-500 text-[10px] font-black uppercase tracking-widest
                            ${sort === 'popular' ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/10 bg-white/[0.05] text-gray-300 hover:text-white hover:border-white/20'}`}
                    >
                        <div className="flex items-center gap-3">
                            {sort === 'popular' ? <Activity size={14} className="text-blue-500" /> : <Clock size={14} />}
                            <span>{sort === 'popular' ? 'Самые популярные' : 'Сначала новые'}</span>
                        </div>
                        <ChevronDown size={12} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSortOpen && (
                        <div className="absolute top-[115%] right-0 lg:left-0 w-full min-w-[240px] bg-[#0d0d0d] border border-white/15 rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden z-[100] backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-2 flex flex-col gap-1">
                                <button onClick={() => { setSort('latest'); setIsSortOpen(false); }} className={`flex items-center gap-4 w-full p-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sort === 'latest' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <Clock size={14} /> Свежие публикации
                                </button>
                                <button onClick={() => { setSort('popular'); setIsSortOpen(false); }} className={`flex items-center gap-4 w-full p-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sort === 'popular' ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                    <Activity size={14} /> Самые популярные
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* КОМПАКТНОЕ ИЗБРАННОЕ */}
                <button 
                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                    className={`h-14 px-7 rounded-[22px] border flex items-center justify-center gap-3 transition-all duration-500 text-[10px] font-black uppercase tracking-widest shrink-0
                        ${favoritesOnly ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-500 shadow-[0_0_35px_rgba(234,179,8,0.2)]' : 'border-white/10 bg-white/[0.05] text-gray-300 hover:text-white hover:border-white/20'}`}
                >
                    <Star size={14} fill={favoritesOnly ? "currentColor" : "none"} className={favoritesOnly ? "animate-pulse" : ""} />
                    <span className="hidden sm:inline">Избранное</span>
                </button>

                {/* КНОПКА СБРОСА: Солидная и заметная */}
                <button 
                    onClick={handleReset}
                    title="Сбросить все настройки"
                    className={`h-14 w-14 rounded-[22px] border transition-all duration-500 flex items-center justify-center group shrink-0
                        ${hasActiveFilters 
                            ? 'border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                            : 'border-white/15 bg-white/[0.08] text-gray-500 hover:text-white hover:border-white/30'}`}
                >
                    <RotateCcw size={16} className={`transition-all duration-700 ${hasActiveFilters ? 'group-hover:rotate-[-180deg]' : 'opacity-40'}`} />
                </button>
            </div>
        </div>
    );
};