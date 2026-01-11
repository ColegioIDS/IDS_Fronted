// src/components/features/signatures/SignaturesTable.tsx
'use client';

import React, { useState } from 'react';
import { Signature, SignatureType } from '@/types/signatures.types';
import Image from 'next/image';
import Button from '@/components/ui/button/Button';
import { Edit2, Trash2, Star, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface SignaturesTableProps {
  filters?: {
    search: string;
    type: string;
    status: string;
  };
  onView?: (signature: any) => void;
  onEdit?: (signature: any) => void;
  onDelete?: (signature: any) => void;
  onSetDefault?: (signature: any) => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canSetDefault?: boolean;
  signatures?: Signature[];
  loading?: boolean;
}

const ITEMS_PER_PAGE = 10;

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
  filters,
  onView,
  onEdit,
  onDelete,
  onSetDefault,
  canView = false,
  canEdit = false,
  canDelete = false,
  canSetDefault = false,
  signatures = [],
  loading = false,
}: SignaturesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (signatures.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">No hay firmas registradas</p>
      </div>
    );
  }

  // Paginación
  const totalPages = Math.ceil(signatures.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSignatures = signatures.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Nombre</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Tipo</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Título</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Firma</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Estado</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Defecto</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSignatures.map((signature) => (
              <tr
                key={signature.id}
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
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
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{signature.title}</td>
                <td className="px-6 py-4">
                  {signature.signatureUrl && (
                    <button
                      onClick={() => setSelectedImage({ url: signature.signatureUrl, name: signature.signatureName })}
                      className="relative w-16 h-8 hover:opacity-75 transition-opacity group cursor-pointer"
                      title="Click para ver a tamaño completo"
                    >
                      <Image
                        src={signature.signatureUrl}
                        alt={signature.signatureName}
                        fill
                        className="object-contain"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn className="h-4 w-4 text-white" />
                      </div>
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      signature.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${signature.isActive ? 'bg-green-600' : 'bg-slate-600'}`}></div>
                    {signature.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {signature.isDefault && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <Star className="h-3 w-3 fill-current" />
                      Defecto
                    </span>
                  )}
                  {!signature.isDefault && (
                    <button
                      onClick={() => onSetDefault?.(signature)}
                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-semibold transition-colors"
                    >
                      <Star className="h-3 w-3" />
                      Marcar defecto
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit?.(signature)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de que deseas eliminar esta firma?')) {
                          onDelete?.(signature);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Mostrando {startIndex + 1} a {Math.min(endIndex, signatures.length)} de {signatures.length} firmas
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white dark:bg-blue-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative bg-white rounded-lg shadow-2xl w-11/12 h-5/6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-slate-100 transition-colors shadow-md"
              title="Cerrar"
            >
              <X className="h-6 w-6 text-slate-700" />
            </button>

            {/* Image Container */}
            <div className="w-full h-full bg-slate-50 flex items-center justify-center p-8 relative">
              <Image
                src={selectedImage.url}
                alt={selectedImage.name}
                fill
                className="object-contain p-8"
                priority
                unoptimized
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-3 border-t">
              <p className="text-sm text-slate-600 font-medium">{selectedImage.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
