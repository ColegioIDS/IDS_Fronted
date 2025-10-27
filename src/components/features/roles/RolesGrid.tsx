// src/components/features/roles/RolesGrid.tsx
'use client';

import { Role } from '@/types/roles.types';
import { RoleCard } from './RoleCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState, EmptySearchResults } from '@/components/shared/feedback/EmptyState';

interface RolesGridProps {
  roles: (Role & { _count?: { users: number; permissions: number } })[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onUpdate?: () => void;
  onEdit?: (roleId: number) => void;
}

export function RolesGrid({
  roles,
  isLoading,
  error,
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
  hasActiveFilters = false,
  onClearFilters,
  onUpdate,
  onEdit,
}: RolesGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        variant="error"
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        title="Error al cargar roles"
        description={error}
      />
    );
  }

  // Empty state
  if (roles.length === 0) {
    if (hasActiveFilters) {
      return <EmptySearchResults onClearFilters={onClearFilters} />;
    }
    
    return (
      <EmptyState
        variant="default"
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        )}
        title="No hay roles disponibles"
        description="Aún no se han creado roles en el sistema."
      />
    );
  }

  // Success state
  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} onUpdate={onUpdate} onEdit={onEdit} />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="p-4 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {/* Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página <span className="font-medium text-gray-900 dark:text-gray-100">{currentPage}</span> de{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{totalPages}</span>
              {' · '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{totalResults}</span> resultado
              {totalResults !== 1 ? 's' : ''} total{totalResults !== 1 ? 'es' : ''}
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Anterior</span>
              </Button>

              <div className="hidden md:flex items-center gap-1">
                {getPageNumbers(currentPage, totalPages).map((pageNum, index) =>
                  pageNum === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={pageNum}
                      onClick={() => onPageChange(Number(pageNum))}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className={
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : ''
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                )}
              </div>

              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                <span className="hidden sm:inline mr-2">Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}