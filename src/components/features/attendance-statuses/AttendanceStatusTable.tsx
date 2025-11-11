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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Clock,
  GripVertical,
  CheckCircle2,
  XCircle,
  Plus,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

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
  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8 text-center text-muted-foreground">
          Cargando estados de asistencia...
        </CardContent>
      </Card>
    );
  }

  if (statuses.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8 text-center text-muted-foreground">
          No hay estados de asistencia registrados
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 bg-muted/50 hover:bg-muted/50">
                <TableHead className="h-12 w-16 pl-6 font-semibold text-foreground">
                  <span className="sr-only">Orden</span>
                </TableHead>
                <TableHead className="h-12 font-semibold text-foreground">Estado</TableHead>
                <TableHead className="h-12 w-32 font-semibold text-foreground">Código</TableHead>
                <TableHead className="h-12 font-semibold text-foreground">Propiedades</TableHead>
                <TableHead className="h-12 font-semibold text-foreground">Opciones</TableHead>
                <TableHead className="h-12 w-28 font-semibold text-foreground">Estado</TableHead>
                <TableHead className="h-12 pr-6 text-right font-semibold text-foreground">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map((status) => (
                <TableRow key={status.id} className="group transition-colors hover:bg-accent/50">
                  <TableCell className="pl-6">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="h-5 w-5 shrink-0 rounded border border-border/60 shadow-sm ring-1 ring-black/5"
                        style={{ backgroundColor: status.colorCode || undefined }}
                      />
                      <div className="space-y-1.5">
                        <div className="font-medium leading-none tracking-tight">{status.name}</div>
                        {status.description && (
                          <div className="max-w-xs text-sm leading-snug text-muted-foreground">
                            {status.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs font-semibold tracking-tight">
                      {status.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {status.isNegative && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 border-orange-200 bg-orange-50 text-orange-700 shadow-sm dark:border-orange-900/50 dark:bg-orange-950/50 dark:text-orange-400"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs font-medium">Negativo</span>
                        </Badge>
                      )}
                      {status.isExcused && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 border-blue-200 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          <span className="text-xs font-medium">Justificable</span>
                        </Badge>
                      )}
                      {status.isTemporal && (
                        <Badge
                          variant="outline"
                          className="gap-1.5 border-purple-200 bg-purple-50 text-purple-700 shadow-sm dark:border-purple-900/50 dark:bg-purple-950/50 dark:text-purple-400"
                        >
                          <Clock className="h-3 w-3" />
                          <span className="text-xs font-medium">Temporal</span>
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      {status.requiresJustification && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                            <FileText className="h-3 w-3 text-primary" />
                          </div>
                          <span>Justificación</span>
                        </div>
                      )}
                      {status.canHaveNotes && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                            <FileText className="h-3 w-3 text-primary" />
                          </div>
                          <span>Notas</span>
                        </div>
                      )}
                      {!status.requiresJustification && !status.canHaveNotes && (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-28">
                    {status.isActive ? (
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-green-200 bg-green-50 text-green-700 shadow-sm dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Activo</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-gray-200 bg-gray-50 text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Inactivo</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 opacity-70 transition-opacity hover:opacity-100 data-[state=open]:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 shadow-lg">
                        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Acciones
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(status)}
                            className="gap-3 py-2.5"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                            <span>Editar estado</span>
                          </DropdownMenuItem>
                        )}
                        {onToggleActive && (
                          <DropdownMenuItem
                            onClick={() => handleToggleActiveClick(status.id, status.isActive)}
                            className="gap-3 py-2.5"
                          >
                            {status.isActive ? (
                              <>
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                <span>Desactivar</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                <span>Activar</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(status.id)}
                            className="gap-3 py-2.5 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
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
      </CardContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newValue ? 'Activar Estado' : 'Desactivar Estado'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.newValue
                ? '¿Estás seguro de que deseas activar este estado de asistencia? Estará disponible para usar en los registros.'
                : '¿Estás seguro de que deseas desactivar este estado de asistencia? No estará disponible para nuevos registros.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel 
              onClick={() => setConfirmDialog({ open: false, statusId: 0, newValue: false })}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmToggleActive}
              className={confirmDialog.newValue ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {confirmDialog.newValue ? 'Sí, activar' : 'Sí, desactivar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
