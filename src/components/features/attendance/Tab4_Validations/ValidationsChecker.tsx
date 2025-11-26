/**
 * ====================================================================
 * VALIDATIONS CHECKER - TAB 4
 * ====================================================================
 *
 * Contenedor principal para TAB 4
 * Ejecuta todas las validaciones en paralelo
 * Muestra resultados en grid de cards
 */

'use client';

import { useEffect } from 'react';
import { useAttendanceValidations } from '@/hooks/data/attendance/useAttendanceValidations';
import { BimesterCheck } from './BimesterCheck';
import { HolidayCheck } from './HolidayCheck';
import { WeekCheck } from './WeekCheck';
import { TeacherAbsenceCheck } from './TeacherAbsenceCheck';
import { ScheduleCheck } from './ScheduleCheck';
import { TodayScheduleCheck } from './TodayScheduleCheck';
import { ConfigDisplay } from './ConfigDisplay';
import { AllowedStatusesDisplay } from './AllowedStatusesDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface ValidationsCheckerProps {
  cycleId: number | null;
  bimesterId?: number;
  date: string;
  teacherId?: number;
  roleId?: number;
  sectionId?: number;
  studentCount?: number;
}

export function ValidationsChecker({
  cycleId,
  bimesterId,
  date,
  teacherId,
  roleId,
  sectionId,
  studentCount,
}: ValidationsCheckerProps) {
  const [validationState, validationActions] = useAttendanceValidations();

  // Ejecutar validaciones cuando los parámetros cambien
  useEffect(() => {
    if (!cycleId) return;

    const runValidations = async () => {
      await validationActions.validate({
        cycleId,
        bimesterId,
        date,
        teacherId,
        roleId,
        sectionId,
        studentCount,
      });
    };

    runValidations();
    // Nota: NO incluimos validationActions en dependencias
    // ya que las funciones internas pueden cambiar frecuentemente
    // Solo ejecutamos cuando los parámetros reales cambian
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleId, bimesterId, date, teacherId, roleId, sectionId, studentCount]);

  const successCount = validationState.results.filter(r => r.passed).length;
  const totalCount = validationState.results.length;
  const allPassed = validationState.overallStatus === 'success';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border-2 border-purple-200 bg-white p-8 shadow-lg dark:border-purple-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md dark:bg-purple-500">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Validaciones Previas
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Verifica que todas las condiciones sean correctas antes de registrar asistencia
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-900 dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-100">
              <CheckCircle className="h-4 w-4" />
              {successCount} / {totalCount} Validaciones Pasadas
            </div>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      {validationState.isValidating ? (
        <div className="animate-in fade-in-50 rounded-xl border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="flex items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                Ejecutando validaciones...
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Progreso: {successCount}/{totalCount}
              </p>
            </div>
          </div>
        </div>
      ) : allPassed && validationState.isComplete ? (
        <div className="animate-in fade-in-50 slide-in-from-top-5 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-6 shadow-md dark:border-emerald-600 dark:bg-emerald-950/30">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md dark:bg-emerald-500">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                Todas las validaciones pasaron
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                El sistema está listo para registrar asistencia
              </p>
            </div>
          </div>
        </div>
      ) : validationState.globalError && !validationState.isValidating ? (
        <div className="animate-in fade-in-50 slide-in-from-top-5 rounded-xl border-2 border-red-500 bg-red-50 p-6 shadow-md dark:border-red-600 dark:bg-red-950/30">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600 text-white shadow-md dark:bg-red-500">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-900 dark:text-red-100">
                Error en validaciones
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {validationState.globalError.message}
              </p>
            </div>
          </div>
        </div>
      ) : validationState.isComplete && !allPassed ? (
        <div className="animate-in fade-in-50 slide-in-from-top-5 rounded-xl border-2 border-amber-500 bg-amber-50 p-6 shadow-md dark:border-amber-600 dark:bg-amber-950/30">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-600 text-white shadow-md dark:bg-amber-500">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                Algunas validaciones fallaron
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Revisa los detalles abajo para ver qué necesita corrección
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Validations Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cycleId && (
          <>
            <BimesterCheck
              cycleId={cycleId}
              date={date}
              isLoading={validationState.isValidating}
            />
            {bimesterId && (
              <>
                <HolidayCheck
                  bimesterId={bimesterId}
                  date={date}
                  isLoading={validationState.isValidating}
                />
                <WeekCheck
                  bimesterId={bimesterId}
                  date={date}
                  isLoading={validationState.isValidating}
                />
                <TodayScheduleCheck
                  date={date}
                  sectionId={sectionId || undefined}
                  isLoading={validationState.isValidating}
                />
              </>
            )}
            {teacherId && (
              <>
                <TeacherAbsenceCheck
                  teacherId={teacherId}
                  date={date}
                  isLoading={validationState.isValidating}
                />
                <ScheduleCheck
                  teacherId={teacherId}
                  sectionId={sectionId || null}
                  date={date}
                  isLoading={validationState.isValidating}
                />
              </>
            )}
            <ConfigDisplay isLoading={validationState.isValidating} />
            {roleId && (
              <AllowedStatusesDisplay
                roleId={roleId}
                isLoading={validationState.isValidating}
              />
            )}
          </>
        )}
      </div>

      {/* No Data State */}
      {!cycleId && (
        <Alert className="border-gray-200 bg-gray-50">
          <AlertCircle className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">
            Selecciona un ciclo escolar para ejecutar las validaciones
          </AlertDescription>
        </Alert>
      )}

      {/* Results Summary */}
      {validationState.results.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Resumen de Validaciones</h3>
          <div className="space-y-2">
            {validationState.results.map(result => (
              <div
                key={result.id}
                className="flex items-center justify-between rounded border border-gray-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  {result.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{result.name}</p>
                    {result.message ? (
                      <p className="text-sm text-gray-600">{result.message}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        {result.passed ? 'Validación exitosa' : 'Validación fallida'}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`rounded px-3 py-1 text-xs font-medium ${
                    result.passed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.passed ? 'Pasó' : 'Falló'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
