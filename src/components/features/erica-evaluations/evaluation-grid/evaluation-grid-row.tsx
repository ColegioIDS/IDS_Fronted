// src/components/erica-evaluations/evaluation-grid/evaluation-grid-row.tsx
"use client";

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Components
import EvaluationCell from './evaluation-cell';

// Types - Usando las interfaces del componente padre
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

interface Scale {
  id: number;
  code: string;
  name: string;
  numericValue: number;
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

interface EvaluationGridRowProps {
  student: Student;
  categories: Category[];
  scales: Scale[];
  onEvaluationChange: (
    enrollmentId: number,
    categoryId: number,
    scaleCode: string,
    notes?: string
  ) => void;
  pendingChanges: PendingChanges;
  isEven: boolean;
}

// ==================== COMPONENTE ====================
export default function EvaluationGridRow({
  student,
  categories,
  scales,
  onEvaluationChange,
  pendingChanges,
  isEven
}: EvaluationGridRowProps) {

  // ========== COMPUTED VALUES ==========
  
  // Iniciales del estudiante para el avatar
  const studentInitials = useMemo(() => {
    const firstName = student.enrollment.student.givenNames.split(' ')[0];
    const lastName = student.enrollment.student.lastNames.split(' ')[0];
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }, [student.enrollment.student]);

  // Nombre completo del estudiante
  const fullName = useMemo(() => {
    return `${student.enrollment.student.lastNames}, ${student.enrollment.student.givenNames}`;
  }, [student.enrollment.student]);

  // Color del progreso basado en el porcentaje
  const progressColor = useMemo(() => {
    if (student.summary.percentage >= 80) return 'bg-green-500';
    if (student.summary.percentage >= 60) return 'bg-yellow-500';
    if (student.summary.percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }, [student.summary.percentage]);

  // Status del estudiante
  const studentStatus = useMemo(() => {
    if (student.summary.isComplete) {
      return { text: 'Completo', variant: 'default' as const, color: 'text-green-600' };
    }
    if (student.summary.completedEvaluations > 0) {
      return { text: 'En progreso', variant: 'secondary' as const, color: 'text-yellow-600' };
    }
    return { text: 'Sin evaluar', variant: 'outline' as const, color: 'text-gray-600' };
  }, [student.summary]);

  // ========== RENDER ==========
  return (
    <div className={`
      p-4 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
      ${isEven ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'}
    `}>
      <div className="grid grid-cols-[300px,repeat(5,1fr)] gap-4 items-center">
        
        {/* ========== INFORMACIÓN DEL ESTUDIANTE ========== */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
              {studentInitials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {fullName}
            </div>
            
            {/* Status y progreso */}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={studentStatus.variant} className="text-xs">
                {studentStatus.text}
              </Badge>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{student.summary.completedEvaluations}/{student.summary.totalCategories}</span>
              </div>
            </div>
            
            {/* Barra de progreso mini */}
            <div className="mt-2">
              <Progress 
                value={student.summary.percentage} 
                className="h-1.5"
              />
            </div>
            
            {/* Puntos totales */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {student.summary.totalPoints.toFixed(1)}/{student.summary.maxPoints.toFixed(1)} puntos
            </div>
          </div>
        </div>

        {/* ========== CELDAS DE EVALUACIÓN ========== */}
        {categories.map(category => {
          // Encontrar la evaluación existente para esta categoría
         const existingEvaluation = student.evaluations.find(
  evaluation => evaluation.categoryId === category.id
);

          // Verificar si hay cambios pendientes
          const pendingKey = `${student.enrollment.id}-${category.id}`;
          const pendingChange = pendingChanges[pendingKey];

          return (
            <EvaluationCell
              key={category.id}
              enrollmentId={student.enrollment.id}
              category={category}
              scales={scales}
              existingEvaluation={existingEvaluation?.evaluation || null}
              pendingChange={pendingChange}
              onEvaluationChange={onEvaluationChange}
            />
          );
        })}
      </div>
      
      {/* ========== INDICADOR DE CAMBIOS PENDIENTES ========== */}
      {Object.keys(pendingChanges).some(key => key.startsWith(`${student.enrollment.id}-`)) && (
        <div className="mt-2 ml-[52px]">
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span>Cambios pendientes de guardar</span>
          </div>
        </div>
      )}
    </div>
  );
}