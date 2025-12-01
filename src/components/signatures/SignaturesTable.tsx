// src/components/signatures/SignaturesTable.tsx
'use client';

import React from 'react';
import { Signature, SignatureType } from '@/types/signatures.types';
import Image from 'next/image';
import Button from '@/components/ui/button/Button';

interface SignaturesTableProps {
  signatures: Signature[];
  loading: boolean;
  onEdit: (signature: Signature) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
}

const getTypeLabel = (type: SignatureType) => {
  const labels: Record<SignatureType, string> = {
    TEACHER: 'Docente',
    DIRECTOR: 'Director',
    COORDINATOR: 'Coordinador',
    PRINCIPAL: 'Principal',
    CUSTOM: 'Personalizada',
  };
  return labels[type] || type;
};

const getTypeColor = (type: SignatureType) => {
  const colors: Record<SignatureType, string> = {
    TEACHER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    DIRECTOR: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    COORDINATOR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    PRINCIPAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    CUSTOM: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return colors[type] || '';
};

export default function SignaturesTable({
  signatures,
  loading,
  onEdit,
  onDelete,
  onSetDefault,
}: SignaturesTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (signatures.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No hay firmas registradas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Nombre</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Título</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Firma</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Estado</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Defecto</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {signatures.map((signature) => (
            <tr
              key={signature.id}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {signature.signatureName}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                    signature.type
                  )}`}
                >
                  {getTypeLabel(signature.type)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{signature.title}</td>
              <td className="px-6 py-4">
                {signature.signatureUrl && (
                  <div className="relative w-16 h-8">
                    <Image
                      src={signature.signatureUrl}
                      alt={signature.signatureName}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    signature.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {signature.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="px-6 py-4">
                {signature.isDefault && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    ⭐ Defecto
                  </span>
                )}
                {!signature.isDefault && (
                  <button
                    onClick={() => onSetDefault(signature.id)}
                    className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-semibold"
                  >
                    Marcar como defecto
                  </button>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(signature)}
                    className="px-3 py-1 text-xs bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200 rounded hover:bg-brand-200 dark:hover:bg-brand-800 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que deseas eliminar esta firma?')) {
                        onDelete(signature.id);
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
