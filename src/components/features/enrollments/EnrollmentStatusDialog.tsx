'use client';

import { useState } from 'react';
import { EnrollmentResponse, EnrollmentStatus } from '@/types/enrollments.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface EnrollmentStatusDialogProps {
  enrollment: EnrollmentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: string, reason: string, notes?: string) => Promise<void>;
  loading?: boolean;
}

const statusOptions = [
  { value: 'active', label: 'Activo', description: 'Matrícula vigente' },
  { value: 'inactive', label: 'Inactivo', description: 'Suspensión temporal' },
  { value: 'graduated', label: 'Graduado', description: 'Completó el grado' },
  { value: 'transferred', label: 'Transferido', description: 'Cambió de institución' },
];

export const EnrollmentStatusDialog = ({
  enrollment,
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: EnrollmentStatusDialogProps) => {
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!newStatus) {
      setError('Selecciona un nuevo estado');
      return;
    }

    if (newStatus === enrollment?.status) {
      setError('El nuevo estado debe ser diferente al actual');
      return;
    }

    if (!reason.trim()) {
      setError('La razón es obligatoria');
      return;
    }

    if (reason.trim().length < 3) {
      setError('La razón debe tener al menos 3 caracteres');
      return;
    }

    try {
      await onSubmit(newStatus, reason, notes);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    }
  };

  const handleClose = () => {
    setNewStatus('');
    setReason('');
    setNotes('');
    setError('');
    onOpenChange(false);
  };

  if (!enrollment) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado de Matrícula</DialogTitle>
          <DialogDescription>
            Estudiante: {enrollment.student.givenNames} {enrollment.student.lastNames}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Estado actual */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Estado Actual
            </Label>
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
              </p>
            </div>
          </div>

          {/* Nuevo estado */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
              Nuevo Estado *
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-slate-500">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Razón */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
              Razón del Cambio *
            </Label>
            <Textarea
              placeholder="Explica por qué se realiza este cambio..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              className="min-h-24 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">{reason.length}/500 caracteres</p>
          </div>

          {/* Notas */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
              Notas Adicionales (Opcional)
            </Label>
            <Textarea
              placeholder="Información adicional..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              className="min-h-20 text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !newStatus || !reason}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Cambiar Estado
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
