// src/components/erica-history/selection-flow/grade-selection.tsx
"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, CheckCircle, BarChart3 } from 'lucide-react';

// Context hooks
import { useGradeCycleContext } from '@/context/GradeCycleContext';

// Types
import { SchoolCycle } from '@/types/SchoolCycle';
import { Grade } from '@/types/student';

// ==================== INTERFACES ====================
interface GradeSelectionProps {
  selectedCycle: SchoolCycle;
  selectedGrade: Grade | null;
  onSelect: (grade: Grade) => void;
  isCompleted: boolean;
  onEdit: () => void;
}

interface GradeCycleWithGrade {
  id: number;
  cycleId: number;
  gradeId: number;
  grade: Grade;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function GradeSelection({
  selectedCycle,
  selectedGrade,
  onSelect,
  isCompleted,
  onEdit
}: GradeSelectionProps) {
  // ========== CONTEXTS ==========
  const { 
    state: { gradeCycles, loading: loadingGrades, error: gradeError }
  } = useGradeCycleContext();

  // ========== COMPUTED VALUES ==========
  const availableGrades = useMemo(() => {
    return gradeCycles
      .filter((gc: any) => gc.cycleId === selectedCycle.id)
      .sort((a: any, b: any) => {
        // Ordenar por orden del grado (primero, segundo, tercero, etc.)
        return (a.grade?.order || 0) - (b.grade?.order || 0);
      });
  }, [gradeCycles, selectedCycle.id]);

  // ========== VISTA COMPLETADA ==========
  if (isCompleted && selectedGrade) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <div className="font-semibold text-green-800 dark:text-green-200">
              {selectedGrade.name}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Nivel: {selectedGrade.level}
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
            Grado seleccionado
          </Badge>
        </div>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
        >
          Cambiar
        </Button>
      </div>
    );
  }

  // ========== MANEJO DE ESTADOS ==========
  if (loadingGrades) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Cargando grados disponibles para consulta histórica...
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (gradeError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar los grados: {gradeError}
        </AlertDescription>
      </Alert>
    );
  }

  if (availableGrades.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No hay grados disponibles en el ciclo "{selectedCycle.name}". 
          Configure los grados activos para este ciclo escolar.
        </AlertDescription>
      </Alert>
    );
  }

  // ========== VISTA DE SELECCIÓN ==========
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Seleccione el grado para consultar el historial ERICA del ciclo "{selectedCycle.name}"
        </p>
        <Badge variant="outline" className="text-xs">
          {availableGrades.length} grado{availableGrades.length !== 1 ? 's' : ''} con historial
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableGrades.map((gradeCycle: any) => (
          <Card 
            key={gradeCycle.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-600"
          >
            <CardContent className="p-6">
              <button
                onClick={() => onSelect(gradeCycle.grade)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-xs"
                  >
                    Historial
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors">
                    {gradeCycle.grade.name}
                  </h3>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Nivel: {gradeCycle.grade.level}</div>
                    {gradeCycle.grade.order && (
                      <div>Orden: {gradeCycle.grade.order}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                    <BarChart3 className="h-3 w-3" />
                    <span>Consultar evaluaciones QNA</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Click para consultar</span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-purple-800 dark:text-purple-200 mb-2">
              Sobre el historial QNA:
            </div>
            <div className="space-y-1 text-purple-700 dark:text-purple-300">
              <div>• Consulte evaluaciones ERICA previamente realizadas</div>
              <div>• Visualice cálculos QNA automáticos por competencias</div>
              <div>• Analice promedios bimestrales, mensuales y quincenales</div>
              <div>• Solo modo lectura - sin funciones de edición</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
        Solo se muestran los grados con evaluaciones ERICA registradas
      </div>
    </div>
  );
}