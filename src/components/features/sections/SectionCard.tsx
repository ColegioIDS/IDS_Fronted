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
 * 🏫 Tarjeta individual de sección sin gradientes y con buen contraste
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
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 bg-white dark:bg-gray-900">
      {/* Barra de utilización superior */}
      <div className="absolute top-0 left-0 right-0 h-1">
        <div 
          className={`h-full transition-all ${
            utilizationColor === 'red' ? 'bg-red-500 dark:bg-red-400' :
            utilizationColor === 'amber' ? 'bg-amber-500 dark:bg-amber-400' :
            utilizationColor === 'blue' ? 'bg-blue-500 dark:bg-blue-400' :
            'bg-emerald-500 dark:bg-emerald-400'
          }`}
          style={{ width: `${utilization}%` }}
        />
      </div>

      <CardHeader className="relative pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          {/* Icono con contraste */}
          <div className="relative">
            <div className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center border-2 bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700">
              <Users className="w-7 h-7 text-blue-700 dark:text-blue-300" />
            </div>
          </div>

          {/* Badge de profesor */}
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1.5 ${
              hasTeacher
                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                : 'bg-gray-200 text-gray-700 border-2 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
            } font-semibold px-3.5 py-1.5`}
          >
            {hasTeacher ? (
              <>
                <User className="h-3.5 w-3.5" />
                Con Profesor
              </>
            ) : (
              <>
                <UserX className="h-3.5 w-3.5" />
                Sin Profesor
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative pb-4">
        {/* Nombre de la sección */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Sección {section.name}
        </h3>
        
        {/* Nombre del grado */}
        {section.grade && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {section.grade.name}
          </p>
        )}

        {/* Info section */}
        <div className="space-y-3">
          {/* Capacidad y utilización */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Capacidad
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {enrollments} / {section.capacity}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Utilización
              </p>
              <p className={`text-lg font-bold ${
                utilizationColor === 'red' ? 'text-red-700 dark:text-red-300' :
                utilizationColor === 'amber' ? 'text-amber-700 dark:text-amber-300' :
                utilizationColor === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                'text-emerald-700 dark:text-emerald-300'
              }`}>
                {utilization}%
              </p>
            </div>
          </div>

          {/* Espacios disponibles */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Espacios disponibles:
            </span>
            <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
              {availableSpots}
            </span>
          </div>

          {/* Profesor asignado */}
          {hasTeacher && section.teacher && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <User className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 truncate">
                {section.teacher.givenNames} {section.teacher.lastNames}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="relative flex flex-wrap gap-2 pt-4 pb-5 border-t-2 border-gray-100 dark:border-gray-800">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView?.(section)}
          className="flex-1 min-w-[90px] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:border-blue-600 dark:hover:text-blue-300 transition-all duration-200 font-medium shadow-sm hover:shadow"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Ver
        </Button>

        {canEdit && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(section)}
            className="flex-1 min-w-[90px] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-amber-50 hover:border-amber-500 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:border-amber-600 dark:hover:text-amber-300 transition-all duration-200 font-medium shadow-sm hover:shadow"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Button>
        )}

        {onViewStats && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewStats(section)}
            className="flex-1 min-w-[90px] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-purple-50 hover:border-purple-500 hover:text-purple-700 dark:hover:bg-purple-950/40 dark:hover:border-purple-600 dark:hover:text-purple-300 transition-all duration-200 font-medium shadow-sm hover:shadow"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Stats
          </Button>
        )}

        {canDelete && onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(section)}
            className="flex-1 min-w-[90px] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-red-50 hover:border-red-500 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:border-red-600 dark:hover:text-red-300 transition-all duration-200 font-medium shadow-sm hover:shadow"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Eliminar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
