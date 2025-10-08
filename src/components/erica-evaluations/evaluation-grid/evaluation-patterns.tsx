// src/components/erica-evaluations/evaluation-grid/evaluation-patterns.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Users, 
  User, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Target
} from 'lucide-react';

interface Scale {
  id: number;
  code: string;
  name: string;
  numericValue: number;
  order: number;
}

interface Category {
  id: number;
  code: string;
  name: string;
  order: number;
}

interface Student {
  enrollment: {
    id: number;
    student: {
      id: number;
      givenNames: string;
      lastNames: string;
    };
  };
  summary: {
    isComplete: boolean;
    completedEvaluations: number;
  };
}

interface EvaluationPattern {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  scalePattern: string[]; // Array de códigos de escala [E, R, I, C, A]
  color: string;
}

interface EvaluationPatternsProps {
  students: Student[];
  categories: Category[];
  scales: Scale[];
  onApplyPattern: (
    studentIds: number[],
    evaluations: Array<{
      enrollmentId: number;
      categoryId: number;
      scaleCode: string;
    }>
  ) => void;
}

export default function EvaluationPatterns({
  students,
  categories,
  scales,
  onApplyPattern
}: EvaluationPatternsProps) {

  // ========== ESTADO LOCAL ==========
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  // ========== PATRONES PREDEFINIDOS ==========
  const evaluationPatterns: EvaluationPattern[] = useMemo(() => [
    {
      id: 'excellent',
      name: 'Excelente General',
      description: 'Todas las competencias en nivel excelente',
      icon: CheckCircle,
      scalePattern: ['E', 'E', 'E', 'E', 'E'],
      color: 'from-green-50 to-green-100 border-green-300'
    },
    {
      id: 'good',
      name: 'Buen Rendimiento',
      description: 'Rendimiento consistentemente bueno',
      icon: TrendingUp,
      scalePattern: ['B', 'B', 'B', 'B', 'B'],
      color: 'from-blue-50 to-blue-100 border-blue-300'
    },
    {
      id: 'average',
      name: 'Rendimiento Promedio',
      description: 'Desempeño estándar esperado',
      icon: Target,
      scalePattern: ['P', 'P', 'P', 'P', 'P'],
      color: 'from-yellow-50 to-yellow-100 border-yellow-300'
    },
    {
      id: 'mixed-strong',
      name: 'Mixto Fuerte',
      description: 'Fortalezas en comunicación y razonamiento',
      icon: Zap,
      scalePattern: ['E', 'B', 'E', 'B', 'B'],
      color: 'from-indigo-50 to-indigo-100 border-indigo-300'
    },
    {
      id: 'developing',
      name: 'En Desarrollo',
      description: 'Necesita apoyo general pero progresando',
      icon: AlertTriangle,
      scalePattern: ['C', 'P', 'C', 'P', 'P'],
      color: 'from-orange-50 to-orange-100 border-orange-300'
    }
  ], []);

  // ========== COMPUTED VALUES ==========
  
  const sortedCategories = useMemo(() => {
    return categories.sort((a, b) => a.order - b.order);
  }, [categories]);

  const selectedStudentsCount = selectedStudents.length;

  const allStudentsSelected = selectedStudents.length === students.length;
  const someStudentsSelected = selectedStudents.length > 0 && selectedStudents.length < students.length;

  // Filtros de estudiantes
  const completedStudents = useMemo(() => 
    students.filter(s => s.summary.isComplete).map(s => s.enrollment.id), 
    [students]
  );

  const incompleteStudents = useMemo(() => 
    students.filter(s => !s.summary.isComplete).map(s => s.enrollment.id), 
    [students]
  );

  const partialStudents = useMemo(() => 
    students.filter(s => s.summary.completedEvaluations > 0 && !s.summary.isComplete)
      .map(s => s.enrollment.id), 
    [students]
  );

  // ========== FUNCIONES ==========

  const handleStudentToggle = (enrollmentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(enrollmentId)
        ? prev.filter(id => id !== enrollmentId)
        : [...prev, enrollmentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(allStudentsSelected ? [] : students.map(s => s.enrollment.id));
  };

  const handleSelectByFilter = (studentIds: number[]) => {
    setSelectedStudents(studentIds);
  };

  const handlePatternSelect = (patternId: string) => {
    setSelectedPattern(selectedPattern === patternId ? null : patternId);
  };

  const handleApplyPattern = () => {
    if (!selectedPattern || selectedStudents.length === 0) return;

    const pattern = evaluationPatterns.find(p => p.id === selectedPattern);
    if (!pattern) return;

    const evaluations = selectedStudents.flatMap(enrollmentId =>
      sortedCategories.map((category, index) => ({
        enrollmentId,
        categoryId: category.id,
        scaleCode: pattern.scalePattern[index] || 'P'
      }))
    );

    onApplyPattern(selectedStudents, evaluations);
    
    // Reset selecciones
    setSelectedStudents([]);
    setSelectedPattern(null);
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

  // ========== RENDER ==========
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Evaluación Rápida por Patrones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* ========== SELECCIÓN DE ESTUDIANTES ========== */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            1. Seleccionar Estudiantes ({selectedStudentsCount} de {students.length})
          </h4>
          
          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              {allStudentsSelected ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectByFilter(incompleteStudents)}
              className="flex items-center gap-1"
            >
              <AlertTriangle className="h-4 w-4" />
              Sin Evaluar ({incompleteStudents.length})
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectByFilter(partialStudents)}
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-4 w-4" />
              Parciales ({partialStudents.length})
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectByFilter(completedStudents)}
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Completos ({completedStudents.length})
            </Button>
          </div>

          {/* Lista de estudiantes */}
          <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {students.map(student => (
                <div key={student.enrollment.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`student-${student.enrollment.id}`}
                    checked={selectedStudents.includes(student.enrollment.id)}
                    onCheckedChange={() => handleStudentToggle(student.enrollment.id)}
                  />
                  <label
                    htmlFor={`student-${student.enrollment.id}`}
                    className="text-sm cursor-pointer truncate flex-1"
                  >
                    {student.enrollment.student.lastNames}, {student.enrollment.student.givenNames}
                  </label>
                  {student.summary.isComplete && (
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* ========== SELECCIÓN DE PATRÓN ========== */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            2. Seleccionar Patrón de Evaluación
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {evaluationPatterns.map(pattern => {
              const Icon = pattern.icon;
              const isSelected = selectedPattern === pattern.id;
              
              return (
                <div
                  key={pattern.id}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? `bg-gradient-to-r ${pattern.color} ring-2 ring-blue-300` 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                  onClick={() => handlePatternSelect(pattern.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {pattern.name}
                    </h5>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {pattern.description}
                  </p>
                  
                  {/* Preview del patrón */}
                  <div className="flex gap-1">
                    {pattern.scalePattern.map((scaleCode, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`text-xs ${getScaleBadgeColor(scaleCode)}`}
                      >
                        {scaleCode}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* ========== APLICAR PATRÓN ========== */}
        <div className="flex items-center justify-between">
          <div>
            {selectedStudentsCount > 0 && selectedPattern && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Aplicar patrón a <span className="font-medium">{selectedStudentsCount} estudiantes</span>
                {' '}({selectedStudentsCount * 5} evaluaciones)
              </div>
            )}
          </div>
          
          <Button
            onClick={handleApplyPattern}
            disabled={selectedStudentsCount === 0 || !selectedPattern}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Aplicar Patrón
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}