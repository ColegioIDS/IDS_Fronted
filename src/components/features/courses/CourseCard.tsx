// src/components/features/courses/CourseCard.tsx
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
  RefreshCw,
  CheckCircle2,
  XCircle,
  Palette,
  Grid3x3,
  Loader2,
} from 'lucide-react';
import { Course } from '@/types/courses';
import { getCourseTheme } from '@/config/theme.config';
import { CourseDetailDialog } from './CourseDetailDialog';
import { DeleteCourseDialog } from './DeleteCourseDialog';
import { ProtectedButton } from '@/components/shared/permissions/ProtectedButton';
import { coursesService } from '@/services/courses.service';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CourseCardProps {
  course: Course & { _count?: { schedules: number; students: number } };
  onUpdate?: () => void;
  onEdit?: (courseId: number) => void;
}

export function CourseCard({ course, onUpdate, onEdit }: CourseCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const courseTheme = getCourseTheme(course.area?.toLowerCase() || 'default');

  const handleSuccess = () => {
    onUpdate?.();
    setShowDelete(false);
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      await coursesService.restoreCourse(course.id);
      toast.success('Curso restaurado exitosamente');
      onUpdate?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al restaurar el curso');
    } finally {
      setIsRestoring(false);
    }
  };

  const getAreaBadgeColor = (area: string | null | undefined): string => {
    if (!area) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';

    const colors: Record<string, string> = {
      'Científica': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      'Humanística': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      'Sociales': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      'Tecnológica': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
      'Artística': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      'Idiomas': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
      'Educación Física': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    };

    return colors[area] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <TooltipProvider>
      <Card className={`overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 ${
        course.isActive
          ? 'border-gray-200 dark:border-gray-800'
          : 'border-gray-400 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/50 opacity-75'
      }`}>
        {/* Overlay para cursos desactivados */}
        {!course.isActive && (
          <div className="absolute inset-0 bg-gray-900/5 dark:bg-gray-900/20 pointer-events-none" />
        )}

        {/* Header */}
        <CardHeader className={`${courseTheme.bg} border-b border-gray-200 dark:border-gray-700 ${
          !course.isActive ? 'opacity-70' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="p-3 rounded-xl shadow-lg cursor-help"
                    style={{
                      backgroundColor: course.color || '#6366F1',
                    }}
                  >
                    <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Color identificador: {course.color || '#6366F1'}</p>
                </TooltipContent>
              </Tooltip>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Código: <span className="font-medium">{course.code}</span>
                </p>
              </div>
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800">
                <DropdownMenuItem
                  onClick={() => setShowDetail(true)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalle
                </DropdownMenuItem>

                <ProtectedButton
                  module="course"
                  action="update"
                  hideOnNoPermission
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => onEdit?.(course.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </ProtectedButton>

                {!course.isActive && (
                  <ProtectedButton
                    module="course"
                    action="restore"
                    hideOnNoPermission
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleRestore}
                    disabled={isRestoring}
                  >
                    {isRestoring ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Restaurando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restaurar
                      </>
                    )}
                  </ProtectedButton>
                )}

                <DropdownMenuSeparator />

                <ProtectedButton
                  module="course"
                  action="delete"
                  hideOnNoPermission
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </ProtectedButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className={`p-4 space-y-4 bg-white dark:bg-gray-900 ${
          !course.isActive ? 'opacity-70' : ''
        }`}>
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={course.isActive ? 'default' : 'secondary'}
              className={
                course.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-2 border-red-400 dark:border-red-600 font-semibold'
              }
            >
              {course.isActive ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Activo
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  INACTIVO
                </>
              )}
            </Badge>

            {course.area && (
              <Badge className={`${getAreaBadgeColor(course.area)} border-0`}>
                <Grid3x3 className="w-3 h-3 mr-1" />
                {course.area}
              </Badge>
            )}

            <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
              ID: {course.id}
            </Badge>
          </div>

          {/* Color Preview */}
          {course.color && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <Palette className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: course.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {course.color}
                </span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 cursor-help hover:shadow-md transition-shadow">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Horarios</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {course._count?.schedules || 0}
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Horarios asignados a este curso</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 cursor-help hover:shadow-md transition-shadow">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                    <Grid3x3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Estudiantes</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {course._count?.students || 0}
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Estudiantes inscritos en este curso</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(course.createdAt || new Date()).toLocaleDateString('es-GT', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>

            <Button
              onClick={() => setShowDetail(true)}
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Ver más
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CourseDetailDialog
        course={course}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />

      <DeleteCourseDialog
        course={course}
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onSuccess={handleSuccess}
      />
    </TooltipProvider>
  );
}
