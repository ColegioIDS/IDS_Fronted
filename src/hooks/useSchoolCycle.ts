// src/hooks/useSchoolCycle.ts
import { useState, useEffect } from 'react';
import { SchoolCycle } from '@/types/SchoolCycle';
import { getSchoolCycles, createCycle, updateCycle } from '@/services/useSchoolCycles';
import { schoolCycleSchema, defaultValues } from "@/schemas/SchoolCycle";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type CyclesFormData = z.infer<typeof schoolCycleSchema>;

export function useSchoolCycle(isEditMode: boolean = false, id?: number) {
    const [cycles, setCycles] = useState<SchoolCycle[]>([]);
    const [isLoadingCycles, setIsLoadingCycles] = useState(true);
    const [cyclesError, setCyclesError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentCycle, setCurrentCycle] = useState<SchoolCycle | null>(null);

    const form = useForm<CyclesFormData>({
        resolver: zodResolver(schoolCycleSchema),
        defaultValues,
    });

    // Load cycle data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadCycleData = async () => {
                try {
                    const cycle = cycles.find(c => c.id === id);
                    if (cycle) {
                        setCurrentCycle(cycle);
                        form.reset({
                            name: cycle.name,
                             startDate: new Date(cycle.startDate),
                             endDate: new Date(cycle.endDate),    
                            isActive: cycle.isActive,
                            isClosed: cycle.isClosed,
                        });
                    }
                } catch (error) {
                    console.error('Error loading cycle data:', error);
                }
            };
            loadCycleData();
        }
    }, [isEditMode, id, cycles, form]);

    const fetchCycles = async () => {
        setIsLoadingCycles(true);
        setCyclesError(null);
        try {
            const response = await getSchoolCycles();
            setCycles(response);
        } catch (error) {
            setCyclesError('Error al cargar los datos');
            console.error(error);
        } finally {
            setIsLoadingCycles(false);
        }
    };

  const handleCreateCycle = async (data: CyclesFormData) => {
  setIsSubmitting(true);
  try {
    await createCycle(data);
    toast.success("Ciclo escolar registrado correctamente");
    await fetchCycles();
    form.reset();
    return { success: true };
  } catch (error: any) {
    console.log("Error completo:", error);
    console.log("Datos de respuesta:", error.response?.data);
    
    // Si es un error de validación del backend
    if (error.response?.data) {
      return { 
        success: false,
        message: error.response.data.message || "Error de validación",
        details: error.response.data.details || []
      };
    }
    
    // Si es otro tipo de error
    toast.error(error.message || "Error al registrar Ciclo escolar");
    return { 
      success: false, 
      message: error.message || "Error desconocido",
      details: []
    };
  } finally {
    setIsSubmitting(false);
  }
};

const handleUpdateCycle = async (id: number, data: CyclesFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
        await updateCycle(id, data);
        toast.success("Ciclo escolar actualizado correctamente");
        await fetchCycles();
        return { success: true };
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data; 
        }
        toast.error("Error al actualizar Ciclo escolar");
        console.error(error);
        return { success: false, message: "Error desconocido" };
    } finally {
        setIsSubmitting(false);
    }
};

    const handleSubmit = isEditMode ? handleUpdateCycle : handleCreateCycle;

    useEffect(() => {
        fetchCycles();
    }, []);

    return {
        cycles,
        currentCycle,
        isLoadingCycles,
        cyclesError,
        isSubmitting,
        form,
        fetchCycles,
        createCycle: handleCreateCycle,
        updateCycle: handleUpdateCycle,
        resetForm: () => form.reset(defaultValues)
    };

}