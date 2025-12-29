'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExportStudent, ExportGradesByBimestre } from '@/types/exports.types';
import { ChevronLeft, ChevronRight, ChevronDown, BookOpen, User, GraduationCap, TrendingUp, Download, FileText } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { exportsService } from '@/services/exports.service';

interface ExportStudentsTableProps {
  students: ExportStudent[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

export function ExportStudentsTable({
  students,
  meta,
  onPageChange,
  loading = false,
}: ExportStudentsTableProps) {
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());

  // Helper para extraer nombre de grado o sección
  const getDisplayName = (item: any): string => {
    if (!item) return '-';
    if (typeof item === 'string') return item;
    if (item?.name) return item.name;
    return '-';
  };

  // Convertir número de bimestre a nombre
  const getBimesterName = (number: number): string => {
    const names: Record<number, string> = {
      1: 'Primer Bimestre',
      2: 'Segundo Bimestre',
      3: 'Tercer Bimestre',
      4: 'Cuarto Bimestre',
    };
    return names[number] || `Bimestre ${number}`;
  };

  // Obtener todos los bimestres (siempre mostrar los 4 bimestres)
  const getAllBimesters = (): { id: number; number: number; name: string }[] => {
    return [1, 2, 3, 4].map((number) => ({
      id: number,
      number: number,
      name: getBimesterName(number),
    }));
  };

  // Obtener cursos de un bimestre para un estudiante
  const getCoursesByBimester = (student: any, bimesterNumber: number): any[] => {
    const bimester = student.gradesByBimester?.find(
      (b: any) => b.bimesterNumber === bimesterNumber
    );
    return bimester?.courses || [];
  };

  // Calcular promedio de un bimestre
  const getBimesterAverage = (student: any, bimesterNumber: number): string => {
    const courses = getCoursesByBimester(student, bimesterNumber);
    if (courses.length === 0) {
      return '--';
    }

    const validScores = courses
      .map((c: any) => c.totalScore)
      .filter((score: any) => score !== null && score !== undefined);

    if (validScores.length === 0) return '--';

    // Si hay al menos un score válido mayor a 0, calcular promedio
    const scoresGreaterThanZero = validScores.filter((score: number) => score > 0);
    if (scoresGreaterThanZero.length === 0) return '--';

    const average = scoresGreaterThanZero.reduce((a: number, b: number) => a + b, 0) / scoresGreaterThanZero.length;
    return average.toFixed(2);
  };

  // Calcular promedio final
  const getFinalAverage = (student: any): string => {
    if (!student.gradesByBimester || student.gradesByBimester.length === 0) {
      return '--';
    }

    const allScores: number[] = [];
    student.gradesByBimester.forEach((bimester: any) => {
      bimester.courses?.forEach((course: any) => {
        if (course.totalScore !== null && course.totalScore !== undefined && course.totalScore > 0) {
          allScores.push(course.totalScore);
        }
      });
    });

    if (allScores.length === 0) return '--';

    const average = allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length;
    return average.toFixed(2);
  };

  const toggleExpanded = (studentId: number) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const toggleSelectStudent = (studentId: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const selectAllStudents = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      const allIds = new Set(students.map((s) => s.studentId));
      setSelectedStudents(allIds);
    }
  };

  const getSelectedStudentsData = () => {
    return students.filter((s) => selectedStudents.has(s.studentId));
  };

