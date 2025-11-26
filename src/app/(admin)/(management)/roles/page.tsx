// src/app/(admin)/roles/page.tsx
import { RolesPageContent } from '@/components/features/roles/RolesPageContent';

export const metadata = {
  title: 'Roles | Sistema de Gestión',
  description: 'Gestión de roles y permisos del sistema',
};

export default function RolesPage() {
  return <RolesPageContent />;
}