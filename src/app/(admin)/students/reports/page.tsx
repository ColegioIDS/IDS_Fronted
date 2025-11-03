'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BarChart3, AlertCircle } from 'lucide-react';
import { ReportGenerator } from '@/components/features/students';
import { studentsService } from '@/services/students.service';
import { Student } from '@/types/students.types';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los estudiantes
  useEffect(() => {
    const loadAllStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar con paginación para obtener todos
        const allStudents: Student[] = [];
        let page = 1;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const result = await studentsService.getStudents({
            page,
            limit,
          });

          allStudents.push(...result.data);
          hasMore = page < result.meta.totalPages;
          page++;
        }

        setStudents(allStudents);
      } catch (err: any) {
        const errorMsg = err.message || 'Error al cargar reportes';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadAllStudents();
  }, []);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      if (format === 'excel') {
        // Exportar a Excel
        exportToExcel(students);
      } else {
        // Exportar a PDF
        exportToPDF(students);
      }
    } catch (error) {
      toast.error(`Error al exportar a ${format.toUpperCase()}`);
    }
  };

  const exportToExcel = (data: Student[]) => {
    // Crear CSV
    const headers = ['Código SIRE', 'Nombre', 'Apellido', 'Fecha Nacimiento', 'Ciclo', 'Grado', 'Sección'];
    const rows = data.map((student) => [
      student.codeSIRE || '',
      student.givenNames,
      student.lastNames,
      student.birthDate || '',
      student.enrollments?.[0]?.cycle?.name || '',
      student.enrollments?.[0]?.section?.grade?.name || '',
      student.enrollments?.[0]?.section?.name || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `reporte_estudiantes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Reporte exportado a Excel/CSV');
  };

  const exportToPDF = (data: Student[]) => {
    // Para PDF, se necesitaría una librería como jsPDF
    // Por ahora mostrar mensaje
    toast.info('Exportación a PDF - Característica en desarrollo');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reportes y Estadísticas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análisis completo del sistema de estudiantes
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Cargando datos de estudiantes...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <CardHeader>
              <CardTitle className="text-lg">Información de Reportes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                • Total de estudiantes en el sistema: <strong>{students.length}</strong>
              </p>
              <p>
                • Datos actualizados: <strong>{new Date().toLocaleString('es-ES')}</strong>
              </p>
              <p>
                • Todos los gráficos y estadísticas se pueden filtrar por rango de fechas y ciclo escolar
              </p>
            </CardContent>
          </Card>

          {/* Report Generator */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <ReportGenerator
              students={students}
              loading={loading}
              onExport={handleExport}
            />
          </div>
        </div>
      )}
    </div>
  );
}
