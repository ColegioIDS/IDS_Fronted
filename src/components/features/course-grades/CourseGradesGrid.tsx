// src/components/features/course-grades/CourseGradesGrid.tsx
'use client';

import React from 'react';
import { CourseGradeDetail } from '@/types/course-grades.types';
import { Card, CardContent } from '@/components/ui/card';
import { FileX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CourseGradeCard from './CourseGradeCard';

interface CourseGradesGridProps {
  courseGrades: CourseGradeDetail[];
  onEdit: (courseGrade: CourseGradeDetail) => void;
  onDelete: (courseGrade: CourseGradeDetail) => void;
  onViewDetails: (courseGrade: CourseGradeDetail) => void;
}

export default function CourseGradesGrid({
  courseGrades,
  onEdit,
  onDelete,
  onViewDetails,
}: CourseGradesGridProps) {
  if (courseGrades.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-12 bg-white dark:bg-gray-900">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              <FileX className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              No hay asignaciones
            </h3>
            <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
              No se encontraron asignaciones curso-grado con los filtros aplicados.
              <br />
              Intente ajustar los filtros o cree una nueva asignación.
            </p>
            <Button 
              variant="outline"
              className="border-gray-300 dark:border-gray-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Asignación
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courseGrades.map((courseGrade) => (
        <CourseGradeCard
          key={courseGrade.id}
          courseGrade={courseGrade}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
