//src\context\RoleContext.tsx

"use client";
import { createContext, useContext, useState } from "react";
import { userole } from "@/hooks/useRoles";

type RoleContextType = ReturnType<typeof userole>;
const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const roles = userole();
  return (
    <RoleContext.Provider value={roles}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
