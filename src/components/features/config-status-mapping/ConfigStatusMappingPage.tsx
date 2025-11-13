// src/components/features/config-status-mapping/ConfigStatusMappingPage.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { configStatusMappingService } from '@/services/config-status-mapping.service';
import {
  ConfigStatusMappingResponseDto,
  PaginatedResponse,
  CreateConfigStatusMappingDto,
  UpdateConfigStatusMappingDto,
  AttendanceConfigDto,
  AttendanceStatusDto,
} from '@/types/config-status-mapping.types';
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader,
  Filter,
} from 'lucide-react';

interface FilterOptions {
  configId?: number;
  statusId?: number;
}

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateConfigStatusMappingDto>({
    configId: 0,
    statusId: 0,
    displayOrder: 0,
    isActive: true,
  });
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);

  // Cargar configuración y estados
  const loadSetupData = useCallback(async () => {
    setSetupLoading(true);
    console.log('Starting loadSetupData...');
    try {
      // Get complete config with status mappings
      console.log('Fetching complete config...');
      const completeData = await configStatusMappingService.getSetupConfig();
      console.log('Complete data received:', completeData);
      
      // Extract config
      setConfig(completeData.config);
      
      // Get statuses from the getSetupStatuses endpoint for the select dropdown
      console.log('Fetching statuses...');
      const statusesData = await configStatusMappingService.getSetupStatuses();
      console.log('Statuses received:', statusesData);
      setStatuses(statusesData.filter((s) => s.isActive));
      
      // Set default configId to the current config
      if (completeData.config) {
        setFormData((prev) => ({ ...prev, configId: completeData.config.id }));
      }
      console.log('Setup data loaded successfully');
    } catch (err: any) {
      console.error('Error loading setup data:', err);
      setError(`Error al cargar configuración: ${err.message || err}`);
    } finally {
      setSetupLoading(false);
    }
  }, []);

  // Cargar mappings
  const loadMappings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response: PaginatedResponse<ConfigStatusMappingResponseDto>;

      if (filters.configId) {
        response = await configStatusMappingService.findByConfigId(
          filters.configId,
          pagination.page,
          pagination.limit,
        );
      } else if (filters.statusId) {
        response = await configStatusMappingService.findByStatusId(
          filters.statusId,
          pagination.page,
          pagination.limit,
        );
      } else {
        response = await configStatusMappingService.findAll(pagination.page, pagination.limit);
      }

      // Validar que response.data es un array
      if (!Array.isArray(response.data)) {
        console.error('Invalid response format:', response);
        setError('Formato de respuesta inválido');
        setMappings([]);
        return;
      }

      setMappings(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err: any) {
      console.error('Error loading mappings:', err);
      setError(err.message || 'Error al cargar mappings');
      setMappings([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadSetupData();
  }, [loadSetupData]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  // Crear mapping
  const handleCreate = async () => {
    if (formData.configId === 0 || formData.statusId === 0) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await configStatusMappingService.create(formData);
      setSuccess('Mapping creado correctamente');
      setShowForm(false);
      setFormData({
        configId: config?.id || 0,
        statusId: 0,
        displayOrder: 0,
        isActive: true,
      });
      setTimeout(() => setSuccess(null), 3000);
      loadMappings();
    } catch (err: any) {
      setError(err.message || 'Error al crear mapping');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar mapping
  const handleUpdate = async () => {
    if (!editingId || formData.configId === 0 || formData.statusId === 0) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await configStatusMappingService.update(editingId, {
        configId: formData.configId,
        statusId: formData.statusId,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      } as UpdateConfigStatusMappingDto);
      setSuccess('Mapping actualizado correctamente');
      setShowForm(false);
      setEditingId(null);
      setFormData({
        configId: config?.id || 0,
        statusId: 0,
        displayOrder: 0,
        isActive: true,
      });
      setTimeout(() => setSuccess(null), 3000);
      loadMappings();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar mapping');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar mapping
  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este mapping?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await configStatusMappingService.delete(id);
      setSuccess('Mapping eliminado correctamente');
      setTimeout(() => setSuccess(null), 3000);
      loadMappings();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar mapping');
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
      displayOrder: mapping.displayOrder,
      isActive: mapping.isActive,
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
      displayOrder: 0,
      isActive: true,
    });
  };

  // Get status name by id
  const getStatusName = (statusId: number) => {
    return statuses.find((s) => s.id === statusId)?.name || `Status ${statusId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Config-Status Mappings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gestiona los mappings entre configuraciones y estados
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={loading || setupLoading}
          className="px-5 py-3.5 text-sm inline-flex items-center justify-center font-medium gap-2 rounded-lg transition bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Nuevo Mapping
        </button>
      </div>

      {/* Config Info */}
      {config && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Configuración Activa:</strong> {config.defaultNotesPlaceholder || 'Config por defecto'} • 
            <strong className="ml-3">Threshold de Riesgo:</strong> {config.riskThresholdPercentage}% • 
            <strong className="ml-3">Alertas por Inasistencias:</strong> {config.consecutiveAbsenceAlert}
          </p>
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-950 border-l-4 border-green-500 p-4 rounded">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && !setupLoading && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {editingId ? 'Editar Mapping' : 'Nuevo Mapping'}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Config ID Display */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Configuración *
                </label>
                {config ? (
                  <div className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-blue-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium">
                    {config.name || `Config #${config.id}`}
                  </div>
                ) : (
                  <div className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 animate-pulse">
                    Cargando configuración...
                  </div>
                )}
              </div>

              {/* Status ID Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Estado *
                </label>
                <select
                  value={formData.statusId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      statusId: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 dark:disabled:bg-slate-600"
                  disabled={loading || statuses.length === 0}
                >
                  <option value={0}>Seleccionar estado</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.code} - {status.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  value={formData.displayOrder || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-100 dark:disabled:bg-slate-600"
                  disabled={loading}
                  min="0"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.checked,
                    })
                  }
                  disabled={loading}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Activo
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={loading}
                className="flex-1 px-5 py-3.5 text-sm inline-flex items-center justify-center font-medium gap-2 rounded-lg transition bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {editingId ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  editingId ? 'Actualizar' : 'Crear'
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-5 py-3.5 text-sm inline-flex items-center justify-center font-medium gap-2 rounded-lg transition bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Setup */}
      {setupLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-brand-500" />
          <span className="ml-3 text-slate-600 dark:text-slate-400">Cargando datos...</span>
        </div>
      )}

      {/* Filtros */}
      {!setupLoading && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-sm inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={filters.statusId || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        statusId: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Todos los estados</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.code} - {status.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilters({});
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tabla */}
      {loading && !showForm ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : mappings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No hay mappings disponibles
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600"
          >
            Crear el primer mapping
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Config ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Status ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {mappings.map((mapping) => (
                  <tr
                    key={mapping.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100 font-medium">
                      {mapping.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {mapping.configId}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {getStatusName(mapping.statusId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {mapping.displayOrder}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          mapping.isActive
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {mapping.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(mapping)}
                          disabled={loading}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition disabled:opacity-50"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(mapping.id)}
                          disabled={loading}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando {mappings.length} de {pagination.total} resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })
                }
                disabled={pagination.page === 1 || loading}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
              </div>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    page: Math.min(pagination.totalPages, pagination.page + 1),
                  })
                }
                disabled={pagination.page === pagination.totalPages || loading}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
