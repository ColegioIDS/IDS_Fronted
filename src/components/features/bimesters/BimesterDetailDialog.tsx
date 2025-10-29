// src/components/features/bimesters/BimesterDetailDialog.tsx

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Hash,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  X 
} from 'lucide-react';
import { Bimester } from '@/types/bimester.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';

interface BimesterDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bimester: Bimester | null;
  onEdit?: (bimester: Bimester) => void;
  onDelete?: (bimester: Bimester) => void;
}

/**
 * Dialog para mostrar detalles completos de un bimestre
 */
export function BimesterDetailDialog({
  open,
  onOpenChange,
  bimester,
  onEdit,
  onDelete,
}: BimesterDetailDialogProps) {
  if (!bimester) return null;

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return date;
    }
  };

  const formatDateTime = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return date;
    }
  };

  const getNumberBadgeColor = (number: number) => {
    const colors: Record<number, string> = {
      1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      2: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      3: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      4: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    };
    return colors[number] || colors[1];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getNumberBadgeColor(bimester.number)}>
                  Bimestre {bimester.number}
                </Badge>
                
                {bimester.isActive ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Activo
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-400 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Inactivo
                  </Badge>
                )}
              </div>

              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {bimester.name}
              </DialogTitle>
            </div>
          </div>

          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Información detallada del bimestre
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información General */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Información General
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Número
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {bimester.number}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Semanas
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {bimester.weeksCount} semanas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                Período
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Fecha de Inicio
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(bimester.startDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Fecha de Fin
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(bimester.endDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auditoría */}
          {(bimester.createdAt || bimester.updatedAt) && (
            <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">
                  Información de Auditoría
                </h3>

                {bimester.createdAt && (
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Creado: </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatDateTime(bimester.createdAt)}
                    </span>
                  </div>
                )}

                {bimester.updatedAt && (
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Última modificación: </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatDateTime(bimester.updatedAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 dark:border-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>

          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(bimester);
                  onOpenChange(false);
                }}
                className="border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}

            {onDelete && (
              <Button
                variant="outline"
                onClick={() => {
                  onDelete(bimester);
                  onOpenChange(false);
                }}
                className="border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BimesterDetailDialog;
