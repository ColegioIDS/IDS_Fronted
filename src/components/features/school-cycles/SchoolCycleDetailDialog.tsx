// src/components/features/school-cycles/SchoolCycleDetailDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/feedback/LoadingSpinner';
import { ErrorAlert } from '@/components/shared/feedback/ErrorAlert';
import { SchoolCycle, SchoolCycleStats } from '@/types/school-cycle.types';
import { schoolCycleService } from '@/services/school-cycle.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatISODateWithTimezone } from '@/utils/dateUtils';
import {
  Calendar,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  Lock,
  Zap,
  GraduationCap,
  Info,
  XCircle,
  CalendarDays,
  Target,
} from 'lucide-react';

interface SchoolCycleDetailDialogProps {
  cycle: SchoolCycle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SchoolCycleDetailDialog({
  cycle,
  open,
  onOpenChange,
}: SchoolCycleDetailDialogProps) {
  const [stats, setStats] = useState<SchoolCycleStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !cycle) return;

    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await schoolCycleService.getStats(cycle.id);
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar estadísticas');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [open, cycle]);

  if (!cycle) return null;

  const startDate = new Date(cycle.startDate);
  const endDate = new Date(cycle.endDate);
  const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] p-0 overflow-hidden bg-white dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="overflow-hidden bg-blue-600 dark:bg-blue-700 border-b-2 border-blue-700 dark:border-blue-600 p-6">
          <div className="flex items-start gap-4">
            <div className="relative p-3 rounded-xl bg-blue-500 dark:bg-blue-800
              border-2 border-blue-400 dark:border-blue-600 shadow-lg">
              <Calendar className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {cycle.name}
              </h2>

              <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Badge */}
                  <Badge className={
                    cycle.isArchived
                      ? 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
                      : cycle.isActive
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700'
                        : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                  }>
                    {cycle.isArchived ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Cerrado
                      </>
                    ) : cycle.isActive ? (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactivo
                      </>
                    )}
                  </Badge>

                  {/* Enrollment Badge */}
                  {!cycle.isArchived && (
                    <Badge className={
                      cycle.canEnroll
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700'
                        : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
                    }>
                      {cycle.canEnroll ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Matrículas Abiertas
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Matrículas Cerradas
                        </>
                      )}
                    </Badge>
                  )}

                  <span className="text-xs text-white dark:text-blue-100">
                    ID: {cycle.id}
                  </span>
                </div>

                {cycle.academicYear && (
                  <p className="text-sm text-white dark:text-blue-100 font-medium">
                    Año Académico: {cycle.academicYear}
                  </p>
                )}
              </div>
            </div>
          </div>

        {/* Content with ScrollArea */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-6 space-y-4">
            {error && <ErrorAlert message={error} />}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Date Range Compact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20
                    border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400">Inicio</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatISODateWithTimezone(cycle.startDate, 'dd MMM yyyy')}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20
                    border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase text-red-700 dark:text-red-400">Fin</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatISODateWithTimezone(cycle.endDate, 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20
                  border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                      <div>
                        <p className="text-xs font-bold uppercase text-purple-700 dark:text-purple-400">Duración</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {durationDays} días
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ≈ {Math.round(durationDays / 30)} meses
                    </p>
                  </div>
                </div>

                {/* Statistics Grid */}
                {stats && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20
                      border-2 border-amber-200 dark:border-amber-800 text-center">
                      <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">Bimestres</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.stats.totalBimesters}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20
                      border-2 border-indigo-200 dark:border-indigo-800 text-center">
                      <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-400">Grados</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.stats.totalGrades}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20
                      border-2 border-emerald-200 dark:border-emerald-800 text-center">
                      <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">Matrículas</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.stats.totalEnrollments}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bimestres List - Compact */}
                {cycle.bimesters && cycle.bimesters.length > 0 && (
                  <Card className="border-2 border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
                        Bimestres ({cycle.bimesters.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {cycle.bimesters.map((bimester) => (
                        <div
                          key={bimester.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50
                            rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold">
                              {bimester.number}
                            </Badge>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {bimester.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {formatISODateWithTimezone(bimester.startDate, 'dd MMM')} -
                                {' '}
                                {formatISODateWithTimezone(bimester.endDate, 'dd MMM yyyy')}
                              </p>
                            </div>
                          </div>
                          {bimester.isActive && (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs">
                              <Zap className="w-3 h-3 mr-1" strokeWidth={2.5} />
                              Activo
                            </Badge>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Metadata - Compact */}
                <Card className="border-2 border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                      Información Adicional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {cycle.description && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Descripción:</p>
                        <p className="text-gray-900 dark:text-white">{cycle.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Creado:</p>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {format(new Date(cycle.createdAt), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>

                      {cycle.createdBy && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Por:</p>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {cycle.createdBy.givenNames} {cycle.createdBy.lastNames}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Archive info */}
                    {cycle.isArchived && cycle.archivedAt && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Archivado:</p>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                          {format(new Date(cycle.archivedAt), 'dd MMM yyyy', { locale: es })}
                        </p>
                        {cycle.archiveReason && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Razón: {cycle.archiveReason}
                          </p>
                        )}
                        {cycle.archivedByUser && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Por: {cycle.archivedByUser.givenNames} {cycle.archivedByUser.lastNames}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
