/**
 * ====================================================================
 * ATTENDANCE PAGE
 * ====================================================================
 * Punto de entrada del módulo de asistencia
 */

import { AttendancePageContent } from '@/components/features/attendance/AttendancePageContent';

export const metadata = {
  title: 'Gestión de Asistencia',
  description: 'Registra, gestiona y visualiza la asistencia de estudiantes',
};

export default function AttendancePage() {
  return (
    <main className="space-y-6 p-6">
      <AttendancePageContent />
    </main>
  );
}
