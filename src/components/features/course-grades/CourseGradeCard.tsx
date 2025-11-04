// src/components/features/course-grades/CourseGradeCard.tsx
'use client';

import React from 'react';
import { CourseGradeDetail } from '@/types/course-grades.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
}

export default function CourseGradeCard({
  courseGrade,
  onEdit,
  onDelete,
  onViewDetails,
}: CourseGradeCardProps) {
  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {courseGrade.course.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {courseGrade.course.code}
              </p>
            </div>
          </div>

          {/* Type Badge */}
          <div className="flex items-center gap-2">
            {courseGrade.isCore ? (
              <Badge className="gap-1.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Núcleo
              </Badge>
            ) : (
              <Badge className="gap-1.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                <Circle className="w-3.5 h-3.5" />
                Electivo
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onViewDetails(courseGrade)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(courseGrade)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(courseGrade)}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-6 space-y-4 bg-white dark:bg-gray-900">
        {/* Grade Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
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
        <Button
          onClick={() => onViewDetails(courseGrade)}
          variant="outline"
          className="w-full mt-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalles Completos
        </Button>
      </CardContent>
    </Card>
  );
}
