// src/components/erica-evaluations/evaluation-grid/evaluation-copy-tool.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Copy, 
  Users, 
  User, 
  CheckCircle, 
  AlertTriangle,
  X,
  Target
} from 'lucide-react';

interface Student {
  enrollment: {
    id: number;
    student: {
      id: number;
      givenNames: string;
      lastNames: string;
    };
  };
  evaluations: Array<{
    categoryId: number;
    categoryCode: string;
    categoryName: string;
    evaluation: {
      id: number;
      scaleCode: string;
      scaleName: string;
      points: number;
      notes?: string;
      evaluatedAt: Date;
      createdAt: Date;
    } | null;
  }>;
  summary: {
    totalPoints: number;
    maxPoints: number;
    completedEvaluations: number;
    totalCategories: number;
    isComplete: boolean;
    percentage: number;
  };
}

interface Category {
  id: number;
  code: string;
  name: string;
  order: number;
}

interface PendingChanges {
  [key: string]: {
    enrollmentId: number;
    categoryId: number;
    scaleCode: string;
    notes?: string;
  };
}

interface EvaluationCopyToolProps {
  students: Student[];
  categories: Category[];
  pendingChanges: PendingChanges;
  onCopyEvaluations: (
    sourceStudentId: number,
    targetStudentIds: number[],
    evaluations: Array<{
      enrollmentId: number;
      categoryId: number;
      scaleCode: string;
      notes?: string;
    }>
  ) => void;
}

