// src/context/GradeContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useGrade } from '@/hooks/useGrade';

type GradeContextType = ReturnType<typeof useGrade>;
const GradeContext = createContext<GradeContextType | null>(null);

// Hook para consumir el contexto
export const useGradeContext = () => {
    const context = useContext(GradeContext);
    if (!context) {
        throw new Error('useGradeContext must be used within a GradeProvider');
    }
    return context;
};

// Componente proveedor del contexto
interface GradeProviderProps {
    children: React.ReactNode;
    isEditMode?: boolean;
    id?: number;  // Añadido el ID para el modo edición
}

export const GradeProvider = ({ children, isEditMode = false, id }: GradeProviderProps) => {
    const grade = useGrade(isEditMode, id);
    return <GradeContext.Provider value={grade}>{children}</GradeContext.Provider>;
};