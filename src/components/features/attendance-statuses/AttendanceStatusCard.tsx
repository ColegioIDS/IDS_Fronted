// src/components/features/attendance-statuses/AttendanceStatusCard.tsx
'use client';

import { AttendanceStatus } from '@/types/attendance-status.types';
import { Check, X, Clock, AlertCircle, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ATTENDANCE_THEME, getStatusTypeStyle } from '@/constants/attendance-statuses-theme';
import { BaseCard } from '@/components/features/attendance-statuses/card/base-card';

interface AttendanceStatusCardProps {
  status: AttendanceStatus;
  onEdit?: (status: AttendanceStatus) => void;
  onDelete?: (id: number) => void;
  onToggleActive?: (id: number, isActive: boolean) => void;
  isCompact?: boolean;
}

export const AttendanceStatusCard = ({
  status,
  onEdit,
  onDelete,
  onToggleActive,
  isCompact = false,
}: AttendanceStatusCardProps) => {
  // Obtener estilo según tipo de estado
  const statusTypeStyle = getStatusTypeStyle(status.isNegative, status.isExcused, status.isTemporal);

  // Icono dinámico según tipo de estado
  const getStatusIcon = () => {
    if (status.isExcused) return <Check className="w-5 h-5" />;
    if (status.isNegative) return <X className="w-5 h-5" />;
    if (status.isTemporal) return <Clock className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  // Versión compacta para listas
  if (isCompact) {
    return (
      <BaseCard variant="compact" isHoverable>
        <div className="flex items-center gap-3">
          {/* Color Indicator */}
          <div
            className={cn(
              'w-4 h-4 rounded-full border-2',
              ATTENDANCE_THEME.radius.full
            )}
            style={{
              backgroundColor: status.colorCode || '#9CA3AF',
              borderColor: status.colorCode || '#9CA3AF',
            }}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn('font-semibold text-sm', ATTENDANCE_THEME.base.text.primary)}>
              {status.code}
            </p>
            <p className={cn('text-xs truncate', ATTENDANCE_THEME.base.text.muted)}>
              {status.name}
            </p>
          </div>

          {/* Icon */}
          <div className={statusTypeStyle.color}>
            {getStatusIcon()}
          </div>
        </div>
      </BaseCard>
    );
  }

  // Versión completa
  return (
    <BaseCard variant="default" className="group overflow-hidden">
      {/* ============================================
          SECCIÓN: HEADER CON CÓDIGO Y DESCRIPCIÓN
          ============================================ */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Badge con Código y Color */}
          <div
            className={cn(
              'w-12 h-12 rounded-lg border-2 flex items-center justify-center flex-shrink-0',
              'font-bold text-white'
            )}
            style={{
              backgroundColor: status.colorCode || '#9CA3AF',
              borderColor: status.colorCode || '#9CA3AF',
            }}
          >
            {status.code}
          </div>

          {/* Título y Descripción */}
          <div className="flex-1 min-w-0">
            <h3 className={cn('font-semibold text-base', ATTENDANCE_THEME.base.text.primary)}>
              {status.name}
            </h3>
            <p className={cn('text-sm mt-1 line-clamp-2', ATTENDANCE_THEME.base.text.muted)}>
              {status.description || 'Sin descripción'}
            </p>
          </div>
        </div>

        {/* Icono de Tipo de Estado (esquina superior derecha) */}
        <div className={statusTypeStyle.color}>
          {getStatusIcon()}
        </div>
      </div>

      {/* ============================================
          SECCIÓN: METADATOS (Estado y Orden)
          ============================================ */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Estado (Activo/Inactivo) */}
        <div className="space-y-1">
          <p className={cn('text-xs font-medium', ATTENDANCE_THEME.base.text.muted)}>
            Estado
          </p>
          <div className={cn(
            'px-2 py-1 rounded text-xs font-medium w-fit',
            status.isActive
              ? ATTENDANCE_THEME.status.active.bg + ' ' + ATTENDANCE_THEME.status.active.text
              : ATTENDANCE_THEME.status.inactive.bg + ' ' + ATTENDANCE_THEME.status.inactive.text
          )}>
            {status.isActive ? 'Activo' : 'Inactivo'}
          </div>
        </div>

        {/* Orden */}
        <div className="space-y-1">
          <p className={cn('text-xs font-medium', ATTENDANCE_THEME.base.text.muted)}>
            Orden
          </p>
          <p className={cn('text-sm font-semibold', ATTENDANCE_THEME.base.text.primary)}>
            {status.order}
          </p>
        </div>
      </div>

      {/* ============================================
          SECCIÓN: BADGES CON PROPIEDADES
          ============================================ */}
      <div className="flex flex-wrap gap-2 mb-4">
        {status.isNegative && (
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded',
            ATTENDANCE_THEME.operations.delete.badge
          )}>
            Ausencia
          </span>
        )}
        {status.requiresJustification && (
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded',
            ATTENDANCE_THEME.operations.update.badge
          )}>
            Requiere Justificación
          </span>
        )}
        {status.isTemporal && (
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded',
            'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
          )}>
            Temporal
          </span>
        )}
        {status.isExcused && (
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded',
            'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
          )}>
            Excusado
          </span>
        )}
      </div>

      {/* ============================================
          SECCIÓN: ACCIONES (Visible en hover)
          ============================================ */}
      {(onEdit || onDelete || onToggleActive) && (
        <div className={cn(
          'flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
        )}>
          {/* Botón Activar/Desactivar */}
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(status.id, !status.isActive)}
              className={cn(
                'p-2 rounded transition-colors flex-1',
                status.isActive
                  ? ATTENDANCE_THEME.operations.read.button
                  : ATTENDANCE_THEME.operations.read.button,
                'text-white text-sm font-medium flex items-center justify-center gap-2'
              )}
              title={status.isActive ? 'Desactivar' : 'Activar'}
            >
              {status.isActive ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Activo</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Inactivo</span>
                </>
              )}
            </button>
          )}

          {/* Botón Editar */}
          {onEdit && (
            <button
              onClick={() => onEdit(status)}
              className={cn(
                'p-2 rounded transition-colors flex-1',
                ATTENDANCE_THEME.operations.update.button,
                'text-white text-sm font-medium flex items-center justify-center gap-2'
              )}
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </button>
          )}

          {/* Botón Eliminar */}
          {onDelete && (
            <button
              onClick={() => onDelete(status.id)}
              className={cn(
                'p-2 rounded transition-colors flex-1',
                ATTENDANCE_THEME.operations.delete.button,
                'text-white text-sm font-medium flex items-center justify-center gap-2'
              )}
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          )}
        </div>
      )}
    </BaseCard>
  );
};