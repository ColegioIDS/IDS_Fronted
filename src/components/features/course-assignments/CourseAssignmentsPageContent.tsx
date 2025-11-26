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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Settings,
  Loader2,
  XCircle,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedContent from '@/components/common/ProtectedContent';
import { useCourseAssignment } from '@/hooks/useCourseAssignment';
import GradeSectionSelector from './components/grade-section-selector';
import CourseAssignmentsTable from './components/course-teacher-table';
import { toast } from 'sonner';

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

    const cycle = formData?.cycles.find(c => c.id === cycleId);
    toast.info('Ciclo seleccionado', {
      description: `${cycle?.name || 'Ciclo escolar'} - Cargando grados disponibles...`,
      icon: <Calendar className="w-5 h-5" />,
    });
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
    toast.info('Cambiando sección', {
      description: 'Seleccione un nuevo grado y sección',
      icon: <ArrowLeft className="w-5 h-5" />,
    });
  };

  // Refrescar todo
  const handleRefresh = async () => {
    const refreshToast = toast.loading('Actualizando datos...', {
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });

    try {
      loadFormData();
      if (selectedCycleId) {
        loadCycleGrades(selectedCycleId);
      }
      setSelectedGradeId(null);
      setSelectedSectionId(null);

      toast.success('Datos actualizados', {
        id: refreshToast,
        description: 'La información se ha actualizado correctamente',
        icon: <CheckCircle className="w-5 h-5" />,
      });
    } catch (err) {
      toast.error('Error al actualizar', {
        id: refreshToast,
        description: 'No se pudieron actualizar los datos',
        icon: <XCircle className="w-5 h-5" />,
      });
    }
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

  const selectedCycle = formData.cycles.find(c => c.id === selectedCycleId);
  const showGradeSelection = selectedCycleId && cycleGradesData && !isLoadingCycleGrades;
  const showAssignmentTable = selectedGradeId && selectedSectionId;

  // Helper para calcular info del ciclo
  const getCycleInfo = () => {
    if (!selectedCycle) return null;

    const start = new Date(selectedCycle.startDate);
    const end = new Date(selectedCycle.endDate);
    const now = new Date();
    
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const progress = (daysElapsed / totalDays) * 100;

    return {
      academicYear: selectedCycle.name,
      daysRemaining: Math.max(0, daysRemaining),
      progress: Math.min(100, Math.max(0, progress))
    };
  };

  const cycleInfo = getCycleInfo();

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
          
          <TooltipProvider>
            <div className="flex items-center gap-2">
              {showAssignmentTable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleBackToSelection}
                      className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Cambiar Sección
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                    <p className="font-semibold">Volver a seleccionar grado y sección</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Recargar datos de ciclos, grados y secciones</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
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

      {/* Información del Ciclo Seleccionado */}
      {cycleInfo && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Ciclo Seleccionado:</strong> {cycleInfo.academicYear} 
            <span className="ml-2 text-sm">
              ({cycleInfo.daysRemaining} días restantes, {Math.round(cycleInfo.progress)}% completado)
            </span>
          </AlertDescription>
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

      {/* Indicador de Progreso */}
      {selectedCycleId && (
        <Card className="border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Paso 1: Selección de Grado y Sección */}
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    selectedGradeId && selectedSectionId
                      ? 'bg-green-600 text-white'
                      : !showAssignmentTable
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {selectedGradeId && selectedSectionId ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className={`text-sm font-medium ${
                    selectedGradeId && selectedSectionId
                      ? 'text-green-700 dark:text-green-300'
                      : !showAssignmentTable
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Seleccionar Grado y Sección
                  </span>
                </div>

                <div className="h-px w-12 bg-gray-300 dark:bg-gray-600" />

                {/* Paso 2: Asignación de Cursos */}
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    showAssignmentTable
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    2
                  </div>
                  <span className={`text-sm font-medium ${
                    showAssignmentTable
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Asignar Maestros a Cursos
                  </span>
                </div>
              </div>

              {/* Info de selección actual */}
              {selectedGradeId && selectedSectionId && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700">
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
      )}

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
      <div className="space-y-6">
        {showGradeSelection && !showAssignmentTable && cycleGradesData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                  formData={cycleGradesData}
                  onSelectionComplete={(gradeId, sectionId) => {
                    setSelectedGradeId(gradeId);
                    setSelectedSectionId(sectionId);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {showAssignmentTable && selectedGradeId && selectedSectionId && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Paso 2: Asignar Maestros a Cursos
              </h2>
            </div>

            <CourseAssignmentsTable 
              gradeId={selectedGradeId}
              sectionId={selectedSectionId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
