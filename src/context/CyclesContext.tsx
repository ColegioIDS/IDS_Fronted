// src/context/CyclesContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useSchoolCycle } from '@/hooks/useSchoolCycle';

type CyclesContextType = ReturnType<typeof useSchoolCycle>;
const CyclesContext = createContext<CyclesContextType | null>(null);

// ✅ Hook para consumir el contexto
export const useCyclesContext = () => {
    const context = useContext(CyclesContext);
    if (!context) {
        throw new Error('useCyclesContext must be used within a CyclesProvider');
    }
    return context;
};

// ✅ Componente proveedor del contexto
interface CyclesProviderProps {
    children: React.ReactNode;
    isEditMode?: boolean;
}

export const CyclesProvider = ({ children, isEditMode }: CyclesProviderProps) => {
    const cycles = useSchoolCycle(isEditMode);
    return <CyclesContext.Provider value={cycles}>{children}</CyclesContext.Provider>;
};
