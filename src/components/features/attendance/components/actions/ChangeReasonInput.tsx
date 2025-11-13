'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ChangeReasonInputProps {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  minLength?: number;
  maxLength?: number;
}

/**
 * ChangeReasonInput Component
 * Modal for entering justification/reason for attendance change
 * Used for audit trail support
 */
export default function ChangeReasonInput({
  onSubmit,
  onCancel,
  isLoading = false,
  minLength = 5,
  maxLength = 500,
}: ChangeReasonInputProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('El motivo es requerido');
      return;
    }
    if (reason.length < minLength) {
      setError(`El motivo debe tener al menos ${minLength} caracteres`);
      return;
    }
    if (reason.length > maxLength) {
      setError(`El motivo no puede exceder ${maxLength} caracteres`);
      return;
    }
    setError('');
    onSubmit(reason);
  };

  const remainingChars = maxLength - reason.length;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Motivo del Cambio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Describe el motivo del cambio de asistencia (obligatorio)
          </label>
          <Textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            placeholder="Ej: Reporte de enfermedad presentado por el estudiante..."
            disabled={isLoading}
            className="min-h-[100px]"
          />
          <div className="mt-2 text-xs text-gray-500">
            {remainingChars} caracteres disponibles ({reason.length}/{maxLength})
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim() || reason.length < minLength}
          >
            {isLoading ? 'Guardando...' : 'Confirmar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
