// src/components/features/attendance-statuses/AttendanceStatusForm.tsx
'use client';

import { useState } from 'react';
import { AttendanceStatus, CreateAttendanceStatusDto } from '@/types/attendance-status.types';
import { useTheme } from 'next-themes';
import { X } from 'lucide-react';

interface AttendanceStatusFormProps {
  initialData?: AttendanceStatus;
  onSubmit: (data: CreateAttendanceStatusDto | any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AttendanceStatusForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: AttendanceStatusFormProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    colorCode: initialData?.colorCode || '#4CAF50',
    isNegative: initialData?.isNegative || false,
    requiresJustification: initialData?.requiresJustification || false,
    isTemporal: initialData?.isTemporal || false,
    isExcused: initialData?.isExcused || false,
    canHaveNotes: initialData?.canHaveNotes ?? true,
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
  const inputBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const labelColor = isDark ? 'text-slate-300' : 'text-slate-700';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    } else if (formData.code.length > 10) {
      newErrors.code = 'El código no puede exceder 10 caracteres';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3 || formData.name.length > 100) {
      newErrors.name = 'El nombre debe tener entre 3 y 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value) || 0
            : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className={`${bgColor} rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'} p-6`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Código y Nombre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código */}
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ej: P, I, R"
              maxLength={10}
              className={`w-full px-4 py-2 rounded border ${inputBg} ${textColor} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              disabled={isLoading || !!initialData}
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Presente"
              className={`w-full px-4 py-2 rounded border ${inputBg} ${textColor} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className={`block text-sm font-medium ${labelColor} mb-2`}>Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción del estado..."
            rows={3}
            className={`w-full px-4 py-2 rounded border ${inputBg} ${textColor} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none`}
            disabled={isLoading}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Color y Orden */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color */}
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                name="colorCode"
                value={formData.colorCode}
                onChange={handleChange}
                className="h-10 w-14 rounded border-2 border-slate-300 cursor-pointer"
                disabled={isLoading}
              />
              <input
                type="text"
                value={formData.colorCode}
                onChange={handleChange}
                name="colorCode"
                placeholder="#4CAF50"
                className={`flex-1 px-3 py-2 rounded border ${inputBg} ${textColor} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono text-sm`}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Orden */}
          <div>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>Orden</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              max="999"
              className={`w-full px-4 py-2 rounded border ${inputBg} ${textColor} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Checkboxes - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} p-3 rounded transition-colors`}>
            <input
              type="checkbox"
              name="isNegative"
              checked={formData.isNegative}
              onChange={handleChange}
              className="w-4 h-4 rounded cursor-pointer"
              disabled={isLoading}
            />
            <span className={`text-sm font-medium ${labelColor}`}>¿Es una ausencia?</span>
          </label>

          <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} p-3 rounded transition-colors`}>
            <input
              type="checkbox"
              name="requiresJustification"
              checked={formData.requiresJustification}
              onChange={handleChange}
              className="w-4 h-4 rounded cursor-pointer"
              disabled={isLoading}
            />
            <span className={`text-sm font-medium ${labelColor}`}>¿Requiere justificación?</span>
          </label>
        </div>

        {/* Checkboxes - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} p-3 rounded transition-colors`}>
            <input
              type="checkbox"
              name="isTemporal"
              checked={formData.isTemporal}
              onChange={handleChange}
              className="w-4 h-4 rounded cursor-pointer"
              disabled={isLoading}
            />
            <span className={`text-sm font-medium ${labelColor}`}>¿Es temporal?</span>
          </label>

          <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} p-3 rounded transition-colors`}>
            <input
              type="checkbox"
              name="canHaveNotes"
              checked={formData.canHaveNotes}
              onChange={handleChange}
              className="w-4 h-4 rounded cursor-pointer"
              disabled={isLoading}
            />
            <span className={`text-sm font-medium ${labelColor}`}>¿Puede tener notas?</span>
          </label>
        </div>

        {/* Checkboxes - Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} p-3 rounded transition-colors`}>
            <input
              type="checkbox"
              name="isExcused"
              checked={formData.isExcused}
              onChange={handleChange}
              className="w-4 h-4 rounded cursor-pointer"
              disabled={isLoading}
            />
            <span className={`text-sm font-medium ${labelColor}`}>¿Es excusado?</span>
          </label>

          <label className={`flex items-center gap-3 cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} p-3 rounded transition-colors`}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded cursor-pointer"
              disabled={isLoading}
            />
            <span className={`text-sm font-medium ${labelColor}`}>¿Está activo?</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-700">
          <button
            type="button"
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
            type="submit"
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded font-medium text-white transition-colors ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};
