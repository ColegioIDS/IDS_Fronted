// src/components/features/grades/GradeDetailDialog.tsx

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GraduationCap, Hash, Layers, X, CheckCircle2, Circle, Info } from 'lucide-react';
import { Grade } from '@/types/grades.types';

interface GradeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
}

/**
 * 👁️ Dialog de detalle de grado con diseño premium
 */
export function GradeDetailDialog({
  open,
  onOpenChange,
  grade,
}: GradeDetailDialogProps) {
  if (!grade) return null;

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-gray-900">
          {/* Header con diseño azul sólido */}
          <div className="bg-indigo-600 dark:bg-indigo-700 border-b-2 border-indigo-700 dark:border-indigo-800 px-6 py-5 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Info className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                Detalle del Grado
              </DialogTitle>
              <p className="text-indigo-100 mt-2 text-sm">
                Información completa del grado académico
              </p>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 bg-white dark:bg-gray-900">
            {/* Nombre */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl
                  border-2 border-indigo-200 dark:border-indigo-800
                  hover:shadow-md transition-all duration-200 cursor-help group">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg
                    bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-300 dark:border-indigo-700
                    group-hover:scale-110 transition-transform duration-200">
                    <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-1.5">
                      Nombre del Grado
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {grade.name}
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Nombre oficial del grado académico</p>
              </TooltipContent>
            </Tooltip>

            {/* Nivel y Orden en grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Nivel */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl
                    border-2 border-purple-200 dark:border-purple-800
                    hover:shadow-md transition-all duration-200 cursor-help group">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg
                      bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-300 dark:border-purple-700
                      group-hover:scale-110 transition-transform duration-200">
                      <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-1.5">
                        Nivel Educativo
                      </p>
                      <Badge variant="outline" className="font-bold text-sm border-2 border-purple-300 dark:border-purple-700
                        bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 px-3 py-1">
                        {grade.level}
                      </Badge>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Nivel educativo al que pertenece</p>
                </TooltipContent>
              </Tooltip>

              {/* Orden */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl
                    border-2 border-blue-200 dark:border-blue-800
                    hover:shadow-md transition-all duration-200 cursor-help group">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg
                      bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-300 dark:border-blue-700
                      group-hover:scale-110 transition-transform duration-200">
                      <Hash className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1.5">
                        Orden
                      </p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 tabular-nums">
                        {grade.order}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                  <p className="font-semibold">Orden de visualización en listados</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Estado */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center justify-between p-4 rounded-xl border-2
                  hover:shadow-md transition-all duration-200 cursor-help ${
                  grade.isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="flex items-center gap-3">
                    {grade.isActive ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
                    )}
                    <p className={`text-sm font-bold uppercase tracking-wide ${
                      grade.isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Estado del Grado
                    </p>
                  </div>
                  <Badge className={`px-4 py-1.5 font-bold border-2 ${
                    grade.isActive
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'
                      : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                  }`}>
                    {grade.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">
                  {grade.isActive
                    ? 'El grado está activo y disponible para uso'
                    : 'El grado está desactivado y no está disponible'}
                </p>
              </TooltipContent>
            </Tooltip>

            {/* ID Badge */}
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="text-xs border-2 border-gray-300 dark:border-gray-600
                hover:bg-gray-100 dark:hover:bg-gray-800 font-medium px-3 py-1">
                ID: {grade.id}
              </Badge>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t-2 border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-900/50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-2 border-gray-300 dark:border-gray-600
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    font-semibold"
                >
                  <X className="h-4 w-4 mr-2" strokeWidth={2.5} />
                  Cerrar
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">Cerrar ventana de detalles</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export default GradeDetailDialog;
