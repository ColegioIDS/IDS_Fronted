// src/components/course-assignments/components/grade-section-selector.tsx
'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Users, ChevronRight, AlertCircle } from 'lucide-react';
import { useGradeContext } from '@/context/GradeContext';
import { useSectionContext } from '@/context/SectionsContext';
import { useCourseAssignmentContext } from '@/context/CourseAssignmentContext';

interface GradeSectionSelectorProps {
  onSelectionComplete: (gradeId: number, sectionId: number) => void;
}

export default function GradeSectionSelector({ onSelectionComplete }: GradeSectionSelectorProps) {
  const { state: gradeState, fetchActiveGrades } = useGradeContext();
  const { state: sectionState, fetchSectionsByGrade } = useSectionContext();
  const { 
    state: { selectedGradeId, selectedSectionId }, 
    setSelectedGrade, 
    setSelectedSection 
  } = useCourseAssignmentContext();

  // Cargar grados activos al montar
  useEffect(() => {
    if (gradeState.grades.length === 0 && !gradeState.loading) {
      fetchActiveGrades();
    }
  }, [gradeState.grades.length, gradeState.loading, fetchActiveGrades]);

  // Cargar secciones cuando se selecciona un grado
  useEffect(() => {
    if (selectedGradeId) {
      fetchSectionsByGrade(selectedGradeId);
    }
  }, [selectedGradeId, fetchSectionsByGrade]);

  // Notificar cuando se complete la selección
  useEffect(() => {
    if (selectedGradeId && selectedSectionId) {
      onSelectionComplete(selectedGradeId, selectedSectionId);
    }
  }, [selectedGradeId, selectedSectionId, onSelectionComplete]);

  const handleGradeSelect = (gradeId: number) => {
    setSelectedGrade(gradeId);
    setSelectedSection(null); // Reset section when grade changes
  };

  const handleSectionSelect = (sectionId: number) => {
    setSelectedSection(sectionId);
  };

  if (gradeState.loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (gradeState.error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {gradeState.error}
        </AlertDescription>
      </Alert>
    );
  }

  const activeGrades = gradeState.grades.filter(grade => grade.isActive);

  return (
    <div className="space-y-6">
      {/* Paso 1: Seleccionar Grado */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium">
            1
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Seleccionar Grado
          </h3>
        </div>

        {activeGrades.length === 0 ? (
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              No hay grados activos disponibles. Configure los grados primero.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGrades.map(grade => (
              <Card 
                key={grade.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedGradeId === grade.id
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950 shadow-md'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleGradeSelect(grade.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        selectedGradeId === grade.id
                          ? 'bg-blue-100 dark:bg-blue-800'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <GraduationCap className={`h-5 w-5 ${
                          selectedGradeId === grade.id
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      {selectedGradeId === grade.id && (
                        <Badge variant="default" className="bg-blue-600 text-white">
                          Seleccionado
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {grade.name}
                  </h4>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Nivel: {grade.level}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>Orden:</span>
                    <span className="font-medium">{grade.order}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Paso 2: Seleccionar Sección (solo si hay grado seleccionado) */}
      {selectedGradeId && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
              selectedSectionId 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            }`}>
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Seleccionar Sección
            </h3>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {gradeState.grades.find(g => g.id === selectedGradeId)?.name}
            </span>
          </div>

          {sectionState.loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sectionState.sections.length === 0 ? (
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                No hay secciones disponibles para este grado. Configure las secciones primero.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sectionState.sections
                .filter(section => section.gradeId === selectedGradeId)
                .map(section => (
                  <Card 
                    key={section.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSectionId === section.id
                        ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950 shadow-md'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleSectionSelect(section.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${
                          selectedSectionId === section.id
                            ? 'bg-green-100 dark:bg-green-800'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Users className={`h-4 w-4 ${
                            selectedSectionId === section.id
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        {selectedSectionId === section.id && (
                          <Badge variant="default" className="bg-green-600 text-white text-xs">
                            Seleccionada
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Sección {section.name}
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Capacidad:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {section.capacity} estudiantes
                          </span>
                        </div>
                        
                        {section.teacher && (
                          <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Maestro Titular:
                            </span>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {section.teacher.givenNames} {section.teacher.lastNames}
                            </p>
                          </div>
                        )}
                        
                        {!section.teacher && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              Sin maestro titular
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Indicador de progreso */}
      {selectedGradeId && selectedSectionId && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs font-medium">
              ✓
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800 dark:text-green-200">
                Selección completada
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {gradeState.grades.find(g => g.id === selectedGradeId)?.name} - 
                Sección {sectionState.sections.find(s => s.id === selectedSectionId)?.name}
              </p>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
}