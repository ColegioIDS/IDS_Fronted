// src/components/erica-evaluations/evaluation-grid/evaluation-grid.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Save, 
  RefreshCw, 
  Users, 
  BarChart3, 
  AlertCircle, 
  CheckCircle2,
  FileText,
  Calendar,
  BookOpen,
  User2
} from 'lucide-react';

// Contexts
import { useEricaEvaluationContext } from '@/context/EricaEvaluationContext';

// Types
import { User } from '@/types/users.types';
import { Section } from '@/types/student';
import { Course } from '@/types/courses';
import { EricaTopic } from '@/types/erica-topics';
import { AcademicWeek } from '@/types/academic-week.types';

// Components
import EvaluationPatterns from './evaluation-patterns';
import EvaluationCopyTool from './evaluation-copy-tool';
import CompactTableView from './compact-table-view';
import GridStats from './grid-stats';

// ==================== INTERFACES ====================
interface EvaluationGridProps {
  selectedTeacher: User;
  selectedSection: Section;
  selectedCourse: Course;
  selectedTopic: EricaTopic;
  currentWeek: AcademicWeek;
}

interface EvaluationData {
  enrollmentId: number;
  categoryId: number;
  scaleCode: string;
  notes?: string;
}

interface PendingChanges {
  [key: string]: EvaluationData; // key: `${enrollmentId}-${categoryId}`
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function EvaluationGrid({
  selectedTeacher,
  selectedSection,
  selectedCourse,
  selectedTopic,
  currentWeek
}: EvaluationGridProps) {

  // ========== CONTEXTS ==========
  const {
    state: { 
      evaluationGrid,
      loadingGrid, 
      submitting,
      error 
    },
    fetchEvaluationGrid,
    saveGrid
  } = useEricaEvaluationContext();

  // ========== ESTADO LOCAL ==========
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ========== EFECTOS ==========
  
  // Cargar grid inicial
  useEffect(() => {
    if (selectedTopic?.id) {
      fetchEvaluationGrid(selectedTopic.id, true);
    }
  }, [selectedTopic?.id, fetchEvaluationGrid]);

  // Auto-save cada 30 segundos si hay cambios pendientes
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || Object.keys(pendingChanges).length === 0) {
      return;
    }

    const autoSaveInterval = setInterval(() => {
      handleSaveChanges();
    }, 30000); // 30 segundos

