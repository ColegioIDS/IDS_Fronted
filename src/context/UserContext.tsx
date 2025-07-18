// src/context/UserContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useUser } from '@/hooks/useUser';

type UserContextType = ReturnType<typeof useUser>;

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: React.ReactNode;
  isEditMode?: boolean;
}

export const UserProvider = ({ children, isEditMode = false }: UserProviderProps) => {
  const value = useUser(isEditMode); // 👈 le pasamos el flag al hook

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
