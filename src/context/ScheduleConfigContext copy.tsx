// src/context/ScheduleConfigContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useScheduleConfig } from '@/hooks/useScheduleConfig';

type ScheduleConfigContextType = ReturnType<typeof useScheduleConfig>;
const ScheduleConfigContext = createContext<ScheduleConfigContextType | null>(null);

// Hook para consumir el contexto
export const useScheduleConfigContext = () => {
    const context = useContext(ScheduleConfigContext);
    if (!context) {
        throw new Error('useScheduleConfigContext must be used within a ScheduleConfigProvider');
    }
    return context;
};

// Componente proveedor del contexto
interface ScheduleConfigProviderProps {
    children: React.ReactNode;
    isEditMode?: boolean;
    id?: number;  // ID para el modo edición
    sectionId?: number; // ID opcional de sección para precargar datos
}

export const ScheduleConfigProvider = ({ 
    children, 
    isEditMode = false, 
    id,
    sectionId 
}: ScheduleConfigProviderProps) => {
    const config = useScheduleConfig(isEditMode, id || sectionId);
    return <ScheduleConfigContext.Provider value={config}>{children}</ScheduleConfigContext.Provider>;
};