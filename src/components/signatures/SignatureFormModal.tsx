// src/components/signatures/SignatureFormModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Signature, SignatureType, CreateSignatureRequest, UpdateSignatureRequest } from '@/types/signatures.types';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/form/input/Checkbox';

interface SignatureFormModalProps {
  isOpen: boolean;
  signature: Signature | null;
  onClose: () => void;
  onSubmit: (data: CreateSignatureRequest | UpdateSignatureRequest, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

const SIGNATURE_TYPES: { value: SignatureType; label: string }[] = [
  { value: SignatureType.TEACHER, label: 'Docente' },
  { value: SignatureType.DIRECTOR, label: 'Director' },
  { value: SignatureType.COORDINATOR, label: 'Coordinador' },
  { value: SignatureType.PRINCIPAL, label: 'Principal' },
  { value: SignatureType.CUSTOM, label: 'Personalizada' },
];

export default function SignatureFormModal({
  isOpen,
  signature,
  onClose,
  onSubmit,
  loading,
}: SignatureFormModalProps) {
  const [formData, setFormData] = useState<any>({
    type: SignatureType.TEACHER,
    userId: '',
    signatureName: '',
    title: '',
    signatureUrl: '',
    publicId: '',
    isActive: true,
    isDefault: false,
    validFrom: '',
    validUntil: '',
  });

  useEffect(() => {
    if (signature) {
      setFormData({
        type: signature.type,
        userId: signature.userId,
        signatureName: signature.signatureName,
        title: signature.title,
        signatureUrl: signature.signatureUrl,
        publicId: signature.publicId,
        isActive: signature.isActive,
        isDefault: signature.isDefault,
        validFrom: signature.validFrom ? new Date(signature.validFrom).toISOString().split('T')[0] : '',
        validUntil: signature.validUntil ? new Date(signature.validUntil).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        type: SignatureType.TEACHER,
        userId: '',
        signatureName: '',
        title: '',
        signatureUrl: '',
        publicId: '',
        isActive: true,
        isDefault: false,
        validFrom: '',
        validUntil: '',
      });
    }
  }, [signature, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!signature;
      const data = isEdit
        ? {
            signatureName: formData.signatureName,
            title: formData.title,
            signatureUrl: formData.signatureUrl,
            publicId: formData.publicId,
            isActive: formData.isActive,
            isDefault: formData.isDefault,
            validFrom: formData.validFrom || null,
            validUntil: formData.validUntil || null,
          }
        : formData;
      await onSubmit(data, isEdit);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {signature ? 'Editar Firma' : 'Crear Nueva Firma'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!signature && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Firma *</Label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {SIGNATURE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>ID del Usuario *</Label>
                  <Input
                    name="userId"
                    type="number"
                    value={formData.userId}
                    onChange={handleChange}
                    placeholder="Ej: 5"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label>Nombre de la Firma *</Label>
            <Input
              name="signatureName"
              value={formData.signatureName}
              onChange={handleChange}
              placeholder="Ej: María García López"
            />
          </div>

          <div>
            <Label>Título/Cargo *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Docente de Matemáticas"
            />
          </div>

          <div>
            <Label>URL de la Firma *</Label>
            <Input
              name="signatureUrl"
              type="text"
              value={formData.signatureUrl}
              onChange={handleChange}
              placeholder="https://cloudinary.com/..."
            />
          </div>

          <div>
            <Label>Public ID de Cloudinary *</Label>
            <Input
              name="publicId"
              value={formData.publicId}
              onChange={handleChange}
              placeholder="signatures/nombre_usuario_123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Válida desde</Label>
              <Input
                name="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Válida hasta</Label>
              <Input
                name="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={formData.isActive}
                onChange={(checked) => setFormData((prev: any) => ({ ...prev, isActive: checked }))}
              />
              <Label className="mb-0">Activa</Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                checked={formData.isDefault}
                onChange={(checked) => setFormData((prev: any) => ({ ...prev, isDefault: checked }))}
              />
              <Label className="mb-0">Marcar como defecto</Label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : signature ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
