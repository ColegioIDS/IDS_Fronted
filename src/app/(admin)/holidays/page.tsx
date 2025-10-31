// src/app/(admin)/holidays/page.tsx

import { HolidaysPageContent } from '@/components/features/holidays';

export const metadata = {
  title: 'Días Festivos | IDS Colegio',
  description: 'Gestión de días festivos y recuperables del sistema educativo',
};

/**
 * 📅 Página de Días Festivos
 * 
 * Ruta: /holidays
 */
export default function HolidaysPage() {
  return <HolidaysPageContent />;
}
