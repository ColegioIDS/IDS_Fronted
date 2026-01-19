// src/components/features/news/NewsPageContent.tsx

'use client';

import React, { useState } from 'react';
import { Plus, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

/**
 * 📰 Componente principal de la página de News
 */
interface NewsPageContentProps {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
}

export function NewsPageContent({
  canView = false,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canExport = false,
}: NewsPageContentProps) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handlers - CREATE
  const handleOpenCreate = () => {
    if (!canCreate) {
      toast.error('No tienes permisos para crear noticias');
      return;
    }
    toast.info('Crear noticia (funcionalidad próximamente)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Noticias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestión de noticias del sistema
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
            title="Crear nueva noticia"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Noticia
          </Button>
        )}
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
        <Newspaper className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No hay noticias
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm mb-4">
          Comienza a agregar noticias para que aparezcan aquí. Las noticias se mostrarán a todos los usuarios del sistema.
        </p>
        {canCreate && (
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Noticia
          </Button>
        )}
      </div>

      {/* Información de Permisos */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Tienes permisos de lectura en este módulo. Contacta al administrador si necesitas permisos de edición.
          </p>
        </div>
      )}
    </div>
  );
}
