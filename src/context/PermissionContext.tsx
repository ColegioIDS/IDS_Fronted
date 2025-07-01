// src/context/PermissionContext.tsx
"use client";
import { createContext, useContext, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";

type PermissionContextType =ReturnType<typeof usePermissions>
const PermissionContext = createContext<PermissionContextType | null>(null);

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const permissions = usePermissions();
  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
};