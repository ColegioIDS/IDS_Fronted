// src/components/features/erica-evaluations/evaluation-grid/copy-evaluations.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Copy, Check } from 'lucide-react';
import { EricaDimension, EricaState, DimensionEvaluation } from '@/types/erica-evaluations';
import { DIMENSION_ORDER } from '../utils/evaluation-helpers';

interface CopyEvaluationsProps {
  students: Array<{
    enrollmentId: number;
    studentName: string;
    EJECUTA: DimensionEvaluation | null;
    RETIENE: DimensionEvaluation | null;
    INTERPRETA: DimensionEvaluation | null;
    CONOCE: DimensionEvaluation | null;
    AMPLIA: DimensionEvaluation | null;
  }>;
  onApplyEvaluations: (enrollmentId: number, dimension: EricaDimension, state: EricaState, notes?: string | null) => void;
  copyOnlyEmpty?: boolean;
  onNotify?: (message: string) => void;
}

export default function CopyEvaluations({
  students,
  onApplyEvaluations,
  copyOnlyEmpty = true,
  onNotify,
}: CopyEvaluationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceStudentId, setSourceStudentId] = useState<number | null>(null);
  const [targetStudentIds, setTargetStudentIds] = useState<Set<number>>(new Set());
  const [localCopyOnlyEmpty, setLocalCopyOnlyEmpty] = useState(copyOnlyEmpty);

  // Estudiantes con evaluaciones COMPLETAS (todas 5 dimensiones)
  const sourceStudents = useMemo(() => {
    return students.filter(student => {
      const evals = {
        EJECUTA: student.EJECUTA,
        RETIENE: student.RETIENE,
        INTERPRETA: student.INTERPRETA,
        CONOCE: student.CONOCE,
        AMPLIA: student.AMPLIA,
      };
      // Contar solo evaluaciones reales (no nulas)
      const completed = Object.values(evals).filter(e => e !== null).length;
      // Solo retornar si TODAS (5) dimensiones están evaluadas
      return completed === 5;
    });
  }, [students]);

  // Estudiantes objetivo (excepto el fuente)
  const targetStudents = useMemo(() => {
    return students.filter(s => s.enrollmentId !== sourceStudentId);
  }, [students, sourceStudentId]);

  const sourceStudent = useMemo(() => {
    return students.find(s => s.enrollmentId === sourceStudentId);
  }, [students, sourceStudentId]);

  const getStudentEvaluations = (student: typeof students[0]) => {
    return {
      EJECUTA: student.EJECUTA,
      RETIENE: student.RETIENE,
      INTERPRETA: student.INTERPRETA,
      CONOCE: student.CONOCE,
      AMPLIA: student.AMPLIA,
    };
  };

  const handleCopy = () => {
    if (!sourceStudent || targetStudentIds.size === 0) return;

    const sourceEvals = getStudentEvaluations(sourceStudent);
    let copiedCount = 0;
    
    targetStudentIds.forEach(targetId => {
      const targetStudent = students.find(s => s.enrollmentId === targetId);
      if (!targetStudent) return;

      const targetEvals = getStudentEvaluations(targetStudent);

      DIMENSION_ORDER.forEach(dimension => {
        const sourceEval = sourceEvals[dimension as keyof typeof sourceEvals];
        const targetEval = targetEvals[dimension as keyof typeof targetEvals];

        // Solo copiar si:
        // 1. Hay evaluación en fuente
        // 2. Si localCopyOnlyEmpty es true, objetivo debe estar vacío
        if (sourceEval && (!localCopyOnlyEmpty || !targetEval)) {
          onApplyEvaluations(targetId, dimension, sourceEval.state as EricaState);
          copiedCount++;
        }
      });
    });

    // Notificar
    if (onNotify) {
      onNotify(`✓ Se copiaron ${copiedCount} evaluaciones a ${targetStudentIds.size} estudiante(s)`);
    }

    setIsOpen(false);
    setSourceStudentId(null);
    setTargetStudentIds(new Set());
  };

  const toggleTarget = (id: number) => {
    const newSet = new Set(targetStudentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setTargetStudentIds(newSet);
  };

  const toggleAllTargets = () => {
    if (targetStudentIds.size === targetStudents.length) {
      setTargetStudentIds(new Set());
    } else {
      setTargetStudentIds(new Set(targetStudents.map(s => s.enrollmentId)));
    }
  };

  const getStudentInitials = (name: string) => {
    const parts = name.split(', ');
    if (parts.length === 2) {
      return `${parts[1][0]}${parts[0][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const completedCount = useMemo(() => {
    if (!sourceStudent) return 0;
    const evals = getStudentEvaluations(sourceStudent);
    return Object.values(evals).filter(e => e !== null).length;
  }, [sourceStudent]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs"
        title="Copiar evaluaciones de un estudiante a otros"
      >
        <Copy className="w-4 h-4 mr-1" />
        Copiar
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Copiar Evaluaciones</DialogTitle>
            <DialogDescription>
              Selecciona un estudiante fuente y copia sus evaluaciones a otros
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Estudiante Fuente */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-sm">Estudiante Fuente</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sourceStudents.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-6">
                    No hay estudiantes con todas las dimensiones evaluadas
                  </div>
                ) : (
                  sourceStudents.map(student => {
                    const evals = getStudentEvaluations(student);
                    const count = Object.values(evals).filter(e => e !== null).length;
                    const isSelected = sourceStudentId === student.enrollmentId;

                    return (
                      <div
                        key={student.enrollmentId}
                        onClick={() => {
                          setSourceStudentId(student.enrollmentId);
                          setTargetStudentIds(new Set());
                        }}
                        className={`p-2 rounded cursor-pointer border-2 transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getStudentInitials(student.studentName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">
                              {student.studentName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {count} evaluaciones completas ✓
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Estudiantes Objetivo */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Copiar a...</h3>
                {sourceStudentId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllTargets}
                    className="text-xs h-auto py-1"
                  >
                    {targetStudentIds.size === targetStudents.length
                      ? 'Desseleccionar'
                      : 'Seleccionar'}{' '}
                    Todo
                  </Button>
                )}
              </div>

              {!sourceStudentId ? (
                <div className="text-xs text-gray-500 text-center py-8">
                  Selecciona un estudiante fuente
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {targetStudents.map(student => {
                    const isSelected = targetStudentIds.has(student.enrollmentId);
                    return (
                      <div
                        key={student.enrollmentId}
                        onClick={() => toggleTarget(student.enrollmentId)}
                        className={`p-2 rounded cursor-pointer border-2 transition-colors flex items-center gap-2 ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {}}
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getStudentInitials(student.studentName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {student.studentName}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {sourceStudent && (
            <>
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={localCopyOnlyEmpty}
                    onCheckedChange={(checked) =>
                      setLocalCopyOnlyEmpty(checked as boolean)
                    }
                  />
                  <span className="text-sm">
                    Copiar solo a celdas vacías (no sobrescribir)
                  </span>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-900">
                  <strong>Resumen:</strong> Se copiarán{' '}
                  <strong>{completedCount} evaluaciones</strong> a{' '}
                  <strong>{targetStudentIds.size} estudiante(s)</strong>
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCopy}
              disabled={!sourceStudent || targetStudentIds.size === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar {targetStudentIds.size} estudiante(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
