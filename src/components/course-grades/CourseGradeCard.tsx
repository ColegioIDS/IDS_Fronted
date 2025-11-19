// src/components/course-grades/CourseGradeCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  Loader2,
  Check,
  Diamond,
} from 'lucide-react';
import { CourseGradeWithRelations } from '@/types/courseGrades';
import { courseGradesService } from '@/services/courseGrades.service';
import { toast } from 'sonner';
import { ProtectedButton } from '@/components/shared/permissions/ProtectedButton';

interface CourseGradeCardProps {
  courseGrade: CourseGradeWithRelations;
  onUpdate?: () => void;
  onEdit?: (courseGradeId: number) => void;
}

export function CourseGradeCard({
  courseGrade,
  onUpdate,
  onEdit,
}: CourseGradeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta asignación?')) return;

    try {
      setIsDeleting(true);
      await courseGradesService.deleteCourseGrade(courseGrade.id);
      toast.success('Asignación eliminada');
      onUpdate?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleCore = async () => {
    try {
      setIsUpdating(true);
      await courseGradesService.updateCourseGrade(courseGrade.id, {
        isCore: !courseGrade.isCore,
      });
      toast.success(`Cambio a ${!courseGrade.isCore ? 'obligatorio' : 'electivo'}`);
      onUpdate?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {courseGrade.course?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {courseGrade.grade?.name} • {courseGrade.grade?.level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  disabled={isDeleting || isUpdating}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={handleToggleCore}
                  className="cursor-pointer"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Cambiar a {courseGrade.isCore ? 'Electivo' : 'Obligatorio'}
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <ProtectedButton
                  module="course-grade"
                  action="delete"
                  hideOnNoPermission
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </>
                  )}
                </ProtectedButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 space-y-4 bg-white dark:bg-gray-900">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={courseGrade.isCore ? 'default' : 'secondary'}
            className={
              courseGrade.isCore
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
            }
          >
            {courseGrade.isCore ? (
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" /> Obligatorio
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Diamond className="w-3 h-3" /> Electivo
              </span>
            )}
          </Badge>

          {courseGrade.course?.area && (
            <Badge variant="outline" className="text-xs">
              {courseGrade.course.area}
            </Badge>
          )}

          <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
            ID: {courseGrade.id}
          </Badge>
        </div>

        {/* Información del Curso */}
        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Código</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {courseGrade.course?.code}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Color</p>
            <div className="flex items-center gap-2">
              {courseGrade.course?.color && (
                <div
                  className="w-6 h-6 rounded-lg border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: courseGrade.course.color }}
                />
              )}
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {courseGrade.course?.color || 'Sin color'}
              </span>
            </div>
          </div>
        </div>

        {/* Información del Grado */}
        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Grado</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {courseGrade.grade?.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Nivel</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {courseGrade.grade?.level}
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        {courseGrade._count && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-2 rounded bg-blue-50 dark:bg-blue-900/20">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {courseGrade._count.courseAssignments || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Asignaciones
              </p>
            </div>
            <div className="text-center p-2 rounded bg-green-50 dark:bg-green-900/20">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {courseGrade._count.studentGrades || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Calificaciones
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
