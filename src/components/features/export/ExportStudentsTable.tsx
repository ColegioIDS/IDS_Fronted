'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExportStudent, ExportGradesByBimestre } from '@/types/exports.types';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  User, 
  GraduationCap, 
  TrendingUp, 
  Download, 
  FileText,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
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
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando estudiantes...</p>
        </div>
      </Card>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertCircle className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">No se encontraron estudiantes</p>
        </div>
      </Card>
    );
  }

  const currentPage = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;
  const total = meta?.total || students.length;

  return (
    <div className="space-y-4">
      {/* Selection Action Bar */}
      {selectedStudents.size > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {selectedStudents.size} estudiante{selectedStudents.size !== 1 ? 's' : ''} seleccionado{selectedStudents.size !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button
              onClick={downloadPDF}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold gap-2 transition-colors rounded-lg h-9"
            >
              <FileText className="w-4 h-4" />
              PDF
            </Button>
            <Button
              onClick={downloadExcel}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 transition-colors rounded-lg h-9"
            >
              <Download className="w-4 h-4" />
              Excel
            </Button>
            <Button
              onClick={() => setSelectedStudents(new Set())}
              size="sm"
              variant="outline"
              className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-9"
            >
              <X className="w-4 h-4" />
              Limpiar
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <Card className="bg-white dark:bg-slate-900 overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedStudents.size === students.length && students.length > 0}
                    onCheckedChange={selectAllStudents}
                    className="w-4 h-4"
                  />
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-100 uppercase tracking-wider">
                  SIRE
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Grado/Sección
                </th>
                {bimesters.map((bim) => (
                  <th
                    key={bim.number}
                    className="px-5 py-3 text-center text-xs font-bold text-slate-100 uppercase tracking-wider"
                  >
                    B{bim.number}
                  </th>
                ))}
                <th className="px-5 py-3 text-center text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Promedio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {students.map((student, idx) => (
                <React.Fragment key={student.studentId}>
                  <tr className={`transition-colors duration-200 ${
                    idx % 2 === 0 
                      ? 'bg-white dark:bg-slate-900' 
                      : 'bg-slate-50 dark:bg-slate-800/50'
                  } ${selectedStudents.has(student.studentId) ? 'bg-blue-100 dark:bg-blue-900/30' : ''} hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer`}>
                    <td className="px-4 py-3 text-center">
                      <Checkbox
                        checked={selectedStudents.has(student.studentId)}
                        onCheckedChange={() => toggleSelectStudent(student.studentId)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <button
                        onClick={() => toggleExpanded(student.studentId)}
                        className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                            expandedStudents.has(student.studentId) ? 'rotate-180' : ''
                          }`}
                        />
                        <span className="font-mono text-blue-600 dark:text-blue-400">{student.codeSIRE || '-'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                        {student.names?.givenNames} {student.names?.lastNames}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                        {getDisplayName(student.enrollments?.[0]?.grade)}/{getDisplayName(student.enrollments?.[0]?.section)}
                      </span>
                    </td>
                    {bimesters.map((bim) => {
                      const avg = getBimesterAverage(student, bim.number);
                      const avgNum = parseFloat(avg);
                      const isValid = !isNaN(avgNum) && avgNum > 0;
                      
                      return (
                        <td
                          key={bim.number}
                          className="px-5 py-3 text-center"
                        >
                          <span className={`inline-block px-3 py-1 rounded-md border text-xs font-bold ${
                            isValid
                              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}>
                            {avg}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-5 py-3 text-center">
                      <span className="inline-block px-4 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        {getFinalAverage(student)}
                      </span>
                    </td>
                  </tr>

                  {/* Expandable Row */}
                  {expandedStudents.has(student.studentId) && (
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-l-4 border-l-blue-600 dark:border-l-blue-400">
                      <td className="px-4 py-3"></td>
                      <td colSpan={3 + bimesters.length} className="px-5 py-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              Detalles de Calificaciones
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {bimesters.map((bim) => {
                              const courses = getCoursesByBimester(student, bim.number);
                              return (
                                <div key={bim.number} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold rounded">
                                      {bim.number}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                      {bim.name}
                                    </span>
                                  </div>
                                  {courses.length > 0 ? (
                                    <div className="space-y-2">
                                      {courses.map((course, idx) => (
                                        <div
                                          key={course.courseId}
                                          className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                                        >
                                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium flex-1 truncate">
                                            {idx + 1}. {course.courseName}
                                          </span>
                                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ml-2 flex-shrink-0 ${
                                            course.totalScore && course.totalScore > 0
                                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                                          }`}>
                                            {course.totalScore !== null && course.totalScore !== undefined
                                              ? course.totalScore.toFixed(2)
                                              : '--'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
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
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {students.map((student) => (
          <Card key={student.studentId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    SIRE
                  </p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {student.codeSIRE || '-'}
                  </p>
                </div>
                <Checkbox
                  checked={selectedStudents.has(student.studentId)}
                  onCheckedChange={() => toggleSelectStudent(student.studentId)}
                  className="w-4 h-4 mt-1"
                />
              </div>

              {/* Student Info */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Estudiante
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {student.names?.givenNames} {student.names?.lastNames}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grade/Section */}
              <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <GraduationCap className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Grado/Sección
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {getDisplayName(student.enrollments?.[0]?.grade)}/{getDisplayName(student.enrollments?.[0]?.section)}
                  </p>
                </div>
              </div>

              {/* Bimestral Grades */}
              <div className="grid grid-cols-2 gap-2">
                {bimesters.map((bim) => {
                  const avg = getBimesterAverage(student, bim.number);
                  const avgNum = parseFloat(avg);
                  const isValid = !isNaN(avgNum) && avgNum > 0;
                  
                  return (
                    <div key={bim.number} className={`p-3 rounded-lg border text-center ${
                      isValid
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}>
                      <p className={`text-xs font-bold uppercase tracking-wider ${
                        isValid
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        B{bim.number}
                      </p>
                      <p className={`text-sm font-bold mt-1 ${
                        isValid
                          ? 'text-amber-900 dark:text-amber-200'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {avg}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Final Average */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Promedio Final
                </span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {getFinalAverage(student)}
                </span>
              </div>

              {/* Expand Button */}
              <Button
                onClick={() => toggleExpanded(student.studentId)}
                variant="outline"
                size="sm"
                className="w-full text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${expandedStudents.has(student.studentId) ? 'rotate-180' : ''}`} />
                {expandedStudents.has(student.studentId) ? 'Ver menos' : 'Ver detalles'}
              </Button>

              {/* Expanded Details */}
              {expandedStudents.has(student.studentId) && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                  {bimesters.map((bim) => {
                    const courses = getCoursesByBimester(student, bim.number);
                    return (
                      <div key={bim.number} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold rounded">
                            {bim.number}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            {bim.name}
                          </span>
                        </div>
                        {courses.length > 0 ? (
                          <div className="space-y-1">
                            {courses.map((course, idx) => (
                              <div key={course.courseId} className="flex justify-between items-center text-xs">
                                <span className="text-slate-700 dark:text-slate-300 truncate flex-1">
                                  {idx + 1}. {course.courseName}
                                </span>
                                <span className={`font-bold ml-2 ${
                                  course.totalScore && course.totalScore > 0
                                    ? 'text-emerald-700 dark:text-emerald-300'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                  {course.totalScore !== null && course.totalScore !== undefined
                                    ? course.totalScore.toFixed(2)
                                    : '--'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-1">
                            Sin calificaciones
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Página <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> de{' '}
              <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
              <span className="text-slate-600 dark:text-slate-400 ml-2">• {total} estudiantes</span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                variant="outline"
                size="sm"
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold gap-1 transition-colors rounded-lg h-9"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>

              <Button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                variant="outline"
                size="sm"
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-semibold gap-1 transition-colors rounded-lg h-9"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
