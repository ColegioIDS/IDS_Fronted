// src/components/features/erica-evaluations/evaluation-grid/patterns-selector.tsx
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
import {
  CheckCircle,
  TrendingUp,
  Target,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { EricaDimension, EricaState, DimensionEvaluation } from '@/types/erica-evaluations';
import { DIMENSION_ORDER } from '../utils/evaluation-helpers';

interface EvaluationPattern {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  states: EricaState[];
  color: string;
}

interface PatternsSelectorProps {
  students: Array<{
    enrollmentId: number;
    studentName: string;
    EJECUTA: DimensionEvaluation | null;
    RETIENE: DimensionEvaluation | null;
    INTERPRETA: DimensionEvaluation | null;
    CONOCE: DimensionEvaluation | null;
    APLICA: DimensionEvaluation | null;
  }>;
  onApplyEvaluations: (enrollmentId: number, dimension: EricaDimension, state: EricaState, notes?: string | null) => void;
  copyOnlyEmpty?: boolean;
  onNotify?: (message: string) => void;
}

export default function PatternsSelector({
  students,
  onApplyEvaluations,
  copyOnlyEmpty = true,
  onNotify,
}: PatternsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [localCopyOnlyEmpty, setLocalCopyOnlyEmpty] = useState(copyOnlyEmpty);

  // Patrones predefinidos
  const patterns: EvaluationPattern[] = useMemo(() => [
    {
      id: 'excellent',
      name: 'Excelente General',
      description: 'Todas las competencias en nivel excelente',
      icon: CheckCircle,
      states: ['E', 'E', 'E', 'E', 'E'] as EricaState[],
      color: 'from-green-50 to-green-100 border-green-300',
    },
    {
      id: 'good',
      name: 'Buen Rendimiento',
      description: 'Rendimiento consistentemente bueno',
      icon: TrendingUp,
      states: ['B', 'B', 'B', 'B', 'B'] as EricaState[],
      color: 'from-blue-50 to-blue-100 border-blue-300',
    },
    {
      id: 'average',
      name: 'Rendimiento Promedio',
      description: 'Desempeño estándar esperado',
      icon: Target,
      states: ['P', 'P', 'P', 'P', 'P'] as EricaState[],
      color: 'from-yellow-50 to-yellow-100 border-yellow-300',
    },
    {
      id: 'mixed-strong',
      name: 'Mixto Fuerte',
      description: 'Fortalezas en ejecución e interpretación',
      icon: Zap,
      states: ['E', 'B', 'E', 'B', 'B'] as EricaState[],
      color: 'from-indigo-50 to-indigo-100 border-indigo-300',
    },
    {
      id: 'developing',
      name: 'En Desarrollo',
      description: 'Necesita apoyo pero progresando',
      icon: AlertTriangle,
      states: ['C', 'P', 'C', 'P', 'P'] as EricaState[],
      color: 'from-orange-50 to-orange-100 border-orange-300',
    },
  ], []);

  const selectedPattern = useMemo(() => {
    return patterns.find(p => p.id === selectedPatternId);
  }, [patterns, selectedPatternId]);

  const getStudentEvaluations = (student: typeof students[0]) => {
    return {
      EJECUTA: student.EJECUTA,
      RETIENE: student.RETIENE,
      INTERPRETA: student.INTERPRETA,
      CONOCE: student.CONOCE,
      APLICA: student.APLICA,
    };
  };

  const handleApplyPattern = () => {
    if (!selectedPattern || selectedStudentIds.size === 0) return;

    let appliedCount = 0;
    selectedStudentIds.forEach(studentId => {
      const student = students.find(s => s.enrollmentId === studentId);
      if (!student) return;

      const evals = getStudentEvaluations(student);

      DIMENSION_ORDER.forEach((dimension, index) => {
        const currentEval = evals[dimension as keyof typeof evals];
        const newState = selectedPattern.states[index];

        // Solo aplicar si:
        // 1. localCopyOnlyEmpty es false O
        // 2. No hay evaluación actual en esta dimensión
        if (!localCopyOnlyEmpty || !currentEval) {
          onApplyEvaluations(studentId, dimension, newState as EricaState);
          appliedCount++;
        }
      });
    });

    // Notificar
    if (onNotify) {
      onNotify(`✓ Patrón "${selectedPattern.name}" aplicado a ${selectedStudentIds.size} estudiante(s) (${appliedCount} evaluaciones)`);
    }

    setIsOpen(false);
    setSelectedStudentIds(new Set());
    setSelectedPatternId(null);
  };

  const toggleStudent = (id: number) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudentIds(newSet);
  };

  const toggleAllStudents = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(students.map(s => s.enrollmentId)));
    }
  };

  const getStudentInitials = (name: string) => {
    const parts = name.split(', ');
    if (parts.length === 2) {
      return `${parts[1][0]}${parts[0][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs"
        title="Aplicar patrones predefinidos de evaluación"
      >
        <Zap className="w-4 h-4 mr-1" />
        Patrones
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Patrones de Evaluación</DialogTitle>
            <DialogDescription>
              Aplicar patrones predefinidos a múltiples estudiantes
            </DialogDescription>
          </DialogHeader>

          {/* Patrones */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Selecciona un patrón</h3>
            <div className="grid grid-cols-2 gap-2">
              {patterns.map(pattern => {
                const PatternIcon = pattern.icon;
                const isSelected = selectedPatternId === pattern.id;

                return (
                  <div
                    key={pattern.id}
                    onClick={() => setSelectedPatternId(pattern.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } bg-gradient-to-br ${pattern.color}`}
                  >
                    <div className="flex items-start gap-2">
                      <PatternIcon className="w-5 h-5 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{pattern.name}</div>
                        <div className="text-xs text-gray-600 mb-2">
                          {pattern.description}
                        </div>
                        <div className="flex gap-1">
                          {pattern.states.map((state, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {state}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selección de estudiantes */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Aplicar a estudiantes</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllStudents}
                className="text-xs h-auto py-1"
              >
                {selectedStudentIds.size === students.length
                  ? 'Desseleccionar'
                  : 'Seleccionar'}{' '}
                Todo
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {students.map(student => {
                const isSelected = selectedStudentIds.has(student.enrollmentId);
                return (
                  <div
                    key={student.enrollmentId}
                    onClick={() => toggleStudent(student.enrollmentId)}
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
          </div>

          {selectedPattern && (
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={localCopyOnlyEmpty}
                  onCheckedChange={(checked) =>
                    setLocalCopyOnlyEmpty(checked as boolean)
                  }
                />
                <span className="text-sm">
                  Aplicar solo a celdas vacías (no sobrescribir)
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleApplyPattern}
              disabled={!selectedPattern || selectedStudentIds.size === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Aplicar a {selectedStudentIds.size} estudiante(s)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
