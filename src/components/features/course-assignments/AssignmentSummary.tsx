// src/components/features/course-assignments/AssignmentSummary.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  UserCheck,
  Calendar
} from 'lucide-react';
import { SectionAssignmentData } from '@/types/course-assignments.types';

interface AssignmentSummaryProps {
  sectionData: SectionAssignmentData;
}

export default function AssignmentSummary({ sectionData }: AssignmentSummaryProps) {
  const { section, assignments, totalAssignments } = sectionData;

  const activeAssignments = assignments.filter(a => a.isActive).length;
  const assignmentsWithSchedules = assignments.filter(a => a._count.schedules > 0).length;

  // Manejar ambas estructuras del backend
  const gradeName = section.grade?.name || section.gradeName || 'N/A';
  const gradeLevel = section.grade?.level || section.gradeLevel || 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Section Info */}
      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-1.5">
                  <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Sección</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {section.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {gradeName}
              </p>
            </div>
            <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
              {gradeLevel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Titular Teacher */}
      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-1.5">
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Maestro Titular
              </p>
              {section.teacher ? (
                <>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {section.teacher.fullName}
                  </p>
                  {section.teacher.email && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                      {section.teacher.email}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Sin asignar
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Count */}
      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-1.5">
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Cursos Asignados</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {activeAssignments}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  / {totalAssignments}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Count */}
      <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-1.5">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Con Horarios</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {assignmentsWithSchedules}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  cursos
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity */}
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 md:col-span-2 lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-1.5">
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Capacidad</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {section.capacity}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">estudiantes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
