import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, lastPage, onPageChange }) => {
    if (lastPage <= 1) return null;

    // Логика расчета страниц с точками
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
        <div className="mt-16 flex items-center justify-center gap-3">
            {/* Назад */}
            <button 
                disabled={currentPage === 1} 
                onClick={() => onPageChange(currentPage - 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-white hover:border-white/10 disabled:opacity-5 transition-all"
            >
                <ArrowLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
                {getPages().map((p, idx) => (
                    p === '...' ? (
                        <span key={`dots-${idx}`} className="text-gray-700 px-2 font-black tracking-widest">...</span>
                    ) : (
                        <button
                            key={`pg-${p}`}
                            onClick={() => onPageChange(Number(p))}
                            className={`w-12 h-12 rounded-2xl text-[11px] font-black transition-all border ${
                                currentPage === p 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]' 
                                : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {/* Ведущий ноль (01, 02...) как на скрине */}
                            {String(p).padStart(2, '0')}
                        </button>
                    )
                ))}
            </div>

            {/* Вперед */}
            <button 
                disabled={currentPage === lastPage} 
                onClick={() => onPageChange(currentPage + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-gray-600 hover:text-white hover:border-white/10 disabled:opacity-5 transition-all"
            >
                <ArrowRight size={16} />
            </button>
        </div>
    );
};