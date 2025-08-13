// src/hooks/useTeachers.ts
import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { User } from '@/types/user';

export function useTeachers() {
  const { 
    users, 
    isLoadingUsers, 
    usersError,
    refetchUsers 
  } = useUser();
  
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoadingUsers) {
      // Filtrar usuarios con rol de docente
      const filteredTeachers = users.filter(user => {
        const roleName = user.role?.name.toLowerCase();
        return roleName === 'docente' || roleName === 'teacher';
      });
      
      setTeachers(filteredTeachers);
      setIsLoading(false);
      setError(usersError);
    }
  }, [users, isLoadingUsers, usersError]);

  const refetch = async () => {
    await refetchUsers();
  };

  return {
    teachers,
    isLoading,
    error,
    refetch
  };
}