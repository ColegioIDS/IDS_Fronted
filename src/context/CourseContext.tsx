// src/context/CourseContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useCourse } from '@/hooks/useCourse';

type CourseContextType = ReturnType<typeof useCourse>;
const CourseContext = createContext<CourseContextType | null>(null);

// Hook para consumir el contexto
export const useCourseContext = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourseContext must be used within a CourseProvider');
    }
    return context;
};

// Componente proveedor del contexto
interface CourseProviderProps {
    children: React.ReactNode;
    isEditMode?: boolean;
    id?: number;  // ID para el modo edición
}

export const CourseProvider = ({ children, isEditMode = false, id }: CourseProviderProps) => {
    const course = useCourse(isEditMode, id);
    return <CourseContext.Provider value={course}>{children}</CourseContext.Provider>;
};