// src/components/attendance/components/attendance-controls/BulkActions.tsx
"use client";

import { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  Users, 
  Zap, 
  RotateCcw,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AttendanceStatusCode } from '@/types/attendance.types';
import { useAttendanceStatuses } from '@/hooks/attendance';

interface BulkActionsProps {
  selectedStudents: number[]; // Array de enrollmentIds seleccionados
  allStudents: number[]; // Array de todos los enrollmentIds disponibles
  totalStudents: number;
  onBulkAction: (enrollmentIds: number[], attendanceStatusId: number) => Promise<void>;  // ✅ CAMBIO: attendanceStatusId en lugar de statusCode
  onSelectAll: () => void;
  onClearSelection: () => void;
  isProcessing?: boolean;
  currentStats: Record<string, number>; // Contador dinámico por ID de estado
}

// 🎨 Mapeo de iconos por tipo de estado (fallback genérico)
const getIconForStatus = (code: string, isExcused: boolean, isNegative: boolean): any => {
  // Prioridad: excusado > negativo > por defecto
  if (isExcused) return FileText;      // Justificaciones
  if (isNegative) return XCircle;      // Faltas/tardanzas
  return CheckCircle;                  // Por defecto
};

/**
 * Obtiene variantes del color (más saturado/fuerte)
 * para que el texto sea visible sobre el fondo semi-transparente
 */
const getDarkenColor = (hex: string | null | undefined): string => {
  if (!hex) return '#6b7280';
  
  // Convertir hex a RGB
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  // Oscurecer el color multiplicando por 0.7 (70% más fuerte)
  const darkR = Math.max(0, Math.floor(r * 0.7));
  const darkG = Math.max(0, Math.floor(g * 0.7));
  const darkB = Math.max(0, Math.floor(b * 0.7));

  // Convertir de vuelta a hex
  return `#${[darkR, darkG, darkB]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')}`;
};

/**
 * Convertir color hexadecimal a estilos dinámicos
 * Genera clases Tailwind inline basadas en el color real de la API
 */
const getColorStyles = (hex: string | null | undefined) => {
  if (!hex) {
    return {
      text: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-700',
      hex: '#6b7280',
    };
  }

  return {
    text: `text-opacity-100`,
    bg: `bg-opacity-10`,
    border: `border-opacity-30`,
    hex: hex,
    // Estilos inline para máxima compatibilidad
    textStyle: { color: hex },
    bgStyle: { 
      backgroundColor: hex,
      opacity: 0.15,  // Cambié de 0.1 a 0.15 (15% opacidad)
    },
  };
};

