export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: number[]; // array de IDs de permisos
  isActive: boolean;
}

export interface RoleState {
  roles: Role[];
  isLoading: boolean;
  error: Error | null;
}

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

export interface CreatedBy {
  id: number;
  fullName: string;
}

export interface RoleTableRow {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: number | null;
  modifiedById: number | null;
  userCount: number;
  permissions: Permission[];
  createdBy: CreatedBy | null;
  modifiedBy: CreatedBy | null;
}

export interface SortConfig<T = string> {
  key: T;
  direction: 'asc' | 'desc';
}
