// src/components/features/school-cycles/ArchiveReasonDialog.tsx

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SchoolCycle } from '@/types/school-cycle.types';
import { Lock } from 'lucide-react';

interface ArchiveReasonDialogProps {
  /**
   * Ciclo a archivar (null si dialog está cerrado)
   */
  cycle: SchoolCycle | null;

  /**
   * Dialog abierto/cerrado
   */
  open: boolean;

  /**
   * Callback cuando el usuario confirma el archivo
   * @param reason - Razón del archivo (puede ser vacía)
   */
  onConfirm: (reason: string) => Promise<void>;

  /**
   * Callback cuando el usuario cancela
   */
  onCancel: () => void;

  /**
   * Si está cargando (desabilita inputs)
   */
  isLoading?: boolean;
}

export function ArchiveReasonDialog({
  cycle,
  open,
  onConfirm,
  onCancel,
  isLoading = false,
}: ArchiveReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Manejar cierre del dialog (limpiar estado)
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason('');
      setError(null);
      onCancel();
    }
  };

  /**
   * Validar y confirmar archivo
   */
  const handleConfirm = async () => {
    try {
      // ✅ Validación: razón máx 500 caracteres
      if (reason.length > 500) {
        setError('La razón no puede exceder 500 caracteres');
        return;
      }

      setError(null);
      await onConfirm(reason);

      // ✅ Limpiar después de éxito
      setReason('');
      setError(null);
    } catch (err: any) {
      // El error ya debería ser manejado en el componente padre
      // Pero si llega aquí, mostrar localmente
      console.error('Archive error:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
            Archivar Ciclo Escolar
          </DialogTitle>
          <DialogDescription>
            {cycle && (
              <span>
                ¿Deseas archivar <strong>{cycle.name}</strong>? Esta acción es permanente y no se
                puede deshacer.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Contenido del formulario */}
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="archiveReason" className="font-medium text-gray-700 dark:text-gray-300">
              Razón del archivo (opcional)
            </Label>
            <textarea
              id="archiveReason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null); // ✅ Limpiar error al escribir
              }}
              disabled={isLoading}
              placeholder="Ej: Fin del año escolar 2025"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {/* Contador de caracteres */}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {reason.length} / 500 caracteres
            </p>
          </div>

          {/* Mostrar error de validación */}
          {error && <p className="text-sm text-red-600 dark:text-red-400">⚠️ {error}</p>}

          {/* Advertencia */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>⚠️ Importante:</strong> Un ciclo archivado no puede ser modificado ni
              eliminado. Asegúrate de que sea la intención correcta.
            </p>
          </div>
        </div>

        {/* Botones */}
        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-800"
          >
            {isLoading ? 'Archivando...' : 'Archivar Ciclo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}