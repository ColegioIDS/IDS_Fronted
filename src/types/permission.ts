//src\types\permission.ts
export interface Permission {
    id: string;
    module: string;
    action: string;
    description: string;
    isActive: boolean;
    isSystem: boolean;

}

export interface PermissionsState {
  permissions: Permission[];
  isLoading: boolean;
  error: Error | null;
}


export type FilterOptions = {
  module: string;
  action: string;
  status: string;
  system: string;
  search: string;
};


