// src/components/features/attendance/components/schedules/QuickStatusBar.tsx

'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Check,
  X,
  Clock,
  AlertCircle,
  Briefcase,
  Heart,
} from 'lucide-react';
import { useAttendanceConfig } from '@/hooks/attendance-hooks';

interface StatusOption {
  id: number;
  code: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
  description: string;
}

interface QuickStatusBarProps {
  selectedStatusId: number | null;
  onStatusSelect: (statusId: number) => void;
  disabled?: boolean;
}

/**
 * Barra rápida de selección de estados de asistencia
 * Muestra botones P, I, T, E, M, A para marcar estudiantes rápidamente
 */
export function QuickStatusBar({
  selectedStatusId,
  onStatusSelect,
  disabled = false,
}: QuickStatusBarProps) {
  const { statuses } = useAttendanceConfig();

  // Mapeo de códigos a iconos
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'P': Check,
    'I': X,
    'T': Clock,
    'IJ': AlertCircle,
    'TJ': Clock,
    'E': AlertCircle,
    'M': Heart,
    'A': Briefcase,
  };

  // Mapeo de códigos a colores
  const colorMap: Record<string, { bg: string; hover: string }> = {
    'P': {
      bg: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
      hover: 'hover:bg-green-200 dark:hover:bg-green-800',
    },
    'I': {
      bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
      hover: 'hover:bg-red-200 dark:hover:bg-red-800',
    },
    'T': {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
      hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-800',
    },
    'E': {
      bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      hover: 'hover:bg-blue-200 dark:hover:bg-blue-800',
    },
    'M': {
      bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      hover: 'hover:bg-purple-200 dark:hover:bg-purple-800',
    },
    'A': {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
      hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-800',
    },
  };

  if (statuses.length === 0) {
    return null;
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📌 Selecciona un estado para marcar rápidamente:
          </p>

          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => {
              const Icon = iconMap[status.code] || Check;
              const colors = colorMap[status.code] || colorMap['P'];
              const isSelected = selectedStatusId === status.id;

              return (
                <Button
                  key={status.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusSelect(status.id)}
                  disabled={disabled}
                  title={status.name}
                  className={`
                    border-2 transition-all
                    ${isSelected
                      ? `${colors.bg} font-semibold ring-2 ring-offset-2 dark:ring-offset-gray-950 ring-gray-400`
                      : `${colors.bg} ${colors.hover}`
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  <span className="text-xs sm:text-sm font-medium">{status.code}</span>
                  <span className="hidden sm:inline ml-1 text-xs opacity-70">
                    {status.name}
                  </span>
                </Button>
              );
            })}
          </div>

          {selectedStatusId && (
            <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                ✓ Modo rápido activado. Haz click en los estudiantes para aplicar este estado.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
