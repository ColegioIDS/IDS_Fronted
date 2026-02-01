// src/components/features/news/NewsPageContent.tsx

'use client';

import React, { useState } from 'react';
import { Plus, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { ChangelogViewer } from './ChangelogViewer';
import { NewsViewer } from './NewsViewer';

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
  const [view, setView] = useState<'news' | 'changelog'>('news');

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
            Noticias & Cambios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestión de noticias del sistema y registro de versiones
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

      {/* Tabs/Selector */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setView('changelog')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            view === 'changelog'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          📜 Historial de Versiones
        </button>
        <button
          onClick={() => setView('news')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            view === 'news'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          📰 Noticias
        </button>
      </div>

      {/* Content */}
      {view === 'changelog' ? (
        <ChangelogViewer />
      ) : (
        <NewsViewer />
      )}
    </div>
  );
}
