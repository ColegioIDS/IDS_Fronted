// src/components/attendance-config/AttendanceConfigCard.tsx

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { AttendanceConfig } from '@/types/attendanceConfig';
import { attendanceConfigTheme, combineTheme, getThemeClass } from '@/theme/attendanceConfigTheme';

interface AttendanceConfigCardProps {
  config: AttendanceConfig;
  isActive?: boolean;
  onEdit?: () => void;
  onActivate?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Componente de tarjeta para mostrar configuración de asistencia
 * Soporta dark mode y temas personalizables
 */
export const AttendanceConfigCard: React.FC<AttendanceConfigCardProps> = ({
  config,
  isActive = false,
  onEdit,
  onActivate,
  variant = 'default',
}) => {
  const themeClass = isActive
    ? attendanceConfigTheme.combinations.cardActive
    : attendanceConfigTheme.combinations.cardInactive;

  const contentClass =
    variant === 'compact'
      ? 'space-y-3'
      : variant === 'detailed'
        ? 'space-y-4'
        : 'space-y-3';

  return (
    <Card
      className={`transition-all duration-200 ${themeClass} ${isActive ? 'ring-2 ring-green-500 dark:ring-green-400' : ''
        }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Configuración #{config.id}
              </CardTitle>
              {isActive && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activa
                </Badge>
              )}
            </div>
            {config.createdAt && (
              <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                Creada: {new Date(config.createdAt).toLocaleDateString('es-ES')}
              </CardDescription>
            )}
          </div>

          {isActive ? (
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Editar
            </button>
          ) : (
            <button
              onClick={onActivate}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              Activar
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className={contentClass}>
        {variant !== 'compact' && <Separator className={attendanceConfigTheme.utilities.divider} />}

        {/* Grid de configuraciones principales */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Umbral de Riesgo */}
          <div className={combineTheme(
            'bg-blue-50 rounded-lg p-3',
            'dark:bg-blue-900/20'
          )}>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Umbral de Riesgo
            </p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {config?.riskThresholdPercentage ?? 'N/A'}%
            </p>
          </div>

          {/* Hora Límite */}
          <div className={combineTheme(
            'bg-amber-50 rounded-lg p-3',
            'dark:bg-amber-900/20'
          )}>
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
              <Clock className="w-3 h-3" />
              Hora Límite
            </div>
            <p className="text-xl font-bold text-amber-900 dark:text-amber-100 mt-1">
              {config?.lateThresholdTime ?? 'N/A'}
            </p>
          </div>

          {/* Tardío (minutos) */}
          <div className={combineTheme(
            'bg-red-50 rounded-lg p-3',
            'dark:bg-red-900/20'
          )}>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Marcar Tardío
            </p>
            <p className="text-xl font-bold text-red-900 dark:text-red-100 mt-1">
              {config?.markAsTardyAfterMinutes ?? 'N/A'}m
            </p>
          </div>
        </div>

        {/* Información adicional */}
        {variant !== 'compact' && (
          <>
            <Separator className={attendanceConfigTheme.utilities.divider} />

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Alertas: {config.consecutiveAbsenceAlert}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {config.maxJustificationDays}d justif.
                </span>
              </div>
            </div>
          </>
        )}

        {/* Códigos de estado negativos */}
        {variant === 'detailed' && (
          <>
            <Separator className={attendanceConfigTheme.utilities.divider} />

            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Códigos Negativos
              </p>
              <div className="flex flex-wrap gap-1">
                {config.negativeStatusCodes?.map(code => (
                  <Badge
                    key={code}
                    variant="outline"
                    className="text-xs border-red-300 text-red-700 dark:border-red-700 dark:text-red-300"
                  >
                    {code}
                  </Badge>
                )) || (
                    <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
                  )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceConfigCard;