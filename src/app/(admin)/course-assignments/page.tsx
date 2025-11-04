// src/app/(admin)/course-assignments/page.tsx
import { Metadata } from 'next';
import { CourseAssignmentsPageContent } from '@/components/features/course-assignments';

export const metadata: Metadata = {
  title: 'Asignación de Cursos y Maestros | IDS',
  description: 'Configure qué maestros imparten cada curso por sección',
};

export default function CourseAssignmentsPage() {
  return <CourseAssignmentsPageContent />;
}