  const downloadPDF = async () => {
    const selectedData = getSelectedStudentsData();
    if (selectedData.length === 0) {
      alert('Por favor selecciona al menos un estudiante');
      return;
    }

    try {
      // Obtener enrollmentIds de los estudiantes seleccionados
      const enrollmentIds = selectedData
        .filter(s => s.enrollments?.[0]?.enrollmentId)
        .map(s => s.enrollments[0].enrollmentId);

      if (enrollmentIds.length === 0) {
        alert('No se encontraron enrollments válidos');
        return;
      }

      const blob = await exportsService.downloadPDF(enrollmentIds);
      exportsService.triggerDownload(blob, `reporte-estudiantes-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el PDF. Por favor intenta de nuevo.');
    }
  };

  const downloadExcel = async () => {
    const selectedData = getSelectedStudentsData();
    if (selectedData.length === 0) {
      alert('Por favor selecciona al menos un estudiante');
      return;
    }

    try {
      // Obtener enrollmentIds de los estudiantes seleccionados
      const enrollmentIds = selectedData
        .filter(s => s.enrollments?.[0]?.enrollmentId)
        .map(s => s.enrollments[0].enrollmentId);

      if (enrollmentIds.length === 0) {
        alert('No se encontraron enrollments válidos');
        return;
      }

      const blob = await exportsService.downloadExcel(enrollmentIds);
      exportsService.triggerDownload(blob, `reporte-estudiantes-${Date.now()}.xlsx`);
    } catch (error) {
      console.error('Error descargando Excel:', error);
      alert('Error al descargar el Excel. Por favor intenta de nuevo.');
    }
  };

  const bimesters = getAllBimesters();
  if (loading) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Cargando estudiantes...</p>
        </div>
      </Card>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron estudiantes</p>
        </div>
      </Card>
    );
  }

  const currentPage = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;
  const total = meta?.total || students.length;

  return (
    <div className="space-y-4">
      {/* Selection Bar */}
      {selectedStudents.size > 0 && (
        <div className="flex items-center justify-between gap-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {selectedStudents.size} estudiante{selectedStudents.size !== 1 ? 's' : ''} seleccionado{selectedStudents.size !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={downloadPDF}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDF
            </Button>
            <Button
              onClick={downloadExcel}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Excel
            </Button>
            <Button
              onClick={() => setSelectedStudents(new Set())}
              size="sm"
              variant="outline"
              className="text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              Limpiar
            </Button>
          </div>
        </div>
      )}

      <Card className="bg-white dark:bg-slate-900 overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-100 uppercase tracking-wider w-12">
                  <Checkbox
                    checked={selectedStudents.size === students.length && students.length > 0}
                    onCheckedChange={selectAllStudents}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-100 uppercase tracking-wider">
                  SIRE
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Grado/Sección
                </th>
                {bimesters.map((bim) => (
                  <th
                    key={bim.number}
                    className="px-6 py-3 text-center text-xs font-bold text-slate-100 uppercase tracking-wider"
                  >
                    {bim.name}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Promedio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {students.map((student, idx) => (
                <React.Fragment key={student.studentId}>
                  {/* Fila principal del estudiante */}
                  <tr className={`transition-colors duration-150 ${
                    idx % 2 === 0 
                      ? 'bg-white dark:bg-slate-900' 
                      : 'bg-gray-50 dark:bg-slate-800/50'
                  } ${selectedStudents.has(student.studentId) ? 'bg-blue-100 dark:bg-blue-900/30' : ''} hover:bg-blue-50 dark:hover:bg-slate-800`}>
                    <td className="px-4 py-2 text-center">
                      <Checkbox
                        checked={selectedStudents.has(student.studentId)}
                        onCheckedChange={() => toggleSelectStudent(student.studentId)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <button
                        onClick={() => toggleExpanded(student.studentId)}
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${
                            expandedStudents.has(student.studentId) ? 'rotate-180' : ''
                          }`}
                        />
                        <span className="text-slate-900 dark:text-slate-100 font-semibold">{student.codeSIRE || '-'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium">
                      {student.names?.givenNames} {student.names?.lastNames}
                    </td>
                    <td className="px-6 py-2 text-xs text-slate-900 dark:text-slate-100">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 text-xs font-semibold">
                        {getDisplayName(student.enrollments?.[0]?.grade)} / {getDisplayName(student.enrollments?.[0]?.section)}
                      </span>
                    </td>
                    {bimesters.map((bim) => (
                      <td
                        key={bim.number}
                        className="px-6 py-2 text-xs text-center font-bold text-slate-900 dark:text-slate-100"
                      >
                        <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800 min-w-12">
                          {getBimesterAverage(student, bim.number)}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-2 text-xs text-center font-bold">
                      <span className="inline-block px-4 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {getFinalAverage(student)}
                      </span>
                    </td>
                  </tr>

                  {/* Fila expandible con detalles de cursos */}
                  {expandedStudents.has(student.studentId) && (
                    <tr className="bg-slate-50 dark:bg-slate-800/30 border-l-4 border-l-blue-600">
                      <td className="px-4 py-2"></td>
                      <td colSpan={3 + bimesters.length} className="px-6 py-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              Detalles de Calificaciones
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {bimesters.map((bim) => {
                              const courses = getCoursesByBimester(student, bim.number);
                              return (
                                <div key={bim.number} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded">
                                      B{bim.number}
                                    </span>
                                    {bim.name}
                                  </h4>
                                  {courses.length > 0 ? (
                                    <div className="space-y-2">
                                      {courses.map((course, idx) => (
                                        <div
                                          key={course.courseId}
                                          className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                                        >
                                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium max-w-xs truncate">
                                            {idx + 1}. {course.courseName}
                                          </span>
                                          <span className={`text-sm font-bold px-3 py-1 rounded-md inline-block min-w-12 text-center ${
                                            course.totalScore && course.totalScore > 0
                                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                                          }`}>
                                            {course.totalScore !== null && course.totalScore !== undefined
                                              ? course.totalScore.toFixed(2)
                                              : '--'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">
                                      Sin calificaciones
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4 p-4">
          {students.map((student) => (
            <div
              key={student.studentId}
              className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    SIRE
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                    {student.codeSIRE || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Nombre
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {student.names?.givenNames} {student.names?.lastNames}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Grado/Sección
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                    {getDisplayName(student.enrollments?.[0]?.grade)} / {getDisplayName(student.enrollments?.[0]?.section)}
                  </span>
                </div>

                {/* Notas por bimestre */}
                <div className="grid grid-cols-2 gap-2">
                  {bimesters.map((bim) => (
                    <div key={bim.number} className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        B{bim.number}
                      </p>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-200 mt-1">
                        {getBimesterAverage(student, bim.number)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Promedio Final
                  </span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {getFinalAverage(student)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="text-slate-900 dark:text-slate-100 text-base font-bold">{currentPage}</span> de <span className="text-slate-900 dark:text-slate-100 text-base font-bold">{totalPages}</span> 
            <span className="text-slate-600 dark:text-slate-400"> • {total} estudiantes</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              variant="outline"
              size="sm"
              className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              variant="outline"
              size="sm"
              className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold gap-1 transition-colors"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
