// src/components/features/school-cycles/SchoolCycleDetailDialog.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/feedback/LoadingSpinner';
import { ErrorAlert } from '@/components/shared/feedback/ErrorAlert';
import { SchoolCycle, SchoolCycleStats } from '@/types/school-cycle.types';
import { schoolCycleService } from '@/services/school-cycle.service';
import { getModuleTheme } from '@/config/theme.config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  BookOpen,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Lock,
  Zap,
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
  const theme = getModuleTheme('school-cycle');
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
        console.error('Error loading stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [open, cycle]);

  if (!cycle) return null;

  const startDate = new Date(cycle.startDate);
  const endDate = new Date(cycle.endDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${theme.text}`}>
            <Calendar className="w-5 h-5" strokeWidth={2.5} />
            {cycle.name}
          </DialogTitle>
          <DialogDescription>
            Información detallada del ciclo escolar
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorAlert message={error} />}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Estado */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estado General</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {cycle.isClosed ? 'Cerrado' : cycle.isActive ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {cycle.isActive && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 flex items-center gap-1">
                      <Zap className="w-3 h-3" strokeWidth={3} />
                      Activo
                    </Badge>
                  )}
                  {cycle.isClosed && (
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 flex items-center gap-1">
                      <Lock className="w-3 h-3" strokeWidth={3} />
                      Cerrado
                    </Badge>
                  )}
                  {!cycle.isActive && !cycle.isClosed && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      Inactivo
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fechas */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" strokeWidth={2.5} />
                  Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fecha de Inicio:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {format(startDate, 'EEEE, d MMMM yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fecha de Fin:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {format(endDate, 'EEEE, d MMMM yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Duración:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    {Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} días
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            {stats && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" strokeWidth={2.5} />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Bimestres</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {stats.stats.totalBimesters}
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Grados</p>
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                        {stats.stats.totalGrades}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Matrículas</p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {stats.stats.totalEnrollments}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bimestres */}
            {cycle.bimesters && cycle.bimesters.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4" strokeWidth={2.5} />
                    Bimestres ({cycle.bimesters.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cycle.bimesters.map((bimester) => (
                    <div
                      key={bimester.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          {bimester.number}
                        </Badge>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {bimester.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(bimester.startDate), 'dd MMM', { locale: es })} -
                            {' '}
                            {format(new Date(bimester.endDate), 'dd MMM yyyy', { locale: es })}
                          </p>
                        </div>
                      </div>
                      {bimester.isActive && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 flex items-center gap-1">
                          <Zap className="w-3 h-3" strokeWidth={3} />
                          Activo
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" strokeWidth={2.5} />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID del Ciclo:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{cycle.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Creado:</span>
                  <span className="text-gray-900 dark:text-white">
                    {format(new Date(cycle.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}