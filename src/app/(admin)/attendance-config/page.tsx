// src/app/(admin)/attendance-config/page.tsx

'use client';

import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const AttendanceConfigWrapper = dynamic(
  () => import('@/components/attendance-config/AttendanceConfigWrapper'),
  {
    loading: () => <ProfileSkeleton type="meta" />,
    ssr: false,
  }
);

/**
 * Página de Configuración de Asistencia
 * Ruta: /attendance-config
 * 
 * Características:
 * - Ver configuración activa
 * - Editar configuración
 * - Crear nuevas configuraciones
 * - Listar todas las configuraciones
 * - Activar/desactivar configuraciones
 * - Soporta dark mode
 */
export default function AttendanceConfigPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Configuración de Asistencia"
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Configuración", href: "#" },
          { label: "Asistencia", href: "#" },
        ]}
      />
      <AttendanceConfigWrapper />
    </div>
  );
}