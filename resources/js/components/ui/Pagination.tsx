import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, lastPage, onPageChange }) => {
    if (lastPage <= 1) return null;

    const getPages = () => {
        const pages: (number | string)[] = [];
        for (let i = 1; i <= lastPage; i++) {
            if (i === 1 || i === lastPage || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    return (
        /* Уменьшили отступ сверху и зазоры для мобилок */
        <div className="mt-10 sm:mt-16 flex items-center justify-center gap-1 sm:gap-3 px-2">
            {/* Кнопка Назад: w-8 на мобилках */}
            <button 
                disabled={currentPage === 1} 
                onClick={() => onPageChange(currentPage - 1)}
                className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-2xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-white disabled:opacity-0 transition-all shrink-0"
            >
                <ArrowLeft size={14} className="sm:size-4" />
            </button>

            {/* УБРАЛИ overflow-hidden и уменьшили gap */}
            <div className="flex items-center gap-0.5 sm:gap-2">
                {getPages().map((p, idx) => (
                    p === '...' ? (
                        <span key={`dots-${idx}`} className="text-gray-700 px-0.5 sm:px-2 font-black text-[10px]">...</span>
                    ) : (
                        <button
                            key={`pg-${p}`}
                            onClick={() => onPageChange(Number(p))}
                            /* Цифры теперь w-8, чтобы 7 элементов влезли в 320px */
                            className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl text-[9px] sm:text-[11px] font-black transition-all border shrink-0 ${
                                currentPage === p 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                                : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-white'
                            }`}
                        >
                            {String(p).padStart(2, '0')}
                        </button>
                    )
                ))}
            </div>

            {/* Кнопка Вперед: w-8 на мобилках */}
            <button 
                disabled={currentPage === lastPage} 
                onClick={() => onPageChange(currentPage + 1)}
                className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-2xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-white disabled:opacity-0 transition-all shrink-0"
            >
                <ArrowRight size={14} className="sm:size-4" />
            </button>
        </div>
    );
};