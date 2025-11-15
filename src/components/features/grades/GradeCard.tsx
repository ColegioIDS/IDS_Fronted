// src/components/features/grades/GradeCard.tsx

'use client';

import React from 'react';
import { Eye, Pencil, Trash2, BarChart3, GraduationCap, CheckCircle2, Circle, Hash, Layers, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grade } from '@/types/grades.types';
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

interface GradeCardProps {
  grade: Grade;
  onView?: (grade: Grade) => void;
  onEdit?: (grade: Grade) => void;
  onDelete?: (grade: Grade) => void;
  onViewStats?: (grade: Grade) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

/**
 * 📇 Tarjeta individual de grado con diseño premium y tooltips
 */
export function GradeCard({
  grade,
  onView,
  onEdit,
  onDelete,
  onViewStats,
  canEdit = true,
  canDelete = true,
}: GradeCardProps) {
  // Determine color scheme based on level
  const getLevelColors = () => {
    switch (grade.level) {
      case 'Primaria':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50',
          iconColor: 'text-blue-600 dark:text-blue-400',
          badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
          badgeText: 'text-blue-700 dark:text-blue-300',
          badgeBorder: 'border-blue-300 dark:border-blue-700',
        };
      case 'Secundaria':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          iconBg: 'bg-purple-100 dark:bg-purple-900/50',
          iconColor: 'text-purple-600 dark:text-purple-400',
          badgeBg: 'bg-purple-100 dark:bg-purple-900/40',
          badgeText: 'text-purple-700 dark:text-purple-300',
          badgeBorder: 'border-purple-300 dark:border-purple-700',
        };
      case 'Preparatoria':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50',
          iconColor: 'text-amber-600 dark:text-amber-400',
          badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
          badgeText: 'text-amber-700 dark:text-amber-300',
          badgeBorder: 'border-amber-300 dark:border-amber-700',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          iconBg: 'bg-gray-100 dark:bg-gray-900/50',
          iconColor: 'text-gray-600 dark:text-gray-400',
          badgeBg: 'bg-gray-100 dark:bg-gray-900/40',
          badgeText: 'text-gray-700 dark:text-gray-300',
          badgeBorder: 'border-gray-300 dark:border-gray-700',
        };
    }
  };

  const levelColors = getLevelColors();

  return (
    <TooltipProvider>
      <Card className="group relative overflow-hidden border-2 border-gray-200 dark:border-gray-800
        hover:border-primary-400 dark:hover:border-primary-600
        shadow-lg hover:shadow-2xl hover:-translate-y-1
        transition-all duration-300 ease-out
        bg-white dark:bg-gray-900">

        {/* Header */}
        <CardHeader className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700
          group-hover:border-primary-200 dark:group-hover:border-primary-800 transition-colors duration-300 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            {/* Icon with badge counter */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative p-4 rounded-xl
                  border-2 ${levelColors.border} ${levelColors.bg}
                  shadow-md group-hover:shadow-lg group-hover:scale-105
                  transition-all duration-300 ease-out cursor-help">
                  <GraduationCap className={`w-7 h-7 ${levelColors.iconColor}`} strokeWidth={2.5} />

                  {/* Activity indicator for active grades */}
                  {grade.isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                  )}

                  {/* Order badge on icon */}
                  <div className="absolute -bottom-2 -right-2 min-w-6 h-6 px-1.5
                    bg-primary-600 dark:bg-primary-500 rounded-full
                    flex items-center justify-center
                    border-2 border-white dark:border-gray-900
                    shadow-md">
                    <span className="text-xs font-bold text-white">
                      #{grade.order}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Grado {grade.name} - Orden #{grade.order}</p>
              </TooltipContent>
            </Tooltip>

            {/* Status badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`${
                  grade.isActive
                    ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-gray-100 text-gray-800 border-2 border-gray-300 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-600'
                } hover:scale-105 transition-transform duration-200 cursor-help font-semibold px-3 py-1`}>
                  {grade.isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                      Activo
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                      Inactivo
                    </>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p>{grade.isActive ? 'Grado actualmente disponible' : 'Grado inactivo'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-5 space-y-4 bg-white dark:bg-gray-900">
          {/* Grade name */}
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white cursor-help
                hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {grade.name}
              </h3>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">Nombre del grado académico</p>
            </TooltipContent>
          </Tooltip>

          {/* Level and Order info cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Level card */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`relative p-3 rounded-xl ${levelColors.bg}
                  border-2 ${levelColors.border}
                  hover:shadow-md transition-all duration-200 cursor-help overflow-hidden`}>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className={`w-4 h-4 ${levelColors.iconColor}`} strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase tracking-wide ${levelColors.badgeText}">
                        Nivel
                      </p>
                    </div>
                    <p className={`font-bold text-sm ${levelColors.badgeText}`}>
                      {grade.level}
                    </p>
                  </div>

                  {/* Decorative element */}
                  <div className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full ${levelColors.iconBg} opacity-30`} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Nivel educativo: {grade.level}</p>
              </TooltipContent>
            </Tooltip>

            {/* Order card */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20
                  border-2 border-indigo-200 dark:border-indigo-800
                  hover:shadow-md transition-all duration-200 cursor-help overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-400">
                        Orden
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 tabular-nums">
                      {grade.order}
                    </p>
                  </div>

                  {/* Decorative element */}
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 opacity-30" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Posición en la secuencia educativa</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* ID Badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-2 border-gray-300 dark:border-gray-600
                  hover:bg-gray-100 dark:hover:bg-gray-800 cursor-help font-medium px-2 py-0.5">
                  ID: {grade.id}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="text-xs">Identificador único del grado</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="flex flex-wrap gap-2 pt-4 pb-5 border-t-2 border-gray-200 dark:border-gray-700
          bg-gray-50 dark:bg-gray-900/50">
          {/* View Details */}
          {onView && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(grade)}
                  className="flex-1 min-w-[80px] border-2 border-blue-300 dark:border-blue-700
                    text-blue-700 dark:text-blue-300
                    hover:bg-blue-50 dark:hover:bg-blue-900/30
                    hover:border-blue-500 dark:hover:border-blue-600
                    transition-all duration-200 font-semibold shadow-sm hover:shadow"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                  Ver
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p>Ver detalles completos del grado</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Edit */}
          {canEdit && onEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(grade)}
                  className="flex-1 min-w-[80px] border-2 border-amber-300 dark:border-amber-700
                    text-amber-700 dark:text-amber-300
                    hover:bg-amber-50 dark:hover:bg-amber-900/30
                    hover:border-amber-500 dark:hover:border-amber-600
                    transition-all duration-200 font-semibold shadow-sm hover:shadow"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                  Editar
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p>Editar información del grado</p>
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
                  onClick={() => onViewStats(grade)}
                  className="flex-1 min-w-[80px] border-2 border-purple-300 dark:border-purple-700
                    text-purple-700 dark:text-purple-300
                    hover:bg-purple-50 dark:hover:bg-purple-900/30
                    hover:border-purple-500 dark:hover:border-purple-600
                    transition-all duration-200 font-semibold shadow-sm hover:shadow"
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                  Stats
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p>Ver estadísticas y relaciones</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Delete */}
          {canDelete && onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(grade)}
                  className="flex-1 min-w-[80px] border-2 border-red-300 dark:border-red-700
                    text-red-700 dark:text-red-300
                    hover:bg-red-50 dark:hover:bg-red-900/30
                    hover:border-red-500 dark:hover:border-red-600
                    transition-all duration-200 font-semibold shadow-sm hover:shadow"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5} />
                  Eliminar
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p>Eliminar o desactivar grado</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardFooter>

        {/* Decorative bottom border */}
        <div className="h-1.5 bg-primary-600 dark:bg-primary-500 opacity-0 group-hover:opacity-100
          transition-opacity duration-300" />
      </Card>
    </TooltipProvider>
  );
}
