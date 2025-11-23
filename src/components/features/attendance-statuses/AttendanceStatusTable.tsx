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
  GripVertical,
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

  const confirmToggleActive = () => {
    if (onToggleActive) {
      onToggleActive(confirmDialog.statusId, confirmDialog.newValue);
      toast.success(
        confirmDialog.newValue ? 'Estado activado' : 'Estado desactivado'
      );
    }
    setConfirmDialog({ open: false, statusId: 0, newValue: false });
  };

  const getStatusColor = (colorCode?: string) => {
    return colorCode || '#94a3b8'; // slate-400 default
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative mb-6">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
        </div>
        <p className="text-muted-foreground font-medium">Cargando estados...</p>
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/10 p-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-full bg-primary/5 mb-4">
          <FileText className="h-8 w-8 text-primary/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay estados registrados</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Comienza creando los estados que utilizarás para registrar la asistencia.
        </p>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primer estado
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
              <TableHead className="w-[50px] pl-4"></TableHead>
              <TableHead className="font-semibold text-foreground h-11">Estado</TableHead>
              <TableHead className="font-semibold text-foreground h-11">Código</TableHead>
              <TableHead className="font-semibold text-foreground h-11">Propiedades</TableHead>
              <TableHead className="font-semibold text-foreground h-11">Configuración</TableHead>
              <TableHead className="font-semibold text-foreground h-11 w-[100px]">Activo</TableHead>
              <TableHead className="text-right font-semibold text-foreground h-11 pr-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((status) => (
              <TableRow 
                key={status.id} 
                className="group transition-all duration-200 hover:bg-muted/30 border-b last:border-0"
                style={{
                  // Subtle colored background on hover based on status color
                  // Using CSS variable for dynamic color if needed, but keeping it simple for now
                }}
              >
                <TableCell className="pl-4 py-3">
                  <div 
                    className="w-1.5 h-8 rounded-full opacity-70"
                    style={{ backgroundColor: getStatusColor(status.colorCode) }}
                  />
                </TableCell>
                <TableCell className="py-3 font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{status.name}</span>
                    {status.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {status.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <code className="relative rounded bg-muted px-[0.4rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground border border-border/50">
                    {status.code}
                  </code>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-wrap gap-2">
                    {status.isNegative && (
                      <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <AlertTriangle className="h-3 w-3" />
                        Ausencia
                      </Badge>
                    )}
                    {status.isExcused && (
                      <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <ShieldCheck className="h-3 w-3" />
                        Justificable
                      </Badge>
                    )}
                    {status.isTemporal && (
                      <Badge variant="outline" className="gap-1 border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                        <Clock className="h-3 w-3" />
                        Temporal
                      </Badge>
                    )}
                    {!status.isNegative && !status.isExcused && !status.isTemporal && (
                      <span className="text-xs text-muted-foreground/50 italic">Sin propiedades</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <div className={cn(
                      "flex items-center gap-1.5 transition-opacity",
                      status.requiresJustification ? "opacity-100 text-amber-600 dark:text-amber-500" : "opacity-40"
                    )}>
                      <FileText className="h-3.5 w-3.5" />
                      Justificación
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 transition-opacity",
                      status.canHaveNotes ? "opacity-100 text-blue-600 dark:text-blue-500" : "opacity-40"
                    )}>
                      <FileText className="h-3.5 w-3.5" />
                      Notas
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  {status.isActive ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 border-0">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border-0">
                      Inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-3 pr-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(status)} className="gap-2 cursor-pointer">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onToggleActive && (
                        <DropdownMenuItem onClick={() => handleToggleActiveClick(status.id, status.isActive)} className="gap-2 cursor-pointer">
                          {status.isActive ? (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(status.id)} 
                          className="gap-2 text-destructive focus:text-destructive cursor-pointer"
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
                ? '¿Estás seguro de que deseas activar este estado? Estará disponible para nuevos registros.'
                : '¿Estás seguro de que deseas desactivar este estado? Ya no aparecerá en las opciones de registro.'}
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
              className={confirmDialog.newValue ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
            >
              {confirmDialog.newValue ? 'Sí, activar' : 'Sí, desactivar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
