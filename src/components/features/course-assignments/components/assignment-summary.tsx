// src/components/features/course-assignments/components/assignment-summary.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BookOpen, UserCheck, Users, CheckCircle, AlertTriangle } from 'lucide-react';

interface AssignmentSummaryProps {
  totalCourses: number;
  assignedCourses: number;
  titularCourses: number;
  specialistCourses: number;
  hasChanges: boolean;
}

export default function AssignmentSummary({
  totalCourses,
  assignedCourses,
  titularCourses,
  specialistCourses,
  hasChanges
}: AssignmentSummaryProps) {
  const unassignedCourses = totalCourses - assignedCourses;
  const completionPercentage = totalCourses > 0 ? Math.round((assignedCourses / totalCourses) * 100) : 0;

  return (
    <TooltipProvider>
      <Card className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-md">
        <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Resumen de Asignaciones
          </CardTitle>
          
          {hasChanges && (
            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Cambios pendientes
            </Badge>
          )}
          
          {!hasChanges && completionPercentage === 100 && (
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completo
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Progreso de asignaciones
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                completionPercentage === 100 
                  ? 'bg-green-600' 
                  : completionPercentage >= 75 
                  ? 'bg-blue-600' 
                  : completionPercentage >= 50 
                  ? 'bg-yellow-600' 
                  : 'bg-red-600'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Estadísticas en grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Cursos */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-help transition-colors">
                <div className="flex items-center justify-center">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Cursos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {totalCourses}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Total de cursos del grado</p>
            </TooltipContent>
          </Tooltip>

          {/* Cursos Asignados */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-help transition-colors">
                <div className="flex items-center justify-center">
                  <div className={`p-2 rounded-lg ${
                    assignedCourses === totalCourses
                      ? 'bg-green-100 dark:bg-green-900'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <CheckCircle className={`h-5 w-5 ${
                      assignedCourses === totalCourses
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Asignados</p>
                <p className={`text-2xl font-bold ${
                  assignedCourses === totalCourses
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {assignedCourses}
                </p>
                {unassignedCourses > 0 && (
                  <p className="text-xs font-medium text-red-500 dark:text-red-400">
                    {unassignedCourses} sin asignar
                  </p>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Cursos con maestro asignado</p>
              {unassignedCourses > 0 && (
                <p className="text-xs mt-1">{unassignedCourses} cursos pendientes</p>
              )}
            </TooltipContent>
          </Tooltip>

          {/* Asignaciones Titulares */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-help transition-colors">
                <div className="flex items-center justify-center">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Titulares</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {titularCourses}
                </p>
                {totalCourses > 0 && (
                  <p className="text-xs font-medium text-blue-500 dark:text-blue-400">
                    {Math.round((titularCourses / totalCourses) * 100)}%
                  </p>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Cursos asignados al maestro titular</p>
            </TooltipContent>
          </Tooltip>

          {/* Asignaciones Especialistas */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-help transition-colors">
                <div className="flex items-center justify-center">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Especialistas</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {specialistCourses}
                </p>
                {totalCourses > 0 && (
                  <p className="text-xs font-medium text-purple-500 dark:text-purple-400">
                    {Math.round((specialistCourses / totalCourses) * 100)}%
                  </p>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Cursos asignados a maestros especialistas</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Mensaje de estado */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {completionPercentage === 100 ? (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Todas las asignaciones están completas
              </span>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {unassignedCourses} curso{unassignedCourses !== 1 ? 's' : ''} sin asignar
              </p>
              {hasChanges && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Recuerde guardar los cambios realizados
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </TooltipProvider>
  );
}
