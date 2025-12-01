// src/app/(admin)/signatures/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSignatures } from '@/hooks/useSignatures';
import { Signature, SignatureType, CreateSignatureRequest, UpdateSignatureRequest } from '@/types/signatures.types';
import SignaturesTable from '@/components/features/signatures/SignaturesTable';
import SignatureFormModal from '@/components/features/signatures/SignatureFormModal';
import Button from '@/components/ui/button/Button';
import { toast } from 'sonner';

export default function SignaturesPage() {
  const { signatures = [], loading, error, fetchSignatures, createSignature, updateSignature, deleteSignature, setDefaultSignature } = useSignatures();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);
  const [filterType, setFilterType] = useState<SignatureType | ''>('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Cargar firmas al montar el componente
  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  // Filtrar firmas según el tipo seleccionado
  const filteredSignatures = filterType
    ? signatures.filter((sig) => sig.type === filterType)
    : signatures;

  const handleOpenModal = (signature?: Signature) => {
    setSelectedSignature(signature || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSignature(null);
  };

  const handleFormSubmit = async (data: CreateSignatureRequest | UpdateSignatureRequest, isEdit: boolean) => {
    setSubmitLoading(true);
    try {
      if (isEdit && selectedSignature) {
        await updateSignature(selectedSignature.id, data as UpdateSignatureRequest);
        toast.success('Firma actualizada correctamente');
      } else {
        await createSignature(data as CreateSignatureRequest);
        toast.success('Firma creada correctamente');
      }
      handleCloseModal();
      await fetchSignatures();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la firma';
      toast.error(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSignature(id);
      toast.success('Firma eliminada correctamente');
      await fetchSignatures();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la firma';
      toast.error(errorMessage);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultSignature(id);
      toast.success('Firma marcada como defecto');
      await fetchSignatures();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al marcar como defecto';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full h-full p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Firmas</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Administra las firmas digitales para cartas de notas y documentos académicos
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg"
          >
            + Crear Nueva Firma
          </Button>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterType('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === ''
                ? 'bg-brand-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todas
          </button>
          {(['TEACHER', 'DIRECTOR', 'COORDINATOR', 'PRINCIPAL', 'CUSTOM'] as SignatureType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === type
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>

        {/* Contenido principal */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg mb-4">
              {error}
            </div>
          )}

          <SignaturesTable
            signatures={filteredSignatures}
            loading={loading}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        </div>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Total de Firmas</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{signatures?.length ?? 0}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">Firmas Activas</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {signatures?.filter((s) => s.isActive).length ?? 0}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1">Por Defecto</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {signatures?.filter((s) => s.isDefault).length ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Modal del formulario */}
      <SignatureFormModal
        isOpen={isModalOpen}
        signature={selectedSignature}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        loading={submitLoading}
      />
    </div>
  );
}

function getTypeLabel(type: SignatureType) {
  const labels: Record<SignatureType, string> = {
    TEACHER: 'Docente',
    DIRECTOR: 'Director',
    COORDINATOR: 'Coordinador',
    PRINCIPAL: 'Principal',
    CUSTOM: 'Personalizada',
  };
  return labels[type] || type;
}
