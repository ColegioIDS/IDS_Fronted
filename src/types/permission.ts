//src\types\permission.ts
export interface Permission {
    id: string;
    module: string;
    action: string;
    description: string;
    isActive: boolean;
    isSystem: boolean;

}