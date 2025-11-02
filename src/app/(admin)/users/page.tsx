'use client';

import { UsersPageContent } from '@/components/features/users';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
