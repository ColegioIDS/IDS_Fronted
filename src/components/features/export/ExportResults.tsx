'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
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
      {/* Metadata Cards */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <CardTitle className="text-xl font-bold">Reporte Generado</CardTitle>
              <CardDescription className="mt-2">
                Sección {filters.section?.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Ciclo</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{filters.cycle?.name}</p>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Bimestre</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{filters.bimester?.name}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Sección</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{filters.section?.name}</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Docente</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {filters.section?.teacher?.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      {studentData && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
            Estudiantes ({studentData.meta?.total || 0})
          </h3>
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
