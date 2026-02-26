// src/app/(admin)/courses/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { ErrorState } from '@/components/shared/ErrorState';
import { CourseForm } from '@/components/features/courses';
import { Loader2 } from 'lucide-react';
import { coursesService } from '@/services/courses.service';
import { Course } from '@/types/courses';
import { COURSE_PERMISSIONS } from '@/constants/modules-permissions/course';

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const [courseId, setCourseId] = useState<number | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <ProtectedPage module={COURSE_PERMISSIONS.UPDATE.module} action={COURSE_PERMISSIONS.UPDATE.action}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </ProtectedPage>
    );
  }

  if (error || !course || courseId === null) {
    return (
      <ProtectedPage module={COURSE_PERMISSIONS.UPDATE.module} action={COURSE_PERMISSIONS.UPDATE.action}>
        <ErrorState
          title="Curso no encontrado"
          description="No pudimos encontrar el curso que deseas editar. Verifica que el ID sea válido."
          showBackButton={true}
        />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module={COURSE_PERMISSIONS.UPDATE.module} action={COURSE_PERMISSIONS.UPDATE.action}>
      <div className="space-y-6">
        <Breadcrumb
          pageTitle="Editar Curso"
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Administración", href: "#" },
            { label: "Cursos", href: "/courses" },
            { label: course.name, href: `/courses/${course.id}` },
            { label: "Editar", href: `/courses/${course.id}/edit` },
          ]}
        />
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <CourseForm courseId={courseId} initialData={course} onSuccess={() => {}} onCancel={() => {}} />
        </div>
      </div>
    </ProtectedPage>
  );
}
