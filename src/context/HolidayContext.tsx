// src/context/HolidayContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useHoliday } from '@/hooks/useHoliday';

type HolidayContextType = ReturnType<typeof useHoliday> & {
  cycleId: number | null;
  setCycleId: (id: number) => void;
  bimesterId: number | null;
  setBimesterId: (id: number) => void;
};

const HolidayContext = createContext<HolidayContextType | null>(null);

export const useHolidayContext = () => {
  const context = useContext(HolidayContext);
  if (!context) {
    throw new Error('useHolidayContext must be used within a HolidayProvider');
  }
  return context;
};

interface HolidayProviderProps {
  children: React.ReactNode;
  initialCycleId?: number;
  initialBimesterId?: number;
  isEditMode?: boolean;
}

export const HolidayProvider = ({
  children,
  initialCycleId,
  initialBimesterId,
  isEditMode = false,
}: HolidayProviderProps) => {
  const [cycleId, setCycleId] = useState<number | null>(initialCycleId ?? null);
  const [bimesterId, setBimesterId] = useState<number | null>(initialBimesterId ?? null);

  // Sincroniza cuando las props cambian
  useEffect(() => {
    if (initialCycleId !== undefined && initialCycleId !== cycleId) {
      setCycleId(initialCycleId);
    }
    if (initialBimesterId !== undefined && initialBimesterId !== bimesterId) {
      setBimesterId(initialBimesterId);
    }
  }, [initialCycleId, initialBimesterId]);

  const holiday = useHoliday(
    cycleId ?? undefined, 
    bimesterId ?? undefined, 
    isEditMode
  );

  return (
    <HolidayContext.Provider 
      value={{ 
        ...holiday, 
        cycleId, 
        setCycleId,
        bimesterId,
        setBimesterId
      }}
    >
      {children}
    </HolidayContext.Provider>
  );
};