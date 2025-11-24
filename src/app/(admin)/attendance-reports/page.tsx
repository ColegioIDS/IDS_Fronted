/**
 * ====================================================================
 * ATTENDANCE REPORTS PAGE
 * ====================================================================
 *
 * Página para ver reportes y estadísticas de asistencia
 */

import { AttendanceReportsPageContent } from '@/components/features/attendance-reports/AttendanceReportsPageContent';

export const metadata = {
  title: 'Reportes de Asistencia | IDS',
  description: 'Visualiza, analiza y descarga reportes de asistencia de estudiantes',
};

export default function AttendanceReportsPage() {
  return <AttendanceReportsPageContent />;
}
