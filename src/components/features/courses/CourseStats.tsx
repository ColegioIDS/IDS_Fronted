// src/components/features/courses/CourseStats.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar, CheckCircle2, Zap } from 'lucide-react';
import { Course } from '@/types/courses';

interface CourseStatsProps {
  courses: (Course & { _count?: { schedules: number; students: number } })[];
  isLoading?: boolean;
}

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
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    },
    {
      label: 'Cursos Activos',
      value: activeCourses,
      icon: CheckCircle2,
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
    },
    {
      label: 'Cursos Inactivos',
      value: inactiveCourses,
      icon: Zap,
      bgColor: 'bg-gray-50 dark:bg-gray-950/30',
      borderColor: 'border-gray-200 dark:border-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-400',
      iconBg: 'bg-gray-100 dark:bg-gray-900/40',
    },
    {
      label: 'Total Horarios',
      value: totalSchedules,
      icon: Calendar,
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    },
    {
      label: 'Estudiantes Inscritos',
      value: totalStudents,
      icon: Users,
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`border ${stat.borderColor} ${stat.bgColor} ${isLoading ? 'animate-pulse' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
