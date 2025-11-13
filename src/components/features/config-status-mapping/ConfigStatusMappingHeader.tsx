// src/components/features/config-status-mapping/ConfigStatusMappingHeader.tsx
'use client';

import React from 'react';
import { Settings, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceConfigDto } from '@/types/config-status-mapping.types';

interface ConfigStatusMappingHeaderProps {
  config: AttendanceConfigDto | null;
  loading: boolean;
  setupLoading: boolean;
  onCreateClick: () => void;
}

export const ConfigStatusMappingHeader: React.FC<ConfigStatusMappingHeaderProps> = ({
  config,
  loading,
  setupLoading,
  onCreateClick,
}) => {
  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Mapeos de Configuración
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 ml-11 max-w-2xl">
              Configura cómo los diferentes estados de asistencia se mapean y se procesan en el sistema
            </p>
          </div>
          <Button
            onClick={onCreateClick}
            disabled={loading || setupLoading || !config}
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Mapeo</span>
          </Button>
        </div>
      </div>

      {/* Config Info Card */}
      {config && (
        <Card className="mb-8 border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Configuración Activa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Nombre
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {config.name || 'Configuración por defecto'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Umbral de Riesgo
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  <span className="text-2xl">{config.riskThresholdPercentage}%</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Alertas Consecutivas
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  <span className="text-2xl">{config.consecutiveAbsenceAlert}</span> ausencias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
