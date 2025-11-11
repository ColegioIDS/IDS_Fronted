// src/components/features/attendance-statuses/AttendanceStatusCard.tsx
'use client';

import { AttendanceStatus } from '@/types/attendance-status.types';
import { useTheme } from 'next-themes';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

interface AttendanceStatusCardProps {
  status: AttendanceStatus;
  onEdit?: (status: AttendanceStatus) => void;
  onDelete?: (id: number) => void;
  isCompact?: boolean;
}

export const AttendanceStatusCard = ({
  status,
  onEdit,
  onDelete,
  isCompact = false,
}: AttendanceStatusCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-600';
  const hoverColor = isDark
    ? 'hover:bg-slate-700 hover:border-slate-600'
    : 'hover:bg-slate-50 hover:border-slate-300';

  const getStatusIcon = () => {
    if (status.isExcused) return <Check className="w-5 h-5 text-blue-500" />;
    if (status.isNegative) return <X className="w-5 h-5 text-red-500" />;
    if (status.isTemporal) return <Clock className="w-5 h-5 text-orange-500" />;
    return <AlertCircle className="w-5 h-5 text-slate-500" />;
  };

  if (isCompact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${bgColor} ${hoverColor} transition-colors`}
      >
        <div
          className="w-4 h-4 rounded-full border-2"
          style={{
            backgroundColor: status.colorCode || '#9CA3AF',
            borderColor: status.colorCode || '#9CA3AF',
          }}
        />
        <div className="flex-1">
          <p className={`font-medium ${textColor}`}>{status.code}</p>
          <p className={`text-sm ${mutedColor}`}>{status.name}</p>
        </div>
        {getStatusIcon()}
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-lg border ${bgColor} ${hoverColor} transition-all duration-200 group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
            style={{
              backgroundColor: status.colorCode || '#9CA3AF',
              borderColor: status.colorCode || '#9CA3AF',
            }}
          >
            <span className={`text-sm font-bold text-white`}>{status.code}</span>
          </div>
          <div>
            <h3 className={`font-semibold ${textColor}`}>{status.name}</h3>
            <p className={`text-sm ${mutedColor}`}>{status.description || 'Sin descripción'}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${mutedColor}`}>Estado:</span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              status.isActive
                ? isDark
                  ? 'bg-green-900 text-green-200'
                  : 'bg-green-100 text-green-800'
                : isDark
                  ? 'bg-red-900 text-red-200'
                  : 'bg-red-100 text-red-800'
            }`}
          >
            {status.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${mutedColor}`}>Orden:</span>
          <span className={`text-xs font-medium ${textColor}`}>{status.order}</span>
        </div>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {status.isNegative && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
            }`}
          >
            Ausencia
          </span>
        )}
        {status.requiresJustification && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            Requiere Justificación
          </span>
        )}
        {status.isTemporal && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              isDark ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800'
            }`}
          >
            Temporal
          </span>
        )}
        {status.isExcused && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
            }`}
          >
            Excusado
          </span>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 pt-3 border-t border-slate-600 group-hover:block hidden">
          {onEdit && (
            <button
              onClick={() => onEdit(status)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(status.id)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                isDark
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
