// src/components/features/school-cycles/SchoolCycleCard.tsx

'use client';

import { SchoolCycle } from '@/types/school-cycle.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getModuleTheme, getStatusTheme } from '@/config/theme.config';
import {
  Calendar,
  BookOpen,
  Users,
  FileText,
  Edit,
  Trash2,
  Lock,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SchoolCycleCardProps {
  cycle: SchoolCycle;
  onEdit?: (cycle: SchoolCycle) => void;
  onDelete?: (cycle: SchoolCycle) => void;
  onActivate?: (cycle: SchoolCycle) => void;
  onClose?: (cycle: SchoolCycle) => void;
  onViewDetails?: (cycle: SchoolCycle) => void;
  isLoading?: boolean;
}

export function SchoolCycleCard({
  cycle,
  onEdit,
  onDelete,
  onActivate,
  onClose,
  onViewDetails,
  isLoading = false,
}: SchoolCycleCardProps) {
  const moduleTheme = getModuleTheme('school-cycle');
  const startDate = new Date(cycle.startDate);
  const endDate = new Date(cycle.endDate);
  const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const isEnded = endDate < new Date();

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      {/* Header con gradiente */}
      <div className={`${moduleTheme.bg} border-b border-gray-200 dark:border-gray-800 p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${moduleTheme.text} truncate`}>{cycle.name}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              ID: {cycle.id}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
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
          </div>
        </div>
      </div>

      <CardContent className="p-4 bg-white dark:bg-gray-900 space-y-4">
        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <div className="text-sm">
              <p className="text-gray-600 dark:text-gray-400 text-xs">Inicio</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {format(startDate, 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Calendar className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <div className="text-sm">
              <p className="text-gray-600 dark:text-gray-400 text-xs">Fin</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {format(endDate, 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Duración */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-gray-600 dark:text-gray-400">Duración</p>
          <p className="font-bold text-lg text-blue-700 dark:text-blue-300">{durationDays} días</p>
        </div>

        {/* Contadores si existen */}
        {cycle._count && (
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Bimestres</p>
              <p className="font-bold text-purple-700 dark:text-purple-300">{cycle._count.bimesters}</p>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Grados</p>
              <p className="font-bold text-amber-700 dark:text-amber-300">{cycle._count.grades}</p>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">Matrículas</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-300">{cycle._count.enrollments}</p>
            </div>
          </div>
        )}

        {/* Estado del ciclo */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600 dark:text-gray-400">Estado:</span>
          {isEnded ? (
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
              Finalizado
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              En curso
            </Badge>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
          {onViewDetails && (
            <Button
              onClick={() => onViewDetails(cycle)}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ChevronRight className="w-4 h-4 mr-1" strokeWidth={2.5} />
              Detalles
            </Button>
          )}

          {!cycle.isClosed && onEdit && (
            <Button
              onClick={() => onEdit(cycle)}
              disabled={isLoading}
              variant="ghost"
              size="sm"
            >
              <Edit className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          )}

          {!cycle.isClosed && !cycle.isActive && onActivate && (
            <Button
              onClick={() => onActivate(cycle)}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-green-600 dark:text-green-400 hover:text-green-700"
            >
              <Zap className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          )}

          {!cycle.isClosed && isEnded && onClose && (
            <Button
              onClick={() => onClose(cycle)}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700"
            >
              <Lock className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          )}

          {!cycle.isClosed && onDelete && (
            <Button
              onClick={() => onDelete(cycle)}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-red-600 dark:text-red-400 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}