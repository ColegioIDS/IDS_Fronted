'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Check, X, AlertCircle, Clock, Users, Loader2, BookOpen, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { AttendanceStatusCode } from '@/types/attendance.types';
import { useAttendanceActions, useAttendanceStatuses } from '@/hooks/attendance';
import { cn } from '@/lib/utils';

import HolidayNotice from '../attendance-states/HolidayNotice';
import { NoStudentsState, NoSearchResultsState } from '../attendance-states/EmptyState';
import BulkActions from '../attendance-controls/BulkActions';
import { CourseSelector } from '../attendance-controls/CourseSelector';

// 🧑 Avatar con iniciales del estudiante
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500',
  'bg-yellow-500', 'bg-green-500', 'bg-teal-500', 'bg-cyan-500', 'bg-indigo-500',
];

// 🎨 Iconos para cada código de estado (constante global)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'P': Check,
  'I': X,
  'T': Clock,
  'IJ': AlertCircle,
  'TJ': Clock,
  'E': AlertCircle,
  'M': AlertCircle,
  'A': AlertCircle,
};

// 🎨 Mapeo de colores hex a clases Tailwind (constante global)
const HEX_TO_TAILWIND: Record<string, { bg: string; hover: string; text: string; badge: string }> = {
  '#10b981': { // Verde (P - Presente)
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-800',
    text: 'text-emerald-900 dark:text-emerald-100',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
  },
  '#ef4444': { // Rojo (I - Inasistencia)
    bg: 'bg-red-100 dark:bg-red-900/30',
    hover: 'hover:bg-red-200 dark:hover:bg-red-800',
    text: 'text-red-900 dark:text-red-100',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  },
  '#eab308': { // Amarillo (T - Tardanza)
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    hover: 'hover:bg-yellow-200 dark:hover:bg-yellow-800',
    text: 'text-yellow-900 dark:text-yellow-100',
    badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
  },
  '#f59e0b': { // Ámbar (IJ - Inasistencia Justificada)
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    hover: 'hover:bg-amber-200 dark:hover:bg-amber-800',
    text: 'text-amber-900 dark:text-amber-100',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
  },
  '#84cc16': { // Lima (TJ - Tardanza Justificada)
    bg: 'bg-lime-100 dark:bg-lime-900/30',
    hover: 'hover:bg-lime-200 dark:hover:bg-lime-800',
    text: 'text-lime-900 dark:text-lime-100',
    badge: 'bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-200'
  },
  '#3b82f6': { // Azul (E - Excusado)
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
  },
  '#8b5cf6': { // Violeta (M - Permiso Médico)
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    hover: 'hover:bg-violet-200 dark:hover:bg-violet-800',
    text: 'text-violet-900 dark:text-violet-100',
    badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200'
  },
  '#6366f1': { // Indigo (A - Permiso Administrativo)
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    hover: 'hover:bg-indigo-200 dark:hover:bg-indigo-800',
    text: 'text-indigo-900 dark:text-indigo-100',
    badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
  },
};

// 🎨 Función para convertir cualquier color HEX a variables CSS dinámicas
// Esta función genera clases Tailwind dinámicamente basadas en colores hex del backend
function hexToTailwindClasses(hexColor: string): { bg: string; hover: string; text: string; badge: string } {
  // Si el color está en nuestro mapeo predefinido, usarlo
  if (HEX_TO_TAILWIND[hexColor]) {
    return HEX_TO_TAILWIND[hexColor];
  }

  // Si no está en el mapeo, generar clases dinámicamente usando valores CSS
  // Convertir hex a RGB para poder usar con opacity
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const rgb = `${r},${g},${b}`;

  // Generar clases con estilos inline como fallback
  return {
    bg: `bg-[rgb(${rgb}/0.1)] dark:bg-[rgb(${rgb}/0.2)]`,
    hover: `hover:bg-[rgb(${rgb}/0.2)] dark:hover:bg-[rgb(${rgb}/0.3)]`,
    text: `text-[rgb(${rgb}/0.9)] dark:text-[rgb(${rgb}/0.95)]`,
    badge: `bg-[rgb(${rgb}/0.1)] dark:bg-[rgb(${rgb}/0.2)] text-[rgb(${rgb}/0.9)] dark:text-[rgb(${rgb}/0.95)]`
  };
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]?.[0]?.toUpperCase() ?? '?';
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

function getColorByName(fullName: string): string {
  const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? 'bg-blue-500';
}

