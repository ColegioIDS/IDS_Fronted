'use client';

import React, { useMemo, useState } from 'react';
import { BookOpen, TrendingUp, ChevronDown, Calendar, Clock, Users, Briefcase, BarChart3, BarChart } from 'lucide-react';
import { useDashboardClasses, useTodayClasses } from '@/hooks/useDashboardClasses';

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];

type ViewMode = 'today' | 'all';

export default function MyCoursesSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [expandedGrade, setExpandedGrade] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Obtener datos según la vista seleccionada
  const todayData = useTodayClasses();
  const allData = useDashboardClasses();

  const { classes, isLoading, error } = viewMode === 'today' ? todayData : allData;

  // Aplanar todas las clases para una vista más simple
  const allCourses = useMemo(() => {
    if (!classes?.grades) return [];
    
    const courses: any[] = [];
    classes.grades.forEach(grade => {
      grade.sections.forEach(section => {
        section.classes.forEach(course => {
          courses.push({
            ...course,
            gradeName: grade.gradeName,
            sectionName: section.sectionName,
            gradeSectionName: `${grade.gradeName} - Sección ${section.sectionName}`,
            studentCount: section.studentCount,
            sectionAverage: section.sectionAverage,
            capacity: section.capacity,
          });
        });
      });
    });
    return courses;
  }, [classes]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mis Cursos</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Acceso rápido a tus cursos activos
            </p>
          </div>
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mis Cursos</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Acceso rápido a tus cursos activos
            </p>
          </div>
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">Error: {error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!allCourses || allCourses.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mis Cursos</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Acceso rápido a tus cursos activos
            </p>
          </div>
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="p-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-700 dark:text-yellow-300">
            {viewMode === 'today' ? 'No hay clases para hoy' : 'No hay cursos disponibles'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mis Cursos</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Total: {classes?.totalClasses || 0} clases
            {viewMode === 'today' && classes && 'date' in classes && (
              <span> • {new Date((classes as any).date).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            )}
          </p>
        </div>
        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Selector de Vista */}
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg inline-flex">
        <button
          onClick={() => {
            setViewMode('all');
            setExpandedGrade(null);
            setExpandedSection(null);
          }}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${
            viewMode === 'all'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Todos mis cursos
        </button>
        <button
          onClick={() => {
            setViewMode('today');
            setExpandedGrade(null);
            setExpandedSection(null);
          }}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${
            viewMode === 'today'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          Clases de hoy
        </button>
      </div>

      {/* Vista por Grados y Secciones */}
      <div className="space-y-4">
        {classes?.grades.map((grade) => (
          <div key={grade.gradeId} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            {/* Header del Grado */}
            <button
              onClick={() => setExpandedGrade(expandedGrade === grade.gradeId ? null : grade.gradeId)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {grade.gradeLevel}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{grade.gradeName}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {grade.gradeStudentCount} estudiantes • Promedio: {grade.gradeAverage.toFixed(2)}%
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform flex-shrink-0 ${
                  expandedGrade === grade.gradeId ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Contenido del Grado */}
            {expandedGrade === grade.gradeId && (
              <div className="p-4 space-y-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                {grade.sections.map((section) => (
                  <div
                    key={section.sectionId}
                    className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    {/* Header de la Sección */}
                    <button
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === `${grade.gradeId}-${section.sectionId}` ? null : `${grade.gradeId}-${section.sectionId}`
                        )
                      }
                      className="w-full flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="text-left flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Sección {section.sectionName}
                          </h4>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Promedio</span>
                            <span className={`text-xs font-bold ${
                              section.sectionAverage >= 80 ? 'text-green-600 dark:text-green-400' :
                              section.sectionAverage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {section.sectionAverage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full transition-all ${
                                section.sectionAverage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                section.sectionAverage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-red-500 to-red-600'
                              }`}
                              style={{ width: `${Math.min(section.sectionAverage, 100)}%` }}
                            />
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform flex-shrink-0 ${
                            expandedSection === `${grade.gradeId}-${section.sectionId}` ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      {/* Progress bar de estudiantes */}
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {section.studentCount}/{section.capacity} estudiantes
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {Math.round((section.studentCount / section.capacity) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                            style={{ width: `${(section.studentCount / section.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Cursos de la Sección */}
                    {expandedSection === `${grade.gradeId}-${section.sectionId}` && (
                      <div className="space-y-2 pt-4">
                        {section.classes.length > 0 ? (
                          section.classes.map((course, courseIndex) => (
                            <div
                              key={`grade-${grade.gradeId}-section-${section.sectionId}-course-${courseIndex}`}
                              className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/30 dark:to-slate-700/50 border border-blue-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4 text-blue-600" />
                                  {course.courseName}
                                </h5>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                  {course.courseCode}
                                </span>
                              </div>

                              {/* Promedio */}
                              <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Promedio Académico
                                  </span>
                                  <span className={`text-xs font-bold ${
                                    course.courseAverage >= 80 ? 'text-green-600 dark:text-green-400' :
                                    course.courseAverage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-red-600 dark:text-red-400'
                                  }`}>
                                    {course.courseAverage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      course.courseAverage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                      course.courseAverage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                      'bg-gradient-to-r from-red-500 to-red-600'
                                    }`}
                                    style={{ width: `${Math.min(course.courseAverage, 100)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Horarios para today-classes */}
                              {viewMode === 'today' && course.schedules && course.schedules.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-slate-700/50">
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Horarios:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {course.schedules.map((schedule, idx) => (
                                      <div
                                        key={idx}
                                        className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-xs"
                                      >
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-blue-500" />
                                          <span className="font-medium">{schedule.startTime} - {schedule.endTime}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                          {dayNames[schedule.dayOfWeek]}
                                          {schedule.classroom && ` • ${schedule.classroom}`}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Horarios para all-classes */}
                              {viewMode === 'all' && (
                                <>
                                  {course.schedules && course.schedules.length > 0 ? (
                                    <div className="mt-2 pt-2 border-t border-blue-200 dark:border-slate-700/50">
                                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Horarios:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {course.schedules.map((schedule, idx) => (
                                          <div
                                            key={idx}
                                            className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-xs"
                                          >
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3 text-blue-500" />
                                              <span className="font-medium">{schedule.startTime} - {schedule.endTime}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                              {dayNames[schedule.dayOfWeek]}
                                              {schedule.classroom && ` • ${schedule.classroom}`}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : course.startTime && course.endTime ? (
                                    <div className="flex items-center gap-1 text-xs">
                                      <Clock className="w-3 h-3 text-blue-500" />
                                      <span className="text-slate-700 dark:text-slate-300">
                                        {course.startTime} - {course.endTime}
                                      </span>
                                    </div>
                                  ) : null}
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400 p-3">
                            No hay clases en esta sección
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
