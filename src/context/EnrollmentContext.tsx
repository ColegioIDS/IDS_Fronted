// src/context/EnrollmentContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useEnrollment } from '@/hooks/useEnrollment';

type EnrollmentContextType = ReturnType<typeof useEnrollment>;
const EnrollmentContext = createContext<EnrollmentContextType | null>(null);

// Hook para consumir el contexto
export const useEnrollmentContext = () => {
    const context = useContext(EnrollmentContext);
    if (!context) {
        throw new Error('useEnrollmentContext must be used within an EnrollmentProvider');
    }
    return context;
};

// Componente proveedor del contexto
interface EnrollmentProviderProps {
    children: React.ReactNode;
    isEditMode?: boolean;
    id?: number;  // ID para el modo edición
}

export const EnrollmentProvider = ({ 
    children, 
    isEditMode = false, 
    id 
}: EnrollmentProviderProps) => {
    const enrollment = useEnrollment(isEditMode, id);
    return (
        <EnrollmentContext.Provider value={enrollment}>
            {children}
        </EnrollmentContext.Provider>
    );
};