// src/components/features/erica-topics/EricaTopicsList.tsx
'use client';

import React, { useState } from 'react';
import { EricaTopic } from '@/types/erica-topics.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  Circle,
  Loader2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EricaTopicsListProps {
  topics: EricaTopic[];
  loading?: boolean;
  onEdit?: (topic: EricaTopic) => void;
  onDelete?: (id: number) => Promise<void>;
  onDuplicate?: (id: number) => void;
  onComplete?: (id: number, completed: boolean) => Promise<void>;
}

export function EricaTopicsList({
  topics,
  loading = false,
  onEdit,
  onDelete,
  onDuplicate,
  onComplete,
}: EricaTopicsListProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId || !onDelete) return;
    try {
      setDeleting(true);
      await onDelete(deleteId);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleComplete = async (topic: EricaTopic) => {
    if (!onComplete) return;
    try {
      setCompletingId(topic.id);
      await onComplete(topic.id, !topic.isCompleted);
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No hay temas ERICA disponibles</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card
          key={topic.id}
          className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {topic.title}
                  </h3>
                  {topic.isActive ? (
                    <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                      Activo
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                      Inactivo
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{topic.weekTheme}</p>
              </div>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {topic.description && (
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Descripción</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                    {topic.description}
                  </p>
                </div>
              )}
              {topic.objectives && (
                <div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Objetivos</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                    {topic.objectives}
                  </p>
                </div>
              )}
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            {/* Footer */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Creado {new Date(topic.createdAt).toLocaleDateString('es-ES')}
              </div>
              <div className="flex gap-2 flex-wrap">
                {onComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleComplete(topic)}
                    disabled={completingId === topic.id}
                    className="gap-2"
                  >
                    {completingId === topic.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : topic.isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    {topic.isCompleted ? 'Completado' : 'Marcar Completo'}
                  </Button>
                )}
                {onDuplicate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDuplicate(topic.id)}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(topic)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(topic.id)}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Tema ERICA</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas eliminar este tema? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
