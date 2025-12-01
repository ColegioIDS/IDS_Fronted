/**
 * TABLA MEJORADA DE ESTUDIANTES PARA REGISTRO DE ASISTENCIA
 * - Diseño moderno con gradientes y sombras
 * - Selección múltiple para actualización masiva
 * - Estados dinámicos con íconos automáticos
 * - Resumen de estados en tiempo real
 * - Soporte para bulk-update endpoint del backend
 */

'use client';

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AttendanceStatusSelector } from './AttendanceStatusSelector';
import { AttendanceStatus } from '@/types/attendance.types';
import { 
  CheckCircle2, 
  Circle,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCheck,
  XCircle,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentData {
  id?: number;
  name?: string;
  enrollmentId: number;
  enrollmentNumber?: string;
  email?: string;
  identificationNumber?: string;
  avatarUrl?: string;
}

interface StudentAttendanceProps {
  students: StudentData[];
  studentAttendance: Map<number, { enrollmentId: number; status: string; isEarlyExit: boolean }>;
  onStatusChange: (enrollmentId: number, status: string) => void;
  onEarlyExitToggle: (enrollmentId: number, isEarlyExit: boolean) => void;
  allowedStatuses?: AttendanceStatus[];
  isLoading?: boolean;
  existingAttendance?: Map<number, { statusId: number; isEarlyExit: boolean }>;
  onBulkStatusChange?: (enrollmentIds: number[], statusId: string) => void;
}

export function ImprovedStudentAttendanceTable({
  students,
  studentAttendance,
  onStatusChange,
  onEarlyExitToggle,
  allowedStatuses,
  isLoading = false,
  existingAttendance = new Map(),
  onBulkStatusChange,
}: StudentAttendanceProps) {
  
  // Estado para selección múltiple
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [bulkStatusId, setBulkStatusId] = useState<string>('');
  
  // Función para obtener iniciales
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Función para obtener icono del estado dinámicamente
  const getStatusIcon = (status: AttendanceStatus) => {
    const iconProps = { className: 'h-3.5 w-3.5' };
    
    // Mapeo dinámico basado en el nombre o descripción
    const name = status.name.toLowerCase();
    const desc = status.description?.toLowerCase() || '';
    
    if (name.includes('presente') || desc.includes('presente')) {
      return <CheckCircle2 {...iconProps} />;
    }
    if (name.includes('inasistencia justificada') || desc.includes('justificada')) {
      return <CheckCheck {...iconProps} />;
    }
    if (name.includes('inasistencia') || name.includes('ausente') || desc.includes('ausent')) {
      return <XCircle {...iconProps} />;
    }
    if (name.includes('tard') || desc.includes('tard')) {
      return <Clock {...iconProps} />;
    }
    if (name.includes('salida') || desc.includes('temprana')) {
      return <AlertCircle {...iconProps} />;
    }
    
    // Default icon
    return <Circle {...iconProps} />;
  };

  // Calcular totales por estado
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    Array.from(studentAttendance.values()).forEach(att => {
      if (att.status) {
        counts[att.status] = (counts[att.status] || 0) + 1;
      }
    });
    
    return counts;
  }, [studentAttendance]);

  // Manejar selección de todos los estudiantes
  const toggleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.enrollmentId)));
    }
  };

  // Manejar selección de estudiante individual
  const toggleSelectStudent = (enrollmentId: number) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(enrollmentId)) {
        newSet.delete(enrollmentId);
      } else {
        newSet.add(enrollmentId);
      }
      return newSet;
    });
  };

  // Aplicar estado masivo
  const applyBulkStatus = () => {
    if (bulkStatusId && selectedStudents.size > 0 && onBulkStatusChange) {
      onBulkStatusChange(Array.from(selectedStudents), bulkStatusId);
      setSelectedStudents(new Set());
      setBulkStatusId('');
    }
  };

  const isAllSelected = selectedStudents.size === students.length && students.length > 0;
  const isSomeSelected = selectedStudents.size > 0 && selectedStudents.size < students.length;

  return (
    <div className="space-y-6">
      {/* Toolbar de acciones masivas */}
      {onBulkStatusChange && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 shadow-lg backdrop-blur-sm">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative flex items-center gap-4 p-5">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border border-white/50 dark:border-gray-700/50">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actualización Masiva
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {selectedStudents.size > 0 
                    ? `${selectedStudents.size} seleccionado${selectedStudents.size > 1 ? 's' : ''}` 
                    : 'Seleccionar estudiantes'}
                </div>
              </div>
            </div>
          
            {selectedStudents.size > 0 && (
              <div className="flex items-center gap-3 ml-auto">
                <Select value={bulkStatusId} onValueChange={setBulkStatusId}>
                  <SelectTrigger className="w-[220px] h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-shadow rounded-xl font-medium">
                    <SelectValue placeholder="Estado a aplicar..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl">
                    {allowedStatuses?.map((status) => (
                      <SelectItem 
                        key={status.id} 
                        value={status.id.toString()}
                        className="rounded-lg my-1"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'rounded-lg p-2 shadow-sm',
                            status.colorCode ? `bg-[${status.colorCode}]/20` : 'bg-gray-100 dark:bg-gray-700'
                          )}>
                            {getStatusIcon(status)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold">{status.name}</span>
                            {status.description && (
                              <span className="text-xs text-muted-foreground">{status.description}</span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              
                <Button
                  onClick={applyBulkStatus}
                  disabled={!bulkStatusId || isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold rounded-xl"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aplicar Cambios
                </Button>
              
                <Button
                  onClick={() => setSelectedStudents(new Set())}
                  variant="outline"
                  size="lg"
                  className="rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumen de estados */}
      {allowedStatuses && allowedStatuses.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900/50 dark:via-gray-900/50 dark:to-zinc-900/50 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Resumen de Asistencia
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {students.length} estudiantes en total
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {allowedStatuses.map(status => {
                const count = statusCounts[status.id.toString()] || 0;
                const percentage = students.length > 0 ? ((count / students.length) * 100).toFixed(0) : 0;
                
                return (
                  <div
                    key={status.id}
                    className={cn(
                      'group relative overflow-hidden rounded-xl border-2 transition-all duration-300',
                      count > 0 
                        ? 'bg-white dark:bg-gray-800 shadow-md hover:shadow-xl scale-100 border-gray-200 dark:border-gray-700' 
                        : 'bg-gray-50 dark:bg-gray-900/30 shadow-sm scale-95 border-gray-100 dark:border-gray-800 opacity-60'
                    )}
                  >
                    {/* Progress bar background */}
                    {count > 0 && (
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    
                    <div className="relative px-4 py-3 flex items-center gap-3">
                      <div className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg shadow-sm transition-transform group-hover:scale-110',
                        status.colorCode ? `bg-[${status.colorCode}]/20` : 'bg-gray-100 dark:bg-gray-700'
                      )}>
                        {getStatusIcon(status)}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {status.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-extrabold text-primary">
                            {count}
                          </span>
                          {count > 0 && (
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              ({percentage}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabla de estudiantes */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Decorative header gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-100 via-gray-100 to-zinc-100 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 border-b-2 border-gray-200 dark:border-gray-700 hover:from-slate-200 hover:via-gray-200 hover:to-zinc-200 dark:hover:from-slate-800 dark:hover:via-gray-800 dark:hover:to-zinc-800">
              {onBulkStatusChange && (
                <TableHead className="w-[60px] text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      className={cn(
                        'h-5 w-5 rounded-lg border-2 shadow-sm',
                        isSomeSelected && 'data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-blue-500 data-[state=checked]:to-indigo-600'
                      )}
                      aria-label="Seleccionar todos"
                    />
                  </div>
                </TableHead>
              )}
              <TableHead className="w-[70px] text-center">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">N°</span>
              </TableHead>
              <TableHead>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Estudiante</span>
              </TableHead>
              <TableHead>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Matrícula</span>
              </TableHead>
              <TableHead className="w-[240px]">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Estado de Asistencia</span>
              </TableHead>
              <TableHead className="w-[150px] text-center">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Estatus</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, index) => {
              const enrollmentId = student.enrollmentId as number;
              const attendance = studentAttendance.get(enrollmentId);
              const studentName = student.name || 'Sin nombre';
              const hasExistingRecord = existingAttendance.has(enrollmentId);
              const isSelected = selectedStudents.has(enrollmentId);

              return (
                <TableRow 
                  key={enrollmentId} 
                  className={cn(
                    "group transition-all duration-300 border-b border-gray-100 dark:border-gray-800",
                    "hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20",
                    "hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800",
                    hasExistingRecord && "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900",
                    isSelected && "bg-blue-100/80 dark:bg-blue-900/30 border-l-4 border-l-blue-600 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800"
                  )}
                >
                  {onBulkStatusChange && (
                    <TableCell className="text-center py-5">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectStudent(enrollmentId)}
                          className="h-5 w-5 rounded-lg border-2 shadow-sm transition-all hover:scale-110"
                          aria-label={`Seleccionar ${studentName}`}
                        />
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-center py-5">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/50 text-xs font-extrabold text-violet-700 dark:text-violet-300 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all border border-violet-200 dark:border-violet-800">
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-700 shadow-lg ring-2 ring-blue-200 dark:ring-blue-900 group-hover:ring-blue-400 dark:group-hover:ring-blue-600 transition-all group-hover:scale-110">
                          <AvatarImage src={student.avatarUrl} alt={studentName} />
                          <AvatarFallback className="bg-indigo-500 text-white font-bold text-sm">
                            {getInitials(studentName)}
                          </AvatarFallback>
                        </Avatar>
                        {hasExistingRecord && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                          {studentName}
                        </span>
                        {student.email && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline-block font-medium">
                            {student.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <Badge 
                      variant="outline" 
                      className="font-mono font-semibold text-xs bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-800/40 transition-all shadow-sm hover:shadow-md border-2 border-sky-300 dark:border-sky-700 px-3 py-1.5 text-sky-700 dark:text-sky-300"
                    >
                      {student.enrollmentNumber || `#${enrollmentId}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5">
                    <AttendanceStatusSelector
                      enrollmentId={enrollmentId}
                      value={attendance?.status || ''}
                      onChange={onStatusChange}
                      allowedStatuses={allowedStatuses}
                      disabled={isLoading}
                    />
                  </TableCell>
                  <TableCell className="text-center py-5">
                    {hasExistingRecord ? (
                      <Badge className="gap-2 bg-emerald-500 text-white border-0 px-4 py-2 shadow-lg hover:shadow-xl hover:bg-emerald-600 transition-all font-semibold hover:scale-105">
                        <CheckCircle2 className="h-4 w-4 animate-pulse" />
                        Registrado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-2 border-dashed border-2 px-4 py-2 text-amber-600 dark:text-amber-400 border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all">
                        <Circle className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
