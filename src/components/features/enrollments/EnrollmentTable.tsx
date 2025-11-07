'use client';

import { EnrollmentResponse, EnrollmentStatus } from '@/types/enrollments.types';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Award,
  Repeat2,
  Users,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnrollmentTableProps {
  enrollments: EnrollmentResponse[];
  loading?: boolean;
  onView?: (enrollment: EnrollmentResponse) => void;
  onEdit?: (enrollment: EnrollmentResponse) => void;
  onDelete?: (enrollment: EnrollmentResponse) => void;
  onTransfer?: (enrollment: EnrollmentResponse) => void;
  onStatusChange?: (enrollment: EnrollmentResponse) => void;
}

const statusConfig = {
  ACTIVE: {
    label: 'Activo',
    icon: CheckCircle2,
    bgLight: 'bg-emerald-50 dark:bg-emerald-950',
    textLight: 'text-emerald-700 dark:text-emerald-300',
    borderLight: 'border-emerald-200 dark:border-emerald-800',
  },
  INACTIVE: {
    label: 'Inactivo',
    icon: XCircle,
    bgLight: 'bg-slate-50 dark:bg-slate-900',
    textLight: 'text-slate-600 dark:text-slate-400',
    borderLight: 'border-slate-200 dark:border-slate-700',
  },
  GRADUATED: {
    label: 'Graduado',
    icon: Award,
    bgLight: 'bg-blue-50 dark:bg-blue-950',
    textLight: 'text-blue-700 dark:text-blue-300',
    borderLight: 'border-blue-200 dark:border-blue-800',
  },
  TRANSFERRED: {
    label: 'Transferido',
    icon: Repeat2,
    bgLight: 'bg-purple-50 dark:bg-purple-950',
    textLight: 'text-purple-700 dark:text-purple-300',
    borderLight: 'border-purple-200 dark:border-purple-800',
  },
};

export const EnrollmentTable = ({
  enrollments,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onTransfer,
  onStatusChange,
}: EnrollmentTableProps) => {
  const getStatusConfig = (status: string) => {
    const config = (statusConfig as any)[status] || statusConfig.ACTIVE;
    return config;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Cargando matrículas...</p>
        </div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">No hay matrículas disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
              Estudiante
            </TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
              Código SIRE
            </TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
              Grado - Sección
            </TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
              Ciclo
            </TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
              Estado
            </TableHead>
            <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">
              Fecha
            </TableHead>
            <TableHead className="text-right text-slate-700 dark:text-slate-300 font-semibold">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const statusCfg = getStatusConfig(enrollment.status);
            const StatusIcon = statusCfg.icon;

            return (
              <TableRow
                key={enrollment.id}
                className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <TableCell className="font-medium">
                  <div>
                    <p className="text-slate-900 dark:text-slate-100">
                      {enrollment.student.givenNames} {enrollment.student.lastNames}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      ID: {enrollment.student.id}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {enrollment.student.codeSIRE || '-'}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-slate-900 dark:text-slate-100">{enrollment.grade.name}</p>
                    <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800">
                      {enrollment.section.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {enrollment.cycle.name}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      'gap-2 font-medium border',
                      statusCfg.bgLight,
                      statusCfg.textLight,
                      statusCfg.borderLight
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                  {format(new Date(enrollment.dateEnrolled), 'dd MMM yyyy', { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Acciones">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">Acciones</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenuContent align="end" className="w-48">
                      {onView && (
                        <DropdownMenuItem
                          onClick={() => onView(enrollment)}
                          className="cursor-pointer gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver detalle</span>
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem
                          onClick={() => onEdit(enrollment)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                      )}
                      {onStatusChange && (
                        <DropdownMenuItem
                          onClick={() => onStatusChange(enrollment)}
                          className="cursor-pointer gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Cambiar estado</span>
                        </DropdownMenuItem>
                      )}
                      {onTransfer && (
                        <DropdownMenuItem
                          onClick={() => onTransfer(enrollment)}
                          className="cursor-pointer gap-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                          <span>Transferir</span>
                        </DropdownMenuItem>
                      )}
                      {(onDelete || onStatusChange) && <DropdownMenuSeparator />}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(enrollment)}
                          className="cursor-pointer gap-2 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
