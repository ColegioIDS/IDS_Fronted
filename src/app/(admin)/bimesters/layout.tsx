//src\app\(admin)\bimesters\layout.tsx
'use client';

import { CyclesProvider } from '@/context/CyclesContext';
import { BimesterProvider } from '@/context/BimesterContext';

export default function BimesterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CyclesProvider>
      <BimesterProvider>
        {children}
      </BimesterProvider>
    </CyclesProvider>
  );
}