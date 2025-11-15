// src/components/features/school-cycles/SchoolCycleCard.tsx
'use client';

import { SchoolCycle } from '@/types/school-cycle.types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Calendar,
  BookOpen,
  Users,
  Edit,
  Trash2,
  Lock,
  Zap,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  GraduationCap,
  AlertCircle,
  CalendarDays,
  Target,
} from 'lucide-react';
import { format, differenceInDays, isAfter, isBefore, isWithinInterval } from 'date-fns';
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
  const startDate = new Date(cycle.startDate);
  const endDate = new Date(cycle.endDate);
  const now = new Date();

  const durationDays = differenceInDays(endDate, startDate);
  const isStarted = isBefore(startDate, now);
  const isEnded = isAfter(now, endDate);
  const isOngoing = isWithinInterval(now, { start: startDate, end: endDate });

  // Calculate progress percentage
  let progressPercentage = 0;
  if (isOngoing) {
    const elapsed = differenceInDays(now, startDate);
    progressPercentage = (elapsed / durationDays) * 100;
  } else if (isEnded) {
    progressPercentage = 100;
  }

  // Determine status color and text
  const getStatusInfo = () => {
    if (cycle.isArchived) {
      return {
        text: 'Cerrado',
        color: 'bg-gray-100 text-gray-800 border-2 border-gray-300 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-600',
        icon: Lock,
      };
    }
    if (cycle.isActive) {
      return {
        text: 'Activo Ahora',
        color: 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
        icon: Zap,
      };
    }
    if (isEnded) {
      return {
        text: 'Finalizado',
        color: 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
        icon: CheckCircle,
      };
    }
    if (isOngoing) {
      return {
        text: 'En Curso',
        color: 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
        icon: Clock,
      };
    }
    if (isStarted) {
      return {
        text: 'Iniciado',
        color: 'bg-blue-100 text-blue-800 border-2 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
        icon: Clock,
      };
    }
    return {
      text: 'Programado',
      color: 'bg-amber-100 text-amber-800 border-2 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
      icon: CalendarDays,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <TooltipProvider>
      <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800
        hover:border-blue-400 dark:hover:border-blue-600
        shadow-lg hover:shadow-2xl hover:-translate-y-1
        transition-all duration-300 ease-out">

        {/* Progress Indicator - Only for ongoing cycles */}
        {isOngoing && !cycle.isArchived && (
          <div className="absolute top-3 left-3 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative cursor-help">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-blue-600 dark:text-blue-400"
                        strokeDasharray={`${(progressPercentage / 100) * 125.6} 125.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Progreso del ciclo: {Math.round(progressPercentage)}%</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Header */}
        <CardHeader className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700
          group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-4 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative p-4 rounded-xl bg-blue-100 dark:bg-blue-900/30
                    border-2 border-blue-200 dark:border-blue-800
                    shadow-md group-hover:shadow-lg group-hover:scale-105
                    transition-all duration-300 ease-out cursor-help">
                    <Calendar className="w-7 h-7 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                    <div className="absolute inset-0 bg-blue-400 dark:bg-blue-500 opacity-0
                      group-hover:opacity-10 rounded-xl transition-opacity duration-300" />

                    {/* Badge count indicator */}
                    {cycle._count && (
                      <div className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5
                        bg-blue-600 dark:bg-blue-500 rounded-full
                        flex items-center justify-center
                        border-2 border-white dark:border-gray-900
                        shadow-md">
                        <span className="text-xs font-bold text-white">
                          {(cycle._count.bimesters || 0) + (cycle._count.grades || 0) + (cycle._count.enrollments || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Ciclo Escolar {cycle.name}</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                  {cycle.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs border-2 border-gray-300 dark:border-gray-600
                        hover:bg-gray-100 dark:hover:bg-gray-800 cursor-help font-medium px-2 py-0.5">
                        ID: {cycle.id}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                      <p className="text-xs">
                        Creado: {format(new Date(cycle.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Edit & Delete Buttons */}
            <div className="flex gap-1">
              {!cycle.isArchived && onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onEdit(cycle)}
                      disabled={isLoading}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                    <p>Editar ciclo</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {!cycle.isArchived && onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onDelete(cycle)}
                      disabled={isLoading}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={2.5} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                    <p>Eliminar ciclo</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-4 space-y-4 bg-white dark:bg-gray-900">
          {/* Status & Enrollment Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`${statusInfo.color} hover:scale-105 transition-transform
                  duration-200 cursor-help font-semibold px-3 py-1`}>
                  <StatusIcon className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                  {statusInfo.text}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p>Estado actual del ciclo escolar</p>
              </TooltipContent>
            </Tooltip>

            {/* Enrollment Status Badge */}
            {!cycle.isArchived && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={`${
                    cycle.canEnroll
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'
                      : 'bg-gray-100 text-gray-800 border-2 border-gray-300 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-600'
                  } hover:scale-105 transition-transform duration-200 cursor-help font-semibold px-3 py-1`}>
                    {cycle.canEnroll ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                        Matrículas Abiertas
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                        Matrículas Cerradas
                      </>
                    )}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p>{cycle.canEnroll ? 'Se pueden realizar matrículas' : 'No se permiten nuevas matrículas'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20
                  border-2 border-blue-200 dark:border-blue-800
                  hover:shadow-md transition-all duration-200 cursor-help">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" strokeWidth={2.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400">Inicio</p>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {format(startDate, 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">{format(startDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative p-3 rounded-xl bg-red-50 dark:bg-red-900/20
                  border-2 border-red-200 dark:border-red-800
                  hover:shadow-md transition-all duration-200 cursor-help">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" strokeWidth={2.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400">Fin</p>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {format(endDate, 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">{format(endDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Duration Info */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20
                border-2 border-purple-200 dark:border-purple-800 cursor-help
                hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-400">Duración</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                        {durationDays} días
                      </p>
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-purple-600/20 dark:text-purple-400/20" strokeWidth={2} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Aproximadamente {Math.round(durationDays / 30)} meses</p>
            </TooltipContent>
          </Tooltip>

          {/* Stats Grid */}
          {cycle._count && (
            <div className="grid grid-cols-3 gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20
                    border-2 border-amber-200 dark:border-amber-800 text-center cursor-help
                    hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="relative z-10">
                      <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">Bimestres</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums flex items-center justify-center gap-1">
                        {cycle._count.bimesters}
                        {cycle._count.bimesters > 0 && (
                          <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                        )}
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-amber-600 dark:bg-amber-400 transition-all duration-300"
                      style={{ width: `${Math.min((cycle._count.bimesters / 6) * 100, 100)}%` }} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">{cycle._count.bimesters} bimestre{cycle._count.bimesters !== 1 ? 's' : ''} configurado{cycle._count.bimesters !== 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20
                    border-2 border-indigo-200 dark:border-indigo-800 text-center cursor-help
                    hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="relative z-10">
                      <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-400">Grados</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums flex items-center justify-center gap-1">
                        {cycle._count.grades}
                        {cycle._count.grades > 0 && (
                          <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                        )}
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
                      style={{ width: `${Math.min((cycle._count.grades / 10) * 100, 100)}%` }} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">{cycle._count.grades} grado{cycle._count.grades !== 1 ? 's' : ''} asignado{cycle._count.grades !== 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20
                    border-2 border-emerald-200 dark:border-emerald-800 text-center cursor-help
                    hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="relative z-10">
                      <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Matrículas</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums flex items-center justify-center gap-1">
                        {cycle._count.enrollments}
                        {cycle._count.enrollments > 0 && (
                          <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                        )}
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-600 dark:bg-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.min((cycle._count.enrollments / 100) * 100, 100)}%` }} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">{cycle._count.enrollments} matrícula{cycle._count.enrollments !== 1 ? 's' : ''} registrada{cycle._count.enrollments !== 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              {!cycle.isArchived && !cycle.isActive && onActivate && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onActivate(cycle)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-300 hover:bg-emerald-50
                        dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/30
                        font-semibold"
                    >
                      <Zap className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                      Activar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                    <p>Activar este ciclo escolar</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {!cycle.isArchived && isEnded && onClose && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onClose(cycle)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50
                        dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800/30
                        font-semibold"
                    >
                      <Lock className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                      Cerrar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                    <p>Cerrar y archivar este ciclo</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {onViewDetails && (
              <Button
                onClick={() => onViewDetails(cycle)}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400
                  hover:bg-blue-50 dark:hover:bg-blue-900/30
                  font-semibold transition-all duration-200
                  hover:scale-105"
              >
                <Eye className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                Ver detalles
              </Button>
            )}
          </div>
        </CardContent>

        {/* Decorative bottom border */}
        <div className="h-1.5 bg-blue-600 dark:bg-blue-500 opacity-0 group-hover:opacity-100
          transition-opacity duration-300" />
      </Card>
    </TooltipProvider>
  );
}
