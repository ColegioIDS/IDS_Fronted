// src/components/features/courses/CourseDetailDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Code,
  Palette,
} from 'lucide-react';
import { Course } from '@/types/courses';
import { coursesService } from '@/services/courses.service';

interface CourseDetailDialogProps {
  course?: Course & { _count?: { schedules: number; students: number } };
  courseId?: number;
  open: boolean;
  onClose: () => void;
}

export function CourseDetailDialog({ 
  course: initialCourse,
  courseId, 
  open, 
  onClose 
}: CourseDetailDialogProps) {
  const [course, setCourse] = useState<Course | null>(initialCourse || null);
  const [isLoading, setIsLoading] = useState(!initialCourse && !!courseId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && courseId && !initialCourse) {
      loadCourseDetails();
    }
  }, [courseId, open, initialCourse]);

  const loadCourseDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const courseData = await coursesService.getCourseById(courseId!);
      setCourse(courseData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el curso');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white dark:bg-gray-900">
        <DialogTitle className="sr-only">Detalle del Curso</DialogTitle>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400">Cargando detalles...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : course ? (
          <ScrollArea className="h-[90vh]">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="p-4 rounded-xl shadow-lg"
                    style={{ backgroundColor: course.color || '#6366F1' }}
                  >
                    <BookOpen className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {course.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Código: <span className="font-medium">{course.code}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={course.isActive ? 'default' : 'secondary'}
                  className={
                    course.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
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
                      Inactivo
                    </>
                  )}
                </Badge>

                {course.area && (
                  <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-0">
                    {course.area}
                  </Badge>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Código */}
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Código del Curso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {course.code}
                    </p>
                  </CardContent>
                </Card>

                {/* Color */}
                {course.color && (
                  <Card className="border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Color
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                          style={{ backgroundColor: course.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {course.color}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Área */}
                {course.area && (
                  <Card className="border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Área
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {course.area}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Creación */}
                {course.createdAt && (
                  <Card className="border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Fecha de Creación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(course.createdAt).toLocaleDateString('es-GT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Actualización */}
              {course.updatedAt && (
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Última Actualización
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(course.updatedAt).toLocaleDateString('es-GT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
