// components/academic-weeks/current-week-card.tsx
"use client";

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Target,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AcademicWeek } from '@/types/academic-week.types';
import { useCurrentAcademicWeek } from '@/context/AcademicWeeksContext';

// Función helper para parsear fechas UTC como fechas locales
const parseUTCAsLocal = (dateString: string) => {
  const dateOnly = dateString.split('T')[0];
  return new Date(dateOnly + 'T00:00:00');
};

interface CurrentWeekCardProps {
  week: AcademicWeek;
}

export function CurrentWeekCard({ week }: CurrentWeekCardProps) {
  const { progress, daysRemaining } = useCurrentAcademicWeek();

  // ✅ DEFINIR las fechas antes del console.log
  const startDate = parseUTCAsLocal(week.startDate);
  const endDate = parseUTCAsLocal(week.endDate);


  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Semana Actual
          </CardTitle>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Semana {week.number}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Info del bimestre */}
        {week.bimester && (
          <p className="text-blue-700 font-medium">
            {week.bimester.name}
          </p>
        )}

        {/* Fechas - ✅ USAR las fechas parseadas */}
        <div className="flex items-center gap-4 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(startDate, 'dd MMM', { locale: es })} - {format(endDate, 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{daysRemaining} días restantes</span>
          </div>
        </div>

        {/* Progreso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="h-4 w-4" />
              <span>Progreso de la semana</span>
            </div>
            <span className="font-medium text-blue-900">{progress.toFixed(0)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
            style={{
              background: 'rgb(219 234 254)', // blue-100
            }}
          />
        </div>

        {/* Objetivos */}
        {week.objectives && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <Target className="h-4 w-4" />
              Objetivos de esta semana
            </div>
            <p className="text-blue-600 text-sm leading-relaxed bg-white/60 p-3 rounded-lg">
              {week.objectives}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}