    return () => clearInterval(autoSaveInterval);
  }, [autoSaveEnabled, hasUnsavedChanges, pendingChanges]);

  // ========== COMPUTED VALUES ==========
  
  const categories = useMemo(() => {
    return evaluationGrid?.dimensions || [];
  }, [evaluationGrid]);

  const scales = useMemo(() => {
    return evaluationGrid?.states || [];
  }, [evaluationGrid]);

  const students = useMemo(() => {
    return evaluationGrid?.students || [];
  }, [evaluationGrid]);

  const stats = useMemo(() => {
    return evaluationGrid?.stats || null;
  }, [evaluationGrid]);

  const pendingChangesCount = useMemo(() => {
    return Object.keys(pendingChanges).length;
  }, [pendingChanges]);

  const completionPercentage = useMemo(() => {
    if (!stats) return 0;
    return stats.totalStudents > 0 
      ? (stats.fullyEvaluatedStudents / stats.totalStudents) * 100 
      : 0;
  }, [stats]);

  // ========== FUNCIONES ==========
  
  const handleEvaluationChange = useCallback((
    enrollmentId: number,
    categoryId: number,
    scaleCode: string,
    notes?: string
  ) => {
    const key = `${enrollmentId}-${categoryId}`;
    
    // Si scaleCode está vacío, remover la evaluación
    if (!scaleCode) {
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[key];
        return newChanges;
      });
    } else {
      setPendingChanges(prev => ({
        ...prev,
        [key]: {
          enrollmentId,
          categoryId,
          scaleCode,
          notes
        }
      }));
    }
    
    setHasUnsavedChanges(true);
  }, []);

  const handleCopyEvaluations = useCallback((
    sourceStudentId: number,
    targetStudentIds: number[],
    evaluations: Array<{
      enrollmentId: number;
      categoryId: number;
      scaleCode: string;
      notes?: string;
    }>
  ) => {
    // Filtrar solo evaluaciones para celdas vacías (respetando campos llenos)
    const filteredEvaluations = evaluations.filter((evaluation: any) => {
      const key = `${evaluation.enrollmentId}-${evaluation.categoryId}`;
      
      // Verificar si ya hay cambios pendientes
      if (pendingChanges[key]) {
        return false;
      }
      
      // Verificar si ya existe evaluación en el grid
      const student = students.find(s => s.enrollmentId === evaluation.enrollmentId);
      
      // Solo aplicar si no existe evaluación previa para esta dimensión
      if (!student) return true;
      
      // Buscar si ya existe evaluación en esa dimensión
      const dimensionKey = Object.keys(student).find(k => {
        const val = student[k as keyof typeof student];
        return val && typeof val === 'object' && 'id' in val && val.id === evaluation.categoryId;
      });
      
      return !dimensionKey;
    });

    if (filteredEvaluations.length === 0) {
      // Las evaluaciones ya existen, no hay nada que copiar
      return;
    }

    // Agregar evaluaciones filtradas a pendingChanges
    const newPendingChanges: PendingChanges = {};
    filteredEvaluations.forEach((evaluation: any) => {
      const key = `${evaluation.enrollmentId}-${evaluation.categoryId}`;
      newPendingChanges[key] = {
        enrollmentId: evaluation.enrollmentId,
        categoryId: evaluation.categoryId,
        scaleCode: evaluation.scaleCode,
        notes: evaluation.notes
      };
    });

    setPendingChanges(prev => ({
      ...prev,
      ...newPendingChanges
    }));

    setHasUnsavedChanges(true);
  }, [pendingChanges, students]);

  const handleSaveChanges = useCallback(async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    try {
      // Map the evaluations to the required SaveGridEvaluationItem format
      const evaluationsToSave = Object.values(pendingChanges).map(item => ({
        enrollmentId: item.enrollmentId,
        dimension: 'EJECUTA' as const,
        state: item.scaleCode as any,
        notes: item.notes
      }));
      
      const result = await saveGrid({
        topicId: selectedTopic.id,
        teacherId: selectedTeacher.id,
        evaluations: evaluationsToSave
      });

      if (result.success) {
        setPendingChanges({});
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        
        // Refrescar el grid para mostrar los cambios guardados
        await fetchEvaluationGrid(selectedTopic.id, true);
      }
    } catch (error) {
    }
  }, [pendingChanges, selectedTopic.id, selectedTeacher.id, saveGrid, fetchEvaluationGrid]);

  const handleRefreshGrid = useCallback(() => {
    if (selectedTopic?.id) {
      fetchEvaluationGrid(selectedTopic.id, true);
    }
  }, [selectedTopic?.id, fetchEvaluationGrid]);

  const handleDiscardChanges = useCallback(() => {
    setPendingChanges({});
    setHasUnsavedChanges(false);
  }, []);



  const handleApplyPattern = useCallback((
  studentIds: number[],
  evaluations: Array<{
    enrollmentId: number;
    categoryId: number;
    scaleCode: string;
  }>
) => {
  // Filtrar solo evaluaciones para celdas vacías
  const filteredEvaluations = evaluations.filter((evaluation: any) => {
    const key = `${evaluation.enrollmentId}-${evaluation.categoryId}`;
    
    // Verificar si ya hay cambios pendientes
    if (pendingChanges[key]) {
      return false;
    }
    
    // Verificar si ya existe evaluación en el grid
    const student = students.find(s => s.enrollmentId === evaluation.enrollmentId);
    
    // Solo aplicar si no existe evaluación previa para esta dimensión
    if (!student) return true;
    
    // Buscar si ya existe evaluación en esa dimensión
    const dimensionKey = Object.keys(student).find(k => {
      const val = student[k as keyof typeof student];
      return val && typeof val === 'object' && 'id' in val && val.id === evaluation.categoryId;
    });
    
    return !dimensionKey;
  });

  if (filteredEvaluations.length === 0) {
    return;
  }

  // Agregar evaluaciones filtradas a pendingChanges
  const newPendingChanges: PendingChanges = {};
  filteredEvaluations.forEach((evaluation: any) => {
    const key = `${evaluation.enrollmentId}-${evaluation.categoryId}`;
    newPendingChanges[key] = {
      enrollmentId: evaluation.enrollmentId,
      categoryId: evaluation.categoryId,
      scaleCode: evaluation.scaleCode
    };
  });

  setPendingChanges(prev => ({
    ...prev,
    ...newPendingChanges
  }));

  setHasUnsavedChanges(true);
}, [pendingChanges, students]);

  // ========== RENDERIZADO CONDICIONAL ==========
  
  if (loadingGrid) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-full" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-48" />
                  <div className="flex space-x-2">
                    {[...Array(5)].map((_, j) => (
                      <Skeleton key={j} className="h-8 w-16" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar el grid de evaluación: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!evaluationGrid) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No se pudo cargar el grid de evaluación
        </h3>
        <Button onClick={handleRefreshGrid} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="space-y-6">
      
      {/* ========== HEADER CON INFORMACIÓN DEL TEMA ========== */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                {selectedTopic.title}
              </h2>
              <div className="flex items-center gap-6 text-sm text-indigo-700 dark:text-indigo-300">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{selectedCourse.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Sección {selectedSection.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Semana {currentWeek?.number || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User2 className="h-4 w-4" />
                  <span>{selectedTeacher.givenNames} {selectedTeacher.lastNames}</span>
                </div>
              </div>
              {selectedTopic.description && (
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 max-w-2xl">
                  {selectedTopic.description}
                </p>
              )}
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </CardContent>
      </Card>

      {/* ========== BARRA DE PROGRESO Y ACCIONES ========== */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Lado izquierdo - Progreso */}
            <div className="flex items-center space-x-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progreso de Evaluación
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(completionPercentage)}%
                  </Badge>
                </div>
                <Progress value={completionPercentage} className="w-48" />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stats?.fullyEvaluatedStudents || 0} de {stats?.totalStudents || 0} estudiantes
                </div>
              </div>

              {/* Indicadores de estado */}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {pendingChangesCount} cambios sin guardar
                  </span>
                </div>
              )}

              {lastSaved && !hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">
                    Guardado {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {/* Lado derecho - Botones de acción */}
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <>
                  <Button
                    onClick={handleDiscardChanges}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Descartar
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={submitting}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {submitting ? 'Guardando...' : 'Guardar'}
                  </Button>
                </>
              )}
              
              <Button
                onClick={handleRefreshGrid}
                variant="outline"
                size="sm"
                disabled={loadingGrid}
              >
                <RefreshCw className={`h-4 w-4 ${loadingGrid ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== ESTADÍSTICAS ========== */}
      {stats && (
        <GridStats 
          stats={stats}
          categories={categories as any}
          totalStudents={students.length}
        />
      )}

      {/* ========== HERRAMIENTAS DE EVALUACIÓN EFICIENTE ========== */}
      <EvaluationPatterns
        students={students as any}
        categories={categories as any}
        scales={scales as any}
        onApplyPattern={handleApplyPattern}
      />

      <EvaluationCopyTool
        students={students as any}
        categories={categories as any}
        pendingChanges={pendingChanges}
        onCopyEvaluations={handleCopyEvaluations}
      />

      {/* ========== GRID DE EVALUACIÓN ========== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Matriz de Evaluación ERICA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CompactTableView
            students={students as any}
            categories={categories as any}
            scales={scales as any}
            onEvaluationChange={handleEvaluationChange}
            pendingChanges={pendingChanges}
          />

          {/* Footer con leyenda de escalas */}
          <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
              Escalas de Evaluación:
            </div>
            <div className="flex flex-wrap gap-4">
              {scales.map((scale: any) => (
                <div key={scale.id} className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`
                      text-xs font-medium
                      ${scale.code === 'E' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                      ${scale.code === 'B' ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}
                      ${scale.code === 'P' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                      ${scale.code === 'C' ? 'bg-orange-100 text-orange-800 border-orange-300' : ''}
                      ${scale.code === 'N' ? 'bg-red-100 text-red-800 border-red-300' : ''}
                    `}
                  >
                    {scale.code}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {scale.name} ({scale.numericValue})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========== MENSAJE DE AYUDA ========== */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema ERICA:</strong> Use los patrones predefinidos para evaluar múltiples estudiantes rápidamente. 
          Los patrones solo se aplican a evaluaciones vacías, preservando evaluaciones existentes.
          Los cambios se guardan automáticamente cada 30 segundos.
        </AlertDescription>
      </Alert>
    </div>
  );
}