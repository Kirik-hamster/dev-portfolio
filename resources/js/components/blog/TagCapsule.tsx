import React, { useState, useRef, useEffect } from 'react';
import { Tag, X, Search, LayoutGrid, List, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface TagCapsuleProps {
    isSearchMode: boolean;
    setIsSearchMode: (val: boolean) => void;
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
    globalTags: string[];
    setCurrentPage: (page: number) => void;
    viewMode: 'blogs' | 'posts';
    setViewMode: (mode: 'blogs' | 'posts') => void;
    setSelectedBlogId: (id: number | null) => void;
    isInsideBlog?: boolean;
}

export const TagCapsule: React.FC<TagCapsuleProps> = ({
    isInsideBlog = false, isSearchMode, setIsSearchMode, selectedTag, setSelectedTag, globalTags,
    setCurrentPage, viewMode, setViewMode, setSelectedBlogId
}) => {
    const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Функция проверки: есть ли куда крутить
    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2); // -2 для запаса на округление
        }
    };

    // Проверяем при загрузке, ресайзе и прокрутке
    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [globalTags]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsViewDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 150;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="sticky top-20 sm:top-24 z-40 mb-10 sm:mb-16 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full p-1.5 sm:p-2 pl-4 sm:pl-6 pr-2 flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                
                {/* ЛЕВАЯ ЧАСТЬ: ИКОНКА + ТЕГИ */}
                <div className="flex items-center gap-2 sm:gap-4 flex-grow overflow-hidden">
                    <Tag size={12} className="text-blue-500 shrink-0" />
                    
                    <div className="flex items-center flex-grow overflow-hidden relative">
                        {/* Стрелка ВЛЕВО (Только мобилка) */}
                        {!isSearchMode && canScrollLeft && (
                            <button 
                                onClick={() => scroll('left')} 
                                className="p-1 text-gray-500 hover:text-blue-500 active:scale-75 transition-all shrink-0"
                            >
                                <ChevronLeft size={14} />
                            </button>
                        )}

                        <div 
                            ref={scrollContainerRef}
                            onScroll={checkScroll}
                            className="flex items-center gap-3 sm:gap-5 overflow-x-hidden no-scrollbar py-1 flex-grow"
                        >
                            {isSearchMode ? (
                                <input 
                                    autoFocus type="text" placeholder="Поиск..." value={selectedTag || ''} 
                                    onChange={(e) => { setSelectedTag(e.target.value || null); setCurrentPage(1); }}
                                    className="bg-transparent border-none outline-none text-[9px] sm:text-[10px] font-bold uppercase text-white w-full placeholder:text-gray-600"
                                />
                            ) : (
                                <>
                                    <button 
                                        onClick={() => { setSelectedTag(null); setCurrentPage(1); }} 
                                        className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest shrink-0 ${!selectedTag ? 'text-white' : 'text-gray-500'}`}
                                    >
                                        All
                                    </button>
                                    {globalTags.map((tag) => (
                                        <button 
                                            key={tag} 
                                            onClick={() => { setSelectedTag(tag); setCurrentPage(1); }} 
                                            className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest whitespace-nowrap shrink-0 transition-all ${selectedTag === tag ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Стрелка ВПРАВО (Только мобилка, слева от лупы) */}
                        {!isSearchMode && canScrollRight && (
                            <button 
                                onClick={() => scroll('right')} 
                                className="p-1 text-gray-500 hover:text-blue-500 active:scale-75 transition-all shrink-0"
                            >
                                <ChevronRight size={14} />
                            </button>
                        )}

                        {/* КНОПКА ПОИСКА (Лупа) */}
                        <button 
                            onClick={() => { setIsSearchMode(!isSearchMode); if (isSearchMode) setSelectedTag(null); }} 
                            className={`ml-2 sm:ml-3 pr-3 sm:pr-4 border-r border-white/10 transition-all shrink-0 ${isSearchMode ? 'text-red-500' : 'text-gray-500 hover:text-white'}`}
                        >
                            {isSearchMode ? <X size={14} /> : <Search size={14} />}
                        </button>
                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ: ДЕКСТОП (Кнопки) / МОБИЛКА (Дропдаун) */}
                {!isInsideBlog && (
                    <div className="flex items-center ml-2">
                        {/* Вид для Десктопа: Обычные кнопки */}
                        <div className="hidden sm:flex items-center gap-1">
                            <button onClick={() => { setViewMode('blogs'); setSelectedBlogId(null); setCurrentPage(1); }} className={`p-2 rounded-full transition-all ${viewMode === 'blogs' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}><LayoutGrid size={14} /></button>
                            <button onClick={() => { setViewMode('posts'); setSelectedBlogId(null); setCurrentPage(1); }} className={`p-2 rounded-full transition-all ${viewMode === 'posts' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}><List size={14} /></button>
                        </div>

                        {/* Вид для Мобилки: Дропдаун */}
                        <div className="sm:hidden relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 active:text-white transition-all"
                            >
                                {viewMode === 'blogs' ? <LayoutGrid size={12} /> : <List size={12} />}
                                <ChevronDown size={10} className={`transition-transform ${isViewDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isViewDropdownOpen && (
                                <div className="absolute top-[calc(100%+10px)] right-0 w-32 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button onClick={() => { setViewMode('blogs'); setSelectedBlogId(null); setIsViewDropdownOpen(false); }} className="flex items-center gap-2 w-full p-3 text-[8px] font-bold uppercase text-gray-400 active:bg-blue-500/10 active:text-blue-400">
                                        <LayoutGrid size={12} /> Блоги
                                    </button>
                                    <button onClick={() => { setViewMode('posts'); setSelectedBlogId(null); setIsViewDropdownOpen(false); }} className="flex items-center gap-2 w-full p-3 text-[8px] font-bold uppercase text-gray-400 active:bg-blue-500/10 active:text-blue-400">
                                        <List size={12} /> Посты
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};