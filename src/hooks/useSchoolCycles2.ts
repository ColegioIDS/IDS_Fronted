'use client';

/**
 * Hook personalizado para gestionar ciclos escolares
 * Utiliza React Query para cacheo y sincronización de datos
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  SchoolCycle,
  SchoolCycleWithDetails,
  SchoolCycleStatsResponse,
  CreateSchoolCycleDto,
  UpdateSchoolCycleDto,
  QuerySchoolCyclesDto,
  SchoolCyclePaginatedResponse,
} from '@/types/SchoolCycle';
import schoolCycleService from '@/services/schoolCycleService';
import { AxiosError } from 'axios';

const QUERY_KEY = 'schoolCycles';

export const schoolCycleKeys = {
  all: ['school-cycles'] as const,
  lists: () => [...schoolCycleKeys.all, 'list'] as const,
  list: (filters?: QuerySchoolCyclesDto) => [...schoolCycleKeys.lists(), filters] as const,
  details: () => [...schoolCycleKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...schoolCycleKeys.details(), id] as const,
  active: () => [...schoolCycleKeys.all, 'active'] as const,
  stats: (id: number | string) => [...schoolCycleKeys.all, 'stats', id] as const,
};

/**
 * Hook para obtener lista paginada de ciclos escolares
 */
export const useSchoolCyclesList = (query: QuerySchoolCyclesDto = {}, enabled: boolean = true) => {
  return useQuery<SchoolCyclePaginatedResponse, AxiosError>({
    queryKey: schoolCycleKeys.list(query),
    queryFn: () => schoolCycleService.getAll(query),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Hook para obtener ciclo activo
 */
export const useActiveCycle = (enabled: boolean = true) => {
  return useQuery<SchoolCycle, AxiosError>({
    queryKey: schoolCycleKeys.active(),
    queryFn: () => schoolCycleService.getActiveCycle(),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para obtener ciclo por ID
 */
export const useSchoolCycle = (cycleId: number | null, enabled: boolean = true) => {
  return useQuery<SchoolCycleWithDetails, AxiosError>({
    queryKey: schoolCycleKeys.detail(cycleId || ''),
    queryFn: () => schoolCycleService.getById(cycleId!),
    enabled: enabled && !!cycleId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Hook para obtener estadísticas de un ciclo
 */
export const useSchoolCycleStats = (cycleId: number | null, enabled: boolean = true) => {
  return useQuery<SchoolCycleStatsResponse, AxiosError>({
    queryKey: schoolCycleKeys.stats(cycleId || ''),
    queryFn: () => schoolCycleService.getStats(cycleId!),
    enabled: enabled && !!cycleId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Hook para crear nuevo ciclo escolar
 */
export const useCreateSchoolCycle = () => {
  const queryClient = useQueryClient();

  return useMutation<SchoolCycle, AxiosError, CreateSchoolCycleDto>({
    mutationFn: (data) => schoolCycleService.create(data),
    onSuccess: (newCycle) => {
      // Invalidar lista de ciclos
      queryClient.invalidateQueries({ queryKey: schoolCycleKeys.lists() });
      // Agregar al caché
      queryClient.setQueryData([QUERY_KEY, 'detail', newCycle.id], newCycle);
    },
  });
};

/**
 * Hook para actualizar ciclo escolar
 */
export const useUpdateSchoolCycle = () => {
  const queryClient = useQueryClient();

  return useMutation<SchoolCycle, AxiosError, { id: number; data: UpdateSchoolCycleDto }>({
    mutationFn: ({ id, data }) => schoolCycleService.update(id, data),
    onSuccess: (updatedCycle, { id }) => {
      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: schoolCycleKeys.lists() });
      // Actualizar caché
      queryClient.setQueryData(schoolCycleKeys.detail(id), updatedCycle);
      if (updatedCycle.isActive) {
        queryClient.setQueryData(schoolCycleKeys.active(), updatedCycle);
      }
    },
  });
};

/**
 * Hook para activar ciclo escolar
 */
export const useActivateSchoolCycle = () => {
  const queryClient = useQueryClient();

  return useMutation<SchoolCycle, AxiosError, number>({
    mutationFn: (id) => schoolCycleService.activate(id),
    onSuccess: (activatedCycle, id) => {
      // Invalidar lista y activo
      queryClient.invalidateQueries({ queryKey: schoolCycleKeys.lists() });
      queryClient.setQueryData(schoolCycleKeys.active(), activatedCycle);
      queryClient.setQueryData(schoolCycleKeys.detail(id), activatedCycle);
    },
  });
};

/**
 * Hook para cerrar ciclo escolar
 */
export const useCloseSchoolCycle = () => {
  const queryClient = useQueryClient();

  return useMutation<SchoolCycle, AxiosError, number>({
    mutationFn: (id) => schoolCycleService.close(id),
    onSuccess: (closedCycle, id) => {
      queryClient.invalidateQueries({ queryKey: schoolCycleKeys.lists() });
      queryClient.setQueryData(schoolCycleKeys.detail(id), closedCycle);
    },
  });
};

/**
 * Hook para eliminar ciclo escolar
 */
export const useDeleteSchoolCycle = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError, number>({
    mutationFn: (id) => schoolCycleService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: schoolCycleKeys.lists() });
      queryClient.removeQueries({ queryKey: schoolCycleKeys.detail(deletedId) });
    },
  });
};
