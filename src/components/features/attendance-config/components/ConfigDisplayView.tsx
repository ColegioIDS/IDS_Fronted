// src/components/features/attendance-config/components/ConfigDisplayView.tsx
'use client';

import React from 'react';
import { AttendanceConfig } from '@/types/attendance-config.types';
import { ConfigCard } from './ConfigCard';
import { ConfigField } from './ConfigField';
import {
  AlertCircle,
  Clock,
  FileText,
  CheckCircle,
  BarChart3,
  Bell,
  Info,
  Check,
  X,
} from 'lucide-react';
import { ATTENDANCE_CONFIG_THEME } from '../attendance-config-theme';

interface ConfigDisplayViewProps {
  config: AttendanceConfig;
  loading?: boolean;
}

export const ConfigDisplayView: React.FC<ConfigDisplayViewProps> = ({
  config,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8 text-center text-slate-600 dark:text-slate-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No hay configuración disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información Básica */}
      <ConfigCard
        title="Información Básica"
        description="Datos generales de la configuración"
        type="threshold"
        icon={Info}
      >
        <div className="space-y-4">
          <ConfigField
            label="Nombre"
            value={config.name}
            type="text"
            helperText="Identificador de esta configuración"
          />
          {config.description && (
            <ConfigField
              label="Descripción"
              value={config.description}
              type="text"
              helperText="Notas sobre esta configuración"
            />
          )}
        </div>
      </ConfigCard>

      {/* Header Info */}
      <div
        className={`
          rounded-lg border-2 p-6
          ${ATTENDANCE_CONFIG_THEME.operations.read.bg}
          ${ATTENDANCE_CONFIG_THEME.operations.read.border}
          ${ATTENDANCE_CONFIG_THEME.operations.read.text}
        `}
      >
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-xl font-bold">Configuración del Sistema</h2>
        </div>
        <p className="text-sm opacity-75">
          Última actualización:{' '}
          <span className="font-semibold">
            {new Date(config.updatedAt).toLocaleDateString('es-ES')}
          </span>
        </p>
        <div
          className={`
            mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            ${config.isActive ? ATTENDANCE_CONFIG_THEME.status.active.bg : ATTENDANCE_CONFIG_THEME.status.inactive.bg}
            ${config.isActive ? ATTENDANCE_CONFIG_THEME.status.active.text : ATTENDANCE_CONFIG_THEME.status.inactive.text}
            text-sm font-semibold
          `}
        >
          <span
            className={`
              h-2.5 w-2.5 rounded-full
              ${config.isActive ? ATTENDANCE_CONFIG_THEME.status.active.dot : ATTENDANCE_CONFIG_THEME.status.inactive.dot}
            `}
          />
          {config.isActive ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      {/* Umbral de Riesgo */}
      <ConfigCard
        title="Umbral de Riesgo y Alertas"
        description="Configuración de límites de asistencia para alertas"
        type="threshold"
        icon={AlertCircle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigField
            label="Porcentaje Mínimo de Asistencia"
            value={config.riskThresholdPercentage}
            type="percentage"
            helperText="Estudiantes por debajo de este % serán marcados en riesgo"
          />
          <ConfigField
            label="Alertas Consecutivas"
            value={config.consecutiveAbsenceAlert}
            type="number"
            helperText="Número de ausencias consecutivas para alertar"
          />
        </div>
      </ConfigCard>

      {/* Tardanza */}
      <ConfigCard
        title="Configuración de Tardanza"
        description="Parámetros para marcar estudiantes como tarde"
        type="timing"
        icon={Clock}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigField
            label="Hora Límite para Tardanza"
            value={config.lateThresholdTime}
            type="time"
            helperText="Hora a partir de la cual se considera tarde"
          />
          <ConfigField
            label="Minutos de Tolerancia"
            value={config.markAsTardyAfterMinutes}
            type="number"
            helperText="Minutos después del horario para marcar tarde"
          />
        </div>
        {config.defaultNotesPlaceholder && (
          <div
            className={`
              mt-4 p-3 rounded-md border-2
              ${ATTENDANCE_CONFIG_THEME.base.bg.secondary}
              ${ATTENDANCE_CONFIG_THEME.base.border.light}
            `}
          >
            <p className="text-xs font-semibold mb-2 opacity-75">
              Placeholder para notas:
            </p>
            <p className="text-sm italic">{config.defaultNotesPlaceholder}</p>
          </div>
        )}
      </ConfigCard>

      {/* Justificaciones */}
      <ConfigCard
        title="Configuración de Justificaciones"
        description="Parámetros para justificación de ausencias"
        type="justification"
        icon={FileText}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConfigField
            label="Justificación Requerida Después"
            value={config.justificationRequiredAfter}
            type="number"
            helperText="Número de ausencias antes de requerir justificación"
          />
          <ConfigField
            label="Máximo Días para Justificar"
            value={config.maxJustificationDays}
            type="number"
            helperText="Días máximos después de la ausencia para justificar"
          />
        </div>
      </ConfigCard>

      {/* Aprobación Automática */}
      <ConfigCard
        title="Aprobación Automática de Justificaciones"
        description="Configuración de aprovisionamiento automático"
        type="approval"
        icon={CheckCircle}
      >
        <div className="space-y-4">
          <div
            className={`
              p-4 rounded-md border-2
              ${
                config.autoApproveJustification
                  ? ATTENDANCE_CONFIG_THEME.sections.approval.bg
                  : ATTENDANCE_CONFIG_THEME.base.bg.secondary
              }
              ${
                config.autoApproveJustification
                  ? ATTENDANCE_CONFIG_THEME.sections.approval.border
                  : ATTENDANCE_CONFIG_THEME.base.border.light
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl flex items-center gap-1">
                {config.autoApproveJustification ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </span>
              <span className="font-semibold">
                {config.autoApproveJustification
                  ? 'Aprobación Automática ACTIVA'
                  : 'Aprobación Automática DESACTIVADA'}
              </span>
            </div>
          </div>

          {config.autoApproveJustification && (
            <ConfigField
              label="Días para Aprobación Automática"
              value={config.autoApprovalAfterDays}
              type="number"
              helperText="Justificaciones se aprueban automáticamente después de estos días"
            />
          )}
        </div>
      </ConfigCard>

      {/* Resumen */}
      <div
        className={`
          rounded-lg border-2 p-4
          ${ATTENDANCE_CONFIG_THEME.validation.info.bg}
          ${ATTENDANCE_CONFIG_THEME.validation.info.border}
          ${ATTENDANCE_CONFIG_THEME.validation.info.text}
        `}
      >
        <div className="flex gap-3">
          <Bell className={`h-5 w-5 flex-shrink-0 ${ATTENDANCE_CONFIG_THEME.validation.info.icon}`} />
          <div className="text-sm">
            <p className="font-semibold mb-2">Resumen de Configuración</p>
            <ul className="space-y-1 text-xs opacity-75">
              <li>
                • Estudiantes con menos del{' '}
                <strong>{config.riskThresholdPercentage}%</strong> de asistencia
                están en riesgo
              </li>
              <li>
                • Se alerta después de{' '}
                <strong>{config.consecutiveAbsenceAlert}</strong> ausencias
                consecutivas
              </li>
              <li>
                • Tardanza se marca después de las{' '}
                <strong>{config.lateThresholdTime}</strong> + 
                <strong> {config.markAsTardyAfterMinutes} min</strong>
              </li>
              <li>
                • Justificación requerida después de{' '}
                <strong>{config.justificationRequiredAfter}</strong> ausencias
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
