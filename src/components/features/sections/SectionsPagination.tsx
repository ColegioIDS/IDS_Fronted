// src/components/features/sections/SectionsPagination.tsx

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SectionsPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Componente de paginación para secciones
 */
export function SectionsPagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  isLoading = false,
}: SectionsPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      {/* Info de items */}
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        Mostrando <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">{startItem}</span> a{' '}
        <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">{endItem}</span> de{' '}
        <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">{total}</span> secciones
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Primera página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isLoading}
          className="h-9 w-9 p-0 border-2 hover:bg-fuchsia-50 hover:border-fuchsia-400 hover:text-fuchsia-700 dark:hover:bg-fuchsia-950/30 dark:hover:border-fuchsia-600 dark:hover:text-fuchsia-300"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Página anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="h-9 w-9 p-0 border-2 hover:bg-fuchsia-50 hover:border-fuchsia-400 hover:text-fuchsia-700 dark:hover:bg-fuchsia-950/30 dark:hover:border-fuchsia-600 dark:hover:text-fuchsia-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Números de página */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-400 dark:text-gray-600">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  disabled={isLoading}
                  className={`h-9 w-9 p-0 border-2 font-semibold ${
                    currentPage === page
                      ? 'bg-fuchsia-600 border-fuchsia-700 text-white hover:bg-fuchsia-700 dark:bg-fuchsia-600 dark:border-fuchsia-500 dark:hover:bg-fuchsia-700'
                      : 'hover:bg-fuchsia-50 hover:border-fuchsia-400 hover:text-fuchsia-700 dark:hover:bg-fuchsia-950/30 dark:hover:border-fuchsia-600 dark:hover:text-fuchsia-300'
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Móvil: solo número actual */}
        <div className="sm:hidden flex items-center px-4 py-2 bg-fuchsia-50 dark:bg-fuchsia-950/30 border-2 border-fuchsia-300 dark:border-fuchsia-700 rounded-lg">
          <span className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">
            {currentPage} / {totalPages}
          </span>
        </div>

        {/* Página siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="h-9 w-9 p-0 border-2 hover:bg-fuchsia-50 hover:border-fuchsia-400 hover:text-fuchsia-700 dark:hover:bg-fuchsia-950/30 dark:hover:border-fuchsia-600 dark:hover:text-fuchsia-300"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Última página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || isLoading}
          className="h-9 w-9 p-0 border-2 hover:bg-fuchsia-50 hover:border-fuchsia-400 hover:text-fuchsia-700 dark:hover:bg-fuchsia-950/30 dark:hover:border-fuchsia-600 dark:hover:text-fuchsia-300"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
