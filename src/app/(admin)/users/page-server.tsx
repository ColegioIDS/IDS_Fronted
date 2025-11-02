// src/app/(admin)/users/page-server.tsx
// Versión Server Component (Sin 'use client')
// Esta es una alternativa si prefieres usar Server Components

import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Importar dinámicamente el componente que usa 'use client'
const UsersPageContent = dynamic(
  () => import('@/components/features/users').then((mod) => mod.UsersPageContent),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Usuarios | IDS Admin Dashboard',
  description: 'Gestiona los usuarios del sistema - Crear, editar, eliminar usuarios',
};

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header con Breadcrumb */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-white font-medium">
              Usuarios
            </span>
          </div>

          {/* Título */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Gestión de Usuarios
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Crea, edita, elimina y gestiona los usuarios del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <UsersPageContent />
        </div>
      </div>
    </div>
  );
}
