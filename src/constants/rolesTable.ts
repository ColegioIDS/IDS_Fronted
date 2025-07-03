import { is } from "date-fns/locale";

// src/constants/rolesTable.ts
export const TABLE_COLUMNS = [
  { key: "name" as const, label: "Nombre", sortable: true, isActionColumn: false },
  { key: "description" as const, label: "Descripción", sortable: true, isActionColumn: false },
  { key: "userCount" as const, label: "Usuarios", sortable: true, isActionColumn: false },
  { key: "createdBy" as const, label: "Creado por", sortable: true, isActionColumn: false },
  { key: "isActive" as const, label: "Estado", sortable: true, isActionColumn: false },
  { key: "permissionCount" as const, label: "Permisos", sortable: true, isActionColumn: false },
  {key:'actions' as const, label: 'Acciones', sortable: false,  isActionColumn: true}
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];