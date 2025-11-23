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
import { AlertCircle } from 'lucide-react';
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
    <div className="space-y-8 p-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))]" />
        <div className="relative z-10 space-y-3">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
            📚 Gestión de Asistencia
          </h1>
          <p className="text-lg text-indigo-100">
            Registra, gestiona y visualiza la asistencia de estudiantes de forma fácil y rápida
          </p>
          <div className="flex gap-2 pt-2">
            <div className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Usuario: {user?.firstName || 'Invitado'}
            </div>
            <div className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              Fecha: {new Date().toLocaleDateString('es-GT', { dateStyle: 'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {attendanceState.error && (
        <Alert className="animate-in fade-in-50 slide-in-from-top-5 border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30">
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
        <TabsList className="grid w-full grid-cols-4 gap-2 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-xl shadow-lg dark:from-slate-800 dark:to-slate-900">
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_1}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 transition-all duration-200"
          >
            📝 {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_1]}
          </TabsTrigger>
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_2}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-200"
          >
            ✏️ {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_2]}
          </TabsTrigger>
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_3}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/30 transition-all duration-200"
          >
            📊 {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_3]}
          </TabsTrigger>
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_4}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all duration-200"
          >
            ✅ {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_4]}
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
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-12 shadow-lg dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
            <div className="text-center space-y-4">
              <div className="text-7xl">📊</div>
              <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                Reportes y Estadísticas
              </h3>
              <p className="text-lg text-amber-700 dark:text-amber-300">
                Esta sección está en construcción
              </p>
              <div className="inline-block rounded-full bg-amber-200 px-6 py-2 text-sm font-semibold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
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