export default function EvaluationCopyTool({
  students,
  categories,
  pendingChanges,
  onCopyEvaluations
}: EvaluationCopyToolProps) {

  // ========== ESTADO LOCAL ==========
  const [sourceStudentId, setSourceStudentId] = useState<number | null>(null);
  const [targetStudentIds, setTargetStudentIds] = useState<number[]>([]);
  const [copyOnlyEmpty, setCopyOnlyEmpty] = useState(true);

  // ========== COMPUTED VALUES ==========
  
  const sourceStudent = useMemo(() => {
    return students.find(s => s.enrollment.id === sourceStudentId) || null;
  }, [students, sourceStudentId]);

  const sortedCategories = useMemo(() => {
    return categories.sort((a, b) => a.order - b.order);
  }, [categories]);

  // Estudiantes disponibles como fuente (que tengan al menos una evaluación)
  const sourceStudents = useMemo(() => {
    return students.filter(student => {
      // Verificar evaluaciones existentes
      const hasEvaluations = student.evaluations.some(e => e.evaluation !== null);
      
      // Verificar cambios pendientes
      const hasPendingChanges = Object.keys(pendingChanges).some(key => 
        key.startsWith(`${student.enrollment.id}-`)
      );
      
      return hasEvaluations || hasPendingChanges;
    });
  }, [students, pendingChanges]);

  // Estudiantes disponibles como objetivo (excluyendo el fuente seleccionado)
  const targetStudents = useMemo(() => {
    return students.filter(s => s.enrollment.id !== sourceStudentId);
  }, [students, sourceStudentId]);

  // Obtener evaluaciones del estudiante fuente (incluyendo pendientes)
  const sourceEvaluations = useMemo(() => {
    if (!sourceStudent) return [];

    return sortedCategories.map(category => {
      const pendingKey = `${sourceStudentId}-${category.id}`;
      const pendingChange = pendingChanges[pendingKey];
      
      if (pendingChange) {
        return {
          categoryId: category.id,
          categoryCode: category.code,
          scaleCode: pendingChange.scaleCode,
          notes: pendingChange.notes,
          isPending: true
        };
      }

      const existingEvaluation = sourceStudent.evaluations.find(
        e => e.categoryId === category.id
      );

      if (existingEvaluation?.evaluation) {
        return {
          categoryId: category.id,
          categoryCode: category.code,
          scaleCode: existingEvaluation.evaluation.scaleCode,
          notes: existingEvaluation.evaluation.notes,
          isPending: false
        };
      }

      return null;
    }).filter(Boolean);
  }, [sourceStudent, sourceStudentId, sortedCategories, pendingChanges]);

  // Calcular cuántas evaluaciones se aplicarán
  const evaluationsToApply = useMemo(() => {
    if (!sourceStudentId || targetStudentIds.length === 0) return 0;

    let count = 0;
    targetStudentIds.forEach(targetId => {
      sourceEvaluations.forEach(sourceEval => {
        if (!sourceEval) return;

        const targetKey = `${targetId}-${sourceEval.categoryId}`;
        const hasPendingChange = pendingChanges[targetKey];
        
        if (!copyOnlyEmpty || !hasPendingChange) {
          const targetStudent = students.find(s => s.enrollment.id === targetId);
          const hasExistingEvaluation = targetStudent?.evaluations.find(
            e => e.categoryId === sourceEval.categoryId && e.evaluation
          );
          
          if (!copyOnlyEmpty || !hasExistingEvaluation) {
            count++;
          }
        }
      });
    });

    return count;
  }, [sourceStudentId, targetStudentIds, sourceEvaluations, copyOnlyEmpty, pendingChanges, students]);

  // ========== FUNCIONES ==========
  
  const getStudentInitials = (student: Student) => {
    const firstName = student.enrollment.student.givenNames.split(' ')[0];
    const lastName = student.enrollment.student.lastNames.split(' ')[0];
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStudentFullName = (student: Student) => {
    return `${student.enrollment.student.lastNames}, ${student.enrollment.student.givenNames}`;
  };

  const getScaleBadgeColor = (code: string) => {
    switch (code) {
      case 'E': return 'bg-green-100 text-green-800 border-green-300';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'P': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'C': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'N': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleSourceSelect = (studentId: number) => {
    setSourceStudentId(studentId);
    setTargetStudentIds([]);
  };

  const handleTargetToggle = (studentId: number) => {
    setTargetStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllTargets = () => {
    const allTargetIds = targetStudents.map(s => s.enrollment.id);
    setTargetStudentIds(
      targetStudentIds.length === allTargetIds.length ? [] : allTargetIds
    );
  };

  const handleCopyEvaluations = () => {
    if (!sourceStudentId || targetStudentIds.length === 0 || sourceEvaluations.length === 0) {
      return;
    }

    const evaluationsToCopy = targetStudentIds.flatMap(targetId => 
      sourceEvaluations
        .filter(sourceEval => sourceEval !== null)
        .map(sourceEval => ({
          enrollmentId: targetId,
          categoryId: sourceEval!.categoryId,
          scaleCode: sourceEval!.scaleCode,
          notes: sourceEval!.notes
        }))
    );

    onCopyEvaluations(sourceStudentId, targetStudentIds, evaluationsToCopy);
    
    // Reset después de aplicar
    setSourceStudentId(null);
    setTargetStudentIds([]);
  };

  const handleReset = () => {
    setSourceStudentId(null);
    setTargetStudentIds([]);
  };

  // ========== RENDER ==========
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Copy className="h-5 w-5 text-orange-500" />
          Copiar Evaluación entre Estudiantes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* ========== SELECCIÓN DE ESTUDIANTE FUENTE ========== */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            1. Seleccionar Estudiante Fuente (Copiar DE)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {sourceStudents.map(student => (
              <div
                key={student.enrollment.id}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${sourceStudentId === student.enrollment.id
                    ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                onClick={() => handleSourceSelect(student.enrollment.id)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-orange-500 text-white text-xs">
                      {getStudentInitials(student)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {getStudentFullName(student)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {student.summary.completedEvaluations}/5 evaluaciones
                    </div>
                  </div>
                  {student.summary.isComplete && (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {sourceStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay estudiantes con evaluaciones para copiar
            </div>
          )}
        </div>

        {/* ========== PREVIEW DE EVALUACIONES FUENTE ========== */}
        {sourceStudent && sourceEvaluations.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Evaluaciones de {getStudentFullName(sourceStudent)}:
            </h5>
            <div className="flex flex-wrap gap-2">
              {sourceEvaluations.map(evaluation => (
                evaluation && (
                  <div key={evaluation.categoryId} className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {evaluation.categoryCode}:
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getScaleBadgeColor(evaluation.scaleCode)}`}
                    >
                      {evaluation.scaleCode}
                    </Badge>
                    {evaluation.isPending && (
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* ========== SELECCIÓN DE ESTUDIANTES OBJETIVO ========== */}
        {sourceStudentId && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                2. Seleccionar Estudiantes Objetivo (Copiar A) - {targetStudentIds.length} seleccionados
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllTargets}
              >
                {targetStudentIds.length === targetStudents.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {targetStudents.map(student => (
                  <div key={student.enrollment.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`target-${student.enrollment.id}`}
                      checked={targetStudentIds.includes(student.enrollment.id)}
                      onCheckedChange={() => handleTargetToggle(student.enrollment.id)}
                    />
                    <label
                      htmlFor={`target-${student.enrollment.id}`}
                      className="text-sm cursor-pointer truncate flex-1"
                    >
                      {getStudentFullName(student)}
                    </label>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {student.summary.completedEvaluations}/5
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* ========== OPCIONES DE COPIA ========== */}
        {sourceStudentId && targetStudentIds.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              3. Opciones de Copia
            </h4>
            
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="copy-only-empty"
                checked={copyOnlyEmpty}
               onCheckedChange={(checked) => setCopyOnlyEmpty(checked === true)}
              />
              <label htmlFor="copy-only-empty" className="text-sm cursor-pointer">
                Solo copiar a evaluaciones vacías (no sobrescribir)
              </label>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Resumen de la operación:
                </span>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                • Copiar de: {getStudentFullName(sourceStudent!)}
                <br />
                • Copiar a: {targetStudentIds.length} estudiantes
                <br />
                • Evaluaciones a aplicar: {evaluationsToApply}
                <br />
                • Modo: {copyOnlyEmpty ? 'Solo celdas vacías' : 'Sobrescribir todas'}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* ========== ACCIONES ========== */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpiar Selección
          </Button>
          
          <Button
            onClick={handleCopyEvaluations}
            disabled={!sourceStudentId || targetStudentIds.length === 0 || evaluationsToApply === 0}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar Evaluaciones ({evaluationsToApply})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}