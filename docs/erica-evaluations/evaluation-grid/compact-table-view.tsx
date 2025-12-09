// src/components/erica-evaluations/evaluation-grid/compact-table-view.tsx
"use client";

import React, { useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import EvaluationDropdown from './evaluation-dropdown';

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

interface CompactTableViewProps {
  students: Student[];
  categories: Category[];
  scales: Scale[];
  onEvaluationChange: (
    enrollmentId: number,
    categoryId: number,
    scaleCode: string,
    notes?: string
  ) => void;
  pendingChanges: PendingChanges;
}

export default function CompactTableView({
  students,
  categories,
  scales,
  onEvaluationChange,
  pendingChanges
}: CompactTableViewProps) {

  const sortedCategories = useMemo(() => {
    return categories.sort((a, b) => a.order - b.order);
  }, [categories]);

  const getStudentInitials = (student: Student) => {
    const firstName = student.enrollment.student.givenNames.split(' ')[0];
    const lastName = student.enrollment.student.lastNames.split(' ')[0];
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStudentFullName = (student: Student) => {
    return `${student.enrollment.student.lastNames}, ${student.enrollment.student.givenNames}`;
  };

  const hasPendingChanges = (student: Student) => {
    return Object.keys(pendingChanges).some(key => 
      key.startsWith(`${student.enrollment.id}-`)
    );
  };

  const getStudentStatus = (student: Student) => {
    if (student.summary.isComplete) {
      return { text: 'Completo', variant: 'default' as const, color: 'bg-green-50' };
    }
    if (student.summary.completedEvaluations > 0) {
      return { text: 'En progreso', variant: 'secondary' as const, color: 'bg-yellow-50' };
    }
    return { text: 'Sin evaluar', variant: 'outline' as const, color: 'bg-gray-50' };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <th className="text-left p-4 font-semibold text-gray-900 dark:text-gray-100 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 min-w-[280px]">
              Estudiante
            </th>
            {sortedCategories.map(category => (
              <th key={category.id} className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100 min-w-[140px]">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-semibold">
                    {category.code}
                  </Badge>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    {category.name}
                  </div>
                </div>
              </th>
            ))}
            <th className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100 min-w-[100px]">
              Total
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {students.map((student, index) => {
            const status = getStudentStatus(student);
            const hasPending = hasPendingChanges(student);

            return (
              <tr 
                key={student.enrollment.id}
                className={`
                  border-b border-gray-200 dark:border-gray-700 
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                  ${hasPending ? 'ring-1 ring-amber-200 bg-amber-50/30' : ''}
                `}
              >
                {/* Columna del estudiante */}
                <td className="p-4 sticky left-0 bg-inherit z-10">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                        {getStudentInitials(student)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {getStudentFullName(student)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={status.variant} className="text-xs">
                          {status.text}
                        </Badge>
                        {hasPending && (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                            <span>Cambios</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Columnas de evaluación */}
                {sortedCategories.map(category => {
                  const existingEvaluation = student.evaluations.find(
                    evaluation => evaluation.categoryId === category.id
                  );

                  const pendingKey = `${student.enrollment.id}-${category.id}`;
                  const pendingChange = pendingChanges[pendingKey];
                  const currentValue = pendingChange?.scaleCode || existingEvaluation?.evaluation?.scaleCode;

                  return (
                    <td key={category.id} className="p-4 text-center">
                      <div className="w-full max-w-[120px] mx-auto">
                        <EvaluationDropdown
                          scales={scales}
                          value={currentValue}
                          onChange={(scaleCode) => 
                            onEvaluationChange(
                              student.enrollment.id,
                              category.id,
                              scaleCode
                            )
                          }
                          placeholder="—"
                        />
                      </div>
                      {pendingChange && (
                        <div className="w-2 h-2 bg-amber-500 rounded-full mx-auto mt-1 animate-pulse"></div>
                      )}
                    </td>
                  );
                })}

                {/* Columna de total */}
                <td className="p-4 text-center">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {student.summary.totalPoints.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      de {student.summary.maxPoints.toFixed(1)}
                    </div>
                    <div className="text-xs">
                      <Badge 
                        variant="outline" 
                        className={`
                          ${student.summary.percentage >= 80 ? 'bg-green-50 text-green-700 border-green-300' : ''}
                          ${student.summary.percentage >= 60 && student.summary.percentage < 80 ? 'bg-yellow-50 text-yellow-700 border-yellow-300' : ''}
                          ${student.summary.percentage < 60 ? 'bg-red-50 text-red-700 border-red-300' : ''}
                        `}
                      >
                        {Math.round(student.summary.percentage)}%
                      </Badge>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {students.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No hay estudiantes para evaluar
        </div>
      )}
    </div>
  );
}