// src/components/attendance-config/AttendanceConfigWrapper.tsx

'use client';

import React, { useEffect } from 'react';
import { useAttendanceConfig } from '@/hooks/useAttendanceConfig';
import {
  EditAttendanceConfigDialog,
  CreateAttendanceConfigDialog,
} from './AttendanceConfigDialogs';
import { AttendanceConfigCard } from './AttendanceConfigCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';
import {
  Settings,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { combineTheme } from '@/theme/attendanceConfigTheme';
import { UpdateAttendanceConfigDto, CreateAttendanceConfigDto } from '@/types/attendanceConfig';

/**
 * Componente contenedor para la gestión completa de AttendanceConfig
 * Integra todos los estados, diálogos y tarjetas
 */
export const AttendanceConfigWrapper: React.FC = () => {
  const {
    activeConfig,
    configs = [],
    defaults,
    isLoadingActive,
    isLoadingList,
    isLoadingDefaults,
    isUpdating,
    isCreating,
    error,
    fetchActiveConfig,
    fetchConfigs,
    fetchDefaults,
    update,
    create,
    activate,
  } = useAttendanceConfig();

  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('actual');

  // Cargar datos al montar
  useEffect(() => {
    fetchActiveConfig();
    fetchConfigs({ limit: 100 });
    fetchDefaults();
  }, []);

  const handleEditSave = async (updates: UpdateAttendanceConfigDto) => {
    if (activeConfig) {
      try {
        await update(activeConfig.id, updates);
        setEditDialogOpen(false);
      } catch (err) {
        console.error('Error al actualizar:', err);
      }
    }
  };

  console.log('Defaults:', configs);

  const handleCreateSubmit = async (data: CreateAttendanceConfigDto) => {
    try {
      await create(data);
      setCreateDialogOpen(false);
      await fetchConfigs({ limit: 100 });
    } catch (err) {
      console.error('Error al crear:', err);
    }
  };

  const handleActivate = async (configId: number) => {
    try {
      await activate(configId);
      await fetchActiveConfig();
    } catch (err) {
      console.error('Error al activar:', err);
    }
  };

  const handleRefresh = () => {
    fetchActiveConfig();
    fetchConfigs({ limit: 100 });
  };

  const isLoading = isLoadingActive || isLoadingList || isLoadingDefaults;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={combineTheme(
            'bg-blue-100 rounded-lg p-2',
            'dark:bg-blue-900/30'
          )}>
            <Settings className={combineTheme(
              'w-6 h-6 text-blue-600',
              'dark:text-blue-400'
            )} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Configuración de Asistencia
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona los parámetros globales del sistema
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-gray-300 dark:border-gray-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Config
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-200 dark:bg-gray-700" />

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando...</span>
        </div>
      )}

      {!isLoading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={combineTheme(
            'bg-gray-100 border-gray-200',
            'dark:bg-gray-800 dark:border-gray-700'
          )}>
            <TabsTrigger value="actual" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Configuración Activa
            </TabsTrigger>
            <TabsTrigger value="todas" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Todas las Configuraciones ({configs.length || 0})
            </TabsTrigger>
          </TabsList>

         {/* Tab: Configuración Activa */}
<TabsContent value="actual" className="space-y-4 mt-6">
  {activeConfig ? (
    <div className="space-y-4">
      <AttendanceConfigCard
        config={activeConfig}
        isActive={true}
        onEdit={() => setEditDialogOpen(true)}
        variant="detailed"
      />

      {/* Detalles extendidos */}
      <div className={combineTheme(
        'bg-blue-50 rounded-lg p-6 border border-blue-200',
        'dark:bg-blue-900/20 dark:border-blue-800'
      )}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Detalles de la Configuración
        </h3>

       // DESPUÉS (Corregido)
{/* Códigos Negativos */}
<div>
  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">
    Códigos Negativos
  </p>
  <div className="flex flex-wrap gap-1">
    {activeConfig?.negativeStatusCodes && activeConfig.negativeStatusCodes.length > 0 ? (
      activeConfig.negativeStatusCodes.map(code => (
        <Badge
          key={code}
          variant="outline"
          className="text-xs border-red-300 text-red-700 dark:border-red-700 dark:text-red-300"
        >
          {code}
        </Badge>
      ))
    ) : (
      <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
    )}
  </div>
</div>

{/* Notas Requeridas */}
<div>
  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">
    Notas Requeridas
  </p>
  <div className="flex flex-wrap gap-1">
    {activeConfig?.notesRequiredForStates && activeConfig.notesRequiredForStates.length > 0 ? (
      activeConfig.notesRequiredForStates.map(state => (
        <Badge
          key={state}
          variant="outline"
          className="text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
        >
          {state}
        </Badge>
      ))
    ) : (
      <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
    )}
  </div>
</div>

        <Separator className="bg-gray-200 dark:bg-gray-700 my-4" />

        {/* Info adicional */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Alertas</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {activeConfig?.consecutiveAbsenceAlert ?? 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Justif. Máx</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {activeConfig?.maxJustificationDays ?? 'N/A'}d
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Requerida</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {activeConfig?.justificationRequiredAfter ?? 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Auto-aprueba</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {activeConfig?.autoApprovalAfterDays ?? 'N/A'}d
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setEditDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Editar Configuración
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className={combineTheme(
      'bg-yellow-50 rounded-lg p-6 border border-yellow-200',
      'dark:bg-yellow-900/20 dark:border-yellow-800'
    )}>
      <p className="text-yellow-800 dark:text-yellow-300">
        No hay configuración activa. Por favor, crea una o activa una existente.
      </p>
    </div>
  )}
</TabsContent>

          {/* Tab: Todas las Configuraciones */}
          <TabsContent value="todas" className="space-y-4 mt-6">
            {configs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configs.map(config => (
                  <AttendanceConfigCard
                    key={config.id}
                    config={config}
                    isActive={activeConfig?.id === config.id}
                    onEdit={() => setEditDialogOpen(true)}
                    onActivate={() => handleActivate(config.id)}
                    variant="compact"
                  />
                ))}
              </div>
            ) : (
              <div className={combineTheme(
                'bg-gray-50 rounded-lg p-6 border border-gray-200 text-center',
                'dark:bg-gray-900/50 dark:border-gray-700'
              )}>
                <p className="text-gray-600 dark:text-gray-400">
                  No hay configuraciones creadas aún.
                </p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Configuración
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Diálogos */}
      <EditAttendanceConfigDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        config={activeConfig}
        onSave={handleEditSave}
        isLoading={isUpdating}
        error={error}
      />

      <CreateAttendanceConfigDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaults={defaults}
        onCreate={handleCreateSubmit}
        isLoading={isCreating}
        error={error}
      />
    </div>
  );
};

export default AttendanceConfigWrapper;