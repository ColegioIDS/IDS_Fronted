// src/components/features/config-status-mapping/ConfigStatusMappingPage.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { configStatusMappingService } from '@/services/config-status-mapping.service';
import {
  ConfigStatusMappingResponseDto,
  CreateConfigStatusMappingDto,
  UpdateConfigStatusMappingDto,
  AttendanceConfigDto,
  AttendanceStatusDto,
} from '@/types/config-status-mapping.types';
import { Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ConfigStatusMappingHeader } from './ConfigStatusMappingHeader';
import { ConfigStatusMappingForm } from './ConfigStatusMappingForm';
import { ConfigStatusMappingTable } from './ConfigStatusMappingTable';

export const ConfigStatusMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<ConfigStatusMappingResponseDto[]>([]);
  const [config, setConfig] = useState<AttendanceConfigDto | null>(null);
  const [statuses, setStatuses] = useState<AttendanceStatusDto[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateConfigStatusMappingDto>({
    configId: 0,
    statusId: 0,
    mappingType: 'negative',
  });

  // Cargar configuración y estados
  const loadSetupData = useCallback(async () => {
    setSetupLoading(true);
    try {
      const completeData = await configStatusMappingService.getSetupConfig();
      setConfig(completeData.config);

      const statusesData = await configStatusMappingService.getSetupStatuses();
      setStatuses(statusesData.filter((s) => s.isActive));

      if (completeData.config) {
        setFormData((prev) => ({ ...prev, configId: completeData.config.id }));
      }
    } catch (err: any) {
      toast.error('Error al cargar la configuración', {
        description: err.message || 'Por favor intenta recargar la página',
      });
    } finally {
      setSetupLoading(false);
    }
  }, []);

  // Cargar mappings
  const loadMappings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await configStatusMappingService.findAll(
        pagination.page,
        pagination.limit
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Formato de respuesta inválido');
      }

      setMappings(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err: any) {
      toast.error('Error al cargar mapeos', {
        description: err.message,
      });
      setMappings([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    loadSetupData();
  }, [loadSetupData]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  // Crear mapping
  const handleCreate = async () => {
    if (formData.configId === 0 || formData.statusId === 0) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    setLoading(true);
    try {
      await configStatusMappingService.create(formData);
      toast.success('Mapeo creado', {
        description: 'El mapeo se ha creado correctamente',
      });
      setShowForm(false);
      setFormData({
        configId: config?.id || 0,
        statusId: 0,
        mappingType: 'negative',
      });
      loadMappings();
    } catch (err: any) {
      toast.error('Error al crear mapeo', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Actualizar mapping
  const handleUpdate = async () => {
    if (!editingId || formData.configId === 0 || formData.statusId === 0) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa todos los campos obligatorios',
      });
      return;
    }

    setLoading(true);
    try {
      await configStatusMappingService.update(editingId, {
        configId: formData.configId,
        statusId: formData.statusId,
        mappingType: formData.mappingType,
      } as UpdateConfigStatusMappingDto);

      toast.success('Mapeo actualizado', {
        description: 'El mapeo se ha actualizado correctamente',
      });
      setShowForm(false);
      setEditingId(null);
      setFormData({
        configId: config?.id || 0,
        statusId: 0,
        mappingType: 'negative',
      });
      loadMappings();
    } catch (err: any) {
      toast.error('Error al actualizar mapeo', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar mapping
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este mapeo?')) {
      return;
    }

    setLoading(true);
    try {
      await configStatusMappingService.delete(id);
      toast.success('Mapeo eliminado', {
        description: 'El mapeo se ha eliminado correctamente',
      });
      loadMappings();
    } catch (err: any) {
      toast.error('Error al eliminar mapeo', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Editar mapping
  const handleEdit = (mapping: ConfigStatusMappingResponseDto) => {
    setEditingId(mapping.id);
    setFormData({
      configId: mapping.configId,
      statusId: mapping.statusId,
      mappingType: mapping.mappingType,
    });
    setShowForm(true);
  };

  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      configId: config?.id || 0,
      statusId: 0,
      mappingType: 'negative',
    });
  };

  const getStatusName = (statusId: number) => {
    return statuses.find((s) => s.id === statusId)?.name || `Status ${statusId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header con Info de Configuración */}
      <ConfigStatusMappingHeader
        config={config}
        loading={loading}
        setupLoading={setupLoading}
        onCreateClick={() => setShowForm(true)}
      />

      {/* Form Dialog */}
      <ConfigStatusMappingForm
        open={showForm}
        loading={loading}
        editingId={editingId}
        config={config}
        statuses={statuses}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={editingId ? handleUpdate : handleCreate}
        onCancel={handleCancel}
      />

      {/* Loading State */}
      {setupLoading && (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full">
              <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">Cargando configuración...</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Por favor espera mientras se cargan los datos</p>
          </CardContent>
        </Card>
      )}

      {/* Mappings Table */}
      {!setupLoading && (
        <ConfigStatusMappingTable
          mappings={mappings}
          loading={loading}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          getStatusName={getStatusName}
        />
      )}
    </div>
  );
};
