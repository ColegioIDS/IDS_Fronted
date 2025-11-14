// src/components/features/attendance-config/AttendanceConfigPage.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AttendanceConfig, UpdateAttendanceConfigDto, CreateAttendanceConfigDto } from '@/types/attendance-config.types';
import { attendanceConfigService } from '@/services/attendance-config.service';
import { ConfigDisplayView, ConfigEditView, ConfigActions } from './components';
import Button from '@/components/ui/button/Button';
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  X,
} from 'lucide-react';
import { ATTENDANCE_CONFIG_THEME } from './attendance-config-theme';

interface AttendanceConfigPageProps {
  compact?: boolean;
}

type ViewMode = 'display' | 'edit';

export const AttendanceConfigPage: React.FC<AttendanceConfigPageProps> = ({
  compact = false,
}) => {
  const [config, setConfig] = useState<AttendanceConfig | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('display');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Cargar configuración
  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceConfigService.getCurrent();
      setConfig(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Guardar cambios
  const handleSave = async (data: UpdateAttendanceConfigDto | CreateAttendanceConfigDto | Partial<AttendanceConfig>) => {
    if (!config) return;

    setLoading(true);
    setError(null);
    try {
      const updated = await attendanceConfigService.update(config.id, data as UpdateAttendanceConfigDto);
      setConfig(updated);
      setViewMode('display');
      setSuccess('Configuración actualizada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar configuración');
    } finally {
      setLoading(false);
    }
  };

  // Crear configuración inicial
  const handleCreate = async (data: Partial<AttendanceConfig>) => {
    setLoading(true);
    setError(null);
    try {
      const created = await attendanceConfigService.create(data as CreateAttendanceConfigDto);
      setConfig(created);
      setShowCreateForm(false);
      setViewMode('display');
      setSuccess('Configuración creada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al crear configuración');
    } finally {
      setLoading(false);
    }
  };

  // Resetear a valores por defecto
  const handleReset = async () => {
    if (
      !window.confirm(
        '¿Estás seguro de que deseas restaurar los valores por defecto? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await attendanceConfigService.reset();
      setConfig(updated);
      setViewMode('display');
      setSuccess('Configuración restaurada a valores por defecto');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al restaurar configuración');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar configuración
  const handleDelete = async () => {
    if (
      !window.confirm(
        '¿Estás seguro de que deseas eliminar la configuración? Esto podría afectar el funcionamiento del sistema.'
      )
    ) {
      return;
    }

    if (!config) return;

    setLoading(true);
    setError(null);
    try {
      await attendanceConfigService.delete(config.id);
      setConfig(null);
      setViewMode('display');
      setSuccess('Configuración eliminada correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar configuración');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Estado: Error sin configuración
  if (error && !config && !showCreateForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-red-200 dark:border-red-900 overflow-hidden">
            {/* Header rojo */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white text-center">Configuración No Encontrada</h1>
            </div>

            {/* Contenido */}
            <div className="px-6 py-8">
              <p className="text-slate-600 dark:text-slate-300 text-center mb-8 leading-relaxed">
                No existe una configuración de asistencia en el sistema. 
                <br />
                <span className="text-sm mt-2 block">Crea una nueva para comenzar</span>
              </p>

              {/* Error mensaje */}
              <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded mb-8">
                <p className="text-red-700 dark:text-red-300 text-sm font-mono">
                  {error}
                </p>
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  disabled={loading}
                  className="w-full"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Crear Configuración Ahora
                </Button>
                <Button
                  onClick={loadConfig}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reintentar
                </Button>
              </div>
            </div>

            {/* Footer info */}
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Esta configuración controla los parámetros globales del sistema de asistencia
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 📝 Estado: Formulario de creación
  if (!config && showCreateForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Crear Configuración
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Establece los parámetros iniciales del sistema de asistencia
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(false);
              setError(null);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <ConfigEditView
            config={{
              id: 0,
              name: '',
              description: null,
              riskThresholdPercentage: 80,
              consecutiveAbsenceAlert: 3,
              defaultNotesPlaceholder: null,
              lateThresholdTime: '08:30',
              markAsTardyAfterMinutes: 15,
              justificationRequiredAfter: 3,
              maxJustificationDays: 365,
              autoApproveJustification: false,
              autoApprovalAfterDays: 7,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            onSave={handleCreate}
            onCancel={() => {
              setShowCreateForm(false);
              setError(null);
            }}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // ✅ Estado: Mensaje de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-950 dark:to-slate-900 px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-900 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              ¡Operación Exitosa!
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              {success}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      {/* 🔴 Alertas de error */}
      {/* 🔴 Alertas de error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      {viewMode === 'display' && !compact && (
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Configuración de Asistencia
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Parámetros globales del sistema
            </p>
          </div>
          <ConfigActions
            onEdit={() => setViewMode('edit')}
            onReset={handleReset}
            onDelete={handleDelete}
            onRefresh={loadConfig}
            loading={loading}
            compact={false}
            showMore={true}
          />
        </div>
      )}

      {/* Vista compacta de acciones */}
      {viewMode === 'display' && compact && (
        <div className="flex justify-end">
          <ConfigActions
            onEdit={() => setViewMode('edit')}
            onReset={handleReset}
            onDelete={handleDelete}
            onRefresh={loadConfig}
            loading={loading}
            compact={true}
            showMore={true}
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        {viewMode === 'display' ? (
          <ConfigDisplayView config={config!} loading={loading} />
        ) : (
          <ConfigEditView
            config={config!}
            onSave={handleSave}
            onCancel={() => setViewMode('display')}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
