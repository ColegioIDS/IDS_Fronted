// src/components/features/attendance-statuses/DeleteStatusDialog.tsx
'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { AlertTriangle } from 'lucide-react';

interface DeleteStatusDialogProps {
  isOpen: boolean;
  statusName: string;
  isLoading?: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const DeleteStatusDialog = ({
  isOpen,
  statusName,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteStatusDialogProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const overlayColor = isDark ? 'bg-black/50' : 'bg-black/30';
  const bgColor = isDark ? 'bg-slate-800' : 'bg-white';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className={`fixed inset-0 ${overlayColor} flex items-center justify-center z-50`}>
      <div
        className={`${bgColor} rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-200" />
          </div>
        </div>

        {/* Content */}
        <h3 className={`text-lg font-semibold text-center ${textColor} mb-2`}>
          ¿Eliminar estado de asistencia?
        </h3>
        <p className={`text-center ${mutedColor} mb-6`}>
          Esta acción eliminará permanentemente el estado <strong>{statusName}</strong>. Esta acción no se puede
          deshacer.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
              isDark
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded font-medium text-white transition-colors ${
              isDark
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-700'
                : 'bg-red-500 hover:bg-red-600 disabled:bg-red-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};
