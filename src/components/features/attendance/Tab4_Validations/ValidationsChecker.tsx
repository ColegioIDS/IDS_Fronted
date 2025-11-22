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
import { ConfigDisplay } from './ConfigDisplay';
import { AllowedStatusesDisplay } from './AllowedStatusesDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

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
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Validaciones Previas</h2>
        <p className="text-gray-600">
          Verifica que todas las condiciones sean correctas antes de registrar asistencia
        </p>
      </div>

      {/* Overall Status */}
      {validationState.isValidating ? (
        <Alert className="border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-blue-600" />
            <AlertDescription className="text-blue-900">
              Ejecutando validaciones... ({successCount}/{totalCount})
            </AlertDescription>
          </div>
        </Alert>
      ) : allPassed && validationState.isComplete ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            ✅ Todas las validaciones pasaron correctamente. Listo para registrar asistencia.
          </AlertDescription>
        </Alert>
      ) : validationState.globalError && !validationState.isValidating ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900">
            ❌ Error al ejecutar validaciones: {validationState.globalError.message}
          </AlertDescription>
        </Alert>
      ) : validationState.isComplete && !allPassed ? (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            ⚠️ Algunas validaciones no pasaron. Revisa los detalles abajo.
          </AlertDescription>
        </Alert>
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
              </>
            )}
            {teacherId && (
              <TeacherAbsenceCheck
                teacherId={teacherId}
                date={date}
                isLoading={validationState.isValidating}
              />
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
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
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
