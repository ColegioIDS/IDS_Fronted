// ==========================================
// src/components/grade-cycle/components/cycle-selection-list.tsx
// ==========================================

"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CycleOption {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  enrollmentsCount?: number;
}

interface CycleSelectionListProps {
  cycles: CycleOption[];
  selectedCycleId: string;
  onSelect: (cycleId: string) => void;
  onActivate: (cycleId: string) => void;
  loading?: boolean;
}

export default function CycleSelectionList({
  cycles,
  selectedCycleId,
  onSelect,
  onActivate,
  loading = false
}: CycleSelectionListProps) {
  
  const now = new Date();
  
  const categorizedCycles = {
    future: cycles.filter(cycle => new Date(cycle.startDate) > now),
    past: cycles.filter(cycle => new Date(cycle.endDate) < now && !cycle.isActive),
    inactive: cycles.filter(cycle => !cycle.isActive && new Date(cycle.startDate) <= now && new Date(cycle.endDate) >= now)
  };

  const renderCycleCard = (cycle: CycleOption, category: 'future' | 'past' | 'inactive') => {
    const isSelected = cycle.id.toString() === selectedCycleId;
    
    return (
      <Card 
        key={cycle.id}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-blue-500 border-blue-200 dark:border-blue-800"
        )}
        onClick={() => onSelect(cycle.id.toString())}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {cycle.name}
            </h4>
            <div className="flex gap-1">
              {category === 'future' && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Futuro
                </Badge>
              )}
              {category === 'past' && (
                <Badge variant="secondary">
                  Pasado
                </Badge>
              )}
              <Badge variant={cycle.isActive ? "default" : "outline"}>
                {cycle.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Período:</span>
              <span>
                {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
              </span>
            </div>
            
            {cycle.enrollmentsCount !== undefined && (
              <div className="flex items-center justify-between">
                <span>Estudiantes:</span>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{cycle.enrollmentsCount}</span>
                </div>
              </div>
            )}
          </div>

          {isSelected && (
            <div className="mt-3 pt-3 border-t flex justify-end">
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate(cycle.id.toString());
                }}
                disabled={loading || cycle.isActive}
              >
                {cycle.isActive ? "Ya Activo" : (
                  <>
                    Activar Ciclo
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (cycles.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay ciclos escolares disponibles</p>
        <p className="text-sm text-muted-foreground">Cree un nuevo ciclo para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ciclos Futuros */}
      {categorizedCycles.future.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ciclos Futuros ({categorizedCycles.future.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categorizedCycles.future.map(cycle => renderCycleCard(cycle, 'future'))}
          </div>
        </div>
      )}

      {/* Ciclos Inactivos (Actuales) */}
      {categorizedCycles.inactive.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            Ciclos Inactivos ({categorizedCycles.inactive.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categorizedCycles.inactive.map(cycle => renderCycleCard(cycle, 'inactive'))}
          </div>
        </div>
      )}

      {/* Ciclos Pasados */}
      {categorizedCycles.past.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            Ciclos Anteriores ({categorizedCycles.past.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categorizedCycles.past.slice(0, 4).map(cycle => renderCycleCard(cycle, 'past'))}
          </div>
          {categorizedCycles.past.length > 4 && (
            <p className="text-xs text-muted-foreground text-center">
              Y {categorizedCycles.past.length - 4} ciclos más...
            </p>
          )}
        </div>
      )}
    </div>
  );
}