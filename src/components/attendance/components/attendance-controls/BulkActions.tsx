// src/components/attendance/components/attendance-controls/BulkActions.tsx
"use client";

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
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
import { AttendanceStatus } from '@/types/attendance.types';

interface BulkActionsProps {
  selectedStudents: number[]; // Array de enrollmentIds seleccionados
  allStudents: number[]; // Array de todos los enrollmentIds disponibles
  totalStudents: number;
  onBulkAction: (enrollmentIds: number[], status: AttendanceStatus) => Promise<void>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isProcessing?: boolean;
  currentStats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    pending: number;
  };
}

// 🎨 Configuración de acciones masivas
const BULK_ACTIONS = [
  {
    status: 'present' as AttendanceStatus,
    label: 'Marcar como Presentes',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/20',
    description: 'Marca los estudiantes seleccionados como presentes'
  },
  {
    status: 'absent' as AttendanceStatus,
    label: 'Marcar como Ausentes',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    description: 'Marca los estudiantes seleccionados como ausentes'
  },
  {
    status: 'late' as AttendanceStatus,
    label: 'Marcar como Tardíos',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
    description: 'Marca los estudiantes seleccionados como tardíos'
  },
  {
    status: 'excused' as AttendanceStatus,
    label: 'Marcar como Justificados',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    description: 'Marca los estudiantes seleccionados como justificados'
  }
];

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

  // 📊 Calcular estadísticas de selección
  const hasSelection = selectedStudents.length > 0;
  const isAllSelected = selectedStudents.length === allStudents.length && allStudents.length > 0;
  const selectionPercentage = totalStudents > 0 ? Math.round((selectedStudents.length / totalStudents) * 100) : 0;

  // 🎯 Ejecutar acción masiva
  const handleBulkAction = async (status: AttendanceStatus) => {
    if (selectedStudents.length === 0) return;
    
    setIsExecuting(true);
    try {
      await onBulkAction(selectedStudents, status);
    } catch (error) {
      console.error('Error en acción masiva:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // ⚡ Acciones rápidas para todos los estudiantes
  const handleQuickAction = async (status: AttendanceStatus) => {
    if (allStudents.length === 0) return;
    
    setIsExecuting(true);
    try {
      await onBulkAction(allStudents, status);
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
          </div>
          
          {hasSelection && (
            <Badge variant="secondary" className="ml-2">
              {selectedStudents.length} seleccionado{selectedStudents.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 📊 Estado actual de asistencia */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="font-semibold text-green-600 dark:text-green-400">{currentStats.present}</div>
            <div className="text-green-700 dark:text-green-300">Presentes</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <div className="font-semibold text-red-600 dark:text-red-400">{currentStats.absent}</div>
            <div className="text-red-700 dark:text-red-300">Ausentes</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <div className="font-semibold text-yellow-600 dark:text-yellow-400">{currentStats.late}</div>
            <div className="text-yellow-700 dark:text-yellow-300">Tardíos</div>
          </div>
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="font-semibold text-blue-600 dark:text-blue-400">{currentStats.excused}</div>
            <div className="text-blue-700 dark:text-blue-300">Justificados</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="font-semibold text-gray-600 dark:text-gray-400">{currentStats.pending}</div>
            <div className="text-gray-700 dark:text-gray-300">Pendientes</div>
          </div>
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
              return (
                <Button
                  key={action.status}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.status)}
                  disabled={totalStudents === 0 || isExecuting || isProcessing}
                  className={`${action.bgColor} border-dashed`}
                  title={`${action.description} (${totalStudents} estudiantes)`}
                >
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className={`h-4 w-4 ${action.color}`} />
                  )}
                  <span className="ml-1 hidden sm:inline text-xs">
                    Todos {action.status === 'present' ? 'P' : 
                           action.status === 'absent' ? 'A' : 
                           action.status === 'late' ? 'T' : 'J'}
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
                    key={`selected-${action.status}`}
                    variant="default"
                    size="sm"
                    onClick={() => handleBulkAction(action.status)}
                    disabled={isExecuting || isProcessing}
                    className={`${action.bgColor}`}
                  >
                    {isExecuting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Icon className={`h-4 w-4 mr-2 ${action.color}`} />
                    )}
                    <span className="text-sm">{action.label}</span>
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
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>Tip:</strong> Selecciona estudiantes individualmente o usa "Seleccionar Todos" 
              para aplicar acciones masivas y ahorrar tiempo.
            </AlertDescription>
          </Alert>
        )}

        {totalStudents === 0 && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              No hay estudiantes cargados. Selecciona una sección para comenzar.
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