//src/types/role.ts
import { DateRange as ReactDayPickerDateRange } from 'react-day-picker';

// Tipo base para User (debe estar definido en otro archivo o aquí mismo)
interface User {
  id: number;
  fullName: string;
  email?: string;
  // ... otras propiedades de usuario
}

// Tipo para Permission (ajustado a tu necesidad)
export interface Permission {
  id: number;
  module: string;
  action: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// Relación Role-Permission (ajustada a Prisma)
export interface RolePermission {
  roleId: number;
  permissionId: number;
  assignedAt: Date | string;
  assignedBy?: string;
  permission: Permission; // Relación completa
}

// Tipo completo para Role (fiel a tu modelo Prisma)
export interface Role {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdById?: number | null;
  modifiedById?: number | null;
  createdBy?: User | null;
  modifiedBy?: User | null;
  permissions: RolePermission[]; // Relación completa
  users?: User[]; // Opcional según necesidad
}

// Tipo optimizado para visualización en tablas
export interface RoleTableRow {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string; // Formateado para UI
  updatedAt: string; // Formateado para UI
  createdBy?: string; // Solo el nombre del creador
  userCount: number;
  permissionCount: number;
   permissions?: Permission[];
   actions?: never;
}

// Estado para manejo en frontend
export interface RoleState {
  roles: Role[] | RoleTableRow[]; // Dependiendo del caso de uso
  isLoading: boolean;
  error: Error | null;
}

// Configuración para ordenamiento
export interface SortConfig<T = keyof RoleTableRow> {
  key: T;
  direction: 'asc' | 'desc';
}

// Tipo para rangos de fecha (react-day-picker)
export type DateRange = ReactDayPickerDateRange;