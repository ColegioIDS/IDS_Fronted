// src/app/(admin)/attendance-config/page.tsx

'use client';

import Breadcrumb from '@/components/common/Breadcrumb';
import { AttendanceConfigPage } from '@/components/features/attendance-config';

/**
 * Página de Configuración de Asistencia
 * Ruta: /admin/attendance-config
 * 
 * Características:
 * - Ver configuración activa del sistema
 * - Editar parámetros de asistencia
 * - Restaurar a valores por defecto
 * - Eliminar configuración
 * - Validaciones en tiempo real
 * - Soporte para dark mode
 * - Tema de colores consistente con attendance
 */
export default function AdminAttendanceConfigPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle=""
        items={[
          { label: "Administración", href: "/admin" },
          { label: "Configuración", href: "#" },
          { label: "Asistencia", href: "#" },
        ]}
      />
      <AttendanceConfigPage />
    </div>
  );
}