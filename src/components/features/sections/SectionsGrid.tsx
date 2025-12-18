// src/components/features/sections/SectionsGrid.tsx
'use client';

import React from 'react';
import { Loader2, Users, Lightbulb } from 'lucide-react';
import type { Section } from '@/types/sections.types';

// Inline SectionCard import - usando referencia dinámica
const SectionCard = React.lazy(() => import('./SectionCard').then(m => ({ default: m.SectionCard })));

interface SectionsGridProps {
  sections: Section[];
  isLoading?: boolean;
  onView?: (section: Section) => void;
  onEdit?: (section: Section) => void;
  onDelete?: (section: Section) => void;
  onViewStats?: (section: Section) => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * 🏫 Grid de tarjetas de secciones
 */
export function SectionsGrid({
  sections,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onViewStats,
  canView = true,
  canEdit = true,
  canDelete = true,
}: SectionsGridProps) {
  // Estado de carga sin gradientes
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800">
        <Loader2 className="h-16 w-16 animate-spin text-primary-600 dark:text-primary-500 mb-6" />
        <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">
          Cargando secciones...
        </p>
      </div>
    );
  }

  // Estado vacío sin gradientes
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 border-4 border-blue-200 dark:border-blue-800 mb-6">
          <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          No se encontraron secciones
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 leading-relaxed">
          No hay secciones que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda o crea una nueva sección.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <Lightbulb className="h-4 w-4 text-blue-700 dark:text-blue-300" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Ajusta los filtros arriba
          </span>
        </div>
      </div>
    );
  }

  // Grid de secciones con animaciones stagger
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ 
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'both'
          }}
        >
          <React.Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
            <SectionCard
              section={section}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewStats={onViewStats}
              canView={canView}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          </React.Suspense>
        </div>
      ))}
    </div>
  );
}
