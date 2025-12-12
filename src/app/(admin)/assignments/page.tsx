import { Metadata } from 'next';
import { AssignmentsPageContent } from '@/components/features/assignments/AssignmentsPageContent';

export const metadata: Metadata = {
  title: 'Crear Tareas | IDS',
  description: 'Crea y gestiona tareas para tus estudiantes',
};

export default function AssignmentsPage() {
  return <AssignmentsPageContent />;
}
