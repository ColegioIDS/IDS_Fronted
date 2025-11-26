// src/app/(admin)/sections/page.tsx
'use client';

import { SectionPageContent } from '@/components/features/sections/SectionPageContent';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';

export default function SectionsPage() {
  return (
    <ProtectedPage module="section" action="read">
      <SectionPageContent />
    </ProtectedPage>
  );
}