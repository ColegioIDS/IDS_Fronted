// src/components/features/course-assignments/CourseAssignmentsPageContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedContent from '@/components/common/ProtectedContent';
import { useCourseAssignment } from '@/hooks/useCourseAssignment';
import GradeSectionSelector from './GradeSectionSelector';
import CourseAssignmentsTable from './CourseAssignmentsTable';

export default function CourseAssignmentsPageContent() {
  // Verificar permisos
  const { hasPermission } = useAuth();
  const canRead = hasPermission('course-assignment', 'read');

  // Hook principal
  const { 
    formData,
    cycleGradesData,
    isLoadingFormData,
    isLoadingCycleGrades,
    error, 
    clearError,
    loadFormData,
    loadCycleGrades
  } = useCourseAssignment({ 
    autoLoadFormData: true 
  });

  // Estados locales para navegación
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  // Auto-seleccionar ciclo activo cuando se carguen los datos
  useEffect(() => {
    if (formData?.cycles && formData.cycles.length > 0 && !selectedCycleId) {
      const activeCycle = formData.cycles.find(c => c.isActive);
      if (activeCycle) {
        setSelectedCycleId(activeCycle.id);
        loadCycleGrades(activeCycle.id);
      }
    }
  }, [formData, selectedCycleId, loadCycleGrades]);

  // Manejar selección de ciclo
  const handleCycleChange = (value: string) => {
    const cycleId = parseInt(value);
    setSelectedCycleId(cycleId);
    setSelectedGradeId(null);
    setSelectedSectionId(null);
    loadCycleGrades(cycleId);
  };

  // Manejar cuando se completa la selección de grado-sección
  const handleSelectionComplete = (gradeId: number, sectionId: number) => {
    setSelectedGradeId(gradeId);
    setSelectedSectionId(sectionId);
  };

  // Volver a selección de grado/sección
  const handleBackToSelection = () => {
    setSelectedGradeId(null);
    setSelectedSectionId(null);
  };

  // Refrescar todo
  const handleRefresh = () => {
    loadFormData();
    if (selectedCycleId) {
      loadCycleGrades(selectedCycleId);
    }
    setSelectedGradeId(null);
    setSelectedSectionId(null);
  };

  // Si no tiene permiso de lectura
  if (!canRead) {
    return (
      <ProtectedContent requiredPermission={{ module: 'course-assignment', action: 'read' }}>
        <></>
      </ProtectedContent>
    );
  }

  // Loading state
  if (isLoadingFormData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="space-y-3 mt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no hay ciclos disponibles
  if (!formData?.cycles || formData.cycles.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              No hay ciclos escolares disponibles
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Configure al menos un ciclo escolar para poder asignar cursos y maestros
            </p>
          </div>
          <Button onClick={loadFormData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const selectedCycle = formData.cycles.find(c => c.id === selectedCycleId);
  const showGradeSelection = selectedCycleId && cycleGradesData && !isLoadingCycleGrades;
  const showAssignmentTable = selectedGradeId && selectedSectionId;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Asignación de Cursos y Maestros
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure qué maestros imparten cada curso por sección
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {showAssignmentTable && (
              <Button 
                variant="outline" 
                onClick={handleBackToSelection}
                className="border-gray-300 dark:border-gray-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cambiar Sección
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="border-gray-300 dark:border-gray-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Error Global */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearError}
            className="mt-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
          >
            Cerrar
          </Button>
        </Alert>
      )}

      {/* Selector de Ciclo Escolar */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Calendar className="h-5 w-5" />
            Ciclo Escolar
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Seleccione el ciclo escolar para el cual desea configurar las asignaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCycleId?.toString() || ''} onValueChange={handleCycleChange}>
            <SelectTrigger className="w-full max-w-md bg-white dark:bg-gray-800">
              <SelectValue placeholder="Seleccionar ciclo escolar" />
            </SelectTrigger>
            <SelectContent>
              {formData.cycles.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cycle.name}</span>
                    {cycle.isActive && (
                      <Badge variant="default" className="bg-green-600 text-white text-xs">
                        Activo
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedCycle && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <CheckCircle className="h-4 w-4" />
              <span>
                {new Date(selectedCycle.startDate).toLocaleDateString()} - {new Date(selectedCycle.endDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Loading grados */}
      {isLoadingCycleGrades && (
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido Principal */}
      {showGradeSelection && !showAssignmentTable && cycleGradesData && (
        <GradeSectionSelector 
          formData={cycleGradesData}
          onSelectionComplete={(gradeId, sectionId) => {
            setSelectedGradeId(gradeId);
            setSelectedSectionId(sectionId);
          }}
        />
      )}

      {/* Tabla de asignaciones */}
      {showAssignmentTable && selectedGradeId && selectedSectionId && (
        <CourseAssignmentsTable 
          gradeId={selectedGradeId}
          sectionId={selectedSectionId}
        />
      )}
    </div>
  );
}
