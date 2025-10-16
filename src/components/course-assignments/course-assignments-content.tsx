// src/components/course-assignments/course-assignments-content.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // ✅ NUEVO
import ProtectedContent from '@/components/common/ProtectedContent'; // ✅ NUEVO
import { useCourseAssignment } from '@/hooks/useCourseAssignment';
import GradeSectionSelector from './components/grade-section-selector';
import CourseTeacherTable from './components/course-teacher-table';

export default function CourseAssignmentsContent() {
  // ✅ NUEVO: Verificar permisos
  const { hasPermission } = useAuth();
  const canRead = hasPermission('course-assignment', 'read');
  const canCreate = hasPermission('course-assignment', 'create');
  const canUpdate = hasPermission('course-assignment', 'update');
  const canBulkUpdate = hasPermission('course-assignment', 'bulk-update');

  // Hook principal
  const { 
    formData, 
    isLoadingFormData, 
    error, 
    clearError,
    loadFormData 
  } = useCourseAssignment({ 
    autoLoadFormData: true 
  });

  // Estados locales para navegación
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<'selection' | 'assignment'>('selection');

  // Determinar el paso actual basado en las selecciones
  useEffect(() => {
    if (selectedGradeId && selectedSectionId) {
      setCurrentStep('assignment');
    } else {
      setCurrentStep('selection');
    }
  }, [selectedGradeId, selectedSectionId]);

  // Manejar cuando se completa la selección de grado-sección
  const handleSelectionComplete = (gradeId: number, sectionId: number) => {
    setSelectedGradeId(gradeId);
    setSelectedSectionId(sectionId);
    setCurrentStep('assignment');
  };

  // Volver al paso de selección
  const handleBackToSelection = () => {
    setSelectedGradeId(null);
    setSelectedSectionId(null);
    setCurrentStep('selection');
  };

  // Refrescar datos
  const handleRefresh = () => {
    loadFormData();
    if (selectedSectionId) {
      setSelectedSectionId(null);
      setSelectedGradeId(null);
      setCurrentStep('selection');
    }
  };

  // Helper para calcular info del ciclo
  const getActiveCycleInfo = () => {
    if (!formData?.activeCycle) return null;

    const start = new Date(formData.activeCycle.startDate);
    const end = new Date(formData.activeCycle.endDate);
    const now = new Date();
    
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const progress = (daysElapsed / totalDays) * 100;

    return {
      academicYear: formData.activeCycle.name,
      daysRemaining: Math.max(0, daysRemaining),
      progress: Math.min(100, Math.max(0, progress))
    };
  };

  const activeCycleInfo = getActiveCycleInfo();

  // ✅ NUEVO: Si no tiene permiso de lectura, mostrar ProtectedContent
  if (!canRead) {
    return (
      <ProtectedContent requiredPermission={{ module: 'course-assignment', action: 'read' }}>
        <>
        </>
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

  // Si no hay ciclo activo
  if (!formData?.activeCycle) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              No hay ciclo escolar activo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Configure un ciclo escolar activo antes de asignar cursos y maestros
            </p>
          </div>
          <Button asChild>
            <a href="/admin/school-cycles">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Ciclo Escolar
            </a>
          </Button>
        </div>
      </div>
    );
  }

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
            {currentStep === 'assignment' && (
              <Button 
                variant="outline" 
                onClick={handleBackToSelection}
                className="border-gray-300 dark:border-gray-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cambiar Selección
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

      {/* Información del Ciclo Activo */}
      {activeCycleInfo && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Ciclo Activo:</strong> {activeCycleInfo.academicYear} 
            <span className="ml-2 text-sm">
              ({activeCycleInfo.daysRemaining} días restantes, {Math.round(activeCycleInfo.progress)}% completado)
            </span>
          </AlertDescription>
        </Alert>
      )}

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

      {/* Indicador de Progreso */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Paso 1: Selección */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  selectedGradeId && selectedSectionId
                    ? 'bg-green-600 text-white'
                    : currentStep === 'selection'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {selectedGradeId && selectedSectionId ? '✓' : '1'}
                </div>
                <span className={`text-sm font-medium ${
                  selectedGradeId && selectedSectionId
                    ? 'text-green-700 dark:text-green-300'
                    : currentStep === 'selection'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Seleccionar Grado y Sección
                </span>
              </div>

              <div className="h-px w-8 bg-gray-300 dark:bg-gray-600" />

              {/* Paso 2: Asignación */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  currentStep === 'assignment'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${
                  currentStep === 'assignment'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Asignar Maestros a Cursos
                </span>
              </div>
            </div>

            {/* Info de selección actual */}
            {selectedGradeId && selectedSectionId && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Grado Seleccionado
                </Badge>
                <Badge variant="outline" className="bg-white dark:bg-gray-800 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                  <Users className="h-3 w-3 mr-1" />
                  Sección Seleccionada
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Contenido Principal */}
      <div className="space-y-6">
        {currentStep === 'selection' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Paso 1: Seleccionar Grado y Sección
              </h2>
            </div>
            
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Primero seleccione el grado académico, luego la sección específica donde desea configurar las asignaciones de cursos y maestros.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GradeSectionSelector 
                  grades={formData.grades}
                  onSelectionComplete={handleSelectionComplete} 
                />
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'assignment' && selectedGradeId && selectedSectionId && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Paso 2: Asignar Maestros a Cursos
              </h2>
            </div>

            {/* ✅ NUEVO: Pasar permisos al componente hijo */}
            <CourseTeacherTable 
              gradeId={selectedGradeId} 
              sectionId={selectedSectionId}
              canUpdate={canUpdate}
              canBulkUpdate={canBulkUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}