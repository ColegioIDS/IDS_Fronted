import React, { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';

interface Enrollment {
  id: number;
  studentId: number;
  cycleId: number;
  gradeId: number;
  sectionId: number;
  status: 'active' | 'graduated' | 'transferred';
}

interface EditEnrollmentModalProps {
  enrollment: Enrollment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Enrollment>) => Promise<void>;
  loading?: boolean;
}

export const EditEnrollmentModal: React.FC<EditEnrollmentModalProps> = ({
  enrollment,
  isOpen,
  onClose,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Enrollment>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (enrollment) {
      setFormData({
        studentId: enrollment.studentId,
        cycleId: enrollment.cycleId,
        gradeId: enrollment.gradeId,
        sectionId: enrollment.sectionId,
        status: enrollment.status,
      });
      setError(null);
    }
  }, [enrollment, isOpen]);

  const handleChange = (field: keyof Enrollment, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  if (!isOpen || !enrollment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Edit2 size={20} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">Editar Matrícula</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Estudiante ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Estudiante
              </label>
              <input
                type="number"
                value={formData.studentId || ''}
                onChange={(e) => handleChange('studentId', parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>

            {/* Ciclo ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Ciclo
              </label>
              <input
                type="number"
                value={formData.cycleId || ''}
                onChange={(e) => handleChange('cycleId', parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>

            {/* Grado ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Grado
              </label>
              <input
                type="number"
                value={formData.gradeId || ''}
                onChange={(e) => handleChange('gradeId', parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>

            {/* Sección ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Sección
              </label>
              <input
                type="number"
                value={formData.sectionId || ''}
                onChange={(e) => handleChange('sectionId', parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => handleChange('status', e.target.value as 'active' | 'graduated' | 'transferred')}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <option value="active">Activo</option>
                <option value="graduated">Graduado</option>
                <option value="transferred">Transferido</option>
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};