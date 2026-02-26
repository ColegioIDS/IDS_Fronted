'use client';

import React, { useMemo, useState } from 'react';
import { AlertCircle, BookOpen, ChevronDown } from 'lucide-react';
import { usePendingTasks } from '@/hooks/useDashboardClasses';
import { Card } from '@/components/ui/card';

export default function PendingTasks() {
  const { pendingTasks, isLoading, error } = usePendingTasks();
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const processedData = useMemo(() => {
    if (!pendingTasks || !pendingTasks.courses) return null;
    return pendingTasks;
  }, [pendingTasks]);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center h-64 text-slate-500">
          Cargando tareas pendientes...
        </div>
      </Card>
    );
  }

  if (error || !processedData) {
    return (
      <Card className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>Error al cargar tareas pendientes</p>
        </div>
      </Card>
    );
  }

  const { courses, summary, section } = processedData;

  if (!courses || courses.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
          <p>No hay tareas pendientes</p>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Card className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Tareas Pendientes
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {section?.grade} - Sección {section?.name}
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-200 dark:border-blue-900/30">
            <p className="text-xs text-slate-600 dark:text-slate-400">Cursos</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
              {summary?.totalCourses || 0}
            </p>
          </div>
          <div className="p-2 bg-orange-50 dark:bg-orange-900/10 rounded border border-orange-200 dark:border-orange-900/30">
            <p className="text-xs text-slate-600 dark:text-slate-400">Tareas</p>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
              {summary?.totalPendingTasks || 0}
            </p>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-900/30">
            <p className="text-xs text-slate-600 dark:text-slate-400">Estudiantes</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-400">
              {summary?.totalStudentsPendingGrades || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Courses and Tasks */}
      <div className="space-y-3">
        {courses.map((course: any) => {
          const isExpanded = expandedCourses.has(course.courseId);
          const hasTasks = course.tasks && course.tasks.length > 0;
          const totalPending = course.tasks?.reduce(
            (sum: number, task: any) => sum + (task.studentsWithoutGrade || 0),
            0
          ) || 0;

          return (
            <div key={course.courseId} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              {/* Course Header */}
              <button
                onClick={() => toggleCourse(course.courseId)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Color dot */}
                  <div
                    className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: course.color || '#666' }}
                  />
                  <div className="min-w-0 text-left">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm md:text-base truncate">
                      {course.courseName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {course.courseCode}
                    </p>
                  </div>
                </div>

                {/* Badge and Icon */}
                <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                      {totalPending}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">pendientes</p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 md:w-5 md:h-5 text-slate-600 dark:text-slate-400 transition-transform flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Tasks List */}
              {isExpanded && hasTasks && (
                <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 space-y-3">
                  {course.tasks.map((task: any, taskIdx: number) => {
                    const pendingCount = task.studentsWithoutGrade || 0;
                    const daysUntilDue = task.dueDate
                      ? Math.ceil(
                          (new Date(task.dueDate).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;
                    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                    const isSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;

                    return (
                      <div
                        key={taskIdx}
                        className={`p-3 rounded-lg border ${
                          isOverdue
                            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                            : isSoon
                            ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30'
                            : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                              <span>Vence: {formatDate(task.dueDate)}</span>
                              {daysUntilDue !== null && (
                                <span
                                  className={`font-semibold ${
                                    isOverdue
                                      ? 'text-red-600 dark:text-red-400'
                                      : isSoon
                                      ? 'text-orange-600 dark:text-orange-400'
                                      : 'text-green-600 dark:text-green-400'
                                  }`}
                                >
                                  ({daysUntilDue === 0 ? 'Hoy' : daysUntilDue > 0 ? `${daysUntilDue}d` : 'Vencido'})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                              {pendingCount}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">sin calificar</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        {task.totalStudents > 0 && (
                          <div className="mt-3">
                            <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-1.5 rounded-full"
                                style={{
                                  width: `${((task.totalStudents - pendingCount) / task.totalStudents) * 100}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {task.totalStudents - pendingCount}/{task.totalStudents} calificados ({task.percentagePending})
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
