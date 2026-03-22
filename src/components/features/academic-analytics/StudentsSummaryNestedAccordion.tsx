// src/components/features/academic-analytics/StudentsSummaryNestedAccordion.tsx

'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, TrendingDown, Minus, BookOpen, ArrowUp, ArrowDown, ChevronsUpDown, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { GradeWithSections, GradeRange } from '@/types/academic-analytics.types';
import { getColorForScore, hexToRgba } from '@/utils/grade-range.utils';

interface StudentsSummaryNestedAccordionProps {
  data: GradeWithSections[];
  isLoading: boolean;
  error: string | null;
  gradeRanges?: GradeRange[];
  onStudentSelect?: (enrollmentId: number) => void;
}

/**
 * Acordeón anidado que muestra estudiantes agrupados por Grado > Sección
 * Nivel 1: Grado (Cuarto, Quinto, etc.)
 * Nivel 2: Sección (A, B, C, etc.)
 * Datos: Tabla de estudiantes
 */
export function StudentsSummaryNestedAccordion({
  data,
  isLoading,
  error,
  gradeRanges = [],
  onStudentSelect,
}: StudentsSummaryNestedAccordionProps) {
  const [sortConfig, setSortConfig] = useState<{
    sectionId: number | null;
    order: 'asc' | 'desc';
  }>({
    sectionId: null,
    order: 'asc',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'ON_TRACK':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'AT_RISK':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'FAILING':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING':
        return (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300">Mejorando</span>
          </div>
        );
      case 'DECLINING':
        return (
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs text-red-700 dark:text-red-300">Decayendo</span>
          </div>
        );
      case 'STABLE':
        return (
          <div className="flex items-center gap-1.5">
            <Minus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-blue-700 dark:text-blue-300">Estable</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      EXCELLENT: 'Excelente',
      ON_TRACK: 'En Vía',
      AT_RISK: 'En Riesgo',
      FAILING: 'Reprobado',
    };
    return labels[status] || status;
  };

  const getScoreColor = (score: number | null, level?: string) => {
    if (score === null || gradeRanges.length === 0) {
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200';
    }
    const color = getColorForScore(score, gradeRanges, level, '#9333EA');
    const rgba = hexToRgba(color, 0.15);
    return {
      backgroundColor: rgba,
      color: color,
      textColor: `text-${color}`
    };
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay estudiantes para mostrar en la sección seleccionada
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Outer Accordion: Grades */}
      <Accordion type="single" collapsible defaultValue={data[0]?.grade.id.toString()} className="w-full">
        {data.map((gradeGroup) => (
          <AccordionItem
            key={gradeGroup.grade.id}
            value={gradeGroup.grade.id.toString()}
            className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 mb-4 transition-all hover:shadow-lg dark:hover:shadow-lg/20"
          >
            {/* Grade Header */}
            <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-slate-700/50 px-6 py-4 transition-colors group">
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="relative flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <BookOpen className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                    {gradeGroup.grade.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {gradeGroup.sections.length}{' '}
                    {gradeGroup.sections.length === 1 ? 'sección' : 'secciones'} •{' '}
                    {gradeGroup.sections.reduce((acc, s) => acc + s.students.length, 0)} estudiantes
                  </p>
                </div>
              </div>
            </AccordionTrigger>

            {/* Grade Content with nested sections */}
            <AccordionContent className="px-0 py-4 bg-gray-50/50 dark:bg-slate-800/30 border-t border-gray-200 dark:border-slate-700">
              <div className="space-y-3 px-6">
                {/* Inner Accordion: Sections */}
                <Accordion type="single" collapsible defaultValue={gradeGroup.sections[0]?.section.id.toString()} className="w-full">
                  {gradeGroup.sections.map((sectionGroup) => (
                    <AccordionItem
                      key={sectionGroup.section.id}
                      value={sectionGroup.section.id.toString()}
                      className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800/80 transition-all hover:shadow-md"
                    >
                      {/* Section Header */}
                      <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-slate-700/50 px-4 py-3 transition-colors group">
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center font-bold text-white text-sm shadow-sm group-hover:shadow-md transition-shadow">
                            {sectionGroup.section.name}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                              Sección {sectionGroup.section.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {sectionGroup.students.length} {sectionGroup.students.length === 1 ? 'estudiante' : 'estudiantes'}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>

                      {/* Students Table */}
                      <AccordionContent className="px-0 py-4">
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 mx-4">
                          <Table>
                            <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-25 dark:from-slate-700 dark:to-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                              <TableRow className="hover:bg-transparent dark:border-slate-700">
                                <TableHead className="px-5 py-4 font-bold text-gray-700 dark:text-gray-200 text-center w-12 text-xs tracking-wide">
                                  #
                                </TableHead>
                                <TableHead 
                                  className="px-5 py-4 font-bold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600/50 transition-colors select-none text-xs tracking-wide"
                                  onClick={() => {
                                    if (sortConfig.sectionId === sectionGroup.section.id) {
                                      setSortConfig({
                                        sectionId: sectionGroup.section.id,
                                        order: sortConfig.order === 'asc' ? 'desc' : 'asc',
                                      });
                                    } else {
                                      setSortConfig({
                                        sectionId: sectionGroup.section.id,
                                        order: 'asc',
                                      });
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    Estudiante
                                    {sortConfig.sectionId === sectionGroup.section.id ? (
                                      sortConfig.order === 'asc' ? (
                                        <ArrowUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      ) : (
                                        <ArrowDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      )
                                    ) : (
                                      <ChevronsUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    )}
                                  </div>
                                </TableHead>
                                <TableHead className="text-right px-5 py-4 font-bold text-gray-700 dark:text-gray-200 text-xs tracking-wide">
                                  Bim 1
                                </TableHead>
                                <TableHead className="text-right px-5 py-4 font-bold text-gray-700 dark:text-gray-200 text-xs tracking-wide">
                                  Bim 2
                                </TableHead>
                                <TableHead className="text-right px-5 py-4 font-bold text-gray-700 dark:text-gray-200 text-xs tracking-wide">
                                  Bim 3
                                </TableHead>
                                <TableHead className="text-right px-5 py-4 font-bold text-gray-700 dark:text-gray-200 text-xs tracking-wide">
                                  Bim 4
                                </TableHead>
                                <TableHead className="text-right px-5 py-4 font-bold text-gray-700 dark:text-gray-200 text-xs tracking-wide">
                                  General
                                </TableHead>
                                <TableHead className="px-5 py-4 font-bold text-gray-700 dark:text-gray-200 text-xs tracking-wide">
                                  Tendencia
                                </TableHead>
                                <TableHead className="px-5 py-4 font-bold text-gray-700 dark:text-gray-200 text-xs tracking-wide">
                                  Estado
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                let sortedStudents = [...sectionGroup.students];
                                
                                if (sortConfig.sectionId === sectionGroup.section.id) {
                                  sortedStudents.sort((a, b) => {
                                    const nameA = `${a.student.lastNames} ${a.student.givenNames}`.toLowerCase();
                                    const nameB = `${b.student.lastNames} ${b.student.givenNames}`.toLowerCase();
                                    
                                    if (sortConfig.order === 'asc') {
                                      return nameA.localeCompare(nameB);
                                    } else {
                                      return nameB.localeCompare(nameA);
                                    }
                                  });
                                }
                                
                                return sortedStudents.map((summary, idx) => {
                                  const { student, cumulativeAverages, trend, academicStatus } = summary;
                                  const isLastRow = idx === sortedStudents.length - 1;
                                  const isEvenRow = idx % 2 === 0;

                                  const getLatestAverage = () => {
                                    if (cumulativeAverages.promedio !== null)
                                      return cumulativeAverages.promedio.toFixed(2);
                                    return '—';
                                  };

                                  return (
                                    <TableRow
                                      key={student.id}
                                      onClick={() => onStudentSelect?.(student.enrollmentId)}
                                      className={`
                                        transition-all duration-200 border-b border-gray-200 dark:border-slate-700/50
                                        ${onStudentSelect ? 'cursor-pointer' : ''}
                                        ${isEvenRow 
                                          ? 'bg-white dark:bg-slate-800/30' 
                                          : 'bg-gray-50/50 dark:bg-slate-700/20'
                                        }
                                        hover:bg-blue-50 dark:hover:bg-slate-700/40
                                        ${isLastRow ? 'border-b-0' : ''}
                                      `}
                                    >
                                      <TableCell className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center text-sm">
                                        {idx + 1}
                                      </TableCell>
                                      <TableCell className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">
                                        <div className="flex items-center gap-2">
                                          {`${student.lastNames}, ${student.givenNames}`}
                                          {onStudentSelect && (
                                            <Eye className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          )}
                                        </div>
                                      </TableCell>
                                    <TableCell className="text-right px-5 py-4">
                                      <span
                                        className={`font-semibold px-3 py-2 rounded-md text-sm transition-colors ${
                                          cumulativeAverages.bimester1 !== null
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                            : 'text-gray-400 dark:text-gray-500'
                                        }`}
                                      >
                                        {cumulativeAverages.bimester1 !== null
                                          ? cumulativeAverages.bimester1.toFixed(2)
                                          : '—'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right px-5 py-4">
                                      <span
                                        className={`font-semibold px-3 py-2 rounded-md text-sm transition-colors ${
                                          cumulativeAverages.bimester2 !== null
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                            : 'text-gray-400 dark:text-gray-500'
                                        }`}
                                      >
                                        {cumulativeAverages.bimester2 !== null
                                          ? cumulativeAverages.bimester2.toFixed(2)
                                          : '—'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right px-5 py-4">
                                      <span
                                        className={`font-semibold px-3 py-2 rounded-md text-sm transition-colors ${
                                          cumulativeAverages.bimester3 !== null
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                            : 'text-gray-400 dark:text-gray-500'
                                        }`}
                                      >
                                        {cumulativeAverages.bimester3 !== null
                                          ? cumulativeAverages.bimester3.toFixed(2)
                                          : '—'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right px-5 py-4">
                                      <span
                                        className={`font-semibold px-3 py-2 rounded-md text-sm transition-colors ${
                                          cumulativeAverages.bimester4 !== null
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                                            : 'text-gray-400 dark:text-gray-500'
                                        }`}
                                      >
                                        {cumulativeAverages.bimester4 !== null
                                          ? cumulativeAverages.bimester4.toFixed(2)
                                          : '—'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right px-5 py-4">
                                      <span
                                        className="font-bold px-3 py-2 rounded-md text-sm transition-all"
                                        style={{
                                          backgroundColor: gradeRanges.length > 0
                                            ? hexToRgba(
                                                getColorForScore(
                                                  parseFloat(getLatestAverage()),
                                                  gradeRanges,
                                                  gradeGroup.grade.level,
                                                  '#3b82f6'
                                                ),
                                                0.15
                                              )
                                            : 'rgba(59, 130, 246, 0.15)',
                                          color: gradeRanges.length > 0
                                            ? getColorForScore(
                                                parseFloat(getLatestAverage()),
                                                gradeRanges,
                                                gradeGroup.grade.level,
                                                '#3b82f6'
                                              )
                                            : '#3b82f6'
                                        }}
                                      >
                                        {getLatestAverage()}
                                      </span>
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                      {getTrendIcon(trend)}
                                    </TableCell>
                                    <TableCell className="px-5 py-4">
                                      <Badge className={`${getStatusColor(academicStatus)} border-0 font-semibold`}>
                                        {getStatusLabel(academicStatus)}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                                });
                              })()}
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default StudentsSummaryNestedAccordion;
