//src\app\(admin)\bimesters\layout.tsx
'use client';

import { CyclesProvider } from '@/context/CyclesContext';
import { BimesterProvider } from '@/context/BimesterContext';
import { GradeProvider } from '@/context/GradeContext';

export default function BimesterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CyclesProvider>
      <BimesterProvider>
        <GradeProvider>
          {children}
        </GradeProvider>
      </BimesterProvider>
    </CyclesProvider>
  );
}