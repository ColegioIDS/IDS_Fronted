// src/components/features/course-grades/CourseGradeDetailDialog.tsx
'use client';

import React from 'react';
import { CourseGradeDetail } from '@/types/course-grades.types';
import { X, BookOpen, GraduationCap, CheckCircle, Circle, Tag, AlignLeft } from 'lucide-react';

interface CourseGradeDetailDialogProps {
  courseGrade: CourseGradeDetail;
  onClose: () => void;
  onEdit?: (courseGrade: CourseGradeDetail) => void;
}

export default function CourseGradeDetailDialog({
  courseGrade,
  onClose,
  onEdit,
}: CourseGradeDetailDialogProps) {
  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 rounded-t-lg dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Detalles de Asignación
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Type Badge */}
          <div className="mb-6 flex justify-center">
            {courseGrade.isCore ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-emerald-700 dark:text-emerald-300">Curso Núcleo (Obligatorio)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-4 py-2 border border-amber-200 dark:border-amber-800">
                <Circle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Curso Electivo</span>
              </div>
            )}
          </div>

          {/* Course Information */}
          <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Información del Curso
              </h4>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    #{courseGrade.course.id}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {courseGrade.course.name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Código</p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {courseGrade.course.code}
                  </p>
                </div>
                {courseGrade.course.area && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Área</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {courseGrade.course.area}
                    </p>
                  </div>
                )}
              </div>
              {courseGrade.course.description && (
                <div>
                  <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Descripción</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {courseGrade.course.description}
                  </p>
                </div>
              )}
              {courseGrade.course.isActive !== undefined && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                  <span
                    className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                      courseGrade.course.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {courseGrade.course.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grade Information */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Información del Grado
              </h4>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    #{courseGrade.grade.id}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {courseGrade.grade.name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nivel</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {courseGrade.grade.level}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Orden</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {courseGrade.grade.order}
                  </p>
                </div>
              </div>
              {courseGrade.grade.isActive !== undefined && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                  <span
                    className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                      courseGrade.grade.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {courseGrade.grade.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(courseGrade);
                  onClose();
                }}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 text-white transition-all"
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
