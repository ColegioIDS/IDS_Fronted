'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAttendanceReport, useTeacherProfile } from '@/hooks/useDashboardClasses';
import DailyReport from './DailyReport';
import WeeklyReport from './WeeklyReport';
import BimestralReport from './BimestralReport';
import type { AttendanceReportType, AttendanceReportParams } from '@/types/dashboard.types';

type ReportTab = Extract<AttendanceReportType, 'daily' | 'weekly' | 'bimestral'>;

export default function AttendanceReport() {
  const [reportType, setReportType] = useState<ReportTab>('daily');
  const { profile } = useTeacherProfile();

  // Create params based on report type (memoized to avoid recreating on every render)
  const params = useMemo<AttendanceReportParams>(() => ({
    type: reportType,
    ...(reportType === 'daily' && { includeJustifications: true }),
    ...(reportType === 'bimestral' && { includeRiskDetection: true }),
  }), [reportType]);

  const { report, isLoading, error } = useAttendanceReport(params);

  const handleTabChange = (value: string) => {
    setReportType(value as ReportTab);
  };

  // Get sections display text
  const sectionsDisplay = useMemo(() => {
    if (!profile) return 'Cargando...';
    
    const sections = profile.profile.assignedSections;
    if (sections.length === 0) return 'Sin secciones asignadas';
    
    if (sections.length === 1) {
      const section = sections[0];
      return `${section.sectionName}`;
    }
    
    // For multiple sections
    return `${sections.length} secciones asignadas`;
  }, [profile]);

  return (
    <Card className="w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6">
        {/* Header with Teacher Profile */}
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                Reportes de Asistencia
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Visualiza el historial de asistencia por diferentes períodos
              </p>
            </div>
          </div>

          {/* Sections Display */}
          {profile && (
            <div className="mt-4">
              {profile.profile.isTitular ? (
                // Titular Profile
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mr-2"></span>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Docente Titular
                  </span>
                  <span className="mx-2 text-blue-300 dark:text-blue-600">•</span>
                  <span className="text-sm text-blue-600 dark:text-blue-300 font-semibold">
                    {profile.profile.sectionName}
                  </span>
                </div>
              ) : (
                // Especialista Profile
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-900/50">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 mr-2"></span>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                      Docente Especialista
                    </span>
                  </div>
                  {profile.profile.assignedSections.map((section) => (
                    <div
                      key={section.sectionId}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-900/50"
                    >
                      <span className="text-sm text-amber-700 dark:text-amber-300">
                        {section.sectionName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Tabs value={reportType} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="daily">Diario</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="bimestral">Bimestral</TabsTrigger>
          </TabsList>

          <div className="min-h-96">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error al cargar el reporte: {error}
                </p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}

            {!isLoading && !error && report && (
              <>
                <TabsContent value="daily" className="mt-0">
                  <DailyReport data={report} />
                </TabsContent>

                <TabsContent value="weekly" className="mt-0">
                  <WeeklyReport data={report} />
                </TabsContent>

                <TabsContent value="bimestral" className="mt-0">
                  <BimestralReport data={report} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </Card>
  );
}
