// src/components/features/attendance-config/components/ConfigActions.tsx
'use client';

import React, { useState } from 'react';
import { Edit, RotateCcw, Trash2, RefreshCw, ChevronDown } from 'lucide-react';

interface ConfigActionsProps {
  onEdit: () => void;
  onReset?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  compact?: boolean;
  showMore?: boolean;
  canModify?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
}

const buttonBaseClasses = 'px-5 py-3.5 text-sm inline-flex items-center justify-center font-medium gap-2 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50';
const primaryClasses = 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300';
const outlineClasses = 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300';
const ghostClasses = 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700';
const destructiveClasses = 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20';

export const ConfigActions: React.FC<ConfigActionsProps> = ({
  onEdit,
  onReset,
  onDelete,
  onRefresh,
  loading = false,
  compact = false,
  showMore = false,
  canModify = true,
  canDelete = true,
  canRestore = true,
}) => {
  const [showMenuMore, setShowMenuMore] = useState(false);

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenuMore(!showMenuMore)}
          disabled={loading}
          className={`${buttonBaseClasses} ${outlineClasses} px-3 py-2`}
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {showMenuMore && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
            {canModify && (
              <button
                onClick={() => {
                  onEdit();
                  setShowMenuMore(false);
                }}
                disabled={loading}
                className={`${ghostClasses} w-full justify-start px-4 py-2 text-left`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
            )}

            {onRefresh && (
              <button
                onClick={() => {
                  onRefresh();
                  setShowMenuMore(false);
                }}
                disabled={loading}
                className={`${ghostClasses} w-full justify-start px-4 py-2 text-left disabled:opacity-50`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
            )}

            {onReset && canRestore && (
              <button
                onClick={() => {
                  onReset();
                  setShowMenuMore(false);
                }}
                disabled={loading}
                className={`${ghostClasses} w-full justify-start px-4 py-2 text-left`}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar
              </button>
            )}

            {onDelete && canDelete && (
              <button
                onClick={() => {
                  onDelete();
                  setShowMenuMore(false);
                }}
                disabled={loading}
                className={`${destructiveClasses} w-full justify-start px-4 py-2 text-left`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {canModify && (
        <button
          onClick={onEdit}
          disabled={loading}
          className={`${buttonBaseClasses} ${primaryClasses}`}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </button>
      )}

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`${buttonBaseClasses} ${outlineClasses}`}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </button>
      )}

      {onReset && canRestore && (
        <button
          onClick={onReset}
          disabled={loading}
          className={`${buttonBaseClasses} ${outlineClasses}`}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar
        </button>
      )}

      {onDelete && canDelete && (
        <button
          onClick={onDelete}
          disabled={loading}
          className={`${buttonBaseClasses} ${destructiveClasses}`}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </button>
      )}
    </div>
  );
};
