// src/context/CourseGradeContext.tsx
'use client';

import { createContext, useContext, useEffect } from 'react';
import { useCourseGrade } from '@/hooks/useCourseGrade';

type CourseGradeContextType = ReturnType<typeof useCourseGrade>;
const CourseGradeContext = createContext<CourseGradeContextType | null>(null);

// Hook para consumir el contexto
export const useCourseGradeContext = () => {
    const context = useContext(CourseGradeContext);
    if (!context) {
        throw new Error('useCourseGradeContext must be used within a CourseGradeProvider');
    }
    return context;
};

// Componente proveedor del contexto
interface CourseGradeProviderProps {
    children: React.ReactNode;
    isEditMode?: boolean;
    id?: number;
    initialFilters?: {
        courseId?: number;
        gradeId?: number;
        isCore?: boolean;
    };
}

export const CourseGradeProvider = ({ 
    children, 
    isEditMode = false, 
    id,
    initialFilters 
}: CourseGradeProviderProps) => {
    const courseGrade = useCourseGrade(isEditMode, id);
    
    // Opcional: cargar con filtros iniciales
    useEffect(() => {
        if (initialFilters) {
            courseGrade.fetchCourseGrades(initialFilters);
        }
    }, [initialFilters]);

    return (
        <CourseGradeContext.Provider value={courseGrade}>
            {children}
        </CourseGradeContext.Provider>
    );
};