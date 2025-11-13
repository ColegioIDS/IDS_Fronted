// src/components/features/config-status-mapping/ConfigStatusMappingForm.tsx
'use client';

import React from 'react';
import { Loader, AlertCircle, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreateConfigStatusMappingDto, AttendanceConfigDto, AttendanceStatusDto } from '@/types/config-status-mapping.types';

interface ConfigStatusMappingFormProps {
  open: boolean;
  loading: boolean;
  editingId: number | null;
  config: AttendanceConfigDto | null;
  statuses: AttendanceStatusDto[];
  formData: CreateConfigStatusMappingDto;
  onFormDataChange: (data: CreateConfigStatusMappingDto) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const ConfigStatusMappingForm: React.FC<ConfigStatusMappingFormProps> = ({
  open,
  loading,
  editingId,
  config,
  statuses,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            {editingId ? '✏️ Editar Mapeo' : '➕ Crear Nuevo Mapeo'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {editingId
              ? 'Modifica los parámetros de este mapeo de estado'
              : 'Define cómo este estado se procesará en el sistema'}
          </DialogDescription>
        </DialogHeader>

        {!config ? (
          <Alert variant="destructive" className="border-red-300 dark:border-red-800">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-base">Configuración no disponible</AlertTitle>
            <AlertDescription>
              No se pudo cargar la configuración activa. Por favor recarga la página.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6 py-4">
            {/* Config ID Display */}
            <div className="space-y-2">
              <Label className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Configuración
              </Label>
              <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {config.name || `Configuración #${config.id}`}
                </p>
              </div>
            </div>

            {/* Status Select */}
            <div className="space-y-2">
              <Label htmlFor="status" className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Estado de Asistencia <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={String(formData.statusId)}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, statusId: parseInt(value) })
                }
              >
                <SelectTrigger 
                  id="status"
                  className="h-10 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <SelectValue placeholder="Selecciona un estado..." />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={String(status.id)}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full ring-1 ring-slate-300"
                          style={{
                            backgroundColor: status.colorCode || '#94a3b8',
                          }}
                        />
                        <span className="font-medium">{status.code}</span>
                        <span className="text-slate-400">•</span>
                        <span>{status.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Selecciona qué estado de asistencia deseas mapear
              </p>
            </div>

            {/* Mapping Type Select */}
            <div className="space-y-2">
              <Label htmlFor="type" className="font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tipo de Mapeo <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={formData.mappingType}
                onValueChange={(value) =>
                  onFormDataChange({
                    ...formData,
                    mappingType: value as 'negative' | 'notesRequired',
                  })
                }
              >
                <SelectTrigger 
                  id="type"
                  className="h-10 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negative">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-red-600" />
                      <span className="font-bold">Negativo</span>
                      <Badge className="bg-red-600 hover:bg-red-700 text-xs">
                        Reduce asistencia
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="notesRequired">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="font-bold">Requiere Notas</span>
                      <Badge className="bg-amber-600 hover:bg-amber-700 text-xs">
                        Justificación
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo seleccionado:
                </p>
                <div className="flex items-center gap-2">
                  {formData.mappingType === 'negative' ? (
                    <>
                      <Zap className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Negativo</span>
                      <Badge className="bg-red-600 hover:bg-red-700 ml-auto text-xs">
                        Impacto de asistencia
                      </Badge>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Requiere Notas</span>
                      <Badge className="bg-amber-600 hover:bg-amber-700 ml-auto text-xs">
                        Justificación requerida
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 justify-end border-t border-slate-200 dark:border-slate-700">
              <Button 
                variant="outline" 
                onClick={onCancel} 
                disabled={loading}
                className="px-6 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={onSubmit}
                disabled={loading || !config || formData.statusId === 0}
                className="px-6 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {editingId ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : editingId ? (
                  '💾 Actualizar'
                ) : (
                  '✨ Crear Mapeo'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
