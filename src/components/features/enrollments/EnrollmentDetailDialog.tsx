'use client';

import { useState } from 'react';
import { EnrollmentDetailResponse } from '@/types/enrollments.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  User,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  Info,
} from 'lucide-react';

interface EnrollmentDetailDialogProps {
  enrollment: EnrollmentDetailResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
}

export const EnrollmentDetailDialog = ({
  enrollment,
  open,
  onOpenChange,
  loading = false,
}: EnrollmentDetailDialogProps) => {
  const [expandHistory, setExpandHistory] = useState(false);

  if (!enrollment) return null;

  const statusColors = {
    active: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
    inactive: 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200',
    graduated: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    transferred: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | React.ReactNode;
  }) => (
    <div className="flex gap-3 py-3 border-b border-slate-200 dark:border-slate-800 last:border-0">
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5 text-slate-400 dark:text-slate-600 mt-0.5" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        <p className="font-medium text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Detalle de Matrícula
          </DialogTitle>
          <DialogDescription>
            ID Matrícula: #{enrollment.id}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Información del Estudiante */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Nombre</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {enrollment.student.givenNames} {enrollment.student.lastNames}
                  </p>
                </div>
                {enrollment.student.codeSIRE && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Código SIRE</p>
                    <Badge variant="outline">{enrollment.student.codeSIRE}</Badge>
                  </div>
                )}
                <InfoRow
                  icon={Calendar}
                  label="ID Estudiante"
                  value={`#${enrollment.student.id}`}
                />
              </CardContent>
            </Card>

            {/* Datos de Matrícula */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Datos de Matrícula
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow
                  icon={BookOpen}
                  label="Grado"
                  value={enrollment.grade.name}
                />
                <InfoRow
                  icon={Building2}
                  label="Sección"
                  value={enrollment.section.name}
                />
                <InfoRow
                  icon={Calendar}
                  label="Ciclo"
                  value={enrollment.cycle.name}
                />
                <div className="py-3 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Estado</p>
                  <Badge
                    className={`font-medium ${statusColors[enrollment.status as keyof typeof statusColors] || statusColors.active}`}
                  >
                    {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                  </Badge>
                </div>
                <InfoRow
                  icon={Clock}
                  label="Fecha de Matrícula"
                  value={format(new Date(enrollment.dateEnrolled), 'dd MMMM yyyy', {
                    locale: es,
                  })}
                />
              </CardContent>
            </Card>

            {/* Historial */}
            {enrollment.history && enrollment.history.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Historial de Cambios
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandHistory(!expandHistory)}
                    >
                      {expandHistory ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {expandHistory && (
                  <CardContent>
                    <div className="space-y-3">
                      {enrollment.history.map((item, idx) => (
                        <div
                          key={idx}
                          className="pb-3 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {item.action === 'status_change' && 'Cambio de Estado'}
                                {item.action === 'transfer' && 'Transferencia'}
                                {item.action === 'created' && 'Matrícula Creada'}
                                {item.action === 'deleted' && 'Matrícula Eliminada'}
                              </p>
                              {item.fromStatus && item.toStatus && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  De {item.fromStatus} a {item.toStatus}
                                </p>
                              )}
                              {item.reason && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Razón: {item.reason}
                                </p>
                              )}
                              <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                                <span>
                                  Por: {item.changedBy.givenNames} {item.changedBy.lastNames}
                                </span>
                                <span>
                                  {format(new Date(item.changedAt), 'dd MMM yyyy HH:mm', {
                                    locale: es,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
