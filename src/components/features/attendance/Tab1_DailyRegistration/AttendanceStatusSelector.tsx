/**
 * SELECTOR DE ESTADO DE ASISTENCIA
 * Componente dropdown para seleccionar estado (Presente, Ausente, Tarde, etc.)
 */

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AttendanceStatus } from '@/types/attendance.types';

interface AttendanceSelectorProps {
  enrollmentId: number;
  value: string; // ID como string (se convierte a number en padre)
  onChange: (enrollmentId: number, statusId: string) => void;
  allowedStatuses?: AttendanceStatus[];
  disabled?: boolean;
}

// Estados por defecto si no se pueden cargar
const DEFAULT_STATUSES: AttendanceStatus[] = [
  { 
    id: 1, 
    code: 'PRESENT', 
    name: 'Presente',
    description: 'Estudiante presente',
    requiresJustification: false,
    canHaveNotes: false,
    isNegative: false,
    isExcused: false,
    isTemporal: false,
    order: 1,
    isActive: true,
  },
  { 
    id: 2, 
    code: 'ABSENT', 
    name: 'Ausente',
    description: 'Estudiante ausente',
    requiresJustification: true,
    canHaveNotes: true,
    isNegative: true,
    isExcused: false,
    isTemporal: false,
    order: 2,
    isActive: true,
  },
  { 
    id: 3, 
    code: 'TARDY', 
    name: 'Tardío',
    description: 'Estudiante llegó tarde',
    requiresJustification: false,
    canHaveNotes: true,
    isNegative: false,
    isExcused: false,
    isTemporal: false,
    order: 3,
    isActive: true,
  },
  { 
    id: 4, 
    code: 'EXCUSED', 
    name: 'Excusado',
    description: 'Ausencia justificada',
    requiresJustification: false,
    canHaveNotes: true,
    isNegative: false,
    isExcused: true,
    isTemporal: false,
    order: 4,
    isActive: true,
  },
];

export function AttendanceStatusSelector({
  enrollmentId,
  value,
  onChange,
  allowedStatuses,
  disabled = false,
}: AttendanceSelectorProps) {
  // ✅ Usar estados del rol si existen, sino defaults
  const statuses = allowedStatuses && allowedStatuses.length > 0 ? allowedStatuses : DEFAULT_STATUSES;
  
  // ✅ Encontrar el status actual para mostrar su nombre
  const currentStatus = statuses.find(s => String(s.id) === value);

  return (
    <Select 
      value={value || ''} 
      onValueChange={(statusId) => onChange(enrollmentId, statusId)} 
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecciona estado...">
          {currentStatus ? currentStatus.name : 'Selecciona estado...'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem
            key={status.id}
            value={String(status.id)} // ✅ IMPORTANTE: Enviar ID como string
          >
            {status.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