export default function BulkActions({
  selectedStudents,
  allStudents,
  totalStudents,
  onBulkAction,
  onSelectAll,
  onClearSelection,
  isProcessing = false,
  currentStats
}: BulkActionsProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  
  // 📡 Cargar estados dinámicamente desde el backend
  const { statuses, loading: statusesLoading, error: statusesError, getStatusLabel, getStatusColor } = useAttendanceStatuses();

  // 🎨 Generar acciones masivas dinámicamente desde los estados cargados
  const BULK_ACTIONS = useMemo(() => {
    return statuses
      .filter(s => s.isActive) // Solo estados activos
      .sort((a, b) => a.order - b.order) // Ordenar por orden definido
      .map(status => {
        const colorStyles = getColorStyles(status.colorCode);
        const icon = getIconForStatus(status.code, status.isExcused, status.isNegative);
        
        return {
          statusId: status.id,  // ✅ CAMBIO: Usar ID en lugar de código
          statusCode: status.code,
          label: `Marcar como ${status.name}`,
          icon,
          colorHex: status.colorCode || '#6b7280',
          colorStyles,
          description: status.description || `Marca los estudiantes seleccionados como ${status.name.toLowerCase()}`,
        };
      });
  }, [statuses]);

  // 📊 Calcular estadísticas de selección
  const hasSelection = selectedStudents.length > 0;
  const isAllSelected = selectedStudents.length === allStudents.length && allStudents.length > 0;
  const selectionPercentage = totalStudents > 0 ? Math.round((selectedStudents.length / totalStudents) * 100) : 0;

  // 🎯 Ejecutar acción masiva
  const handleBulkAction = async (attendanceStatusId: number) => {  // ✅ CAMBIO: ID en lugar de código
    if (selectedStudents.length === 0) return;
    
    setIsExecuting(true);
    try {
      await onBulkAction(selectedStudents, attendanceStatusId);
    } catch (error) {
      console.error('Error en acción masiva:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // ⚡ Acciones rápidas para todos los estudiantes
  const handleQuickAction = async (attendanceStatusId: number) => {  // ✅ CAMBIO: ID en lugar de código
    if (allStudents.length === 0) return;
    
    setIsExecuting(true);
    try {
      await onBulkAction(allStudents, attendanceStatusId);
    } catch (error) {
      console.error('Error en acción rápida:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // 🎨 Obtener estado visual según selección
  const getSelectionVariant = () => {
    if (selectedStudents.length === 0) return "outline";
    if (isAllSelected) return "default";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Acciones Masivas</span>
            {statusesLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
          </div>
          
          {hasSelection && (
            <Badge variant="secondary" className="ml-2">
              {selectedStudents.length} seleccionado{selectedStudents.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ⚠️ Mostrar error si hay problema cargando estados */}
        {statusesError && (
          <Alert variant="destructive">
            <AlertDescription>
              Error cargando estados de asistencia: {statusesError}
            </AlertDescription>
          </Alert>
        )}
        {/* 📊 Estado actual de asistencia - DINÁMICO DEL BACKEND (TODOS LOS ESTADOS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 text-xs">
          {statuses
            .filter(s => s.isActive)
            .sort((a, b) => a.order - b.order)
            .map(status => {
              const darkenedColor = getDarkenColor(status.colorCode);
              
              return (
                <div 
                  key={status.code} 
                  className="text-center p-3 rounded border transition-all hover:shadow-md"
                  style={{
                    backgroundColor: status.colorCode + '26', // 15% opacity en hex (26 = ~15%)
                    borderColor: status.colorCode || '#d1d5db',
                  }}
                >
                  {/* Código con color oscurecido */}
                  <div 
                    className="font-bold text-sm"
                    style={{
                      color: darkenedColor,
                    }}
                  >
                    {status.code}
                  </div>
                  {/* Nombre con color oscurecido */}
                  <div 
                    className="text-xs font-medium mt-1"
                    style={{
                      color: darkenedColor,
                    }}
                  >
                    {status.name}
                  </div>
                </div>
              );
            })}
        </div>

        {/* 🎯 Controles de selección */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant={getSelectionVariant()}
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            disabled={totalStudents === 0 || isExecuting}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            {isAllSelected ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            {hasSelection && !isAllSelected && (
              <Badge variant="outline" className="ml-2">
                {selectionPercentage}%
              </Badge>
            )}
          </Button>

          {hasSelection && (
            <Button
              variant="outline"
              onClick={onClearSelection}
              disabled={isExecuting}
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        {/* ⚡ Acciones rápidas (para todos) */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Acciones Rápidas (Todos los estudiantes)
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {BULK_ACTIONS.map((action) => {
              const Icon = action.icon;
              const darkenedColor = getDarkenColor(action.colorHex);
              
              return (
                <Button
                  key={action.statusId}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.statusId)}
                  disabled={totalStudents === 0 || isExecuting || isProcessing}
                  style={{
                    borderColor: action.colorHex,
                    backgroundColor: action.colorHex + '15', // 15% opacity
                    color: darkenedColor, // Usar color oscurecido
                  }}
                  className="border-dashed hover:opacity-80"
                  title={`${action.description} (${totalStudents} estudiantes)`}
                >
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" style={{ color: darkenedColor }} />
                  )}
                  <span className="ml-1 hidden sm:inline text-xs font-semibold">
                    Todo {action.statusCode}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* 🎯 Acciones para seleccionados */}
        {hasSelection && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Acciones para Seleccionados ({selectedStudents.length} estudiantes)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {BULK_ACTIONS.map((action) => {
                const Icon = action.icon;
                
                return (
                  <Button
                    key={`selected-${action.statusId}`}
                    variant="default"
                    size="sm"
                    onClick={() => handleBulkAction(action.statusId)}
                    disabled={isExecuting || isProcessing}
                    style={{
                      borderColor: action.colorHex,
                      backgroundColor: action.colorHex + '26', // 15% opacity igual a otros botones
                      color: getDarkenColor(action.colorHex),
                    }}
                  >
                    {isExecuting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Icon className="h-4 w-4 mr-2" style={{ color: getDarkenColor(action.colorHex) }} />
                    )}
                    <span className="text-sm font-semibold">
                      {action.statusCode}
                    </span>
                    <Badge variant="outline" className="ml-2">
                      {selectedStudents.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* ℹ️ Ayuda contextual */}
        {!hasSelection && totalStudents > 0 && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-900 dark:text-blue-200">
              <div className="space-y-2">
                <p className="font-semibold">💡 Cómo usar Acciones Masivas</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Acciones Rápidas:</strong> Marca todos los {totalStudents} estudiantes con un estado</li>
                  <li><strong>Selecciona estudiantes:</strong> Usa los checkboxes individuales para seleccionar grupos específicos</li>
                  <li><strong>Acciones para Seleccionados:</strong> Aparecerá cuando selecciones al menos 1 estudiante</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {totalStudents === 0 && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-900 dark:text-amber-200">
              <strong>No hay estudiantes cargados.</strong> Selecciona una sección en la vista anterior para comenzar.
            </AlertDescription>
          </Alert>
        )}

        {/* 🚧 Estado de procesamiento */}
        {(isExecuting || isProcessing) && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Procesando:</strong> Aplicando cambios de asistencia...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}