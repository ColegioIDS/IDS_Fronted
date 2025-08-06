'use client';

import { CyclesProvider } from '@/context/CyclesContext';
import { BimesterProvider } from '@/context/BimesterContext';
import { HolidayProvider } from '@/context/HolidayContext';

export default function HolidayLayout({ children }: { children: React.ReactNode }) {
  return (
    <CyclesProvider>
      <BimesterProvider>
        <HolidayProvider>
          {children}
        </HolidayProvider>
      </BimesterProvider>
    </CyclesProvider>
  );
}
