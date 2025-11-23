/**
 * ====================================================================
 * ATTENDANCE PAGE CONTENT - Contenedor Principal
 * ====================================================================
 *
 * Componente root que:
 * • Maneja los TABs
 * • Carga datos iniciales
 * • Orquesta los hooks
 * • Gestiona el estado global del módulo
 */

'use client';

import { useState, useEffect } from 'react';
import { AttendanceProvider, useAttendanceContext } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen, User, Calendar, Edit3, BarChart3, CheckCircle } from 'lucide-react';
import { AttendanceFilters } from './AttendanceFilters';
import { DailyRegistration } from './Tab1_DailyRegistration';
import { UpdateAttendanceTabSmartEdit } from './Tab2_UpdateAttendance/UpdateAttendance-Smart';
import { ValidationsChecker } from './Tab4_Validations';
import { ATTENDANCE_TABS, ATTENDANCE_TAB_LABELS } from '@/constants/attendance.constants';

type AttendanceTabType = typeof ATTENDANCE_TABS[keyof typeof ATTENDANCE_TABS];

function AttendancePageContentInner() {
  const { state: attendanceState } = useAttendanceContext();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AttendanceTabType>(ATTENDANCE_TABS.TAB_1);

  // Guardar tab activo en localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('attendance-active-tab');
    if (savedTab && Object.values(ATTENDANCE_TABS).includes(savedTab as AttendanceTabType)) {
      setActiveTab(savedTab as AttendanceTabType);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value as AttendanceTabType);
    localStorage.setItem('attendance-active-tab', value);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="rounded-xl border-2 border-indigo-200 bg-white p-8 shadow-lg dark:border-indigo-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md dark:bg-indigo-500">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Asistencia
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Registra, gestiona y visualiza la asistencia de estudiantes de forma fácil y rápida
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <User className="h-4 w-4" />
                {user?.firstName || 'Invitado'}
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('es-GT', { dateStyle: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {attendanceState.error && (
        <Alert className="animate-in fade-in-50 slide-in-from-top-5 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="font-medium text-red-900 dark:text-red-100">
            {attendanceState.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <AttendanceFilters />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-2 rounded-xl bg-gray-100 p-2 dark:bg-gray-800">
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_1}
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_1]}
          </TabsTrigger>
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_2}
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_2]}
          </TabsTrigger>
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_3}
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_3]}
          </TabsTrigger>
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_4}
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_4]}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: REGISTRO DIARIO */}
        <TabsContent value={ATTENDANCE_TABS.TAB_1} className="space-y-6">
          <DailyRegistration />
        </TabsContent>

        {/* TAB 2: ACTUALIZAR ASISTENCIA */}
        <TabsContent value={ATTENDANCE_TABS.TAB_2} className="space-y-6">
          <UpdateAttendanceTabSmartEdit />
        </TabsContent>

        {/* TAB 3: REPORTES */}
        <TabsContent value={ATTENDANCE_TABS.TAB_3} className="space-y-6">
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-12 text-center shadow-lg dark:border-amber-800 dark:bg-amber-950/20">
            <div className="mx-auto flex max-w-md flex-col items-center space-y-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg">
                <BarChart3 className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                Reportes y Estadísticas
              </h3>
              <p className="text-base text-amber-700 dark:text-amber-300">
                Esta sección está en construcción
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-100 px-6 py-2 text-sm font-semibold text-amber-900 dark:border-amber-500 dark:bg-amber-900 dark:text-amber-100">
                <Calendar className="h-4 w-4" />
                Próximamente
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: VALIDACIONES */}
        <TabsContent value={ATTENDANCE_TABS.TAB_4} className="space-y-6">
          <ValidationsChecker
            cycleId={attendanceState.selectedCycleId}
            bimesterId={attendanceState.selectedBimesterId || undefined}
            date={attendanceState.selectedDate}
            teacherId={undefined}
            roleId={user?.role?.id}
            sectionId={attendanceState.selectedSectionId || undefined}
            studentCount={attendanceState.students.length}
          />
        </TabsContent>
      </Tabs>

      {/* Debug Info (opcional, quitar en producción) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="rounded bg-gray-100 p-4">
          <summary className="cursor-pointer font-medium text-gray-700">
            Estado del Módulo (DEBUG)
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-white p-2 text-xs">
            {JSON.stringify(attendanceState, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export function AttendancePageContent() {
  return (
    <AttendanceProvider>
      <AttendancePageContentInner />
    </AttendanceProvider>
  );
}
