'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Calendar, RefreshCw, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedContent from '@/components/common/ProtectedContent';

import { useSchedules } from '@/hooks/useSchedules';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * PASO 4: Main schedules page component (simplified)
 * 
 * This component orchestrates the schedules module:
 * - Displays basic statistics
 * - Handles permission checks
 * - Theme switching and refresh
 * 
 * Architecture: Uses unified useSchedules hook + schedulesService
 * Primary identifier: courseAssignmentId
 */
export default function SchedulesPageContent({
  className = '',
}: {
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  // Permission checks
  const { hasPermission } = usePermissions();
  const canRead = hasPermission('schedule', 'read');

  // New unified hook
  const {
    schedules,
    formData,
    isLoadingFormData,
    isLoading,
    error,
    clearError,
    loadSchedulesBySection,
  } = useSchedules();

  // ✅ Handle refresh
  const handleRefreshAll = async () => {
    try {
      if (formData?.sections && formData.sections.length > 0) {
        await loadSchedulesBySection(formData.sections[0].id);
        toast.success('Datos actualizados');
      }
    } catch (err) {
      toast.error('Error al actualizar datos');
      console.error('Refresh error:', err);
    }
  };

  // Compute stats
  const stats = {
    totalSchedules: schedules.length,
    totalSections: formData?.sections?.length || 0,
    totalCourses: formData?.courses?.length || 0,
  };

  // ✅ Check permissions
  if (!canRead) {
    return (
      <ProtectedContent
        requiredPermission={{ module: 'schedule', action: 'read' }}
      >
        <></>
      </ProtectedContent>
    );
  }

  // ✅ Loading state
  if (isLoadingFormData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className={isDark ? 'text-white' : 'text-gray-900'}>
              Cargando datos...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ No active cycle
  if (!formData?.activeCycle) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No hay ciclo escolar activo. Configure un ciclo antes de gestionar horarios.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ✅ Render principal
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with stats */}
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="h-5 w-5" />
              Gestión de Horarios
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isLoading}
                className={`${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Horarios</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalSchedules}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Secciones</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalSections}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cursos</div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalCourses}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for schedule view */}
      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="p-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            📅 Vista de calendario en construcción...
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-2">
            Próximamente: Grilla de horarios interactiva con drag & drop (CourseAssignment → TimeSlot)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
