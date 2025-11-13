// src/components/features/attendance-config/components/ConfigField.tsx
'use client';

import React from 'react';
import { ATTENDANCE_CONFIG_THEME } from '../attendance-config-theme';

interface ConfigFieldProps {
  label: string;
  value: string | number | boolean;
  editValue?: string | number | boolean;
  isEditing?: boolean;
  onChange?: (value: any) => void;
  type?: 'text' | 'number' | 'time' | 'checkbox' | 'percentage';
  min?: number;
  max?: number;
  placeholder?: string;
  helperText?: string;
  error?: string;
  compact?: boolean;
  inline?: boolean;
}

export const ConfigField: React.FC<ConfigFieldProps> = ({
  label,
  value,
  editValue,
  isEditing = false,
  onChange,
  type = 'text',
  min,
  max,
  placeholder,
  helperText,
  error,
  compact = false,
  inline = false,
}) => {
  if (!isEditing) {
    // Vista de solo lectura
    return (
      <div className={inline ? 'flex items-center justify-between gap-4' : ''}>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div
          className={`
            ${inline ? 'text-right' : 'mt-2 p-3 rounded-md'}
            ${ATTENDANCE_CONFIG_THEME.base.bg.secondary}
            ${ATTENDANCE_CONFIG_THEME.base.text.primary}
            font-semibold
          `}
        >
          {typeof value === 'boolean' ? (
            <span className={value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {value ? '✓ Sí' : '✗ No'}
            </span>
          ) : type === 'percentage' ? (
            <span>{value}%</span>
          ) : type === 'time' ? (
            <span>{value}</span>
          ) : (
            <span>{value}</span>
          )}
        </div>
        {helperText && (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }

  // Modo edición
  if (type === 'checkbox') {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={editValue as boolean}
          onChange={(e) => onChange?.(e.target.checked)}
          className="w-5 h-5 rounded cursor-pointer"
        />
        <div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </span>
          {helperText && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {helperText}
            </p>
          )}
        </div>
      </label>
    );
  }

  return (
    <div className={compact ? '' : 'space-y-2'}>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        type={type === 'percentage' ? 'number' : type}
        value={String(editValue ?? '')}
        onChange={(e) => {
          let val: any = e.target.value;
          if (type === 'number' || type === 'percentage') {
            val = val === '' ? '' : parseInt(val, 10);
          }
          onChange?.(val);
        }}
        min={min}
        max={max}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 rounded-md border-2 outline-none
          transition-colors duration-200
          ${
            error
              ? `${ATTENDANCE_CONFIG_THEME.validation.error.border} ${ATTENDANCE_CONFIG_THEME.validation.error.bg}`
              : `${ATTENDANCE_CONFIG_THEME.base.border.light} ${ATTENDANCE_CONFIG_THEME.base.bg.primary}`
          }
          focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          dark:focus:ring-offset-slate-900
          ${ATTENDANCE_CONFIG_THEME.base.text.primary}
          text-sm
        `}
      />
      {error && (
        <p className={`text-xs ${ATTENDANCE_CONFIG_THEME.validation.error.text}`}>
          ⚠️ {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
