// src/hooks/useBimester.ts
import { useState, useEffect } from 'react';
import { Bimester, SchoolBimesterPayload } from '@/types/SchoolBimesters';
import { getBimestersByCycle, createBimester, updateBimester } from '@/services/useSchoolBimester';
import { bimesterSchema, defaultValues } from "@/schemas/bimester.schema";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type BimesterFormData = z.infer<typeof bimesterSchema>;

export function useBimester(cycleId?: number, isEditMode: boolean = false, bimesterId?: number) {
    const [bimesters, setBimesters] = useState<Bimester[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentBimester, setCurrentBimester] = useState<Bimester | null>(null);
    console.log("ciclo 1", cycleId)

    const form = useForm<BimesterFormData>({
        resolver: zodResolver(bimesterSchema),
        defaultValues,
    });

    // Load bimester data when in edit mode
    useEffect(() => {
        if (isEditMode && bimesterId) {
            const loadBimesterData = async () => {
                try {
                    const bimester = bimesters.find(b => b.id === bimesterId);
                    if (bimester) {
                        setCurrentBimester(bimester);
                        form.reset({
                            name: bimester.name,
                            startDate: new Date(bimester.startDate),
                            endDate: new Date(bimester.endDate),
                            isActive: bimester.isActive,
                            weeksCount: bimester.weeksCount,
                            number: bimester.number
                        });
                    }
                } catch (error) {
                    console.error('Error loading bimester data:', error);
                }
            };
            loadBimesterData();
        }
    }, [isEditMode, bimesterId, bimesters, form]);

    const fetchBimesters = async (id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getBimestersByCycle(id);
            setBimesters(response);
        } catch (error) {
            setError('Error al cargar los bimestres');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBimester = async (data: BimesterFormData) => {
        setIsSubmitting(true);
        try {
            console.log("create bimester", cycleId)
            

            if (!cycleId) {
                toast.error("Debes seleccionar un ciclo escolar primero");
                return { 
                    success: false, 
                    message: "No se ha seleccionado un ciclo escolar",
                    details: [] 
                };
            }

            const payload: SchoolBimesterPayload = {
                ...data,
                number: data.number ?? 1,
            };
            const { cycleId: _, ...payloadWithoutCycleId } = payload;




            console.log(payload)
            
            const createdBimester = await createBimester(cycleId, payloadWithoutCycleId);
            toast.success("Bimestre creado correctamente");
            await fetchBimesters(cycleId);
            form.reset();
            
            return { 
                success: true, 
                data: createdBimester,
                message: "Bimestre creado con éxito"
            };
        } catch (error: any) {
            console.error("Error al crear bimestre:", error);
            
            const errorData = error.response?.data || error;
            const errorMessage = errorData.message || "Error al crear el bimestre";
            const errorDetails = errorData.details || [];

            if (errorDetails.length === 0) {
                toast.error(errorMessage);
            }

            return { 
                success: false,
                message: errorMessage,
                details: errorDetails
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateBimester = async (bimesterId: number, data: Partial<BimesterFormData>) => {
        setIsSubmitting(true);
        try {
            const updatedBimester = await updateBimester(bimesterId, data);
            toast.success("Bimestre actualizado correctamente");
            console.log("ciclo", cycleId)
            if (cycleId) {
                await fetchBimesters(cycleId);
            }
            return { success: true, data: updatedBimester };
        } catch (error: any) {
            const errorData = error.response?.data || error;
            toast.error(errorData.message || "Error al actualizar el bimestre");
            return { 
                success: false,
                message: errorData.message || "Error desconocido",
                details: errorData.details || []
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (cycleId) {
            fetchBimesters(cycleId);
        }
    }, [cycleId]);

    return {
        bimesters,
        currentBimester,
        isLoading,
        error,
        isSubmitting,
        form,
        fetchBimesters,
        createBimester: handleCreateBimester,
        updateBimester: handleUpdateBimester,
        resetForm: () => form.reset(defaultValues)
    };
}