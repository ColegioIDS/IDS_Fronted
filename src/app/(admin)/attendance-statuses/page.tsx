// src/app/(admin)/attendance-statuses/page.tsx
/**
 * Página de Gestión de Estados de Asistencia
 * 
 * Ruta: /attendance-statuses
 * Permisos requeridos: attendance-statuses:view
 */

import { AttendanceStatusesPageContent } from '@/components/features/attendance-statuses';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estados de Asistencia | IDS',
  description: 'Gestión de estados de asistencia del sistema educativo',
};

export default function AttendanceStatusesPage() {
  return (
    <div className="min-h-screen p-6">
      <AttendanceStatusesPageContent />
    </div>
  );
}
