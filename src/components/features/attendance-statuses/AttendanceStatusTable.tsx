'use client';

import { useState } from 'react';
import { AttendanceStatus } from '@/types/attendance-status.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AttendanceStatusTableProps {
  statuses: AttendanceStatus[];
  loading?: boolean;
  onEdit?: (status: AttendanceStatus) => void;
  onDelete?: (id: number) => void;
  onToggleActive?: (id: number, isActive: boolean) => void;
  onAdd?: () => void;
}

export const AttendanceStatusTable = ({
  statuses,
  loading = false,
  onEdit,
  onDelete,
  onToggleActive,
  onAdd,
}: AttendanceStatusTableProps) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    statusId: number;
    newValue: boolean;
  }>({
    open: false,
    statusId: 0,
    newValue: false,
  });

  const handleToggleActiveClick = (id: number, currentValue: boolean) => {
    setConfirmDialog({
      open: true,
      statusId: id,
      newValue: !currentValue,
    });
  };

  const confirmToggleActive = async () => {
    try {
      if (onToggleActive) {
        await onToggleActive(confirmDialog.statusId, confirmDialog.newValue);
        toast.success(
          confirmDialog.newValue ? 'Estado activado' : 'Estado desactivado'
        );
      }
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        'Error al cambiar el estado'
      );
    } finally {
      setConfirmDialog({ open: false, statusId: 0, newValue: false });
    }
  };

  const getStatusColor = (colorCode?: string) => {
    return colorCode || '#94a3b8';
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative mb-6">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400"></div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando estados...</p>
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-950/30 mb-4">
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No hay estados registrados</h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-6">
          Comienza creando los estados que utilizarás para registrar la asistencia.
        </p>
        {onAdd && (
          <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Crear primer estado
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
              <TableHead className="w-[50px] pl-4"></TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 h-12">Estado</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 h-12">Código</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 h-12">Propiedades</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 h-12">Configuración</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-100 h-12 w-[100px]">Activo</TableHead>
              <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-100 h-12 pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((status) => (
              <TableRow 
                key={status.id} 
                className="group transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 last:border-0"
              >
                <TableCell className="pl-4 py-4">
                  <div 
                    className="w-2 h-8 rounded-full opacity-75 transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: getStatusColor(status.colorCode) }}
                  />
                </TableCell>
                <TableCell className="py-4 font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{status.name}</span>
                    {status.description && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] mt-0.5">
                        {status.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <code className="relative rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 font-mono text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {status.code}
                  </code>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-2">
                    {status.isNegative && (
                      <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-xs px-2.5 py-1 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Ausencia
                      </Badge>
                    )}
                    {status.isExcused && (
                      <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors text-xs px-2.5 py-1 font-medium">
                        <ShieldCheck className="h-3 w-3" />
                        Justificable
                      </Badge>
                    )}
                    {status.isTemporal && (
                      <Badge variant="outline" className="gap-1 border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors text-xs px-2.5 py-1 font-medium">
                        <Clock className="h-3 w-3" />
                        Temporal
                      </Badge>
                    )}
                    {!status.isNegative && !status.isExcused && !status.isTemporal && (
                      <span className="text-xs text-slate-400 dark:text-slate-600 italic">Sin propiedades</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className={cn(
                      "flex items-center gap-1.5 transition-opacity",
                      status.requiresJustification ? "opacity-100 text-amber-600 dark:text-amber-500 font-medium" : "opacity-40"
                    )}>
                      <FileText className="h-3.5 w-3.5" />
                      Justif.
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 transition-opacity",
                      status.canHaveNotes ? "opacity-100 text-cyan-600 dark:text-cyan-500 font-medium" : "opacity-40"
                    )}>
                      <FileText className="h-3.5 w-3.5" />
                      Notas
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {status.isActive ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-200 dark:hover:bg-emerald-950/60 transition-colors text-xs font-medium px-2.5 py-1">
                      Activo
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium px-2.5 py-1">
                      Inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-4 pr-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel className="text-xs font-semibold text-slate-600 dark:text-slate-400">Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(status)} className="gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                          <Pencil className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onToggleActive && (
                        <DropdownMenuItem onClick={() => handleToggleActiveClick(status.id, status.isActive)} className="gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                          {status.isActive ? (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(status.id)} 
                          className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newValue ? 'Activar Estado' : 'Desactivar Estado'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.newValue
                ? 'Estás seguro de que deseas activar este estado? Estará disponible para nuevos registros.'
                : 'Estás seguro de que deseas desactivar este estado? Ya no aparecerá en las opciones de registro.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel 
              onClick={() => setConfirmDialog({ open: false, statusId: 0, newValue: false })}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmToggleActive}
              className={confirmDialog.newValue ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {confirmDialog.newValue ? 'Sí, activar' : 'Sí, desactivar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};