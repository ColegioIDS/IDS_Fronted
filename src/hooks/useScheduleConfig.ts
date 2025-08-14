// src/hooks/useScheduleConfig.ts
import { useState, useEffect } from 'react';
import { 
  ScheduleConfig, 
  CreateScheduleConfigDto,
  UpdateScheduleConfigDto
} from '@/types/schedule-config';
import { 
  getScheduleConfigs, 
  createScheduleConfig, 
  updateScheduleConfig, 
  getScheduleConfigById,
  getScheduleConfigBySection,
  deleteScheduleConfig
} from '@/services/ScheduleConfig';
import { scheduleConfigSchema, defaultScheduleConfigValues } from "@/schemas/schedule-config";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type ScheduleConfigFormData = z.infer<typeof scheduleConfigSchema>;

export function useScheduleConfig(isEditMode: boolean = false, id?: number) {
    const [configs, setConfigs] = useState<ScheduleConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentConfig, setCurrentConfig] = useState<ScheduleConfig | null>(null);
const [queriedSections, setQueriedSections] = useState<Set<number>>(new Set());

    const form = useForm<ScheduleConfigFormData>({
        resolver: zodResolver(scheduleConfigSchema),
        defaultValues: defaultScheduleConfigValues,
    });

    // Load config data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadConfigData = async () => {
                try {
                    const config = await getScheduleConfigById(id);
                    setCurrentConfig(config);
                    form.reset({
                        sectionId: config.sectionId,
                        workingDays: config.workingDays,
                        startTime: config.startTime,
                        endTime: config.endTime,
                        classDuration: config.classDuration,
                        breakSlots: config.breakSlots
                    });
                } catch (error) {
                    console.error('Error loading config data:', error);
                    toast.error('Error al cargar los datos de configuración');
                }
            };
            loadConfigData();
        }
    }, [isEditMode, id, form]);

    const fetchConfigs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getScheduleConfigs();
            setConfigs(response);
        } catch (error) {
            setError('Error al cargar las configuraciones');
            toast.error('Error al cargar las configuraciones');
        } finally {
            setIsLoading(false);
        }
    };
const fetchConfigBySection = async (sectionId: number) => {
  // Si ya consultamos esta sección, no hacer request nuevamente
  if (queriedSections.has(sectionId)) {
    return currentConfig;
  }

  setIsLoading(true);
  try {
    const config = await getScheduleConfigBySection(sectionId);
    setCurrentConfig(config);
    setQueriedSections(prev => new Set(prev).add(sectionId));
    return config;
  } catch (error) {
    console.error('Error loading config by section:', error);
    // Marcar como consultada incluso si hay error
    setQueriedSections(prev => new Set(prev).add(sectionId));
    throw error;
  } finally {
    setIsLoading(false);
  }
};

    const handleCreateConfig = async (data: ScheduleConfigFormData) => {
        setIsSubmitting(true);
        try {
            const newConfig = await createScheduleConfig(data);
            toast.success("Configuración creada correctamente");
            await fetchConfigs();
            form.reset();
            return { success: true, data: newConfig };
        } catch (error: any) {
            console.log("Error completo:", error);
            console.log("Datos de respuesta:", error.response?.data);
            
            if (error.response?.data) {
                return { 
                    success: false,
                    message: error.response.data.message || "Error de validación",
                    details: error.response.data.details || []
                };
            }
            
            toast.error(error.message || "Error al crear la configuración");
            return { 
                success: false, 
                message: error.message || "Error desconocido",
                details: []
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateConfig = async (id: number, data: Partial<ScheduleConfigFormData>) => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            const updatedConfig = await updateScheduleConfig(id, data);
            toast.success("Configuración actualizada correctamente");
            await fetchConfigs();
            return { success: true, data: updatedConfig };
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data; 
            }
            toast.error("Error al actualizar la configuración");
            console.error(error);
            return { success: false, message: "Error desconocido" };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfig = async (id: number) => {
        try {
            await deleteScheduleConfig(id);
            toast.success("Configuración eliminada correctamente");
            await fetchConfigs();
            return { success: true };
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar la configuración");
            return { success: false, message: error.message };
        }
    };

    const handleSubmit = isEditMode ? handleUpdateConfig : handleCreateConfig;

    useEffect(() => {
        fetchConfigs();
    }, []);

    return {
        configs,
        currentConfig,
        isLoading,
        error,
        isSubmitting,
        form,
        fetchConfigs,
        fetchConfigBySection,
        createConfig: handleCreateConfig,
        updateConfig: handleUpdateConfig,
        deleteConfig: handleDeleteConfig,
        resetForm: () => form.reset(defaultScheduleConfigValues)
    };
}