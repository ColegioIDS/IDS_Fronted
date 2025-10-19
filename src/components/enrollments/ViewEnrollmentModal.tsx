import React from 'react';
import { X, Eye } from 'lucide-react';
import { Enrollment } from '@/hooks/useEnrollment';

interface ViewEnrollmentModalProps {
  enrollment: Enrollment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewEnrollmentModal: React.FC<ViewEnrollmentModalProps> = ({
  enrollment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !enrollment) return null;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Activo',
      graduated: 'Graduado',
      transferred: 'Transferido',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'text-green-600 bg-green-50',
      graduated: 'text-blue-600 bg-blue-50',
      transferred: 'text-purple-600 bg-purple-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Detalles de Matrícula</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ID */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">ID</label>
            <p className="text-gray-900 font-medium">{enrollment.id}</p>
          </div>

          {/* Estudiante */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Estudiante</label>
            <p className="text-gray-900 font-medium">{enrollment.student?.name || 'N/A'}</p>
            <p className="text-xs text-gray-500">ID: {enrollment.studentId}</p>
          </div>

          {/* Ciclo */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Ciclo</label>
            <p className="text-gray-900 font-medium">{enrollment.cycle?.name || 'N/A'}</p>
          </div>

          {/* Grado */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Grado</label>
            <p className="text-gray-900 font-medium">{enrollment.grade?.name || 'N/A'}</p>
          </div>

          {/* Sección */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Sección</label>
            <p className="text-gray-900 font-medium">{enrollment.section?.name || 'N/A'}</p>
          </div>

          {/* Estado */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enrollment.status)}`}>
              {getStatusLabel(enrollment.status)}
            </span>
          </div>

          {/* Fecha de Matrícula */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Fecha de Matrícula</label>
            <p className="text-gray-900 font-medium">
              {new Date(enrollment.enrollmentDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};