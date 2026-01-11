// src/components/features/signatures/SignatureCard.tsx

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit2, Trash2, Star } from 'lucide-react';

interface SignatureCardProps {
  signature: any;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canSetDefault?: boolean;
}

export function SignatureCard({
  signature,
  onView,
  onEdit,
  onDelete,
  onSetDefault,
  canView = false,
  canEdit = false,
  canDelete = false,
  canSetDefault = false,
}: SignatureCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen de firma */}
      <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {signature.imageUrl ? (
          <img
            src={signature.imageUrl}
            alt={signature.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-400">Sin imagen</div>
        )}
        {signature.isDefault && (
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
            <Star className="h-3 w-3" />
            Por defecto
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{signature.name}</h3>
          <p className="text-sm text-gray-600">{signature.type || 'Sin tipo'}</p>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={signature.isActive ? 'default' : 'secondary'}>
            {signature.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
          {signature.isDefault && (
            <Badge className="bg-yellow-500">Default</Badge>
          )}
        </div>

        {/* Descripción */}
        {signature.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {signature.description}
          </p>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          {canView && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onView}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              title="Editar"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
          {canSetDefault && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onSetDefault}
              title="Establecer como default"
              disabled={signature.isDefault}
            >
              <Star className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
