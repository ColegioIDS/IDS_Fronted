'use client';

import React from 'react';
import { BookOpen, Users, TrendingUp, MoreHorizontal } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  section: string;
  students: number;
  averageGrade: number;
  attendanceRate: number;
}

export default function MyCoursesSection() {
  // Datos placeholder
  const courses: Course[] = [
    {
      id: '1',
      name: 'Matemáticas',
      section: 'A - 6to Primaria',
      students: 35,
      averageGrade: 8.2,
      attendanceRate: 92,
    },
    {
      id: '2',
      name: 'Ciencias Naturales',
      section: 'B - 6to Primaria',
      students: 32,
      averageGrade: 7.9,
      attendanceRate: 88,
    },
    {
      id: '3',
      name: 'Español',
      section: 'A - 5to Primaria',
      students: 38,
      averageGrade: 8.5,
      attendanceRate: 95,
    },
    {
      id: '4',
      name: 'Historia',
      section: 'C - 6to Primaria',
      students: 40,
      averageGrade: 7.8,
      attendanceRate: 85,
    },
  ];

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
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {course.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Sección: {course.section}
                </p>

                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{course.students} estudiantes</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Promedio: <span className="font-semibold">{course.averageGrade}/10</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-12 h-2 bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${course.attendanceRate}%` }}
                      />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {course.attendanceRate}%
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
