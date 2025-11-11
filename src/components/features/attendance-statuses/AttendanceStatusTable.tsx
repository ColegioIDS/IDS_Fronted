// src/components/features/attendance-statuses/AttendanceStatusTable.tsx
'use client';

import { AttendanceStatus } from '@/types/attendance-status.types';
import { useTheme } from 'next-themes';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface AttendanceStatusTableProps {
  statuses: AttendanceStatus[];
  loading?: boolean;
  onEdit?: (status: AttendanceStatus) => void;
  onDelete?: (id: number) => void;
  onToggleActive?: (id: number, isActive: boolean) => void;
}

export const AttendanceStatusTable = ({
  statuses,
  loading = false,
  onEdit,
  onDelete,
  onToggleActive,
}: AttendanceStatusTableProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const headerBg = isDark ? 'bg-slate-800' : 'bg-slate-100';
  const rowBg = isDark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-white hover:bg-slate-50';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-600';

  if (loading) {
    return (
      <div className={`rounded-lg border ${borderColor} p-8 text-center ${mutedColor}`}>
        Cargando estados de asistencia...
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className={`rounded-lg border ${borderColor} p-8 text-center ${mutedColor}`}>
        No hay estados de asistencia registrados
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto border ${borderColor} rounded-lg`}>
      <table className="w-full">
        {/* Header */}
        <thead>
          <tr className={`${headerBg} border-b ${borderColor}`}>
            <th className={`px-6 py-3 text-left text-sm font-semibold ${textColor}`}>Código</th>
            <th className={`px-6 py-3 text-left text-sm font-semibold ${textColor}`}>Nombre</th>
            <th className={`px-6 py-3 text-left text-sm font-semibold ${textColor}`}>Color</th>
            <th className={`px-6 py-3 text-center text-sm font-semibold ${textColor}`}>Orden</th>
            <th className={`px-6 py-3 text-center text-sm font-semibold ${textColor}`}>Ausencia</th>
            <th className={`px-6 py-3 text-center text-sm font-semibold ${textColor}`}>
              Requiere Just.
            </th>
            <th className={`px-6 py-3 text-center text-sm font-semibold ${textColor}`}>Estado</th>
            <th className={`px-6 py-3 text-right text-sm font-semibold ${textColor}`}>Acciones</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-700">
          {statuses.map((status) => (
            <tr key={status.id} className={`${rowBg} transition-colors`}>
              {/* Código */}
              <td className={`px-6 py-4 text-sm font-medium ${textColor}`}>{status.code}</td>

              {/* Nombre */}
              <td className={`px-6 py-4 text-sm ${textColor}`}>
                <div>
                  <p className="font-medium">{status.name}</p>
                  <p className={`text-xs ${mutedColor}`}>{status.description || '-'}</p>
                </div>
              </td>

              {/* Color */}
              <td className={`px-6 py-4 text-sm`}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border-2"
                    style={{
                      backgroundColor: status.colorCode || '#9CA3AF',
                      borderColor: status.colorCode || '#9CA3AF',
                    }}
                  />
                  <span className={`text-xs font-mono ${mutedColor}`}>
                    {status.colorCode || 'N/A'}
                  </span>
                </div>
              </td>

              {/* Orden */}
              <td className={`px-6 py-4 text-sm text-center ${textColor}`}>{status.order}</td>

              {/* Ausencia */}
              <td className={`px-6 py-4 text-sm text-center`}>
                {status.isNegative ? (
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Sí
                  </span>
                ) : (
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    No
                  </span>
                )}
              </td>

              {/* Requiere Justificación */}
              <td className={`px-6 py-4 text-sm text-center`}>
                {status.requiresJustification ? (
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    Sí
                  </span>
                ) : (
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    No
                  </span>
                )}
              </td>

              {/* Estado */}
              <td className={`px-6 py-4 text-sm text-center`}>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
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
              </td>

              {/* Acciones */}
              <td className={`px-6 py-4 text-sm text-right`}>
                <div className="flex items-center justify-end gap-2">
                  {onToggleActive && (
                    <button
                      onClick={() => onToggleActive(status.id, !status.isActive)}
                      className={`p-2 rounded transition-colors ${
                        isDark
                          ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                          : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                      title={status.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {status.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {onEdit && (
                    <button
                      onClick={() => onEdit(status)}
                      className={`p-2 rounded transition-colors ${
                        isDark
                          ? 'hover:bg-blue-900 text-blue-400 hover:text-blue-200'
                          : 'hover:bg-blue-100 text-blue-600 hover:text-blue-900'
                      }`}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={() => onDelete(status.id)}
                      className={`p-2 rounded transition-colors ${
                        isDark
                          ? 'hover:bg-red-900 text-red-400 hover:text-red-200'
                          : 'hover:bg-red-100 text-red-600 hover:text-red-900'
                      }`}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
