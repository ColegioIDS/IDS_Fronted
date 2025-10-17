// src/hooks/useEnrollment.ts

import { useState, useCallback } from 'react';
import {
  getEnrollmentFormData,
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  graduateEnrollment,
  transferEnrollment,
  reactivateEnrollment,
  bulkGraduateEnrollments,
  bulkTransferEnrollments
} from '@/services/enrollment.service';
import type {
  EnrollmentFormDataResponse,
  EnrollmentResponse,
  EnrollmentDetailResponse,
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentQueryParams
} from '@/types/enrollment.types';

interface UseEnrollmentOptions {
  autoLoadFormData?: boolean;
  autoLoadEnrollments?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface UseEnrollmentReturn {
  // Estado
  formData: EnrollmentFormDataResponse | null;
  enrollments: EnrollmentResponse[];
  selectedEnrollment: EnrollmentDetailResponse | null;
  isLoading: boolean;
  isLoadingFormData: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Métodos de carga
  loadFormData: () => Promise<void>;
  loadEnrollments: (params?: EnrollmentQueryParams) => Promise<void>;
  loadEnrollmentById: (id: number) => Promise<EnrollmentDetailResponse | null>;

  // Métodos CRUD
  createEnrollmentItem: (data: CreateEnrollmentDto) => Promise<EnrollmentResponse | null>;
  updateEnrollmentItem: (id: number, data: UpdateEnrollmentDto) => Promise<EnrollmentResponse | null>;
  deleteEnrollmentItem: (id: number) => Promise<boolean>;

  // Métodos de cambio de estado
  graduateEnrollmentItem: (id: number) => Promise<EnrollmentResponse | null>;
  transferEnrollmentItem: (id: number) => Promise<EnrollmentResponse | null>;
  reactivateEnrollmentItem: (id: number) => Promise<EnrollmentResponse | null>;

  // Operaciones en lote
  bulkGraduate: (ids: number[]) => Promise<EnrollmentResponse[]>;
  bulkTransfer: (ids: number[]) => Promise<EnrollmentResponse[]>;

  // Utilidades
  clearError: () => void;
  setSelectedEnrollment: (enrollment: EnrollmentDetailResponse | null) => void;
}

export function useEnrollment(options: UseEnrollmentOptions = {}): UseEnrollmentReturn {
  const {
    autoLoadFormData = false,
    autoLoadEnrollments = false,
    onSuccess,
    onError
  } = options;

  // ==================== ESTADO ====================
  const [formData, setFormData] = useState<EnrollmentFormDataResponse | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== CARGA DE DATOS ====================

  /**
   * Carga todos los datos necesarios para el formulario de matrícula
   */
  const loadFormData = useCallback(async () => {
    try {
      setIsLoadingFormData(true);
      setError(null);
      
      const data = await getEnrollmentFormData();
      setFormData(data);
      
      console.log('✅ Form data cargado:', data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar datos del formulario';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error cargando form data:', err);
    } finally {
      setIsLoadingFormData(false);
    }
  }, [onError]);

  /**
   * Carga lista de matrículas con filtros opcionales
   */
  const loadEnrollments = useCallback(async (params?: EnrollmentQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getEnrollments(params);
      setEnrollments(data);
      
      console.log('✅ Matrículas cargadas:', data.length);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar matrículas';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error cargando matrículas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  /**
   * Carga una matrícula específica por ID
   */
  const loadEnrollmentById = useCallback(async (id: number): Promise<EnrollmentDetailResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getEnrollmentById(id);
      setSelectedEnrollment(data);
      
      console.log('✅ Matrícula cargada:', data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar matrícula';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error cargando matrícula:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // ==================== OPERACIONES CRUD ====================

  /**
   * Crea una nueva matrícula
   */
  const createEnrollmentItem = useCallback(async (
    data: CreateEnrollmentDto
  ): Promise<EnrollmentResponse | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newEnrollment = await createEnrollment(data);
      
      // Actualizar lista local
      setEnrollments(prev => [newEnrollment, ...prev]);
      
      // Recargar form data para actualizar estadísticas
      await loadFormData();
      
      const successMessage = 'Matrícula creada exitosamente';
      onSuccess?.(successMessage);
      console.log('✅ Matrícula creada:', newEnrollment);
      
      return newEnrollment;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear matrícula';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error creando matrícula:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadFormData, onSuccess, onError]);

  /**
   * Actualiza una matrícula existente
   */
  const updateEnrollmentItem = useCallback(async (
    id: number,
    data: UpdateEnrollmentDto
  ): Promise<EnrollmentResponse | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedEnrollment = await updateEnrollment(id, data);
      
      // Actualizar lista local
      setEnrollments(prev => 
        prev.map(item => item.id === id ? updatedEnrollment : item)
      );
      
      // Actualizar selección si es la misma
      if (selectedEnrollment?.id === id) {
        setSelectedEnrollment(prev => prev ? { ...prev, ...updatedEnrollment } : null);
      }
      
      // Recargar form data
      await loadFormData();
      
      const successMessage = 'Matrícula actualizada exitosamente';
      onSuccess?.(successMessage);
      console.log('✅ Matrícula actualizada:', updatedEnrollment);
      
      return updatedEnrollment;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar matrícula';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error actualizando matrícula:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedEnrollment, loadFormData, onSuccess, onError]);

  /**
   * Elimina una matrícula
   */
  const deleteEnrollmentItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await deleteEnrollment(id);
      
      // Actualizar lista local
      setEnrollments(prev => prev.filter(item => item.id !== id));
      
      // Limpiar selección si es la misma
      if (selectedEnrollment?.id === id) {
        setSelectedEnrollment(null);
      }
      
      // Recargar form data
      await loadFormData();
      
      const successMessage = 'Matrícula eliminada exitosamente';
      onSuccess?.(successMessage);
      console.log('✅ Matrícula eliminada:', id);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar matrícula';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error eliminando matrícula:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedEnrollment, loadFormData, onSuccess, onError]);

  // ==================== CAMBIOS DE ESTADO ====================

  /**
   * Gradúa una matrícula
   */
  const graduateEnrollmentItem = useCallback(async (
    id: number
  ): Promise<EnrollmentResponse | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const graduatedEnrollment = await graduateEnrollment(id);
      
      // Actualizar lista local
      setEnrollments(prev => 
        prev.map(item => item.id === id ? graduatedEnrollment : item)
      );
      
      await loadFormData();
      
      const successMessage = 'Matrícula graduada exitosamente';
      onSuccess?.(successMessage);
      console.log('✅ Matrícula graduada:', graduatedEnrollment);
      
      return graduatedEnrollment;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al graduar matrícula';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error graduando matrícula:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadFormData, onSuccess, onError]);

  /**
   * Transfiere una matrícula
   */
  const transferEnrollmentItem = useCallback(async (
    id: number
  ): Promise<EnrollmentResponse | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const transferredEnrollment = await transferEnrollment(id);
      
      setEnrollments(prev => 
        prev.map(item => item.id === id ? transferredEnrollment : item)
      );
      
      await loadFormData();
      
      const successMessage = 'Matrícula transferida exitosamente';
      onSuccess?.(successMessage);
      console.log('✅ Matrícula transferida:', transferredEnrollment);
      
      return transferredEnrollment;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al transferir matrícula';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error transfiriendo matrícula:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadFormData, onSuccess, onError]);

  /**
   * Reactiva una matrícula
   */
  const reactivateEnrollmentItem = useCallback(async (
    id: number
  ): Promise<EnrollmentResponse | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const reactivatedEnrollment = await reactivateEnrollment(id);
      
      setEnrollments(prev => 
        prev.map(item => item.id === id ? reactivatedEnrollment : item)
      );
      
      await loadFormData();
      
      const successMessage = 'Matrícula reactivada exitosamente';
      onSuccess?.(successMessage);
      console.log('✅ Matrícula reactivada:', reactivatedEnrollment);
      
      return reactivatedEnrollment;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al reactivar matrícula';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error reactivando matrícula:', err);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadFormData, onSuccess, onError]);

  // ==================== OPERACIONES EN LOTE ====================

  /**
   * Gradúa múltiples matrículas
   */
  const bulkGraduate = useCallback(async (ids: number[]): Promise<EnrollmentResponse[]> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const graduatedEnrollments = await bulkGraduateEnrollments(ids);
      
      // Actualizar lista local
      setEnrollments(prev => 
        prev.map(item => {
          const updated = graduatedEnrollments.find(g => g.id === item.id);
          return updated || item;
        })
      );
      
      await loadFormData();
      
      const successMessage = `${ids.length} matrículas graduadas exitosamente`;
      onSuccess?.(successMessage);
      console.log('✅ Matrículas graduadas:', graduatedEnrollments);
      
      return graduatedEnrollments;
    } catch (err: any) {
      const errorMessage = err.message || 'Error en graduación masiva';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error en graduación masiva:', err);
      return [];
    } finally {
      setIsSubmitting(false);
    }
  }, [loadFormData, onSuccess, onError]);

  /**
   * Transfiere múltiples matrículas
   */
  const bulkTransfer = useCallback(async (ids: number[]): Promise<EnrollmentResponse[]> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const transferredEnrollments = await bulkTransferEnrollments(ids);
      
      setEnrollments(prev => 
        prev.map(item => {
          const updated = transferredEnrollments.find(t => t.id === item.id);
          return updated || item;
        })
      );
      
      await loadFormData();
      
      const successMessage = `${ids.length} matrículas transferidas exitosamente`;
      onSuccess?.(successMessage);
      console.log('✅ Matrículas transferidas:', transferredEnrollments);
      
      return transferredEnrollments;
    } catch (err: any) {
      const errorMessage = err.message || 'Error en transferencia masiva';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('❌ Error en transferencia masiva:', err);
      return [];
    } finally {
      setIsSubmitting(false);
    }
  }, [loadFormData, onSuccess, onError]);

  // ==================== UTILIDADES ====================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== EFECTOS INICIALES ====================

  // Auto-cargar form data al montar
  useState(() => {
    if (autoLoadFormData) {
      loadFormData();
    }
  });

  // Auto-cargar matrículas al montar
  useState(() => {
    if (autoLoadEnrollments) {
      loadEnrollments();
    }
  });

  // ==================== RETURN ====================

  return {
    // Estado
    formData,
    enrollments,
    selectedEnrollment,
    isLoading,
    isLoadingFormData,
    isSubmitting,
    error,

    // Métodos de carga
    loadFormData,
    loadEnrollments,
    loadEnrollmentById,

    // CRUD
    createEnrollmentItem,
    updateEnrollmentItem,
    deleteEnrollmentItem,

    // Cambios de estado
    graduateEnrollmentItem,
    transferEnrollmentItem,
    reactivateEnrollmentItem,

    // Operaciones en lote
    bulkGraduate,
    bulkTransfer,

    // Utilidades
    clearError,
    setSelectedEnrollment
  };
}