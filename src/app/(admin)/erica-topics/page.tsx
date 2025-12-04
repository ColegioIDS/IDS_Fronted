// src/app/(admin)/erica-topics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EricaTopicsListEnhanced } from '@/components/features/erica-topics';
import { useEricaTopics } from '@/hooks/useEricaTopics';
import { CreateEricaTopicDto, UpdateEricaTopicDto, EricaTopic } from '@/types/erica-topics.types';
import { Plus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function EricaTopicsPage() {
  const router = useRouter();
  const {
    topics,
    loading,
    error,
    pagination,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    duplicateTopic,
    completeTopic,
  } = useEricaTopics();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchTopics({
      page,
      limit: 10,
      search: search || undefined,
    });
  }, [page, search, fetchTopics]);

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await deleteTopic(id);
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const topic = topics.find((t) => t.id === id);
      if (!topic) return;

      // Mostrar input para nueva semana
      const newWeekId = prompt('Ingrese el ID de la nueva semana académica:');
      if (!newWeekId) return;

      await duplicateTopic(id, parseInt(newWeekId));
      alert('Tema duplicado exitosamente');
    } catch (error) {
      alert('Error al duplicar tema');
    }
  };

  const handleComplete = async (id: number, completed: boolean) => {
    try {
      await completeTopic(id, completed);
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Administración</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Temas ERICA</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <Button
              onClick={() => router.push('/erica-topics/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Tema
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Input
            placeholder="Buscar por título, tema de semana..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border-slate-300 dark:border-slate-700"
          />
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        {loading && topics.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <>
            <EricaTopicsListEnhanced
              topics={topics}
              loading={loading}
              onEdit={(topic) => router.push(`/erica-topics/${topic.id}/edit`)}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onComplete={handleComplete}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
