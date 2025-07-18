// src/utils/role.ts
export function getRoleBadgeColor(role: string) {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-600';
    case 'docente':
      return 'bg-blue-100 text-blue-600';
    case 'Tutor':
      return 'bg-green-100 text-green-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}
