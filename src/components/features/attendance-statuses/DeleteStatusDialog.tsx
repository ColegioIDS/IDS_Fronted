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
  const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderColor = isDark ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`fixed inset-0 ${overlayColor} flex items-center justify-center z-50 p-4`}>
      <div
        className={`${bgColor} rounded-xl shadow-xl p-6 max-w-sm w-full border ${borderColor} transform transition-all`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950/30">
            <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Content */}
        <h3 className={`text-lg font-bold text-center ${textColor} mb-2`}>
          Eliminar estado de asistencia
        </h3>
        <p className={`text-center ${mutedColor} mb-6 text-sm leading-relaxed`}>
          Esta acción eliminará permanentemente el estado <strong className="text-slate-900 dark:text-slate-100 font-semibold">{statusName}</strong>. Esta acción no se puede deshacer.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition-colors text-sm ${
              isDark
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-700'
                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};