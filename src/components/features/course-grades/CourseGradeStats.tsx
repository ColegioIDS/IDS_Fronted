// src/components/features/course-grades/CourseGradeStats.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, GraduationCap, CheckCircle2, Circle, BarChart3 } from 'lucide-react';

interface CourseGradeStatsProps {
  totalAssignments: number;
  totalCourses: number;
  totalGrades: number;
  coreAssignments: number;
  electiveAssignments: number;
}

export default function CourseGradeStats({
  totalAssignments,
  totalCourses,
  totalGrades,
  coreAssignments,
  electiveAssignments,
}: CourseGradeStatsProps) {
  const stats = [
    {
      icon: BarChart3,
      label: 'Total Asignaciones',
      value: totalAssignments,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: BookOpen,
      label: 'Cursos Asignados',
      value: totalCourses,
      gradient: 'from-indigo-500 to-purple-500',
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: GraduationCap,
      label: 'Grados con Cursos',
      value: totalGrades,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: CheckCircle2,
      label: 'Cursos Núcleo',
      value: coreAssignments,
      gradient: 'from-emerald-500 to-green-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Circle,
      label: 'Cursos Electivos',
      value: electiveAssignments,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100 dark:bg-amber-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-6 bg-white dark:bg-gray-900">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>

              <div className="mt-4">
                <h4 className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </h4>
                <span className="mt-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
