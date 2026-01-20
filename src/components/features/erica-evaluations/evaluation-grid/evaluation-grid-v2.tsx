// src/components/features/erica-evaluations/evaluation-grid/evaluation-grid-v2.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Save, 
  RefreshCw, 
  Users, 
  BarChart3, 
  AlertCircle, 
  CheckCircle2,
  XCircle,
  Undo2,
  Lightbulb,
  Check,
} from 'lucide-react';

import DimensionEvaluationCell from './dimension-evaluation-cell';
import GridStatsV2 from './grid-stats-v2';
import BulkStateSelector from './bulk-state-selector';
import HeaderBulkSelector from './header-bulk-selector';
import CopyEvaluations from './copy-evaluations';
import PatternsSelector from './patterns-selector';
import SmartSuggestions from './smart-suggestions';
import {
  EricaDimension,
  EricaState,
  EvaluationGridData,
  DimensionEvaluation,
  SaveGridEvaluationItem,
} from '@/types/erica-evaluations';
import {
  DIMENSION_ORDER,
  DIMENSION_SHORT_LABELS,
  getDimensionLabel,
  calculateStudentAverage,
  calculateStudentTotalPoints,
  countCompletedDimensions,
  isStudentFullyEvaluated,
  formatPoints,
  formatPercentage,
  getStudentInitials,
  formatStudentName,
} from '../utils/evaluation-helpers';
import { useEricaEvaluationGrid } from '@/hooks/data/erica-evaluations';

interface EvaluationGridV2Props {
  topicId: number;
  teacherId: number;
  topicTitle?: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
  statsHeaderAction?: React.ReactNode; // Toggle u otra acción para GridStatsV2
}

interface PendingChange {
  enrollmentId: number;
  dimension: EricaDimension;
  state: EricaState;
  notes?: string | null;
}

