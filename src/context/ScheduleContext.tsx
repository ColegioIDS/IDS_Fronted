// src/context/ScheduleContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useSchedule } from '@/hooks/useSchedule';

type ScheduleContextType = ReturnType<typeof useSchedule>;
const ScheduleContext = createContext<ScheduleContextType | null>(null);

// Hook para consumir el contexto
export const useScheduleContext = () => {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error('useScheduleContext must be used within a ScheduleProvider');
    }
    return context;
};

// Componente proveedor del contexto
interface ScheduleProviderProps {
    children: React.ReactNode;
    isEditMode?: boolean;
    id?: number;  // ID para el modo edición
}

export const ScheduleProvider = ({ 
    children, 
    isEditMode = false, 
    id 
}: ScheduleProviderProps) => {
    const schedule = useSchedule(isEditMode, id);
    return (
        <ScheduleContext.Provider value={schedule}>
            {children}
        </ScheduleContext.Provider>
    );
};