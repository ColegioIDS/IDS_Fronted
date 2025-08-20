// components/academic-weeks/academic-week-card.tsx
"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Target,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAcademicWeekActions } from '@/context/AcademicWeeksContext';
import { AcademicWeek } from '@/types/academic-week.types';
import { EditWeekDialog } from './edit-week-dialog';
import { DeleteWeekDialog } from './delete-week-dialog';
import { cn } from '@/lib/utils';
import { 
  parseUTCAsLocal, 
  calculateWeekProgress, 
  calculateDaysRemaining, 
  calculateTotalDays 
} from '@/utils/date-helpers';

interface AcademicWeekCardProps {
  week: AcademicWeek;
}

export function AcademicWeekCard({ week }: AcademicWeekCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const now = new Date();
  const startDate = parseUTCAsLocal(week.startDate);
  const endDate = parseUTCAsLocal(week.endDate);
  
  const isActive = startDate <= now && now <= endDate;
  const isPast = endDate < now;
  const isFuture = startDate > now;

  const getStatusInfo = () => {
    if (isActive) return {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800',
      text: 'En curso',
      cardStyle: 'ring-2 ring-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/10 dark:to-background'
    };
    if (isPast) return {
      color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-700',
      text: 'Completada',
      cardStyle: 'bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-950/10 dark:to-background'
    };
    return {
      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800',
      text: 'Próxima',
      cardStyle: 'bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/10 dark:to-background'
    };
  };

  const statusInfo = getStatusInfo();
  
  // Usar las funciones utilitarias
  const weekProgress = calculateWeekProgress(startDate, endDate);
  const daysRemaining = calculateDaysRemaining(endDate);
  const totalDays = calculateTotalDays(startDate, endDate);

  return (
    <>
      <Card className={cn(
        "group hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 hover:-translate-y-1 border-0 shadow-md",
        statusInfo.cardStyle
      )}>
        <CardHeader className="pb-4 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 -translate-y-6 translate-x-6" />
          
          <div className="flex items-start justify-between relative">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 dark:bg-background/80 shadow-sm border border-white/50 dark:border-border/50">
                  <BookOpen className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    Semana {week.number}
                  </h3>
                  <Badge className={cn("text-xs font-medium px-2.5 py-1", statusInfo.color)}>
                    {statusInfo.text}
                  </Badge>
                </div>
              </div>
              
              {week.bimester && (
                <div className="flex items-center gap-2 pl-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {week.bimester.name}
                  </p>
                  {week.bimester.cycle && (
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      • {week.bimester.cycle.name}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 hover:bg-white/80 dark:hover:bg-background/80 shadow-sm border border-white/50 dark:border-border/50 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => setIsEditOpen(true)}
                  className="cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar semana
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar semana
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* Información de fechas mejorada */}
          <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 border border-white/50 dark:border-border/50 backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {format(startDate, 'dd MMM', { locale: es })} - {format(endDate, 'dd MMM yyyy', { locale: es })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {totalDays} {totalDays === 1 ? 'día' : 'días'} de duración
                    </p>
                  </div>
                </div>
                
                {isActive && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
                      <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        {daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500">
                        Semana en progreso
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Indicador visual del progreso si está activa */}
              {isActive && (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {weekProgress}%
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                    Progreso
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Objetivos */}
          {week.objectives && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                  <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Objetivos de la semana
                </h4>
              </div>
              <div className="bg-white/60 dark:bg-background/60 rounded-lg p-3 border border-white/50 dark:border-border/50 backdrop-blur-sm">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {week.objectives}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditWeekDialog 
        week={week}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      
      <DeleteWeekDialog 
        week={week}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}