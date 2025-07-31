
/**
 * Retorna las iniciales de un nombre y apellido (por ejemplo "Juan Carlos Pérez" → "JP")
 */
export function getInitials(givenNames: string, lastNames: string): string {
  const firstNameInitial = givenNames?.trim().charAt(0).toUpperCase() ?? '';
  const lastNameInitial = lastNames?.trim().charAt(0).toUpperCase() ?? '';

  return `${firstNameInitial}${lastNameInitial}`;
}