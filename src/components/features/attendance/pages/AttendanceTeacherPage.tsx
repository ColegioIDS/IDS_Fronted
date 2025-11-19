// src/components/features/attendance/pages/AttendanceTeacherPage.tsx
/**
 * NUEVA PÁGINA: Sistema de Asistencia por Cursos del Maestro
 * 
 * Flujo mejorado y visual:
 * 1. Seleccionar fecha
 * 2. Ver cursos disponibles
 * 3. Seleccionar cursos (1-10)
 * 4. Seleccionar estado de asistencia
 * 5. Opcionalmente: hora de llegada y notas
 * 6. Guardar asistencia
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  FileText,
} from 'lucide-react';

import { useTeacherCourses, useTeacherAttendanceRegistration, useAttendanceStatuses } from '@/hooks/attendance';
import { CourseSelectionGrid } from '../components/CourseSelectionGrid';
import { AttendanceStatusSelector } from '../components/AttendanceStatusSelector';
import { BulkTeacherAttendanceByCourseRequest } from '@/types/attendance.types';

interface AttendanceTeacherPageProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

type Step = 'date' | 'courses' | 'status' | 'review' | 'success';

export function AttendanceTeacherPage({ onClose, onSuccess }: AttendanceTeacherPageProps) {
  // Estados principales
  const [currentStep, setCurrentStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Datos de cursos y asistencia
  const { courses, isLoading: coursesLoading, error: coursesError, fetchCourses } = useTeacherCourses();
  const { statuses, loading: statusesLoading } = useAttendanceStatuses();
  const { registerAttendance, isLoading: registering, isSuccess, result, error: registrationError } =
    useTeacherAttendanceRegistration();

  // Estados de formulario
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [arrivalTime, setArrivalTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Cargar cursos cuando cambia la fecha
  useEffect(() => {
    setSelectedCourses([]);
    fetchCourses(selectedDate);
    setCurrentStep('date');
  }, [selectedDate, fetchCourses]);

  // Cambiar al paso de éxito cuando se registra exitosamente
  useEffect(() => {
    if (isSuccess && result) {
      setCurrentStep('success');
    }
  }, [isSuccess, result]);

  // Validaciones
  const canProceedFromDate = selectedDate && courses.length > 0;
  const canProceedFromCourses = selectedCourses.length > 0;
  const canProceedFromStatus = selectedStatus !== null;

  // Handlers
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleProceedToStatus = () => {
    if (canProceedFromCourses) {
      setCurrentStep('status');
    }
  };

  const handleProceedToReview = () => {
    if (canProceedFromStatus) {
      setCurrentStep('review');
    }
  };

  const handleRegisterAttendance = async () => {
    const payload: BulkTeacherAttendanceByCourseRequest = {
      date: selectedDate,
      courseAssignmentIds: selectedCourses,
      attendanceStatusId: selectedStatus!,
      arrivalTime: arrivalTime || undefined,
      notes: notes || undefined,
    };

    try {
      await registerAttendance(payload);
    } catch (error) {
      toast.error('Error al registrar asistencia');
    }
  };

  const handleReset = () => {
    setCurrentStep('date');
    setSelectedCourses([]);
    setSelectedStatus(null);
    setArrivalTime('');
    setNotes('');
  };

  const handleClose = () => {
    if (onSuccess && isSuccess) onSuccess();
    if (onClose) onClose();
  };

  // ========================================================================
  // STEP 1: Seleccionar Fecha
  // ========================================================================
  if (currentStep === 'date') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Asistencia</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Selecciona una fecha para ver tus cursos disponibles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seleccionar Fecha
            </CardTitle>
            <CardDescription>Elige la fecha para la cual registrarás asistencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-base font-medium">
                Fecha
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="mt-2"
              />
            </div>

            {coursesLoading && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">Cargando cursos disponibles...</span>
              </div>
            )}

            {coursesError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{coursesError}</AlertDescription>
              </Alert>
            )}

            {courses.length === 0 && !coursesLoading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sin cursos</AlertTitle>
                <AlertDescription>No tienes cursos programados para esta fecha</AlertDescription>
              </Alert>
            )}

            {courses.length > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Encontramos <span className="font-semibold">{courses.length}</span> curso
                  {courses.length !== 1 ? 's' : ''} disponible{courses.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            <Button
              onClick={() => setCurrentStep('courses')}
              disabled={!canProceedFromDate || coursesLoading}
              className="w-full"
              size="lg"
            >
              Continuar <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========================================================================
  // STEP 2: Seleccionar Cursos
  // ========================================================================
  if (currentStep === 'courses') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              2
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seleccionar Cursos</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Elige los cursos para los que deseas registrar asistencia
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cursos Disponibles - {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseSelectionGrid
              courses={courses}
              selectedCourseIds={selectedCourses}
              onSelectionChange={setSelectedCourses}
              maxSelection={10}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep('date')} className="flex-1">
            Atrás
          </Button>
          <Button onClick={handleProceedToStatus} disabled={!canProceedFromCourses} className="flex-1">
            Continuar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ========================================================================
  // STEP 3: Seleccionar Estado
  // ========================================================================
  if (currentStep === 'status') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              3
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Estado de Asistencia</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Selecciona el estado que se aplicará a todos los estudiantes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Estados Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceStatusSelector
              statuses={statuses.filter((s) => s.isActive)}
              selectedStatusId={selectedStatus}
              onStatusChange={setSelectedStatus}
              isLoading={statusesLoading}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep('courses')} className="flex-1">
            Atrás
          </Button>
          <Button onClick={handleProceedToReview} disabled={!canProceedFromStatus} className="flex-1">
            Continuar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ========================================================================
  // STEP 4: Revisar y Registrar
  // ========================================================================
  if (currentStep === 'review') {
    const selectedCoursesData = courses.filter((c) => selectedCourses.includes(c.courseAssignmentId));
    const totalStudents = selectedCoursesData.reduce((total, c) => total + c.studentCount, 0);
    const selectedStatusData = statuses.find((s) => s.id === selectedStatus);

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              4
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revisar Registro</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Verifica los datos antes de guardar</p>
        </div>

        {/* Resumen */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDate}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cursos Seleccionados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCourses.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estudiantes Afectados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{totalStudents}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estado de Asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedStatusData?.name || '-'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional opcional */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información Adicional (Opcional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="arrival-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora de Llegada
              </Label>
              <Input
                id="arrival-time"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Formato: HH:MM</p>
            </div>

            <div>
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notas
              </Label>
              <Textarea
                id="notes"
                placeholder="Agrega notas si es necesario (máx 500 caracteres)"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                maxLength={500}
                className="mt-2"
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {notes.length}/500 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        {registrationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{registrationError}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentStep('status')} disabled={registering} className="flex-1">
            Atrás
          </Button>
          <Button onClick={handleRegisterAttendance} disabled={registering} className="flex-1">
            {registering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Registrar Asistencia
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ========================================================================
  // STEP 5: Éxito
  // ========================================================================
  if (currentStep === 'success' && isSuccess && result) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Asistencia Registrada</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Se ha registrado exitosamente</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumen del Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between border-b pb-2 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Fecha</span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.date}</span>
            </div>
            <div className="flex justify-between border-b pb-2 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Cursos Procesados</span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.courseCount}</span>
            </div>
            <div className="flex justify-between border-b pb-2 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Registros Creados</span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.createdAttendances}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estudiantes Afectados</span>
              <span className="font-semibold text-gray-900 dark:text-white">{result.enrollmentsCovered}</span>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleClose} className="w-full">
          Cerrar
        </Button>
      </div>
    );
  }

  return null;
}
