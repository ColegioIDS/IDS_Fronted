// src/components/shared/EmptyState.tsx
'use client';

import React from 'react';
import {
  AlertCircle,
  Calendar,
  BookOpen,
  Users,
  Clock,
  CalendarDays,
  GraduationCap,
} from 'lucide-react';

interface EmptyStateProps {
  type:
    | 'no-active-cycle'
    | 'no-active-bimester'
    | 'no-weeks'
    | 'no-grades'
    | 'no-courses'
    | 'no-data'
    | 'error';
  message?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const emptyStates = {
  'no-active-cycle': {
    icon: Calendar,
    title: 'Sin ciclo escolar activo',
    description:
      'No hay un ciclo escolar activo en el sistema. Contacta al administrador para activar un ciclo.',
    iconColor: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  'no-active-bimester': {
    icon: Clock,
    title: 'Sin bimestre activo',
    description: 'No hay un bimestre activo para el ciclo escolar actual. Contacta al administrador para activar un bimestre.',
    iconColor: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'no-weeks': {
    icon: CalendarDays,
    title: 'Sin semanas académicas',
    description: 'No hay semanas académicas registradas para este bimestre. Contacta al administrador.',
    iconColor: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  'no-grades': {
    icon: GraduationCap,
    title: 'Sin grados disponibles',
    description: 'No hay grados registrados para este ciclo escolar. Contacta al administrador.',
    iconColor: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  'no-courses': {
    icon: BookOpen,
    title: 'Sin cursos disponibles',
    description: 'No hay cursos registrados para los grados. Contacta al administrador.',
    iconColor: 'text-teal-500 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
  },
  'no-data': {
    icon: Users,
    title: 'Sin datos disponibles',
    description:
      'No se encontraron los datos solicitados. Intenta nuevamente más tarde.',
    iconColor: 'text-slate-500 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800/50',
  },
  error: {
    icon: AlertCircle,
    title: 'Error al cargar datos',
    description:
      'Ocurrió un error al intentar cargar los datos. Por favor, intenta nuevamente.',
    iconColor: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
};

export function EmptyState({
  type,
  message,
  description,
  action,
}: EmptyStateProps) {
  const state = emptyStates[type];
  const Icon = state.icon;

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          {/* Icon Container with colored background */}
          <div className={`p-4 rounded-full ${state.bgColor}`}>
            <Icon className={`w-12 h-12 ${state.iconColor}`} />
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {message || state.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {description || state.description}
            </p>
          </div>

          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-4 px-6 py-2.5 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors duration-200"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
