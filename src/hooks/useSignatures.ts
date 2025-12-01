// src/hooks/useSignatures.ts
import { useState, useCallback } from 'react';
import { signaturesService } from '@/services/signatures.service';
import {
  Signature,
  SignatureType,
  CreateSignatureRequest,
  UpdateSignatureRequest,
  SignatureFilters,
  PaginatedSignaturesResponse,
  SignaturesForCartaResponse,
} from '@/types/signatures.types';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

interface UseSignaturesState {
  signatures: Signature[];
  loading: boolean;
  error: string | null;
}

export const useSignatures = () => {
  const [state, setState] = useState<UseSignaturesState>({
    signatures: [],
    loading: false,
    error: null,
  });

  // Obtener todas las firmas
  const fetchSignatures = useCallback(
    async (filters?: SignatureFilters) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await signaturesService.getAllSignatures(filters);
        setState((prev) => ({ ...prev, signatures: response.data, loading: false }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error fetching signatures';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      }
    },
    []
  );

  // Crear firma
  const createSignature = useCallback(
    async (data: CreateSignatureRequest | any) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        let processedData = { ...data };

        // 📸 Si hay un File de imagen, subirlo a Cloudinary
        if (data.signatureFile instanceof File) {
          try {
            const cloudinaryResponse = await uploadImageToCloudinary(
              data.signatureFile,
              'signatures'
            );

            // ✅ Reemplazar el File con los datos de Cloudinary
            processedData.signatureUrl = cloudinaryResponse.url;
            processedData.publicId = cloudinaryResponse.publicId;
            delete processedData.signatureFile; // Eliminar el archivo temporal
          } catch (err: any) {
            throw new Error(`Error al subir imagen: ${err.message}`);
          }
        }

        const newSignature = await signaturesService.createSignature(processedData);
        setState((prev) => ({
          ...prev,
          signatures: Array.isArray(prev.signatures) ? [...prev.signatures, newSignature] : [newSignature],
          loading: false,
        }));
        return newSignature;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error creating signature';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  // Obtener firma por ID
  const getSignatureById = useCallback(
    async (id: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const signature = await signaturesService.getSignatureById(id);
        setState((prev) => ({ ...prev, loading: false }));
        return signature;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error fetching signature';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  // Obtener firmas por tipo
  const getSignaturesByType = useCallback(
    async (type: SignatureType, schoolCycleId?: number, isDefault?: boolean) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await signaturesService.getSignaturesByType(type, schoolCycleId, isDefault);
        setState((prev) => ({ ...prev, loading: false }));
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error fetching signatures';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  // Obtener firmas para carta de notas
  const getSignaturesForCarta = useCallback(
    async (schoolCycleId?: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await signaturesService.getSignaturesForCarta(schoolCycleId);
        setState((prev) => ({ ...prev, loading: false }));
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error fetching signatures';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  // Actualizar firma
  const updateSignature = useCallback(
    async (id: number, data: UpdateSignatureRequest | any) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        let processedData = { ...data };

        // 📸 Si hay un File de imagen, subirlo a Cloudinary
        if (data.signatureFile instanceof File) {
          try {
            const cloudinaryResponse = await uploadImageToCloudinary(
              data.signatureFile,
              'signatures'
            );

            // ✅ Reemplazar el File con los datos de Cloudinary
            processedData.signatureUrl = cloudinaryResponse.url;
            processedData.publicId = cloudinaryResponse.publicId;
            delete processedData.signatureFile; // Eliminar el archivo temporal
          } catch (err: any) {
            throw new Error(`Error al subir imagen: ${err.message}`);
          }
        }

        const updated = await signaturesService.updateSignature(id, processedData);
        setState((prev) => ({
          ...prev,
          signatures: Array.isArray(prev.signatures) 
            ? prev.signatures.map((sig) => (sig.id === id ? updated : sig))
            : [updated],
          loading: false,
        }));
        return updated;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error updating signature';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  // Marcar como defecto
  const setDefaultSignature = useCallback(
    async (id: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await signaturesService.setDefaultSignature(id);
        // Actualizar la lista local
        await fetchSignatures();
        setState((prev) => ({ ...prev, loading: false }));
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error updating default signature';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [fetchSignatures]
  );

  // Eliminar firma
  const deleteSignature = useCallback(
    async (id: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await signaturesService.deleteSignature(id);
        setState((prev) => ({
          ...prev,
          signatures: Array.isArray(prev.signatures)
            ? prev.signatures.filter((sig) => sig.id !== id)
            : [],
          loading: false,
        }));
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error deleting signature';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  // Obtener firma por defecto de un tipo
  const getDefaultSignatureByType = useCallback(
    async (type: SignatureType, schoolCycleId?: number) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const signature = await signaturesService.getDefaultSignatureByType(type, schoolCycleId);
        setState((prev) => ({ ...prev, loading: false }));
        return signature;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error fetching signature';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return null;
      }
    },
    []
  );

  // Limpiar error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    signatures: state.signatures,
    loading: state.loading,
    error: state.error,
    fetchSignatures,
    createSignature,
    getSignatureById,
    getSignaturesByType,
    getSignaturesForCarta,
    updateSignature,
    setDefaultSignature,
    deleteSignature,
    getDefaultSignatureByType,
    clearError,
  };
};
