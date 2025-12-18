'use client';

import { useState } from 'react';
import { useStudentExport } from '@/hooks/data/useStudentExport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, Clock, Users, Download } from 'lucide-react';
import { GradesSelector, SectionsSelector } from './shared';

export function StudentExportPageContent() {
  const [selectedGradeId, setSelectedGradeId] = useState<number | undefined>();
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>();

  // Hook para obtener datos y controlar descargas
  const {
    formData: exportData,
    isFormLoading: isLoading,
    formError: error,
    isDownloading,
    downloadExcel,
  } = useStudentExport({ autoFetch: true });

  const activeCycle = exportData?.[0];

  const calculateProgress = () => {
    if (!activeCycle) return 0;
    const start = new Date(activeCycle.startDate).getTime();
    const end = new Date(activeCycle.endDate).getTime();
    const now = new Date().getTime();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-8 pb-8">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 dark:from-emerald-900 dark:via-emerald-800 dark:to-teal-900 p-8 shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_1px)] bg-[length:40px_40px]" />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                <Download className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Exportar Estudiantes</h1>
                <p className="text-emerald-100 text-lg mt-1">Descarga datos de estudiantes por grado y sección</p>
              </div>
            </div>
          </div>

          {/* Stats badges */}
          <div className="hidden md:flex gap-2 flex-col text-right">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Ciclo Activo
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Sistema en Línea
            </Badge>
          </div>
        </div>
      </div>

      {/* Active Cycle Card */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ciclo Escolar Activo</h2>
        </div>

        {isLoading ? (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-24 w-full bg-gray-200 dark:bg-gray-700" />
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive" className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Error al cargar el ciclo escolar activo</AlertDescription>
          </Alert>
        ) : activeCycle ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Card - 2 columns */}
            <Card className="lg:col-span-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      {activeCycle.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                      {activeCycle.description || 'Ciclo escolar actual'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-sm">
                    Activo
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso del Ciclo</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Inicio</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(activeCycle.startDate).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activeCycle.startDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-950 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Fin</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(activeCycle.endDate).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activeCycle.endDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side Stats Card */}
            <Card className="border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 dark:text-white">Información del Ciclo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Año Académico</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {activeCycle.academicYear || new Date(activeCycle.startDate).getFullYear()}
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total de Grados</p>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                    {activeCycle.grades?.length || 0}
                  </p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total de Secciones</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {activeCycle.grades?.reduce((acc, g) => acc + (g.sections?.length || 0), 0) || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Selectors Card */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filtros de Exportación</h2>

        {activeCycle && (
          <Card className="border-emerald-200 dark:border-emerald-800 shadow-md">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GradesSelector
                  grades={activeCycle.grades || []}
                  selectedGradeId={selectedGradeId}
                  onGradeSelect={setSelectedGradeId}
                />

                <SectionsSelector
                  grades={activeCycle.grades || []}
                  selectedGradeId={selectedGradeId}
                  selectedSectionId={selectedSectionId}
                  onSectionSelect={setSelectedSectionId}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 gap-2"
                  disabled={!selectedGradeId || !selectedSectionId || isDownloading}
                  onClick={() => {
                    if (selectedGradeId && selectedSectionId && activeCycle?.id) {
                      downloadExcel(activeCycle.id, selectedGradeId, selectedSectionId);
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? 'Descargando...' : 'Descargar Excel'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedGradeId(undefined);
                    setSelectedSectionId(undefined);
                  }}
                >
                  Limpiar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
