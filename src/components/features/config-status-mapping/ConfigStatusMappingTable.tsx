// src/components/features/config-status-mapping/ConfigStatusMappingTable.tsx
'use client';

import React, { useState } from 'react';
import { ConfigStatusMappingResponseDto } from '@/types/config-status-mapping.types';
import { Edit, Trash2, ChevronLeft, ChevronRight, List, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConfigStatusMappingTableProps {
  mappings: ConfigStatusMappingResponseDto[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onEdit: (mapping: ConfigStatusMappingResponseDto) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
  getStatusName: (statusId: number) => string;
}

export const ConfigStatusMappingTable: React.FC<ConfigStatusMappingTableProps> = ({
  mappings,
  loading,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  getStatusName,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const getMappingTypeBadge = (type: string) => {
    return type === 'negative' ? 'Negativo' : 'Requiere Notas';
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      setDeletingId(deleteConfirm);
      await onDelete(deleteConfirm);
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  if (mappings.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <List className="w-8 h-8 text-slate-400 dark:text-slate-600" />
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No hay mapeos configurados
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
            Comienza agregando tu primer mapeo para configurar cómo se procesan los estados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Mapeos Registrados</CardTitle>
              <CardDescription className="mt-1">
                <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-2 py-1 rounded font-semibold text-sm">
                  {pagination.total}
                </span>
                <span className="ml-2">mapeo{pagination.total !== 1 ? 's' : ''} en total</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left py-4 px-4 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
                    Mapeo ID
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
                    Estado
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
                    Tipo de Mapeo
                  </th>
                  <th className="text-right py-4 px-4 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {mappings.map((mapping) => (
                  <tr
                    key={mapping.id}
                    className="hover:bg-blue-50 dark:hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-slate-600 transition-colors">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            #{mapping.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant="outline" 
                        className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-medium"
                      >
                        {getStatusName(mapping.statusId)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          mapping.mappingType === 'negative' ? 'destructive' : 'secondary'
                        }
                        className={`font-semibold ${
                          mapping.mappingType === 'negative'
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                        }`}
                      >
                        {getMappingTypeBadge(mapping.mappingType)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(mapping)}
                          disabled={loading}
                          className="h-9 px-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Editar mapeo"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(mapping.id)}
                          disabled={loading || deletingId === mapping.id}
                          className="h-9 px-3 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                          title="Eliminar mapeo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Página <span className="font-bold text-slate-900 dark:text-slate-100">{pagination.page}</span> de{' '}
                <span className="font-bold text-slate-900 dark:text-slate-100">{pagination.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1 || loading}
                  className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
                  }
                  disabled={pagination.page === pagination.totalPages || loading}
                  className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-lg">Confirmar eliminación</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription className="text-base leading-relaxed">
            ¿Estás seguro de que deseas eliminar este mapeo? Esta acción no se puede deshacer.
          </DialogDescription>
          <DialogFooter className="gap-3 sm:gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deletingId !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingId !== null ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
