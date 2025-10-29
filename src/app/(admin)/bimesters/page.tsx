//src\app\(admin)\bimesters\page.tsx


import { BimesterPageContent } from '@/components/features/bimesters';

// Note: Metadata is for reference only, actual implementation uses generateMetadata for dynamic content


export const metadata = {
  title: 'Gestión de Bimestres | Sistema de Gestión',
  description: 'Administra los bimestres académicos por ciclo escolar',
};

export default function BimestersPage() {
  return <BimesterPageContent />;
}