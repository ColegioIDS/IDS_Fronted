//src\context\BimesterContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useBimester } from '@/hooks/useBimester';

type BimesterContextType = ReturnType<typeof useBimester> & {
  cycleId: number | null;
  setCycleId: (id: number) => void;
};

const BimesterContext = createContext<BimesterContextType | null>(null);

export const useBimesterContext = () => {
  const context = useContext(BimesterContext);
  if (!context) {
    throw new Error('useBimesterContext must be used within a BimesterProvider');
  }
  return context;
};

interface BimesterProviderProps {
  children: React.ReactNode;
  initialCycleId?: number;
  isEditMode?: boolean;
}

export const BimesterProvider = ({
  children,
  initialCycleId,
  isEditMode = false,
}: BimesterProviderProps) => {
  const [cycleId, setCycleId] = useState<number | null>(initialCycleId ?? null);

  // 🔁 sincroniza cuando la prop cambia
  useEffect(() => {
    if (initialCycleId !== undefined && initialCycleId !== cycleId) {
      setCycleId(initialCycleId);
    }
  }, [initialCycleId]);

  const bimester = useBimester(cycleId ?? undefined, isEditMode);

  return (
    <BimesterContext.Provider value={{ ...bimester, cycleId, setCycleId }}>
      {children}
    </BimesterContext.Provider>
  );
};