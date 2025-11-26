// src/components/features/courses/CourseStats.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Course } from '@/types/courses';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CourseStatsProps {
  courses: (Course & { _count?: { schedules: number; students: number } })[];
  isLoading?: boolean;
}

/**
 * 📊 Estadísticas de cursos - Diseño profesional moderno
 */
export function CourseStats({ courses, isLoading = false }: CourseStatsProps) {
  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => c.isActive).length;
  const inactiveCourses = courses.filter((c) => !c.isActive).length;
  const totalSchedules = courses.reduce((sum, c) => sum + (c._count?.schedules || 0), 0);
  const totalStudents = courses.reduce((sum, c) => sum + (c._count?.students || 0), 0);

  const stats = [
    {
      label: 'Total de Cursos',
      value: totalCourses,
      icon: BookOpen,
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-500',
      iconBg: 'bg-blue-600 dark:bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      tooltip: 'Número total de cursos registrados en el sistema',
    },
    {
      label: 'Cursos Activos',
      value: activeCourses,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-500',
      iconBg: 'bg-emerald-600 dark:bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      tooltip: 'Cursos que están actualmente disponibles para inscripción',
    },
    {
      label: 'Cursos Inactivos',
      value: inactiveCourses,
      icon: XCircle,
      bgColor: 'bg-gray-50 dark:bg-gray-950/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-500',
      iconBg: 'bg-gray-600 dark:bg-gray-500',
      textColor: 'text-gray-700 dark:text-gray-400',
      tooltip: 'Cursos que han sido desactivados temporalmente',
    },
    {
      label: 'Total Horarios',
      value: totalSchedules,
      icon: Calendar,
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-500',
      iconBg: 'bg-purple-600 dark:bg-purple-500',
      textColor: 'text-purple-700 dark:text-purple-400',
      tooltip: 'Suma total de horarios asignados a todos los cursos',
    },
    {
      label: 'Estudiantes Inscritos',
      value: totalStudents,
      icon: Users,
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      iconColor: 'text-indigo-600 dark:text-indigo-500',
      iconBg: 'bg-indigo-600 dark:bg-indigo-500',
      textColor: 'text-indigo-700 dark:text-indigo-400',
      tooltip: 'Total de estudiantes inscritos en todos los cursos',
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Card
                  className={`border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-help ${
                    isLoading ? 'animate-pulse' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.iconBg} shadow-md`}>
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="text-right">
                        {isLoading ? (
                          <div className="h-10 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                        ) : (
                          <p className={`text-4xl font-bold ${stat.textColor} tabular-nums`}>
                            {stat.value}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0 max-w-xs">
                <p className="font-semibold">{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
