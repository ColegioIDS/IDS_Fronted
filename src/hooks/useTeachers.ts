// src/hooks/useTeachers.ts
'use client';

import { useUserContext } from '@/context/UserContext';
import { User } from '@/types/user';

export function useTeachers() {
  const context = useUserContext();
  
  if (!context) {
    throw new Error('useTeachers must be used within a UserProvider');
  }

  const { users } = context;
  
  // Filtrar usuarios con rol de docente
  const teachers = users.filter(user => 
    user.role?.name.toLowerCase() === 'docente' || 
    user.role?.name.toLowerCase() === 'teacher'
  );

  return {
    teachers,
    isLoading: false,
    error: null
  };
}