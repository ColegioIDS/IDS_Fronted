// src/components/features/erica-evaluations/evaluation-grid/smart-suggestions.tsx
"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { DimensionEvaluation } from '@/types/erica-evaluations';

interface SmartSuggestionsProps {
  students: Array<{
    enrollmentId: number;
    studentName: string;
    EJECUTA: DimensionEvaluation | null;
    RETIENE: DimensionEvaluation | null;
    INTERPRETA: DimensionEvaluation | null;
    CONOCE: DimensionEvaluation | null;
    APLICA: DimensionEvaluation | null;
  }>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Suggestion {
  type: 'incomplete' | 'pattern' | 'outlier';
  title: string;
  description: string;
  studentIds: number[];
  action?: string;
}

export default function SmartSuggestions({
  students,
  isOpen,
  onOpenChange,
}: SmartSuggestionsProps) {
  const getStudentEvaluations = (student: typeof students[0]) => {
    return {
      EJECUTA: student.EJECUTA,
      RETIENE: student.RETIENE,
      INTERPRETA: student.INTERPRETA,
      CONOCE: student.CONOCE,
      APLICA: student.APLICA,
    };
  };

  const suggestions: Suggestion[] = useMemo(() => {
    const result: Suggestion[] = [];

    // Encontrar estudiantes incompletos
    const incompleteStudents = students.filter(s => {
      const evals = getStudentEvaluations(s);
      const completed = Object.values(evals).filter(e => e !== null).length;
      return completed > 0 && completed < 5;
    });

    if (incompleteStudents.length > 0) {
      result.push({
        type: 'incomplete',
        title: `${incompleteStudents.length} estudiante(s) sin completar`,
        description: 'Tienen algunas evaluaciones pero faltan otras',
        studentIds: incompleteStudents.map(s => s.enrollmentId),
        action: 'Completar evaluaciones pendientes',
      });
    }

    // Detectar estudiantes sin evaluar
    const unevaluatedStudents = students.filter(s => {
      const evals = getStudentEvaluations(s);
      const completed = Object.values(evals).filter(e => e !== null).length;
      return completed === 0;
    });

    if (unevaluatedStudents.length > 0) {
      result.push({
        type: 'incomplete',
        title: `${unevaluatedStudents.length} estudiante(s) sin evaluar`,
        description: 'No tienen ninguna evaluación registrada',
        studentIds: unevaluatedStudents.map(s => s.enrollmentId),
        action: 'Iniciar evaluación',
      });
    }

    // Detectar estudiantes con patrón consistente (todos igual)
    const patternStudents = students.filter(s => {
      const evals = getStudentEvaluations(s);
      const values = Object.values(evals)
        .filter(e => e !== null)
        .map(e => e?.state);
      
      if (values.length < 3) return false;
      
      const allEqual = values.every(v => v === values[0]);
      return allEqual;
    });

    if (patternStudents.length > 1) {
      result.push({
        type: 'pattern',
        title: 'Patrón detectado',
        description: `${patternStudents.length} estudiantes tienen el mismo patrón de evaluación`,
        studentIds: patternStudents.map(s => s.enrollmentId),
        action: 'Ver similitudes',
      });
    }

    return result;
  }, [students]);

  const getStudentInitials = (name: string) => {
    const parts = name.split(', ');
    if (parts.length === 2) {
      return `${parts[1][0]}${parts[0][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'incomplete':
        return <AlertCircle className="w-5 h-5" />;
      case 'pattern':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'incomplete':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'pattern':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Sugerencias Inteligentes
          </DialogTitle>
        </DialogHeader>

        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <p className="text-sm">✅ Excelente! No hay sugerencias por ahora.</p>
              <p className="text-xs mt-2">Todas las evaluaciones están completas.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, idx) => {
              const affectedStudents = students.filter(s =>
                suggestion.studentIds.includes(s.enrollmentId)
              );

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${getSuggestionColor(
                    suggestion.type
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{suggestion.title}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {suggestion.description}
                      </div>

                      {affectedStudents.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {affectedStudents.map(student => (
                            <div
                              key={student.enrollmentId}
                              className="flex items-center gap-1 bg-white/50 rounded px-2 py-1 text-xs"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {getStudentInitials(student.studentName)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{student.studentName.split(', ')[0]}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {suggestion.action && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-3 text-xs h-auto py-1"
                        >
                          {suggestion.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