function StudentAvatarInitials({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = getInitials(name);
  const color = getColorByName(name);
  const sizeClass = size === 'lg' ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-base';

  return (
    <div className={cn('flex items-center justify-center rounded-full font-semibold text-white', color, sizeClass)} title={name}>
      {initials}
    </div>
  );
}

// 📋 Interface para los datos que devuelve el backend
// Backend devuelve: { id, enrollmentId, studentId, studentName, date, attendanceStatusId, ... }
interface StudentData {
  id?: number;                  // Attendance record ID
  enrollmentId: number;         // Enrollment ID
  studentId?: number;           // Student ID (agregado por el backend)
  studentName: string;          // Student full name
  grade?: string;               // Grade (opcional)
  section?: string;             // Section (opcional)
  date?: string;                // Attendance date
  attendanceStatusId?: number;  // ✅ CAMBIO: ID numérico en lugar de statusCode
  notes?: string | null;
  arrivalTime?: string | null;
  minutesLate?: number | null;
  departureTime?: string | null;
  hasJustification?: boolean;
  recordedAt?: string;
  lastModifiedAt?: string;
}

interface AttendanceTableProps {
  sectionId?: number;
  selectedDate: Date;
  onDateChange?: (date: Date) => void;
  onRefresh?: () => Promise<any>; // ✅ Callback para refrescar datos (retorna Promise)
  isHoliday?: boolean;
  holiday?: {
    id: number;
    date: Date | string;
    description: string;
    isRecovered: boolean;
  };
  data?: any[];  // Backend devuelve datos con studentName, enrollmentId, attendanceStatusId, etc
  loading?: boolean;
  error?: string | null;
}

const ATTENDANCE_CONFIG_FALLBACK: Record<AttendanceStatusCode, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeColor: string;
}> = {
  'P': {
    label: 'Presente',
    icon: Check,
    color: 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-900 dark:text-green-100 border-green-200 dark:border-green-700',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  },
  'I': {
    label: 'Inasistencia',
    icon: X,
    color: 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-900 dark:text-red-100 border-red-200 dark:border-red-700',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  },
  'T': {
    label: 'Tardanza',
    icon: Clock,
    color: 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  },
  'IJ': {
    label: 'Inasistencia Justificada',
    icon: AlertCircle,
    color: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  },
  'TJ': {
    label: 'Tardanza Justificada',
    icon: Clock,
    color: 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-700',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  },
  'E': {
    label: 'Excusado',
    icon: AlertCircle,
    color: 'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-900 dark:text-indigo-100 border-indigo-200 dark:border-indigo-700',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
  },
  'M': {
    label: 'Permiso Médico',
    icon: AlertCircle,
    color: 'bg-violet-100 hover:bg-violet-200 dark:bg-violet-900 dark:hover:bg-violet-800 text-violet-900 dark:text-violet-100 border-violet-200 dark:border-violet-700',
    badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
  },
  'A': {
    label: 'Permiso Administrativo',
    icon: AlertCircle,
    color: 'bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900 dark:hover:bg-cyan-800 text-cyan-900 dark:text-cyan-100 border-cyan-200 dark:border-cyan-700',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
  },
};

export default function AttendanceTable({
  sectionId,
  selectedDate,
  onDateChange,
  onRefresh, // ✅ Callback para refrescar
  isHoliday = false,
  holiday,
  data = [],
  loading = false,
  error = null,
}: AttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]); // ✅ NUEVO
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const { updateAttendance, createAttendance, upsertAttendance, bulkApplyStatus, bulkByCourses } = useAttendanceActions();
  
  // 📡 Cargar estados dinámicamente desde el backend
  const { statuses, loading: statusesLoading } = useAttendanceStatuses();
  
  // 🎨 Generar configuración dinámica de asistencia desde los estados cargados
  const ATTENDANCE_CONFIG = useMemo<Record<number, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    hexColor: string;
    badgeColor: string;
    code: AttendanceStatusCode;
  }>>(() => {
    const config: Record<number, any> = {};
    
    // Si los estados están cargados, usar sus nombres y colores dinámicos
    if (statuses.length > 0) {
      statuses.forEach(status => {
        const colorHex = status.colorCode || '#6b7280';
        // Usar la función para obtener colores (mapeo predefinido o generado dinámicamente)
        const tailwindColors = hexToTailwindClasses(colorHex);
        
        config[status.id] = {  // ✅ CAMBIO: Usar ID en lugar de code
          code: status.code as AttendanceStatusCode,
          label: status.name,
          icon: ICON_MAP[status.code] || Check,
          hexColor: colorHex,
          color: `${tailwindColors.bg} ${tailwindColors.hover} ${tailwindColors.text} border-2 border-gray-200 dark:border-gray-700`,
          badgeColor: tailwindColors.badge,
        };
      });
    } else {
      // Fallback si no hay estados cargados
      config[1] = { 
        code: 'P' as AttendanceStatusCode,
        label: 'Presente', 
        icon: Check, 
        hexColor: '#10b981',
        color: 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-100 border-2 border-gray-200 dark:border-gray-700',
        badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
      };
    }
    
    return config;
  }, [statuses]);

  // Filtros de búsqueda
  const filteredStudents = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter(student => {
      // Validar que studentName existe
      if (!student || !student.studentName) return false;
      
      const fullName = student.studentName.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query);
    });
  }, [data, searchQuery]);

  // DEBUG: Log inicial para ver qué datos llegan
  console.log('🔍 [AttendanceTable DEBUG]', {
    dataLength: data.length,
    filteredStudentsLength: filteredStudents.length,
    firstStudent: data[0],
  });

  // Estadísticas actuales - DINÁMICAS POR ID DE ESTADO
  const currentStats = useMemo(() => {
    // Crear contador dinámico para cada estado por ID
    const stats: Record<string | number, number> = {
      total: filteredStudents.length,
    };

    // Inicializar contador para cada estado activo del backend (por ID)
    if (statuses.length > 0) {
      statuses.forEach(status => {
        stats[status.id] = 0;
      });
    } else {
      // Fallback si los estados no cargaron
      stats[1] = 0;
      stats[2] = 0;
      stats[3] = 0;
      stats[4] = 0;
      stats[5] = 0;
      stats[6] = 0;
      stats[7] = 0;
      stats[8] = 0;
    }

    // 📊 CONTAR ESTUDIANTES POR ESTADO ACTUAL (por ID)
    // Recorrer estudiantes filtrados y contar por attendanceStatusId
    filteredStudents.forEach(student => {
      if (student.attendanceStatusId) {
        stats[student.attendanceStatusId] = (stats[student.attendanceStatusId] || 0) + 1;
      }
    });

    console.log('[AttendanceTable Stats Debug]', {
      filteredStudentsLength: filteredStudents.length,
      statusesLength: statuses.length,
      statusesIds: statuses.map(s => ({ id: s.id, code: s.code })),
      finalStats: stats,
    });

    return stats;
  }, [filteredStudents, statuses]);

  const handleStudentSelection = useCallback((enrollmentId: number, selected: boolean) => {
    setSelectedStudents(prev =>
      selected
        ? [...prev, enrollmentId]
        : prev.filter(id => id !== enrollmentId)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedStudents(filteredStudents.map(s => s.enrollmentId));
  }, [filteredStudents]);

  const handleClearSelection = useCallback(() => {
    setSelectedStudents([]);
  }, []);

  const handleAttendanceChange = useCallback(
    async (enrollmentId: number, attendanceStatusId: number) => {
      setUpdatingIds(prev => new Set([...prev, enrollmentId]));
      const loadingToast = toast.loading(`Registrando asistencia...`);
      
      try {
        const isoDate = selectedDate.toISOString().split('T')[0];
        const student = filteredStudents.find(s => s.enrollmentId === enrollmentId);
        const studentName = student?.studentName || 'Estudiante';
        const statusConfig = ATTENDANCE_CONFIG[attendanceStatusId];
        
        await upsertAttendance({
          enrollmentId,
          date: isoDate,
          attendanceStatusId,  // ✅ CAMBIO: Usar ID en lugar de código
          ...(selectedCourseIds.length > 0 && { courseAssignmentIds: selectedCourseIds }), // ✅ NUEVO: Agregar cursos seleccionados
        }, true);

        // Success toast
        toast.success(`${studentName} marcado como ${statusConfig?.code}`, {
          id: loadingToast,
          description: `Asistencia registrada para ${isoDate}`,
        });

        // 🔄 Refrescar datos si está disponible el callback
        if (onRefresh) {
          console.log('[AttendanceTable] Refrescando datos después de upsert...');
          await onRefresh();
        }

        console.log(`[AttendanceTable] Asistencia registrada exitosamente para enrollmentId ${enrollmentId}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        
        // ❌ Error toast
        toast.error(`Error al registrar asistencia`, {
          id: loadingToast,
          description: errorMessage,
        });

        console.error('Error registrando asistencia:', err);
      } finally {
        setUpdatingIds(prev => {
          const next = new Set(prev);
          next.delete(enrollmentId);
          return next;
        });
      }
    },
    [upsertAttendance, selectedDate, filteredStudents, onRefresh, ATTENDANCE_CONFIG, selectedCourseIds]
  );

  const handleBulkAction = useCallback(
    async (enrollmentIds: number[], attendanceStatusId: number) => {
      // Validación: Verificar que haya cursos seleccionados
      if (selectedCourseIds.length === 0) {
        toast.error('Selecciona al menos un curso', {
          description: 'Debes seleccionar uno o más cursos antes de registrar asistencia',
        });
        return;
      }

      const statusConfig = ATTENDANCE_CONFIG[attendanceStatusId];
      const dateStr = selectedDate.toISOString().split('T')[0];

      // Mostrar dialog de confirmación
      const result = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve(false), 30000); // Timeout 30s

        // Crear overlay de confirmación
        const overlay = document.createElement('div');
        overlay.className =
          'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';

        const dialog = document.createElement('div');
        dialog.className =
          'bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6 space-y-4';

        dialog.innerHTML = `
          <div class="space-y-3">
            <p class="font-medium text-gray-900">Confirmar registro de asistencia masiva</p>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 19H9a6 6 0 016-6v.001"></path></svg>
                <span>${enrollmentIds.length} estudiante(s)</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"></path></svg>
                <span>${selectedCourseIds.length} curso(s)</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span>${dateStr}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Estado: ${statusConfig?.code}</span>
              </div>
            </div>
            <p class="text-xs text-gray-500">Se crearán ${enrollmentIds.length * selectedCourseIds.length} registros de asistencia</p>
          </div>
          <div class="flex gap-3 pt-4 border-t">
            <button id="cancel-btn" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancelar
            </button>
            <button id="confirm-btn" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
              Confirmar
            </button>
          </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const cancelBtn = dialog.querySelector('#cancel-btn');
        const confirmBtn = dialog.querySelector('#confirm-btn');

        cancelBtn?.addEventListener('click', () => {
          clearTimeout(timer);
          overlay.remove();
          resolve(false);
        });

        confirmBtn?.addEventListener('click', () => {
          clearTimeout(timer);
          overlay.remove();
          resolve(true);
        });

        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            clearTimeout(timer);
            overlay.remove();
            resolve(false);
          }
        });
      });

      if (!result) {
        console.log('[AttendanceTable] Carga masiva cancelada por el usuario');
        return;
      }

      const newUpdatingIds = new Set(enrollmentIds);
      setUpdatingIds(prev => new Set([...prev, ...newUpdatingIds]));
      const loadingToast = toast.loading(`Marcando ${enrollmentIds.length} estudiante(s)...`);

      try {
        console.log('[AttendanceTable] Iniciando carga masiva...');
        console.log(`[AttendanceTable] Estudiantes: ${enrollmentIds.length}, Cursos: ${selectedCourseIds.length}`);

        await bulkByCourses({
          date: dateStr,
          courseAssignmentIds: selectedCourseIds,
          attendances: enrollmentIds.map(id => ({
            enrollmentId: id,
            attendanceStatusId,
          })),
        });

        toast.success(
          `${enrollmentIds.length} estudiante(s) marcado(s) en ${selectedCourseIds.length} curso(s) como ${statusConfig?.code}`,
          {
            id: loadingToast,
            description: `${enrollmentIds.length * selectedCourseIds.length} registros creados exitosamente`,
          }
        );

        console.log('[AttendanceTable] Carga masiva completada exitosamente');

        // Refrescar datos si está disponible el callback
        if (onRefresh) {
          console.log('[AttendanceTable] Refrescando datos...');
          await onRefresh();
        }

        setSelectedStudents([]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';

        toast.error(`Error en carga masiva`, {
          id: loadingToast,
          description: errorMessage,
        });

        console.error('[AttendanceTable] Error en carga masiva:', err);
      } finally {
        setUpdatingIds(prev => {
          const next = new Set(prev);
          enrollmentIds.forEach(id => next.delete(id));
          return next;
        });
      }
    },
    [bulkByCourses, selectedDate, selectedCourseIds, onRefresh, ATTENDANCE_CONFIG]
  );

  // 🎉 Si es día festivo, mostrar componente especial
  if (isHoliday && holiday) {
    return (
      <HolidayNotice
        holiday={holiday}
        selectedDate={selectedDate}
        onDateChange={onDateChange || (() => {})}
      />
    );
  }

  if (isHoliday && !holiday) {
    return (
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Día Festivo:</strong> No se puede tomar asistencia en días festivos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // 📭 Estado vacío
  if (data.length === 0 && !loading) {
    return (
      <NoStudentsState
        action={{
          label: "Cambiar sección",
          onClick: () => window.history.back(),
          variant: "default"
        }}
      />
    );
  }

  // 🔍 Sin resultados de búsqueda
  if (searchQuery && filteredStudents.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar estudiante por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <NoSearchResultsState
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      </div>
    );
  }

  // ✅ RENDERIZADO NORMAL - Tabla con estudiantes
  return (
    <div className="space-y-4">
      {/* ✅ NUEVO: Selector de cursos */}
      <CourseSelector
        sectionId={sectionId}
        selectedCourseIds={selectedCourseIds}
        onSelectionChange={setSelectedCourseIds}
        disabled={false}
      />

      {/* ⚡ Acciones masivas */}
      <BulkActions
        selectedStudents={selectedStudents}
        allStudents={filteredStudents.map(s => s.enrollmentId)}
        totalStudents={currentStats.total}
        onBulkAction={handleBulkAction}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        isProcessing={updatingIds.size > 0}
        currentStats={currentStats}
      />

      {/* 🔍 Barra de búsqueda y estadísticas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar estudiante por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{currentStats.total}</span>
                <span className="text-gray-500">estudiantes</span>
              </div>

              {statuses.length > 0 && statuses[0]?.id && ATTENDANCE_CONFIG[statuses[0].id] && currentStats[statuses[0].id] > 0 && (
                <Badge className={ATTENDANCE_CONFIG[statuses[0].id]?.badgeColor}>
                  {currentStats[statuses[0].id]} {statuses[0].name}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📊 Tabla principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Asistencia</span>
            <Badge variant="secondary">
              {selectedDate.toLocaleDateString('es-GT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredStudents.map((student, index) => {
              const isSelected = selectedStudents.includes(student.enrollmentId);
              const isUpdating = updatingIds.has(student.enrollmentId);
              
              // Obtener el color del status si existe
              const statusConfig = student.attendanceStatusId ? ATTENDANCE_CONFIG[student.attendanceStatusId] : null;
              const rowBgColor = statusConfig ? statusConfig.color.split(' ').filter((c: string) => c.includes('bg-')).join(' ') : 'border-gray-200 dark:border-gray-700';
              const rowBorderColor = statusConfig ? statusConfig.color.split(' ').filter((c: string) => c.includes('border-')).join(' ') : 'border-gray-200 dark:border-gray-700';

              return (
                <div
                  key={student.enrollmentId}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:opacity-80 transition-colors ${
                    student.attendanceStatusId 
                      ? `${rowBgColor} ${rowBorderColor}` 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleStudentSelection(student.enrollmentId, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    />

                    <StudentAvatarInitials
                      name={student.studentName}
                      size="md"
                    />

                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                        <span>{student.studentName}</span>
                        {student.attendanceStatusId && ATTENDANCE_CONFIG[student.attendanceStatusId] && (
                          <span className={`inline-block px-2 py-1 ${ATTENDANCE_CONFIG[student.attendanceStatusId]?.badgeColor} text-xs font-semibold rounded`}>
                            {ATTENDANCE_CONFIG[student.attendanceStatusId]?.code}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <span>Grado {student.grade} - Sección {student.section}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-wrap">
                    {statuses.map((status) => {
                      const config = ATTENDANCE_CONFIG[status.id];
                      const Icon = config?.icon || AlertCircle;
                      const isCurrentStatus = student.attendanceStatusId === status.id;

                      return (
                        <Button
                          key={status.id}
                          variant={isCurrentStatus ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAttendanceChange(student.enrollmentId, status.id)}
                          disabled={isUpdating}
                          className={isCurrentStatus ? config?.color : `border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700`}
                          title={config?.label}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden md:inline text-xs">{config?.code}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 📊 Resumen final dinámico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen de Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Total de estudiantes */}
            <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total:</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStats.total}</span>
            </div>

            {/* Estadísticas por estado */}
            {statuses && statuses.length > 0 && (
              <>
                {statuses.map((status) => {
                  const config = ATTENDANCE_CONFIG[status.id];
                  const textColorClass = config?.color?.split(' ').find((c: string) => c.startsWith('text-')) || 'text-gray-900 dark:text-gray-100';
                  const count = currentStats[status.id] || 0;
                  const Icon = config?.icon || AlertCircle;
                  const bgClass = config?.color.split(' ').filter((c: string) => c.includes('bg-')).join(' ') || 'bg-gray-50 dark:bg-gray-900/30';
                  const borderClass = config?.color.split(' ').filter((c: string) => c.includes('border-')).join(' ') || 'border-gray-200 dark:border-gray-700';

                  return (
                    <div
                      key={status.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border ${bgClass} ${borderClass}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{status.code}:</span>
                      <span className={`font-bold ${textColorClass}`}>{count}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
