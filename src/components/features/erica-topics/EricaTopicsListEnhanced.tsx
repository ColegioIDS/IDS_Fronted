// src/components/features/erica-topics/EricaTopicsListEnhanced.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { EricaTopic, EricaAcademicWeek, EricaCascadeDataResponse } from '@/types/erica-topics.types';
import { Card, CardContent } from '@/components/ui/card';
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
  BookOpen,
  Calendar,
  Users,
  User,
  ChevronRight,
  MoreHorizontal,
  Eye,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmptyState } from '@/components/shared/EmptyState';
import { ProtectedContent } from '@/components/shared/permissions/ProtectedContent';
import { ERICA_TOPICS_PERMISSIONS } from '@/constants/erica-topics.permissions';
import { cn } from '@/lib/utils';

interface EricaTopicsListEnhancedProps {
  topics: EricaTopic[];
  loading?: boolean;
  cascadeData: EricaCascadeDataResponse | null;
  cascadeLoading?: boolean;
  onEdit?: (topic: EricaTopic) => void;
  onDelete?: (id: number) => Promise<void>;
  onDuplicate?: (id: number) => void;
  onComplete?: (id: number, currentlyCompleted: boolean) => void;
}

export function EricaTopicsListEnhanced({
  topics,
  loading = false,
  cascadeData,
  cascadeLoading = false,
  onEdit,
  onDelete,
  onDuplicate,
  onComplete,
}: EricaTopicsListEnhancedProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Crear mapas para buscar nombres por ID
  const courseMap = useMemo(() => {
    if (!cascadeData) return {};
    const map: Record<number, string> = {};
    // Iterar sobre gradesSections para obtener cursos de courseAssignments
    Object.values(cascadeData.gradesSections).forEach((sections: any) => {
      if (Array.isArray(sections)) {
        sections.forEach((section: any) => {
          if (section.courseAssignments && Array.isArray(section.courseAssignments)) {
            section.courseAssignments.forEach((ca: any) => {
              if (ca.course) {
                map[ca.course.id] = ca.course.name;
              }
            });
          }
        });
      }
    });
    return map;
  }, [cascadeData]);

  // Crear mapa de secciones
  const sectionMap = useMemo(() => {
    if (!cascadeData) return {};
    const map: Record<number, string> = {};
    Object.values(cascadeData.gradesSections).forEach((sections: any) => {
      if (Array.isArray(sections)) {
        sections.forEach((section: any) => {
          map[section.id] = `Sección ${section.name}`;
        });
      }
    });
    return map;
  }, [cascadeData]);

  // Crear mapa de docentes
  const teacherMap = useMemo(() => {
    if (!cascadeData) return {};
    const map: Record<number, string> = {};
    Object.values(cascadeData.gradesSections).forEach((sections: any) => {
      if (Array.isArray(sections)) {
        sections.forEach((section: any) => {
          if (section.courseAssignments && Array.isArray(section.courseAssignments)) {
            section.courseAssignments.forEach((ca: any) => {
              if (ca.teacher) {
                map[ca.teacher.id] = `${ca.teacher.givenNames} ${ca.teacher.lastNames}`;
              }
            });
          }
        });
      }
    });
    return map;
  }, [cascadeData]);

  const weekMap = useMemo(() => {
    if (!cascadeData) return {};
    const map: Record<number, string> = {};
    cascadeData.weeks.forEach((week: EricaAcademicWeek) => {
      map[week.id] = `Semana ${week.number}`;
    });
    return map;
  }, [cascadeData]);

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

  const handleComplete = (topic: EricaTopic) => {
    if (!onComplete) return;
    // Pasa el estado actual al padre, el padre decide qué hacer
    onComplete(topic.id, topic.isCompleted);
  };

  if (loading || cascadeLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  // Si no hay cascadeData, mostrar loading
  if (!cascadeData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <EmptyState type="no-data" />
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {topics.map((topic) => (
          <Card
            key={topic.id}
            className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md dark:hover:shadow-slate-950 transition-shadow"
          >
            <div className="space-y-3">
              {/* Encabezado con título y estado */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {topic.weekTheme}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={topic.isActive ? 'default' : 'secondary'}
                    className={
                      topic.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
                    }
                  >
                    {topic.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge
                    variant={topic.isCompleted ? 'default' : 'secondary'}
                    className={
                      topic.isCompleted
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    }
                  >
                    {topic.isCompleted ? 'Completado' : 'En Progreso'}
                  </Badge>
                </div>
              </div>

              {/* Información académica */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Curso:</span>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {courseMap[topic.courseId] || `ID: ${topic.courseId}`}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Semana:</span>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {weekMap[topic.academicWeekId] || `ID: ${topic.academicWeekId}`}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Sección:</span>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {sectionMap[topic.sectionId] || `ID: ${topic.sectionId}`}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Docente:</span>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {teacherMap[topic.teacherId] || `ID: ${topic.teacherId}`}
                  </p>
                </div>
              </div>

              {/* Descripción (preview) */}
              {topic.description && (
                <>
                  <Separator className="my-2 bg-slate-200 dark:bg-slate-800" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {topic.description}
                  </p>
                </>
              )}

              {/* Botones de acciones */}
              <Separator className="my-2 bg-slate-200 dark:bg-slate-800" />
              <div className="flex gap-2 justify-end flex-wrap">
                {/* Botón Completar - requiere permiso mark-complete */}
                <ProtectedContent {...ERICA_TOPICS_PERMISSIONS.MARK_COMPLETE} hideOnNoPermission>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleComplete(topic)}
                    className="border-slate-300 dark:border-slate-600"
                    title={topic.isCompleted ? 'Marcar como en progreso' : 'Marcar como completado'}
                  >
                    {topic.isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </Button>
                </ProtectedContent>

                {/* Botón Duplicar - requiere permiso duplicate */}
                <ProtectedContent {...ERICA_TOPICS_PERMISSIONS.DUPLICATE} hideOnNoPermission>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDuplicate?.(topic.id)}
                    className="border-slate-300 dark:border-slate-600"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </ProtectedContent>

                {/* Botón Editar - requiere permiso update */}
                <ProtectedContent {...ERICA_TOPICS_PERMISSIONS.UPDATE} hideOnNoPermission>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit?.(topic)}
                    className="border-slate-300 dark:border-slate-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </ProtectedContent>

                {/* Botón Eliminar - requiere permiso delete */}
                <ProtectedContent {...ERICA_TOPICS_PERMISSIONS.DELETE} hideOnNoPermission>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(topic.id)}
                    className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </ProtectedContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              ¿Eliminar tema?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción no se puede deshacer
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
