//src\context\StudentContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useStudent } from '@/hooks/useStudent';

type StudentContextType = ReturnType<typeof useStudent>;
const StudentContext = createContext<StudentContextType | null>(null);

export const useStudentContext = () => {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error('useStudentContext must be used within a StudentProvider');
    }
    return context;
};
interface StudentProviderProps {
    children: React.ReactNode;
    isEditMode?: boolean;
}

export const StudentProvider = ({ children, isEditMode }: StudentProviderProps) => {
    const student = useStudent(isEditMode);
    return <StudentContext.Provider value={student}>{children}</StudentContext.Provider>;
};
export const StudentConsumer = StudentContext.Consumer;