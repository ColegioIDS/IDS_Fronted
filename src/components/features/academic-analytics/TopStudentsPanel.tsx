'use client';

import { useState } from 'react';
import { AlertCircle, Medal, TrendingUp, TrendingDown, Minus, ChevronDown, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TopStudentsData } from '@/types/academic-analytics.types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TopStudentsPanelProps {
  data: TopStudentsData | null;
  isLoading: boolean;
  error: string | null;
  topLimit: number;
  onTopLimitChange?: (limit: number) => void;
}

const academicStatusConfig = {
  EXCELLENT: {
    label: 'Excelente',
    color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-800',
  },
  ON_TRACK: {
    label: 'En Camino',
    color: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    badgeColor: 'bg-blue-100 dark:bg-blue-800',
  },
  AT_RISK: {
    label: 'En Riesgo',
    color: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    badgeColor: 'bg-amber-100 dark:bg-amber-800',
  },
  FAILING: {
    label: 'Reprobado',
    color: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
    badgeColor: 'bg-red-100 dark:bg-red-800',
  },
};

/**
 * Panel que muestra los N mejores estudiantes en acordeón por grado
 */
export function TopStudentsPanel({
  data,
  isLoading,
  error,
  topLimit,
  onTopLimitChange,
}: TopStudentsPanelProps) {
  const [selectedTopLimit, setSelectedTopLimit] = useState<string>(
    topLimit.toString()
  );

  const handleTopLimitChange = (value: string) => {
    setSelectedTopLimit(value);
    onTopLimitChange?.(parseInt(value, 10));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-40" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data || !data.grades || data.grades.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay datos disponibles para los mejores estudiantes
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control de cantidad de tops */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mostrar top de:
        </label>
        <Select value={selectedTopLimit} onValueChange={handleTopLimitChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Top 5</SelectItem>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="15">Top 15</SelectItem>
            <SelectItem value="20">Top 20</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Acordeón por Grado */}
      <Accordion type="single" collapsible className="w-full">
        {data.grades.map((grade, gradeIdx) => (
          <AccordionItem key={grade.grade.id} value={`grade-${grade.grade.id}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 flex-1">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {grade.grade.name}
                  </h3>
                  {grade.grade.level && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {grade.grade.level}
                    </p>
                  )}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-4">
              <div className="space-y-6 ml-2">
                {grade.sections.map((section) => (
                  <div
                    key={section.section.id}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
                  >
                    {/* Encabezado de Sección */}
                    <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Sección {section.section.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Top {selectedTopLimit} mejores estudiantes
                      </p>
                    </div>

                    {/* Tabla de Estudiantes */}
                    {section.students && section.students.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
                              <TableHead className="w-8 text-center">#</TableHead>
                              <TableHead>Estudiante</TableHead>
                              <TableHead className="text-right">
                                Promedio
                              </TableHead>
                              <TableHead className="text-center">
                                Tendencia
                              </TableHead>
                              <TableHead className="text-center">
                                Estado
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {section.students.map((student, idx) => {
                              const statusConfig =
                                academicStatusConfig[
                                  student.academicStatus as keyof typeof academicStatusConfig
                                ];

                              const trendIcon =
                                student.trend === 'IMPROVING' ? (
                                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : student.trend === 'DECLINING' ? (
                                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                ) : (
                                  <Minus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                );

                              const medalIcon =
                                idx === 0 ? (
                                  <Medal className="w-5 h-5 text-amber-500" />
                                ) : idx === 1 ? (
                                  <Medal className="w-5 h-5 text-gray-400" />
                                ) : idx === 2 ? (
                                  <Medal className="w-5 h-5 text-amber-700" />
                                ) : (
                                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    {idx + 1}
                                  </span>
                                );

                              return (
                                <TableRow
                                  key={student.student.enrollmentId}
                                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50"
                                >
                                  {/* Posición */}
                                  <TableCell className="text-center">
                                    {medalIcon}
                                  </TableCell>

                                  {/* Nombre del Estudiante */}
                                  <TableCell>
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {student.student.givenNames}{' '}
                                        {student.student.lastNames}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        ID: {student.student.enrollmentId}
                                      </p>
                                    </div>
                                  </TableCell>

                                  {/* Promedio */}
                                  <TableCell className="text-right">
                                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                      {student.cumulativeAverages.promedio
                                        ? student.cumulativeAverages.promedio.toFixed(
                                            2
                                          )
                                        : 'N/A'}
                                    </span>
                                  </TableCell>

                                  {/* Tendencia */}
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center">
                                      {trendIcon}
                                    </div>
                                  </TableCell>

                                  {/* Estado Académico */}
                                  <TableCell className="text-center">
                                    <Badge
                                      className={`${statusConfig.badgeColor} text-gray-800 dark:text-gray-200`}
                                    >
                                      {statusConfig.label}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          No hay estudiantes disponibles en esta sección
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
