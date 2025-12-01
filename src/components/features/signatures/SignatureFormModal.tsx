// src/components/features/signatures/SignatureFormModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Signature, SignatureType, CreateSignatureRequest, UpdateSignatureRequest } from '@/types/signatures.types';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/form/input/Checkbox';
import { signaturesService } from '@/services/signatures.service';
import { toast } from 'sonner';
import { Camera, Loader2, AlertCircle, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface User {
  id: number;
  givenNames: string;
  lastNames: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
}

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
    isActive: true,
    isDefault: false,
    validFrom: '',
    validUntil: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Cargar usuarios disponibles
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await signaturesService.getAvailableUsers();
      // El servicio retorna { data: [...] } o directamente [...]
      const usersList = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      setUsers(usersList);
      if (usersList.length === 0) {
        toast.warning('No hay usuarios disponibles para asignar firmas');
      }
    } catch (error: any) {
      toast.error('Error al cargar usuarios: ' + error.message);
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Cargar datos de firma si está editando
  useEffect(() => {
    if (signature && isOpen) {
      setFormData({
        type: signature.type,
        userId: signature.userId,
        signatureName: signature.signatureName,
        title: signature.title,
        isActive: signature.isActive,
        isDefault: signature.isDefault,
        validFrom: signature.validFrom ? new Date(signature.validFrom).toISOString().split('T')[0] : '',
        validUntil: signature.validUntil ? new Date(signature.validUntil).toISOString().split('T')[0] : '',
      });
      setPreviewUrl(signature.signatureUrl);
      setSelectedFile(null);
    } else {
      setFormData({
        type: SignatureType.TEACHER,
        userId: '',
        signatureName: '',
        title: '',
        isActive: true,
        isDefault: false,
        validFrom: '',
        validUntil: '',
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [signature, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!signature;

      // Validar que la imagen sea obligatoria en creación
      if (!isEdit && !selectedFile && !previewUrl) {
        toast.error('Debes seleccionar una imagen de firma');
        return;
      }

      const data: any = isEdit
        ? {
            signatureName: formData.signatureName,
            title: formData.title,
            isActive: formData.isActive,
            isDefault: formData.isDefault,
            validFrom: formData.validFrom || null,
            validUntil: formData.validUntil || null,
          }
        : {
            type: formData.type,
            userId: parseInt(formData.userId, 10),
            signatureName: formData.signatureName,
            title: formData.title,
            isActive: formData.isActive,
            isDefault: formData.isDefault,
            validFrom: formData.validFrom || null,
            validUntil: formData.validUntil || null,
          };

      // Agregar archivo si está disponible
      if (selectedFile) {
        data.signatureFile = selectedFile;
      }

      await onSubmit(data, isEdit);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50/50 via-transparent to-blue-50/50 dark:from-slate-800/50 dark:via-transparent dark:to-slate-800/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {signature ? 'Editar Firma' : 'Crear Nueva Firma'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sección de Imagen */}
          <div className="flex flex-col items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
            <div className="relative group">
              <div className="rounded-lg p-1 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Vista previa de firma"
                    className="h-32 w-32 object-cover rounded-md border-2 border-white dark:border-slate-900"
                  />
                ) : (
                  <div className="h-32 w-32 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-slate-400" />
                  </div>
                )}
              </div>
              <label
                htmlFor="signature-input"
                className="absolute -bottom-2 -right-2 rounded-full bg-blue-600 dark:bg-blue-700 p-2 shadow-lg cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
              >
                <Camera className="h-4 w-4 text-white" />
                <span className="sr-only">Cambiar firma</span>
              </label>
              <input
                id="signature-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="hidden"
              />
            </div>
            <div className="text-center text-sm">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                Haz clic en el ícono de cámara para cambiar la firma
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Formatos: JPG, PNG • Máximo 5MB
              </p>
            </div>
            {selectedFile && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700/50 rounded-lg p-3 w-full">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 truncate">
                    {selectedFile.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Crear Nueva */}
          {!signature && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Firma *</Label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SIGNATURE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Usuario *</Label>
                  {loadingUsers ? (
                    <div className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando usuarios...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
                      No hay usuarios disponibles
                    </div>
                  ) : (
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      disabled={loadingUsers}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                    >
                      <option value="">Selecciona un usuario</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.givenNames} {user.lastNames} ({user.role.name})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Campos comunes */}
          <div>
            <Label>Nombre de la Firma *</Label>
            <Input
              name="signatureName"
              value={formData.signatureName}
              onChange={handleChange}
              placeholder="Ej: María García López"
              disabled={loading}
            />
          </div>

          <div>
            <Label>Título/Cargo *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Docente de Matemáticas"
              disabled={loading}
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Válida desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={loading}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-colors disabled:opacity-50"
                  >
                    <span>
                      {formData.validFrom
                        ? format(new Date(formData.validFrom), 'PPP', { locale: es })
                        : 'Selecciona una fecha'}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.validFrom ? new Date(formData.validFrom) : undefined}
                    onSelect={(date) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        validFrom: date ? format(date, 'yyyy-MM-dd') : '',
                      }));
                    }}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Válida hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={loading}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-colors disabled:opacity-50"
                  >
                    <span>
                      {formData.validUntil
                        ? format(new Date(formData.validUntil), 'PPP', { locale: es })
                        : 'Selecciona una fecha'}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.validUntil ? new Date(formData.validUntil) : undefined}
                    onSelect={(date) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        validUntil: date ? format(date, 'yyyy-MM-dd') : '',
                      }));
                    }}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={formData.isActive}
                onChange={(checked) => setFormData((prev: any) => ({ ...prev, isActive: checked }))}
                disabled={loading}
              />
              <Label className="mb-0 cursor-pointer">Activa</Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                checked={formData.isDefault}
                onChange={(checked) => setFormData((prev: any) => ({ ...prev, isDefault: checked }))}
                disabled={loading}
              />
              <Label className="mb-0 cursor-pointer">Marcar como defecto</Label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {signature ? 'Actualizar' : 'Crear'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
