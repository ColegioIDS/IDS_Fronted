import { useState, useEffect, useCallback } from 'react';
import { Holiday, CreateHolidayPayload, UpdateHolidayPayload } from '@/types/holiday';
import { getAllHolidays, filterHolidays, createHoliday, updateHoliday, deleteHoliday } from '@/services/useHoliday';
import { holidaySchema, defaultValues } from "@/schemas/holiday.schema";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type HolidayFormData = z.infer<typeof holidaySchema>;

export function useHoliday(cycleId?: number, bimesterId?: number, isEditMode: boolean = false, holidayId?: number) {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentHoliday, setCurrentHoliday] = useState<Holiday | null>(null);

    const form = useForm<HolidayFormData>({
        resolver: zodResolver(holidaySchema),
        defaultValues,
    });

    // Load holiday data when in edit mode
    useEffect(() => {
        if (isEditMode && holidayId) {
            const loadHolidayData = async () => {
                try {
                    const holiday = holidays.find(h => h.id === holidayId) || 
                                  filteredHolidays.find(h => h.id === holidayId);
                    if (holiday) {
                        setCurrentHoliday(holiday);
                        form.reset({
                            bimesterId: holiday.bimesterId,
                            date: new Date(holiday.date),
                            description: holiday.description,
                            isRecovered: holiday.isRecovered
                        });
                    }
                } catch (error) {
                    console.error('Error loading holiday data:', error);
                }
            };
            loadHolidayData();
        }
    }, [isEditMode, holidayId, holidays, filteredHolidays, form]);

    const fetchAllHolidays = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllHolidays();
            setHolidays(response);
        } catch (error) {
            setError('Error al cargar los días festivos');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchFilteredHolidays = useCallback(async (cycleId?: number, bimesterId?: number) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!cycleId && !bimesterId) {
                await fetchAllHolidays();
                return;
            }

            const response = await filterHolidays({ cycleId, bimesterId });
            setFilteredHolidays(response);
        } catch (error) {
            setError('Error al filtrar los días festivos');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchAllHolidays]);

    const handleCreateHoliday = useCallback(async (data: HolidayFormData) => {
        setIsSubmitting(true);
        try {
            const payload: CreateHolidayPayload = {
                bimesterId: data.bimesterId,
                date: data.date.toISOString(),
                description: data.description,
                isRecovered: data.isRecovered || false
            };

            const createdHoliday = await createHoliday(payload);
            toast.success("Día festivo creado correctamente");
            
            // Refetch data based on current filters
            if (cycleId || bimesterId) {
                await fetchFilteredHolidays(cycleId, bimesterId);
            } else {
                await fetchAllHolidays();
            }
            
            form.reset();
            
            return { 
                success: true, 
                data: createdHoliday,
                message: "Día festivo creado con éxito"
            };
        } catch (error: any) {
            console.error("Error al crear día festivo:", error);
            
            const errorData = error.response?.data || error;
            const errorMessage = errorData.message || "Error al crear el día festivo";
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
    }, [cycleId, bimesterId, fetchAllHolidays, fetchFilteredHolidays, form]);

    const handleUpdateHoliday = useCallback(async (holidayId: number, data: Partial<HolidayFormData>) => {
        setIsSubmitting(true);
        try {
            const payload: UpdateHolidayPayload = {};
            
            if (data.bimesterId) payload.bimesterId = data.bimesterId;
            if (data.date) payload.date = data.date.toISOString();
            if (data.description) payload.description = data.description;
            if (data.isRecovered !== undefined) payload.isRecovered = data.isRecovered;

            const updatedHoliday = await updateHoliday(holidayId, payload);
            toast.success("Día festivo actualizado correctamente");
            
            // Refetch data based on current filters
            if (cycleId || bimesterId) {
                await fetchFilteredHolidays(cycleId, bimesterId);
            } else {
                await fetchAllHolidays();
            }
            
            return { 
                success: true, 
                data: updatedHoliday,
                message: "Día festivo actualizado con éxito"
            };
        } catch (error: any) {
            const errorData = error.response?.data || error;
            toast.error(errorData.message || "Error al actualizar el día festivo");
            return { 
                success: false,
                message: errorData.message || "Error desconocido",
                details: errorData.details || []
            };
        } finally {
            setIsSubmitting(false);
        }
    }, [cycleId, bimesterId, fetchAllHolidays, fetchFilteredHolidays]);

    const handleDeleteHoliday = useCallback(async (holidayId: number) => {
        setIsSubmitting(true);
        try {
            await deleteHoliday(holidayId);
            toast.success("Día festivo eliminado correctamente");
            
            // Refetch data based on current filters
            if (cycleId || bimesterId) {
                await fetchFilteredHolidays(cycleId, bimesterId);
            } else {
                await fetchAllHolidays();
            }
            
            return { success: true, message: "Día festivo eliminado con éxito" };
        } catch (error: any) {
            const errorData = error.response?.data || error;
            toast.error(errorData.message || "Error al eliminar el día festivo");
            return { 
                success: false,
                message: errorData.message || "Error desconocido",
                details: errorData.details || []
            };
        } finally {
            setIsSubmitting(false);
        }
    }, [cycleId, bimesterId, fetchAllHolidays, fetchFilteredHolidays]);

    useEffect(() => {
        if (cycleId || bimesterId) {
            fetchFilteredHolidays(cycleId, bimesterId);
        } else {
            fetchAllHolidays();
        }
    }, [cycleId, bimesterId, fetchAllHolidays, fetchFilteredHolidays]);

    return {
       holidays: cycleId || bimesterId ? filteredHolidays : holidays,
        currentHoliday,
        isLoading,
        error,
        isSubmitting,
        form,
        fetchAllHolidays,
        fetchFilteredHolidays,
        createHoliday: handleCreateHoliday,
        updateHoliday: handleUpdateHoliday,
        deleteHoliday: handleDeleteHoliday,
        resetForm: () => form.reset(defaultValues)
    };
}