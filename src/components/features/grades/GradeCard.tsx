// src/components/features/grades/GradeCard.tsx

'use client';

import React from 'react';
import { Eye, Pencil, Trash2, BarChart3, GraduationCap, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grade } from '@/types/grades.types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

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
 * 📇 Tarjeta individual de grado con diseño premium
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
  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 bg-white dark:bg-gray-900">
      {/* Status indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1">
        <div 
          className={`h-full ${
            grade.isActive 
              ? 'bg-emerald-500 dark:bg-emerald-400' 
              : 'bg-gray-400 dark:bg-gray-600'
          }`}
        />
      </div>

      <CardHeader className="relative pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          {/* Icon con buen contraste */}
          <div className="relative">
            <div className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center border-2 ${
              grade.isActive
                ? 'bg-primary-50 dark:bg-primary-950 border-primary-300 dark:border-primary-700'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
            }`}>
              <GraduationCap className={`w-7 h-7 ${
                grade.isActive
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
          </div>

          {/* Status badge sin gradientes */}
          <Badge
            variant={grade.isActive ? 'default' : 'secondary'}
            className={`inline-flex items-center gap-1.5 ${
              grade.isActive
                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                : 'bg-gray-200 text-gray-700 border-2 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
            } font-semibold px-3.5 py-1.5`}
          >
            {grade.isActive ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Activo
              </>
            ) : (
              <>
                <Circle className="h-3.5 w-3.5" />
                Inactivo
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative pb-4">
        {/* Grade name con buen contraste */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {grade.name}
        </h3>

        {/* Info section sin gradientes */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Nivel:</span>
            <Badge 
              variant="outline" 
              className="font-bold border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-900 text-blue-800 dark:text-blue-300 px-2.5"
            >
              {grade.level}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Orden:</span>
            <span className="text-sm font-bold text-purple-800 dark:text-purple-300">
              #{grade.order}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative flex flex-wrap gap-2 pt-4 pb-5 border-t-2 border-gray-100 dark:border-gray-800">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView?.(grade)}
          className="flex-1 min-w-[90px] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:border-blue-600 dark:hover:text-blue-300 transition-all duration-200 font-medium shadow-sm hover:shadow"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Ver
        </Button>

        {canEdit && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(grade)}
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
            onClick={() => onViewStats(grade)}
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
            onClick={() => onDelete(grade)}
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
