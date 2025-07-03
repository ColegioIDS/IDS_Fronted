// src/context/RoleContext.tsx
"use client";
import { createContext, useContext } from "react";
import { useRoles } from "@/hooks/useRoles";
import type { RoleTableRow } from "@/types/role";

interface RoleContextValue {
  roles: RoleTableRow[]; // Asegurar que siempre es RoleTableRow[]
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const { roles, isLoading, error, refetch } = useRoles();
  return (
    <RoleContext.Provider value={{ roles, isLoading, error, refetch }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRoleContext must be used within a RoleProvider");
  }
  return context;
};