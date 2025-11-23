/**
 * SELECTOR DE ESTADO DE ASISTENCIA
 * Componente dropdown para seleccionar estado (Presente, Ausente, Tarde, etc.)
 * Rediseñado para usar un Badge interactivo en lugar de un Select nativo.
 */

'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatus } from '@/types/attendance.types';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

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
    colorCode: '#10b981' // Green
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
    colorCode: '#ef4444' // Red
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
    colorCode: '#f59e0b' // Amber/Yellow
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
    colorCode: '#3b82f6' // Blue
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

  // Función auxiliar para obtener colores (fallback si no vienen en DB)
  const getStatusColorStyles = (code: string, colorCode?: string) => {
    // Si tenemos colorCode directo, usarlo para generar estilos
    if (colorCode && /^#[0-9A-F]{6}$/i.test(colorCode)) {
      return {
        borderColor: colorCode,
        backgroundColor: `${colorCode}20`, // 20 = ~12% opacity hex
        color: colorCode,
      };
    }

    // Fallbacks por código
    switch (code) {
      case 'PRESENT':
        return { borderColor: '#10b981', backgroundColor: '#ecfdf5', color: '#047857' }; // Green-700
      case 'ABSENT':
        return { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#b91c1c' }; // Red-700
      case 'TARDY':
        return { borderColor: '#f59e0b', backgroundColor: '#fffbeb', color: '#b45309' }; // Amber-700
      case 'EXCUSED':
        return { borderColor: '#3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8' }; // Blue-700
      default:
        return { borderColor: '#6b7280', backgroundColor: '#f3f4f6', color: '#374151' }; // Gray-700
    }
  };

  const currentStyles = currentStatus 
    ? getStatusColorStyles(currentStatus.code, currentStatus.colorCode)
    : { borderColor: '#e5e7eb', backgroundColor: '#ffffff', color: '#6b7280' };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled} className="outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
        <Badge 
          variant="outline" 
          className={cn(
            "cursor-pointer px-3 py-1 text-sm font-medium transition-all hover:opacity-80 flex items-center gap-1.5 border",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            borderColor: currentStyles.borderColor,
            backgroundColor: currentStyles.backgroundColor,
            color: currentStyles.color,
          }}
        >
          {currentStatus ? currentStatus.name : 'Seleccionar'}
          {!disabled && <ChevronDown className="h-3 w-3 opacity-70" />}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        {statuses.map((status) => {
          const styles = getStatusColorStyles(status.code, status.colorCode);
          return (
            <DropdownMenuItem
              key={status.id}
              onClick={() => onChange(enrollmentId, String(status.id))}
              className="cursor-pointer font-medium"
            >
              <div 
                className="mr-2 h-2.5 w-2.5 rounded-full" 
                style={{ backgroundColor: styles.borderColor }}
              />
              {status.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
