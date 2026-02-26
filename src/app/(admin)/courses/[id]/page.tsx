// src/app/(admin)/courses/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, ArrowLeft } from 'lucide-react';
import { coursesService } from '@/services/courses.service';
import { Course } from '@/types/courses';
import { useAuth } from '@/context/AuthContext';
import { COURSE_PERMISSIONS } from '@/constants/modules-permissions/course';

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [courseId, setCourseId] = useState<number | null>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canUpdate = hasPermission(COURSE_PERMISSIONS.UPDATE.module, COURSE_PERMISSIONS.UPDATE.action);

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const { id } = await params;
        setCourseId(parseInt(id));
      } catch (error) {
        console.error('Error resolving params:', error);
      }
    };
    resolveParams();
  }, []);

  useEffect(() => {
    if (courseId === null) return;

    const loadCourse = async () => {
      try {
        setLoading(true);
        const data = await coursesService.getCourseById(courseId);
        setCourse(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <ProtectedPage module={COURSE_PERMISSIONS.READ_ONE.module} action={COURSE_PERMISSIONS.READ_ONE.action}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </ProtectedPage>
    );
  }

  if (error || !course || courseId === null) {
    return (
      <ProtectedPage module={COURSE_PERMISSIONS.READ_ONE.module} action={COURSE_PERMISSIONS.READ_ONE.action}>
        <ErrorState
          title="Curso no encontrado"
          description="No pudimos encontrar el curso que buscas. Verifica que el ID sea válido o intenta desde la lista de cursos."
          showBackButton={true}
        />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module={COURSE_PERMISSIONS.READ_ONE.module} action={COURSE_PERMISSIONS.READ_ONE.action}>
      <div className="space-y-6">
        <Breadcrumb
          pageTitle={course.name}
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Administración", href: "#" },
            { label: "Cursos", href: "/courses" },
            { label: course.name, href: `/courses/${course.id}` },
          ]}
        />

        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {course.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Código: <span className="font-medium">{course.code}</span>
              </p>
            </div>

            {canUpdate && (
              <Button
                onClick={() => router.push(`/courses/${course.id}/edit`)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            )}
          </div>

          {/* Course Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Área
              </p>
              <p className="text-lg text-gray-900 dark:text-white">
                {course.area || 'No especificada'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Estado
              </p>
              <p className="text-lg">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                }`}>
                  {course.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </p>
            </div>

            {(course as any).description && (
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Descripción
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {(course as any).description}
                </p>
              </div>
            )}

            {course.color && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Color
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: course.color }}
                  />
                  <p className="text-gray-700 dark:text-gray-300 font-mono">
                    {course.color}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
