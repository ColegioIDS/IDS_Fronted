// src/components/features/signatures/SignatureFormDialog.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface SignatureFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signature?: any;
  canEdit?: boolean;
}

export function SignatureFormDialog({
  open,
  onOpenChange,
  signature,
  canEdit = false,
}: SignatureFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (signature) {
      setFormData({
        name: signature.name || '',
        type: signature.type || '',
        description: signature.description || '',
        isActive: signature.isActive ?? true,
      });
    } else {
      setFormData({
        name: '',
        type: '',
        description: '',
        isActive: true,
      });
    }
  }, [signature, open]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!formData.type) {
      toast.error('El tipo es requerido');
      return;
    }

    // TODO: Guardar firma
    toast.success(
      signature
        ? 'Firma actualizada correctamente'
        : 'Firma creada correctamente'
    );
    onOpenChange(false);
  };

  const isEditing = !!signature;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Firma Digital' : 'Nueva Firma Digital'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza la información de la firma'
              : 'Crea una nueva firma digital de autoridad escolar'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Firma</Label>
            <Input
              id="name"
              placeholder="ej: Director Juan Pérez"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Autoridad</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="coordinator">Coordinador</SelectItem>
                <SelectItem value="teacher">Maestro</SelectItem>
                <SelectItem value="admin">Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción adicional (opcional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Estado */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked as boolean })
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Firma Activa
            </Label>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={!canEdit && isEditing}
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
