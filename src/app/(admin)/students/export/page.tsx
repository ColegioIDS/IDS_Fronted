import { StudentExportPageContent } from '@/components/features/student-export';

export const metadata = {
  title: 'Exportar Estudiantes | Sistema de Gestión',
  description: 'Exportar datos de estudiantes por grado y sección',
};

export default function ExportStudentsPage() {
  return <StudentExportPageContent />;
}
