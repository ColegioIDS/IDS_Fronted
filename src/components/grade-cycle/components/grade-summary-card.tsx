// ==========================================
// src/components/grade-cycle/components/grade-summary-card.tsx
// ==========================================

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Users, Building, TrendingUp } from 'lucide-react';
import { Grade } from '@/types/grades';
import { cn } from '@/lib/utils';

interface GradeSummaryCardProps {
  grade: Grade;
  stats?: {
    sectionsCount: number;
    totalCapacity: number;
    enrolledCount: number;
    occupancyRate: number;
  };
  isLinkedToCycle?: boolean;
  onToggleLink?: (gradeId: number, linked: boolean) => void;
}

export default function GradeSummaryCard({ 
  grade, 
  stats, 
  isLinkedToCycle = false,
  onToggleLink 
}: GradeSummaryCardProps) {
  
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return "text-red-600";
    if (rate >= 75) return "text-yellow-600";
    if (rate >= 50) return "text-green-600";
    return "text-blue-600";
  };

  const getOccupancyBgColor = (rate: number) => {
    if (rate >= 90) return "bg-red-600";
    if (rate >= 75) return "bg-yellow-600";
    if (rate >= 50) return "bg-green-600";
    return "bg-blue-600";
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      isLinkedToCycle && "ring-1 ring-green-500 border-green-200 dark:border-green-800"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <span>{grade.name}</span>
          </div>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              {grade.level}
            </Badge>
            {isLinkedToCycle && (
              <Badge variant="default" className="text-xs bg-green-600">
                Vinculado
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Orden: {grade.order} • {grade.isActive ? "Activo" : "Inactivo"}
        </CardDescription>
      </CardHeader>
      
      {stats && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">{stats.sectionsCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Secciones</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">{stats.enrolledCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Matriculados</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className={cn("text-sm font-medium", getOccupancyColor(stats.occupancyRate))}>
                    {Math.round(stats.occupancyRate)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Ocupación</p>
              </div>
            </div>

            {/* Barra de capacidad */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Capacidad: {stats.totalCapacity}</span>
                <span>{stats.enrolledCount} matriculados</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={cn("h-2 rounded-full transition-all duration-300", getOccupancyBgColor(stats.occupancyRate))}
                  style={{ width: `${Math.min(100, stats.occupancyRate)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}