'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            onPageChange(totalPages);
        }
    }, [currentPage, totalPages, onPageChange]);

    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Simple logic: show all pages if few, or simplified range (TODO: optimized range for many pages)
    // For now, let's just show previous/next and current page info if too many pages
    const showAllPages = totalPages <= 7;

    return (
        <div className="flex justify-center items-center gap-2 mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {showAllPages ? (
                <div className="flex gap-2">
                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            ) : (
                <span className="text-sm font-medium text-slate-600 px-4">
                    Page {currentPage} sur {totalPages}
                </span>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
                aria-label="Next page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};
