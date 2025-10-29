// src/components/features/bimesters/BimesterGrid.tsx

'use client';

import React from 'react';
import { BimesterCard } from './BimesterCard';
import { Bimester } from '@/types/bimester.types';
import { EmptyState, EmptySearchResults } from '@/components/shared/feedback/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BimesterGridProps {
  bimesters: Bimester[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit?: (bimester: Bimester) => void;
  onDelete?: (bimester: Bimester) => void;
  onViewDetails: (bimester: Bimester) => void;
}

/**
 * Grid responsivo de tarjetas de bimestres con paginación
 */
export function BimesterGrid({
  bimesters,
  isLoading,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onEdit,
  onDelete,
  onViewDetails,
}: BimesterGridProps) {
  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-6 bg-white dark:bg-gray-900">
              <Skeleton className="h-6 w-20 mb-3" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (bimesters.length === 0) {
    return (
      <EmptySearchResults 
        onClearFilters={() => window.location.reload()}
       // message="No se encontraron bimestres con los filtros seleccionados"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {bimesters.map((bimester) => (
          <BimesterCard
            key={bimester.id}
            bimester={bimester}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {(currentPage - 1) * Math.ceil(total / totalPages) + 1}
              </span>
              {' '}-{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {Math.min(currentPage * Math.ceil(total / totalPages), total)}
              </span>
              {' '}de{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {total}
              </span>
              {' '}bimestres
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-gray-300 dark:border-gray-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Mostrar solo páginas relevantes
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className={
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border-gray-300 dark:border-gray-700'
                        }
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span
                        key={page}
                        className="px-2 text-gray-500 dark:text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-gray-300 dark:border-gray-700"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default BimesterGrid;
