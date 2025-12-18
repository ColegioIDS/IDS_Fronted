// src/components/features/course-grades/CourseGradeCard.tsx
'use client';

import React from 'react';
import { CourseGradeDetail } from '@/types/course-grades.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, Eye, Edit, Trash2, MoreHorizontal, GraduationCap, CheckCircle2, Circle } from 'lucide-react';

interface CourseGradeCardProps {
  courseGrade: CourseGradeDetail;
  onEdit: (courseGrade: CourseGradeDetail) => void;
  onDelete: (courseGrade: CourseGradeDetail) => void;
  onViewDetails: (courseGrade: CourseGradeDetail) => void;
  canReadOne?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function CourseGradeCard({
  courseGrade,
  onEdit,
  onDelete,
  onViewDetails,
  canReadOne = true,
  canUpdate = false,
  canDelete = false,
}: CourseGradeCardProps) {
  return (
    <TooltipProvider>
      <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Header */}
        <CardHeader className="bg-indigo-50 dark:bg-indigo-950 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900 shadow-sm flex-shrink-0">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {courseGrade.course.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {courseGrade.course.code}
                </p>
              </div>
            </div>

            {/* Type Badge & Menu */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  {courseGrade.isCore ? (
                    <Badge className="gap-1.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-help">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Núcleo
                    </Badge>
                  ) : (
                    <Badge className="gap-1.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-help">
                      <Circle className="w-3.5 h-3.5" />
                      Electivo
                    </Badge>
                  )}
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">
                    {courseGrade.isCore ? 'Curso obligatorio del plan de estudios' : 'Curso opcional para el estudiante'}
                  </p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {canReadOne && (
                    <DropdownMenuItem onClick={() => onViewDetails(courseGrade)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </DropdownMenuItem>
                  )}
                  {canUpdate && (
                    <DropdownMenuItem onClick={() => onEdit(courseGrade)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(courseGrade)}
                        className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6 space-y-4 bg-white dark:bg-gray-900">
          {/* Grade Info */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border-2 border-purple-100 dark:border-purple-800 cursor-help hover:shadow-md transition-shadow">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 shadow-sm">
                  <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {courseGrade.grade.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Nivel: {courseGrade.grade.level}
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Grado al que está asignado este curso</p>
            </TooltipContent>
          </Tooltip>

        {/* Course Details */}
        {courseGrade.course.area && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Área:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {courseGrade.course.area}
            </span>
          </div>
        )}

        {/* Action Button */}
        {canReadOne && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onViewDetails(courseGrade)}
                variant="outline"
                className="w-full mt-2 border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles Completos
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Ver información completa de la asignación</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  </TooltipProvider>
  );
}
