// src/app/(admin)/(management)/school-cycles/page.tsx

import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { SchoolCyclePageContent } from '@/components/features/school-cycles';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciclos Escolares | Sistema de Gestión Académica',
  description: 'Gestiona los ciclos escolares, bimestres y configuraciones del sistema',
};

export default function SchoolCyclesPage() {
  return (
    <ProtectedPage module="school-cycle" action="read">
      <main className="p-6 space-y-6">
        <SchoolCyclePageContent />
      </main>
    </ProtectedPage>
  );
}