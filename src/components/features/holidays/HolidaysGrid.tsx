// src/components/features/holidays/HolidaysGrid.tsx

'use client';

import React from 'react';
import { Holiday } from '@/types/holidays.types';
import { HolidayCard } from './HolidayCard';
import { Loader2 } from 'lucide-react';

interface HolidaysGridProps {
  holidays: Holiday[];
  isLoading?: boolean;
  onView?: (holiday: Holiday) => void;
  onEdit?: (holiday: Holiday) => void;
  onDelete?: (holiday: Holiday) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * 🗂️ Grid de tarjetas de días festivos
 */
export function HolidaysGrid({
  holidays,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}: HolidaysGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (holidays.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se encontraron días festivos
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {holidays.map((holiday) => (
        <HolidayCard
          key={holiday.id}
          holiday={holiday}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}

export default HolidaysGrid;
