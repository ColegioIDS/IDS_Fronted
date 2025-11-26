// src/components/features/sections/SectionCard.tsx

'use client';

import React from 'react';
import { Eye, Pencil, Trash2, BarChart3, Users, User, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/types/sections.types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SectionCardProps {
  section: Section;
  onView?: (section: Section) => void;
  onEdit?: (section: Section) => void;
  onDelete?: (section: Section) => void;
  onViewStats?: (section: Section) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * 🏫 Tarjeta individual de sección con tooltips y diseño mejorado
 */
export function SectionCard({
  section,
  onView,
  onEdit,
  onDelete,
  onViewStats,
  canEdit = true,
  canDelete = true,
}: SectionCardProps) {
  const enrollments = section._count?.enrollments || 0;
  const utilization = section.capacity > 0
    ? Math.round((enrollments / section.capacity) * 100)
    : 0;
  const availableSpots = section.capacity - enrollments;
  const hasTeacher = !!section.teacherId;

  // Determinar color según utilización
  const getUtilizationColor = () => {
    if (utilization >= 90) return 'red';
    if (utilization >= 75) return 'amber';
    if (utilization >= 50) return 'blue';
    return 'emerald';
  };

  const utilizationColor = getUtilizationColor();

  return (
    <TooltipProvider>
      <Card className="group relative overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-gray-200 dark:border-gray-800 hover:border-fuchsia-400 dark:hover:border-fuchsia-600 bg-white dark:bg-gray-900">
        {/* Barra de utilización superior con tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-0 left-0 right-0 h-1.5 cursor-help">
              <div
                className={`h-full transition-all duration-500 ${
                  utilizationColor === 'red' ? 'bg-red-500 dark:bg-red-400' :
                  utilizationColor === 'amber' ? 'bg-amber-500 dark:bg-amber-400' :
                  utilizationColor === 'blue' ? 'bg-blue-500 dark:bg-blue-400' :
                  'bg-emerald-500 dark:bg-emerald-400'
                }`}
                style={{ width: `${utilization}%` }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
            <p className="font-semibold">Utilización: {utilization}%</p>
          </TooltipContent>
        </Tooltip>

        <CardHeader className="relative pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            {/* Icono con tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative cursor-help">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center border-2 bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Users className="w-7 h-7 text-blue-700 dark:text-blue-300" strokeWidth={2.5} />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Sección {section.name}</p>
              </TooltipContent>
            </Tooltip>

            {/* Badge de profesor con tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-1.5 cursor-help ${
                    hasTeacher
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                      : 'bg-gray-200 text-gray-700 border-2 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                  } font-semibold px-3.5 py-1.5 hover:scale-105 transition-transform duration-200`}
                >
                  {hasTeacher ? (
                    <>
                      <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Con Profesor
                    </>
                  ) : (
                    <>
                      <UserX className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Sin Profesor
                    </>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">
                  {hasTeacher
                    ? `Profesor: ${section.teacher?.givenNames} ${section.teacher?.lastNames}`
                    : 'No tiene profesor asignado'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="relative pb-4">
          {/* Nombre de la sección */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Sección {section.name}
          </h3>

          {/* Nombre del grado */}
          {section.grade && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
              {section.grade.name}
            </p>
          )}

          {/* Info section */}
          <div className="space-y-3">
            {/* Capacidad y utilización con tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-help">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
                      Capacidad
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                      {enrollments} / {section.capacity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
                      Utilización
                    </p>
                    <p className={`text-lg font-bold tabular-nums ${
                      utilizationColor === 'red' ? 'text-red-700 dark:text-red-300' :
                      utilizationColor === 'amber' ? 'text-amber-700 dark:text-amber-300' :
                      utilizationColor === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                      'text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {utilization}%
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">{enrollments} estudiantes inscritos de {section.capacity} disponibles</p>
              </TooltipContent>
            </Tooltip>

            {/* Espacios disponibles con tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800 cursor-help hover:shadow-sm transition-shadow">
                  <span className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Espacios disponibles:
                  </span>
                  <span className="text-sm font-bold text-blue-800 dark:text-blue-300 tabular-nums">
                    {availableSpots}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Cupos disponibles para nuevos estudiantes</p>
              </TooltipContent>
            </Tooltip>

            {/* Profesor asignado con tooltip */}
            {hasTeacher && section.teacher && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 cursor-help hover:shadow-sm transition-shadow">
                    <User className="h-4 w-4 text-emerald-700 dark:text-emerald-300" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 truncate">
                      {section.teacher.givenNames} {section.teacher.lastNames}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Profesor asignado a esta sección</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>

        <CardFooter className="relative flex flex-wrap gap-2 pt-4 pb-5 border-t-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          {/* Ver */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(section)}
                className="flex-1 min-w-[80px] border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 hover:border-blue-500 dark:hover:bg-blue-950/40 dark:hover:border-blue-600 transition-all duration-200 font-semibold shadow-sm hover:shadow"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                Ver
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Ver detalles completos de la sección</p>
            </TooltipContent>
          </Tooltip>

          {/* Editar */}
          {canEdit && onEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(section)}
                  className="flex-1 min-w-[80px] border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 hover:border-amber-500 dark:hover:bg-amber-950/40 dark:hover:border-amber-600 transition-all duration-200 font-semibold shadow-sm hover:shadow"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                  Editar
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Editar información de la sección</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Stats */}
          {onViewStats && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewStats(section)}
                  className="flex-1 min-w-[80px] border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 hover:border-purple-500 dark:hover:bg-purple-950/40 dark:hover:border-purple-600 transition-all duration-200 font-semibold shadow-sm hover:shadow"
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                  Stats
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Ver estadísticas detalladas</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Eliminar */}
          {canDelete && onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(section)}
                  className="flex-1 min-w-[80px] border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 hover:border-red-500 dark:hover:bg-red-950/40 dark:hover:border-red-600 transition-all duration-200 font-semibold shadow-sm hover:shadow"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                  Eliminar
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Eliminar sección del sistema</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardFooter>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-fuchsia-600 dark:bg-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </TooltipProvider>
  );
}
