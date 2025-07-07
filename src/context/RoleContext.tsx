// src/context/RoleContext.tsx
'use client';
import { createContext, useContext } from 'react';
import { useRoles } from '@/hooks/useRoles';

// Tipamos directamente con lo que retorna el hook
type RoleContextType = ReturnType<typeof useRoles>;

const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useRoles(); // usamos todo el hook
  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
};
