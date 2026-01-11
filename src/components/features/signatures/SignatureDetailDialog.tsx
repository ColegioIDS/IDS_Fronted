// src/components/features/signatures/SignatureDetailDialog.tsx

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface SignatureDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signature?: any;
}

export function SignatureDetailDialog({
  open,
  onOpenChange,
  signature,
}: SignatureDetailDialogProps) {
  if (!signature) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Firma Digital</DialogTitle>
          <DialogDescription>
            {signature.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagen */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Imagen de Firma</h3>
            <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center aspect-video">
              {signature.imageUrl ? (
                <img
                  src={signature.imageUrl}
                  alt={signature.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-gray-400">Sin imagen</span>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="font-semibold">{signature.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo</p>
              <p className="font-semibold">{signature.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <Badge variant={signature.isActive ? 'default' : 'secondary'}>
                {signature.isActive ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Por Defecto</p>
              {signature.isDefault ? (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold text-yellow-600">Sí</span>
                </div>
              ) : (
                <span className="font-semibold">No</span>
              )}
            </div>
          </div>

          {/* Descripción */}
          {signature.description && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Descripción</p>
              <p className="bg-gray-50 p-3 rounded border">
                {signature.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 text-xs text-gray-500 space-y-1">
            <p>Creado: {new Date(signature.createdAt).toLocaleDateString()}</p>
            {signature.updatedAt && (
              <p>
                Actualizado:{' '}
                {new Date(signature.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
