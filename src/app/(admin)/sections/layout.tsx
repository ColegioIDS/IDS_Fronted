'use client';

import { CyclesProvider } from '@/context/CyclesContext';
import { BimesterProvider } from '@/context/BimesterContext';
import { GradeProvider } from '@/context/GradeContext';
import { SectionProvider } from '@/context/SectionContext';
import { UserProvider } from '@/context/UserContext';

export default function BimesterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>

      <CyclesProvider>
        <BimesterProvider>
          <GradeProvider>
            <SectionProvider>
              {children}
            </SectionProvider>
          </GradeProvider>
        </BimesterProvider>
      </CyclesProvider>
    </UserProvider>
  );
}