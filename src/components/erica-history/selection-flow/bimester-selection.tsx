// src/components/erica-history/selection-flow/bimester-selection.tsx
"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

// Types
import { SchoolCycle } from '@/types/SchoolCycle';
import { Bimester } from '@/types/SchoolBimesters';

// ==================== INTERFACES ====================
interface BimesterSelectionProps {
  selectedCycle: SchoolCycle;
  availableBimesters: Bimester[];
  selectedBimester: Bimester | null;
  onSelect: (bimester: Bimester) => void;
  isCompleted: boolean;
  onEdit: () => void;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function BimesterSelection({
  selectedCycle,
  availableBimesters,
  selectedBimester,
  onSelect,
  isCompleted,
  onEdit
}: BimesterSelectionProps) {

  // ========== COMPUTED VALUES ==========
  
  // Ordenar bimestres por número
  const sortedBimesters = useMemo(() => {
    return [...availableBimesters].sort((a, b) => (a.number || 0) - (b.number || 0));
  }, [availableBimesters]);

  // Encontrar bimestre activo
  const activeBimester = useMemo(() => {
    return availableBimesters.find(b => b.isActive) || null;
  }, [availableBimesters]);

  // ========== FUNCIONES ==========
  
  const getBimesterStatus = (bimester: Bimester) => {
    const now = new Date();
    const startDate = new Date(bimester.startDate);
    const endDate = new Date(bimester.endDate);

    if (bimester.isActive) {
      return { 
        status: 'active', 
        text: 'Actual', 
        color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
        icon: Clock 
      };
    } else if (now < startDate) {
      return { 
        status: 'upcoming', 
        text: 'Próximo', 
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
        icon: Calendar 
      };
    } else if (now > endDate) {
      return { 
        status: 'completed', 
        text: 'Completado', 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
        icon: CheckCircle2 
      };
    } else {
      return { 
        status: 'inactive', 
        text: 'Inactivo', 
        color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
        icon: AlertTriangle 
      };
    }
  };

  const formatDateRange = (bimester: Bimester) => {
    const startDate = new Date(bimester.startDate);
    const endDate = new Date(bimester.endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // ========== VISTA COMPLETADA ==========
  if (isCompleted && selectedBimester) {
    const status = getBimesterStatus(selectedBimester);
    
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <div className="font-semibold text-green-800 dark:text-green-200">
              {selectedBimester.name}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {formatDateRange(selectedBimester)} • {status.text}
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
            Bimestre seleccionado
          </Badge>
        </div>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
        >
          Cambiar
        </Button>
      </div>
    );
  }

  // ========== ESTADO VACÍO ==========
  if (sortedBimesters.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No hay bimestres configurados para el ciclo "{selectedCycle.name}". 
          Configure los bimestres académicos para consultar las evaluaciones.
        </AlertDescription>
      </Alert>
    );
  }

  // ========== VISTA DE SELECCIÓN ==========
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Seleccione el bimestre para consultar las evaluaciones del ciclo "{selectedCycle.name}"
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {sortedBimesters.length} bimestre{sortedBimesters.length !== 1 ? 's' : ''} disponible{sortedBimesters.length !== 1 ? 's' : ''}
          </Badge>
          {activeBimester && (
            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
              Recomendado: {activeBimester.name}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedBimesters.map((bimester) => {
          const status = getBimesterStatus(bimester);
          const StatusIcon = status.icon;
          
          return (
            <Card 
              key={bimester.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2 ${
                bimester.isActive 
                  ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/30'
                  : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <CardContent className="p-6">
                <button
                  onClick={() => onSelect(bimester)}
                  className="w-full text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${status.color}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                          {bimester.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Bimestre {bimester.number || 0}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium ${status.color.replace('bg-', 'border-').replace('text-', 'text-')}`}
                    >
                      {status.text}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange(bimester)}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span>Duración: {bimester.weeksCount} semanas</span>
                    </div>
                    
                    {bimester.isActive && (
                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Bimestre actual recomendado</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Click para seleccionar</span>
                      <span>→</span>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info adicional */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Información sobre bimestres:
            </div>
            <div className="space-y-2 text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span><strong>Actual:</strong> Bimestre en curso (recomendado para consultas recientes)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span><strong>Completado:</strong> Bimestre finalizado (ideal para análisis histórico)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span><strong>Próximo:</strong> Bimestre futuro (puede no tener evaluaciones)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
        Se mostrará el grid QNA completo con las 8 semanas académicas del bimestre seleccionado
      </div>
    </div>
  );
}