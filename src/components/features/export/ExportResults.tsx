'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, BookOpen, Users, Mail, ArrowRight } from 'lucide-react';
import { ExportStudentsTable } from './ExportStudentsTable';
import { ExportsStudentFilterResponse } from '@/types/exports.types';

interface ExportResultsProps {
  filters: {
    cycle: any;
    bimester: any;
    section: any;
  };
  studentData?: ExportsStudentFilterResponse | null;
  loading?: boolean;
  onPageChange?: (page: number) => void;
}

export function ExportResults({ filters, studentData, loading, onPageChange }: ExportResultsProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-slate-900 dark:text-white text-xl font-bold">
                Reporte Generado
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Sección {filters.section?.name} • {studentData?.meta?.total || 0} estudiantes
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ciclo Card */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Ciclo
                </span>
              </div>
              <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                {filters.cycle?.name || '-'}
              </p>
            </div>

            {/* Bimestre Card */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Bimestre
                </span>
              </div>
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                {filters.bimester?.name || '-'}
              </p>
            </div>

            {/* Sección Card */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/50">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  Sección
                </span>
              </div>
              <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                {filters.section?.name || '-'}
              </p>
            </div>

            {/* Docente Card */}
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800/50">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">
                  Docente
                </span>
              </div>
              <p className="text-sm font-bold text-cyan-900 dark:text-cyan-100 truncate" title={filters.section?.teacher?.email}>
                {filters.section?.teacher?.email || '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table Section */}
      {studentData && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Estudiantes
            </h3>
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
              {studentData.meta?.total || 0}
            </span>
          </div>
          <ExportStudentsTable
            students={studentData.data || []}
            meta={studentData.meta}
            onPageChange={onPageChange}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
