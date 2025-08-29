// ==========================================
// src/components/grade-cycle/components/cycle-info-card.tsx
// ==========================================

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface CycleInfoCardProps {
  cycle: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  progress: number;
  daysRemaining: number;
  totalEnrollments?: number;
}

export default function CycleInfoCard({ 
  cycle, 
  progress, 
  daysRemaining, 
  totalEnrollments = 0 
}: CycleInfoCardProps) {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200">{cycle.name}</span>
          </div>
          <Badge variant={cycle.isActive ? "default" : "secondary"}>
            {cycle.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Ciclo escolar actual - {totalEnrollments} estudiantes matriculados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Período</p>
              <p className="text-xs text-muted-foreground">
                {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Tiempo Restante</p>
              <p className="text-xs text-muted-foreground">
                {daysRemaining} días
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Progreso del Año
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