export default function EvaluationGridV2({
  topicId,
  teacherId,
  topicTitle,
  onSaveSuccess,
  onSaveError,
  statsHeaderAction,
}: EvaluationGridV2Props) {
  
  const {
    gridData,
    isLoading,
    isSaving,
    error,
    saveError,
    loadGrid,
    localGrid,
    pendingChanges,
    updateCell,
    clearCell,
    saveGrid,
    hasUnsavedChanges,
    discardChanges,
    resetGrid,
  } = useEricaEvaluationGrid();

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [overwriteMode, setOverwriteMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cargar grid al montar o cambiar topicId
  useEffect(() => {
    if (topicId) {
      loadGrid(topicId, true);
    }
    
    return () => {
      resetGrid();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    if (!localGrid || !localGrid.length) return null;
    
    const totalStudents = localGrid.length;
    const fullyEvaluated = localGrid.filter(student => {
      const evaluations = {
        EJECUTA: student.EJECUTA,
        RETIENE: student.RETIENE,
        INTERPRETA: student.INTERPRETA,
        CONOCE: student.CONOCE,
        APLICA: student.APLICA,
      };
      return isStudentFullyEvaluated(evaluations);
    }).length;
    
    const studentsWithAnyEvaluation = localGrid.filter(student => 
      countCompletedDimensions({
        EJECUTA: student.EJECUTA,
        RETIENE: student.RETIENE,
        INTERPRETA: student.INTERPRETA,
        CONOCE: student.CONOCE,
        APLICA: student.APLICA,
      }) > 0
    ).length;

    const totalEvaluations = localGrid.reduce((sum, student) => 
      sum + countCompletedDimensions({
        EJECUTA: student.EJECUTA,
        RETIENE: student.RETIENE,
        INTERPRETA: student.INTERPRETA,
        CONOCE: student.CONOCE,
        APLICA: student.APLICA,
      }), 0
    );

    const maxEvaluations = totalStudents * DIMENSION_ORDER.length;
    const completionRate = maxEvaluations > 0 ? (totalEvaluations / maxEvaluations) * 100 : 0;
    
    const averagePoints = localGrid.length > 0
      ? localGrid.reduce((sum, student) => 
          sum + calculateStudentAverage({
            EJECUTA: student.EJECUTA,
            RETIENE: student.RETIENE,
            INTERPRETA: student.INTERPRETA,
            CONOCE: student.CONOCE,
            APLICA: student.APLICA,
          }), 0
        ) / localGrid.length
      : 0;

    return {
      totalStudents,
      fullyEvaluated,
      studentsWithAnyEvaluation,
      totalEvaluations,
      maxEvaluations,
      completionRate,
      averagePoints,
    };
  }, [localGrid]);

  // Notificación de operaciones
  const handleNotify = useCallback((message: string) => {
    setSaveMessage({
      type: 'success',
      message,
    });
    setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  // Manejar cambio de evaluación
  const handleEvaluationChange = useCallback((
    enrollmentId: number,
    dimension: EricaDimension,
    state: EricaState,
    notes?: string | null
  ) => {
    updateCell(enrollmentId, dimension, state, notes);
  }, [updateCell]);

  // Opción 2: Aplicar estado a todos los estudiantes en todas las dimensiones
  const handleApplyToAllStudents = useCallback((state: EricaState) => {
    if (!localGrid) return;
    let count = 0;
    localGrid.forEach(student => {
      DIMENSION_ORDER.forEach(dimension => {
        updateCell(student.enrollmentId, dimension, state);
        count++;
      });
    });
    // Mostrar notificación
    setSaveMessage({
      type: 'success',
      message: `✓ Se aplicó estado "${state}" a ${localGrid.length} estudiante(s) (${count} evaluaciones)`,
    });
    setTimeout(() => setSaveMessage(null), 3000);
  }, [localGrid, updateCell]);

  // Manejar limpieza de evaluación
  const handleClearEvaluation = useCallback((
    enrollmentId: number,
    dimension: EricaDimension
  ) => {
    clearCell(enrollmentId, dimension);
  }, [clearCell]);

  // Guardar cambios
  const handleSave = useCallback(async () => {
    const result = await saveGrid(topicId, teacherId);
    
    if (result) {
      setLastSaved(new Date());
      const evalCount = result.evaluationsProcessed || result.evaluations?.length || 0;
      const message = result.message || `Cambios guardados exitosamente (${evalCount} evaluaciones)`;
      setSaveMessage({
        type: 'success',
        message,
      });
      toast.success('Guardado exitoso', {
        description: message,
      });
      onSaveSuccess?.();
      // Auto-dismiss en 5 segundos
      setTimeout(() => setSaveMessage(null), 5000);
    } else {
    }
  }, [topicId, teacherId, saveGrid, onSaveSuccess]);

  // Monitorear cambios en saveError
  useEffect(() => {
    if (saveError) {
      const message = `Error al guardar: ${saveError}`;
      setSaveMessage({
        type: 'error',
        message,
      });
      toast.error('Error al guardar', {
        description: saveError,
      });
      onSaveError?.(saveError);
      // Auto-dismiss en 5 segundos
      setTimeout(() => setSaveMessage(null), 5000);
    }
  }, [saveError, onSaveError]);

  // Refrescar grid
  const handleRefresh = useCallback(() => {
    loadGrid(topicId, true);
  }, [topicId, loadGrid]);

  // Renderizado de loading
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-48" />
                {DIMENSION_ORDER.map(d => (
                  <Skeleton key={d} className="h-12 w-24" />
                ))}
                <Skeleton className="h-12 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizado de error
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Sin datos
  if (!localGrid || !localGrid.length) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay estudiantes para evaluar en este tema</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast de guardado/error */}
      {saveMessage && (
        <Alert className={`flex items-center gap-3 ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : 'bg-red-50 border-red-300 text-red-800'
        } animate-in fade-in slide-in-from-top-2 duration-300`}>
          {saveMessage.type === 'success' ? (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-500 text-white flex-shrink-0">
              <Check className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-6 w-6 flex-shrink-0">
              <XCircle className="h-5 w-5" />
            </div>
          )}
          <AlertDescription className="m-0">{saveMessage.message}</AlertDescription>
        </Alert>
      )}

      {/* Header con acciones */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-lg">
                Grid de Evaluación ERICA
              </CardTitle>
              {topicTitle && (
                <p className="text-sm text-gray-500 mt-1 truncate">{topicTitle}</p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 flex-wrap">
              {/* Indicador de cambios pendientes */}
              {hasUnsavedChanges && (
                <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-700 text-xs sm:text-sm whitespace-nowrap">
                  {pendingChanges.size} cambios
                </Badge>
              )}
              
              {/* Última vez guardado */}
              {lastSaved && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Guardado: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              {/* Botón bulk para todos */}
              <div className="w-full sm:w-auto">
                <HeaderBulkSelector
                  onApplyToAll={handleApplyToAllStudents}
                  disabled={!localGrid || localGrid.length === 0}
                />
              </div>
              
              {/* Botones de acción */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="text-xs sm:text-sm"
                  title="Refrescar"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline ml-1">Refrescar</span>
                </Button>
                
                {hasUnsavedChanges && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={discardChanges}
                    className="text-xs sm:text-sm"
                    title="Descartar cambios"
                  >
                    <Undo2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Descartar</span>
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving}
                  className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <Save className={`h-4 w-4 ${isSaving ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline ml-1">{isSaving ? 'Guardando...' : 'Guardar'}</span>
                  <span className="sm:hidden">{isSaving ? '...' : 'OK'}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Barra de herramientas de optimización */}
      {localGrid && localGrid.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Optimizaciones:</span>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 flex-1">
                {/* Copiar evaluaciones */}
                <div className="w-full sm:w-auto">
                  <CopyEvaluations
                    students={localGrid}
                    onApplyEvaluations={handleEvaluationChange}
                    copyOnlyEmpty={!overwriteMode}
                    onNotify={handleNotify}
                  />
                </div>

                {/* Aplicar patrones */}
                <div className="w-full sm:w-auto">
                  <PatternsSelector
                    students={localGrid}
                    onApplyEvaluations={handleEvaluationChange}
                    copyOnlyEmpty={!overwriteMode}
                    onNotify={handleNotify}
                  />
                </div>

                {/* Sugerencias inteligentes */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestions(true)}
                  className="text-xs w-full sm:w-auto"
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Sugerencias
                </Button>

                {/* Separador - solo en desktop */}
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

                {/* Toggle Sobrescribir */}
                <Button
                  variant={overwriteMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOverwriteMode(!overwriteMode)}
                  className={`text-xs w-full sm:w-auto ${
                    overwriteMode
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : ''
                  }`}
                  title="Activar para sobrescribir celdas ya evaluadas"
                >
                  <span className="sm:hidden">{overwriteMode ? '⚠️ ON' : 'OFF'}</span>
                  <span className="hidden sm:inline">{overwriteMode ? '⚠️ Sobrescribir ON' : 'Sobrescribir OFF'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      {stats && (
        <GridStatsV2
          totalStudents={stats.totalStudents}
          fullyEvaluated={stats.fullyEvaluated}
          studentsWithAnyEvaluation={stats.studentsWithAnyEvaluation}
          completionRate={stats.completionRate}
          averagePoints={stats.averagePoints}
          headerAction={statsHeaderAction}
        />
      )}

      {/* Error de guardado */}
      {saveError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Grid de evaluaciones */}
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full border-collapse text-sm sm:text-base">
              {/* Header */}
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="text-left p-2 sm:p-4 font-semibold text-gray-900 dark:text-gray-100 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 min-w-[150px] sm:min-w-[250px] border-r border-gray-200 dark:border-gray-700">
                    <span className="hidden sm:inline">Estudiante</span>
                    <span className="sm:hidden text-xs">Est.</span>
                  </th>
                  {DIMENSION_ORDER.map(dimension => {
                    // Mapeo de dimensiones a códigos
                    const dimensionCodeMap: Record<string, string> = {
                      'EJECUTA': 'E',
                      'RETIENE': 'R',
                      'INTERPRETA': 'I',
                      'CONOCE': 'C',
                      'APLICA': 'A'
                    };
                    const dimensionCode = dimensionCodeMap[dimension];
                    
                    // Obtener el color de la dimensión del gridData por código
                    const dimensionInfo = gridData?.dimensions?.find(d => d.code === dimensionCode);
                    const hexColor = dimensionInfo?.hexColor || '#999999';
                    
                    return (
                      <th 
                        key={dimension} 
                        className="text-center p-1 sm:p-3 font-semibold min-w-[80px] sm:min-w-[120px]"
                      >
                        <div className="space-y-0.5 sm:space-y-1">
                          <Badge 
                            variant="outline" 
                            className="font-bold text-xs sm:text-sm"
                            style={{
                              backgroundColor: hexColor,
                              color: 'white',
                              borderColor: hexColor,
                            }}
                          >
                            {dimensionCode}
                          </Badge>
                          <div className="text-xs font-normal hidden sm:block" style={{ color: hexColor }}>
                            {dimension}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                  <th className="text-center p-1 sm:p-4 font-semibold text-gray-900 dark:text-gray-100 min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                    <span className="hidden sm:inline">Suma</span>
                    <span className="sm:hidden">S</span>
                  </th>
                  <th className="text-center p-1 sm:p-4 font-semibold text-gray-900 dark:text-gray-100 min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                    <span className="hidden sm:inline">Promedio</span>
                    <span className="sm:hidden">P</span>
                  </th>
                  <th className="text-center p-1 sm:p-4 font-semibold text-gray-900 dark:text-gray-100 min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
                    Est.
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {localGrid && localGrid.length > 0 && localGrid.map((student, index) => {
                  if (!student || !student.studentName) {
                    return null;
                  }
                  
                  const evaluations = {
                    EJECUTA: student.EJECUTA,
                    RETIENE: student.RETIENE,
                    INTERPRETA: student.INTERPRETA,
                    CONOCE: student.CONOCE,
                    APLICA: student.APLICA,
                  };
                  const average = calculateStudentAverage(evaluations);
                  const completed = countCompletedDimensions(evaluations);
                  const isComplete = isStudentFullyEvaluated(evaluations);
                  const [lastName, firstName] = student.studentName.split(', ');
                  const initials = getStudentInitials(firstName || '', lastName || '');
                  
                  // Verificar si tiene cambios pendientes
                  const hasPending = Array.from(pendingChanges.keys()).some(
                    key => key.startsWith(`${student.enrollmentId}-`)
                  );

                  return (
                    <tr 
                      key={student.enrollmentId}
                      className={`
                        border-b border-gray-100 dark:border-gray-800
                        ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                        ${hasPending ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}
                        hover:bg-blue-50/50 dark:hover:bg-blue-900/10
                      `}
                    >
                      {/* Nombre del estudiante */}
                      <td className={`p-2 sm:p-3 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 ${
                        index % 2 === 0 
                          ? 'bg-white dark:bg-gray-900' 
                          : 'bg-gray-50 dark:bg-gray-800'
                      } ${hasPending ? 'bg-amber-100/70 dark:bg-amber-900/30' : ''}`}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm truncate">
                              {student.studentName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              ID: {student.enrollmentId}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {/* Opción 5: Bulk state selector (aplicar a todas las dimensiones) */}
                            <BulkStateSelector
                              enrollmentId={student.enrollmentId}
                              studentName={student.studentName}
                              dimensions={DIMENSION_ORDER}
                              onApplyState={handleEvaluationChange}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Celdas de evaluación por dimensión */}
                      {DIMENSION_ORDER.map(dimension => {
                        const changeKey = `${student.enrollmentId}-${dimension}`;
                        const pending = pendingChanges.get(changeKey);
                        
                        return (
                          <td key={dimension} className="p-2 text-center">
                            <div className="flex justify-center">
                              <DimensionEvaluationCell
                                enrollmentId={student.enrollmentId}
                                dimension={dimension}
                                existingEvaluation={student[dimension]}
                                pendingChange={pending}
                                onEvaluationChange={handleEvaluationChange}
                                onClearEvaluation={handleClearEvaluation}
                              />
                            </div>
                          </td>
                        );
                      })}

                      {/* Suma */}
                      <td className="p-1 sm:p-3 text-center">
                        <div className="font-bold text-sm sm:text-lg text-gray-900 dark:text-gray-100">
                          {completed > 0 ? formatPoints(calculateStudentTotalPoints(evaluations)) : '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {completed}/{DIMENSION_ORDER.length}
                        </div>
                      </td>

                      {/* Promedio */}
                      <td className="p-1 sm:p-3 text-center">
                        <div className="font-bold text-sm sm:text-lg text-gray-900 dark:text-gray-100">
                          {completed > 0 ? formatPoints(average) : '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {completed}/{DIMENSION_ORDER.length}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="p-1 sm:p-3 text-center">
                        {isComplete ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300 text-xs sm:text-sm">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Completo</span>
                            <span className="sm:hidden">OK</span>
                          </Badge>
                        ) : completed > 0 ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs sm:text-sm">
                            <span className="hidden sm:inline">En progreso</span>
                            <span className="sm:hidden">Prog</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 text-xs sm:text-sm">
                            Pend
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions Modal */}
      <SmartSuggestions
        students={localGrid || []}
        isOpen={showSuggestions}
        onOpenChange={setShowSuggestions}
      />
    </div>
  );
}
