'use client';

import { useState } from 'react';
import { EnrollmentResponse } from '@/types/enrollments.types';
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
import { AlertCircle, ArrowRight, Loader2, MapPin, GraduationCap, Users } from 'lucide-react';

interface EnrollmentTransferDialogProps {
  enrollment: EnrollmentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    newGradeId: number,
    newSectionId: number,
    reason: string,
    notes?: string
  ) => Promise<void>;
  loading?: boolean;
}

export const EnrollmentTransferDialog = ({
  enrollment,
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: EnrollmentTransferDialogProps) => {
  const [newGradeId, setNewGradeId] = useState('');
  const [newSectionId, setNewSectionId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!newGradeId || !newSectionId) {
      setError('Selecciona grado y sección');
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
      await onSubmit(parseInt(newGradeId), parseInt(newSectionId), reason, notes);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error en transferencia');
    }
  };

  const handleClose = () => {
    setNewGradeId('');
    setNewSectionId('');
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
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Transferir Estudiante
          </DialogTitle>
          <DialogDescription>
            {enrollment.student.givenNames} {enrollment.student.lastNames}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Ubicación actual */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Ubicación Actual
            </p>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {enrollment.grade.name} - Sección {enrollment.section.name}
            </p>
          </div>

          {/* Nueva ubicación */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Nueva Ubicación
            </Label>

            <div>
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Grado *
              </Label>
              <Select value={newGradeId} onValueChange={setNewGradeId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Primero Primaria</SelectItem>
                  <SelectItem value="2">Segundo Primaria</SelectItem>
                  <SelectItem value="3">Tercero Primaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Sección *
              </Label>
              <Select value={newSectionId} onValueChange={setNewSectionId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">A</SelectItem>
                  <SelectItem value="2">B</SelectItem>
                  <SelectItem value="3">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Razón */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
              Razón de Transferencia *
            </Label>
            <Textarea
              placeholder="Motivo de la transferencia..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              className="min-h-24 text-sm"
            />
          </div>

          {/* Notas */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
              Notas (Opcional)
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
              disabled={loading || !newGradeId || !newSectionId || !reason}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transfiriendo...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Confirmar Transferencia
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
