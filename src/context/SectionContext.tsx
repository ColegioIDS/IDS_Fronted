// src/context/SectionContext.tsx
'use client';

import { createContext, useContext, useEffect } from 'react';
import { useSection } from '@/hooks/useSection';

type SectionContextType = ReturnType<typeof useSection>;
const SectionContext = createContext<SectionContextType | null>(null);

// Hook para consumir el contexto
export const useSectionContext = () => {
    const context = useContext(SectionContext);
    if (!context) {
        throw new Error('useSectionContext must be used within a SectionProvider');
    }
    return context;
};

// Componente proveedor del contexto
interface SectionProviderProps {
    children: React.ReactNode;
    isEditMode?: boolean;
    id?: number;  // ID para el modo edición
    gradeId?: number; // ID opcional para filtrar secciones por grado
}

export const SectionProvider = ({ 
    children, 
    isEditMode = false, 
    id,
    gradeId 
}: SectionProviderProps) => {
    const section = useSection(isEditMode, id);
    
    // Efecto para filtrar por gradeId si está presente
    useEffect(() => {
        if (gradeId) {
            section.fetchSections(gradeId);
        }
    }, [gradeId]);

    return (
        <SectionContext.Provider value={section}>
            {children}
        </SectionContext.Provider>
    );
};