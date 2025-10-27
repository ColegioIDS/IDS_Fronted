// src/app/(admin)/permissions/page.tsx
import { PermissionsPageContent } from '@/components/features/permissions/PermissionsPageContent';

export const metadata = {
  title: 'Permisos | Sistema de Gestión',
  description: 'Gestión de permisos del sistema',
};

export default function PermissionsPage() {
  return <PermissionsPageContent />;
}