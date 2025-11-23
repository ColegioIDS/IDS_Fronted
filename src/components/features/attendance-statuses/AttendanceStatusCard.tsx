// src/components/features/attendance-statuses/AttendanceStatusCard.tsx

'use client';

import { AttendanceStatus } from '@/types/attendance-status.types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
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
  const statusTypeStyle = getStatusTypeStyle(status.isNegative, status.isExcused, status.isTemporal);

  const getStatusIcon = () => {
    if (status.isExcused) return <CheckCircle2 className="w-5 h-5" />;
    if (status.isNegative) return <XCircle className="w-5 h-5" />;
    if (status.isTemporal) return <Clock className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  if (isCompact) {
    return (
      <div
        className={cn(
          'p-3 rounded-lg border-2 transition-all duration-200',
          'hover:shadow-md dark:hover:shadow-lg',
          'bg-white dark:bg-slate-900',
          'border-slate-200 dark:border-slate-700'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white dark:border-slate-900 shadow-sm"
            style={{ backgroundColor: status.colorCode || '#9CA3AF' }}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {status.code}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {status.name}
            </p>
          </div>
          <div className={cn('flex-shrink-0', statusTypeStyle.color)}>
            {getStatusIcon()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <BaseCard className={cn(
      'group overflow-hidden transition-all duration-200',
      statusTypeStyle.bg,
      'border-2 border-slate-200 dark:border-slate-700',
      'hover:shadow-lg dark:hover:shadow-2xl'
    )}>
      <div className="flex items-start justify-between mb-6 pb-6 border-b-2 border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={cn(
              'w-14 h-14 rounded-xl border-2 border-white dark:border-slate-800',
              'flex items-center justify-center flex-shrink-0',
              'font-bold text-white shadow-lg',
              'text-lg'
            )}
            style={{ backgroundColor: status.colorCode || '#9CA3AF' }}
          >
            {status.code}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
              {status.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
              {status.description || 'Sin descripción'}
            </p>
            <div className="flex gap-4 mt-3 text-xs">
              <span
                className={cn(
                  'px-2 py-1 rounded-full font-medium',
                  status.isActive
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                )}
              >
                {status.isActive ? '✓ Activo' : '✕ Inactivo'}
              </span>
              <span className="px-2 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                Orden: {status.order}
              </span>
            </div>
          </div>
        </div>

        <div className={cn('flex-shrink-0', statusTypeStyle.color)}>
          {getStatusIcon()}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {status.isNegative && (
          <span className={cn(
            'px-3 py-1.5 text-xs font-semibold rounded-full',
            'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200',
            'border border-red-200 dark:border-red-700'
          )}>
            🚫 Ausencia
          </span>
        )}

        {status.requiresJustification && (
          <span className={cn(
            'px-3 py-1.5 text-xs font-semibold rounded-full',
            'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200',
            'border border-amber-200 dark:border-amber-700'
          )}>
            📋 Justificación
          </span>
        )}

        {status.isTemporal && (
          <span className={cn(
            'px-3 py-1.5 text-xs font-semibold rounded-full',
            'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200',
            'border border-orange-200 dark:border-orange-700'
          )}>
            ⏱️ Temporal
          </span>
        )}

        {status.isExcused && (
          <span className={cn(
            'px-3 py-1.5 text-xs font-semibold rounded-full',
            'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200',
            'border border-blue-200 dark:border-blue-700'
          )}>
            ✓ Excusado
          </span>
        )}

        {status.canHaveNotes && (
          <span className={cn(
            'px-3 py-1.5 text-xs font-semibold rounded-full',
            'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200',
            'border border-purple-200 dark:border-purple-700'
          )}>
            📝 Notas
          </span>
        )}
      </div>

      {(onEdit || onDelete || onToggleActive) && (
        <div
          className={cn(
            'flex gap-2 pt-6 border-t-2 border-slate-200 dark:border-slate-700',
            'opacity-0 group-hover:opacity-100 transition-all duration-200'
          )}
        >
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(status.id, !status.isActive)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg transition-all duration-200',
                'font-semibold text-sm flex items-center justify-center gap-2',
                'text-white border-2 border-transparent',
                status.isActive
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg'
                  : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg'
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

          {onEdit && (
            <button
              onClick={() => onEdit(status)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg transition-all duration-200',
                'font-semibold text-sm flex items-center justify-center gap-2',
                'text-white border-2 border-transparent',
                'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md hover:shadow-lg'
              )}
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Editar</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(status.id)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg transition-all duration-200',
                'font-semibold text-sm flex items-center justify-center gap-2',
                'text-white border-2 border-transparent',
                'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg'
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
