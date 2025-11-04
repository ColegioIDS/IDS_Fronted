// src/components/features/course-assignments/GradeSectionSelector.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Users, BookOpen, ArrowRight } from 'lucide-react';
import { CycleGradesData } from '@/types/course-assignments.types';

interface GradeSectionSelectorProps {
  formData: CycleGradesData;
  onSelectionComplete: (gradeId: number, sectionId: number) => void;
}

export default function GradeSectionSelector({
  formData,
  onSelectionComplete,
}: GradeSectionSelectorProps) {
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Los grados ya vienen en la estructura correcta
  const grades = useMemo(() => {
    return formData.grades.sort((a, b) => a.order - b.order);
  }, [formData.grades]);

  // Filtrar secciones por grado seleccionado
  const sectionsForGrade = useMemo(() => {
    if (!selectedGradeId) return [];
    const grade = formData.grades.find(g => g.id === parseInt(selectedGradeId));
    return grade?.sections.sort((a, b) => a.name.localeCompare(b.name)) || [];
  }, [selectedGradeId, formData.grades]);

  // Calcular totales
  const totalSections = useMemo(() => {
    return formData.grades.reduce((acc, grade) => acc + grade.sections.length, 0);
  }, [formData.grades]);

  const totalGrades = formData.grades.length;

  const handleContinue = () => {
    if (selectedGradeId && selectedSectionId) {
      onSelectionComplete(parseInt(selectedGradeId), parseInt(selectedSectionId));
    }
  };

  const canContinue = selectedGradeId && selectedSectionId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Info Card */}
      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Seleccione Grado y Sección
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Elija el grado y la sección para asignar cursos y maestros
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Selector Card */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="p-6 space-y-6">
          {/* Grado Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Grado Escolar
            </label>
            <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
              <SelectTrigger className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <SelectValue placeholder="Seleccione un grado" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                {grades.map((grade) => (
                  <SelectItem 
                    key={grade.id} 
                    value={grade.id.toString()}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{grade.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {grade.level}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {grades.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No hay grados disponibles
              </p>
            )}
          </div>

          {/* Sección Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Sección
            </label>
            <Select 
              value={selectedSectionId} 
              onValueChange={setSelectedSectionId}
              disabled={!selectedGradeId}
            >
              <SelectTrigger className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <SelectValue placeholder={
                  selectedGradeId 
                    ? "Seleccione una sección" 
                    : "Primero seleccione un grado"
                } />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                {sectionsForGrade.map((section) => (
                  <SelectItem 
                    key={section.id} 
                    value={section.id.toString()}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{section.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        Capacidad: {section.capacity}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGradeId && sectionsForGrade.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No hay secciones disponibles para este grado
              </p>
            )}
          </div>

          {/* Continue Button */}
          <div className="pt-4">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-2">
                <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Grados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {grades.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Secciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {totalSections}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Grados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {totalGrades}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
