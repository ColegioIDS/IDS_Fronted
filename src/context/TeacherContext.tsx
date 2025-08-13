// src/context/TeacherContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useTeachers } from '@/hooks/useTeachers';
import { User } from '@/types/user';

interface TeacherContextType {
  teachers: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const TeacherContext = createContext<TeacherContextType | null>(null);

export const useTeacherContext = () => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacherContext must be used within a TeacherProvider');
  }
  return context;
};

interface TeacherProviderProps {
  children: React.ReactNode;
}

export const TeacherProvider = ({ children }: TeacherProviderProps) => {
  const teachersData = useTeachers();
  
  return (
    <TeacherContext.Provider value={teachersData}>
      {children}
    </TeacherContext.Provider>
  );
};