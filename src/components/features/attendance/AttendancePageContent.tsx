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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Asistencia</h1>
        <p className="text-gray-600">
          Registra, gestiona y visualiza la asistencia de estudiantes
        </p>
      </div>

      {/* Error Display */}
      {attendanceState.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900">
            {attendanceState.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <AttendanceFilters />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value={ATTENDANCE_TABS.TAB_1} className="data-[state=active]:bg-white">
            {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_1]}
          </TabsTrigger>
          <TabsTrigger value={ATTENDANCE_TABS.TAB_2} className="data-[state=active]:bg-white">
            {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_2]}
          </TabsTrigger>
          <TabsTrigger value={ATTENDANCE_TABS.TAB_3} className="data-[state=active]:bg-white">
            {ATTENDANCE_TAB_LABELS[ATTENDANCE_TABS.TAB_3]}
          </TabsTrigger>
          <TabsTrigger value={ATTENDANCE_TABS.TAB_4} className="data-[state=active]:bg-white">
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
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-center py-12">
              <p className="text-gray-600">TAB 3 - Reportes (En construcción)</p>
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
