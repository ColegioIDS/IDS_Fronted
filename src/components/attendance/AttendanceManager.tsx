// src/components/attendance/AttendanceManager.tsx

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendance } from '@/hooks/useAttendance';
import AttendanceForm from './AttendanceForm';
import AttendanceTable from './AttendanceTable';
import AttendanceStats from './AttendanceStats';
import BulkAttendanceForm from './BulkAttendanceForm';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Tab = 'register' | 'list' | 'bulk' | 'stats';

export default function AttendanceManager() {
  const [activeTab, setActiveTab] = useState<Tab>('register');
  const { error, resetError } = useAttendance();

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">{error.message}</div>
            {error.code === 'VALIDATION_ERROR' && error.details && (
              <div className="mt-2 text-sm">
                {Array.isArray(error.details) &&
                  error.details.map((detail: any, idx: number) => (
                    <div key={idx}>• {detail.message}</div>
                  ))}
              </div>
            )}
            <button
              onClick={resetError}
              className="mt-2 text-sm font-medium hover:underline"
            >
              Descartar
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="register" className="text-sm">
            Registrar
          </TabsTrigger>
          <TabsTrigger value="list" className="text-sm">
            Historial
          </TabsTrigger>
          <TabsTrigger value="bulk" className="text-sm">
            Carga Masiva
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-sm">
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Registrar */}
        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Asistencia</CardTitle>
              <CardDescription>
                Registra la asistencia de un estudiante de forma individual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Historial */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Asistencia</CardTitle>
              <CardDescription>
                Visualiza y administra los registros de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Carga Masiva */}
        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carga Masiva de Asistencia</CardTitle>
              <CardDescription>
                Registra asistencia para múltiples estudiantes simultáneamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkAttendanceForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Estadísticas */}
        <TabsContent value="stats" className="space-y-4">
          <AttendanceStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}