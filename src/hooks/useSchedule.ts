// src/hooks/useSchedule.ts
import { useState, useEffect } from 'react';
import { Schedule, ScheduleFormValues } from '@/types/schedules';
import { 
  getSchedules, 
  createSchedule, 
  updateSchedule, 
  getScheduleById,
  getSchedulesBySection,
  getSchedulesByTeacher
} from '@/services/schedule';
import { scheduleSchema, defaultValues } from "@/schemas/schedule";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type ScheduleFormData = z.infer<typeof scheduleSchema>;

export function useSchedule(isEditMode: boolean = false, id?: number) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
    const [schedulesError, setSchedulesError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);

    const form = useForm<ScheduleFormData>({
        resolver: zodResolver(scheduleSchema),
        defaultValues,
    });

    // Load schedule data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadScheduleData = async () => {
                try {
                    const schedule = await getScheduleById(id);
                    setCurrentSchedule(schedule);
                    form.reset({
                        sectionId: schedule.sectionId,
                        courseId: schedule.courseId,
                        teacherId: schedule.teacherId,
                        dayOfWeek: schedule.dayOfWeek,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        classroom: schedule.classroom || '',
                    });
                } catch (error) {
                    console.error('Error loading schedule data:', error);
                    toast.error('Error al cargar los datos del horario');
                }
            };
            loadScheduleData();
        }
    }, [isEditMode, id, form]);

    const fetchSchedules = async (filters?: {
        sectionId?: number;
        courseId?: number;
        teacherId?: number;
        dayOfWeek?: number;
    }) => {
        setIsLoadingSchedules(true);
        setSchedulesError(null);
        try {
            const response = await getSchedules(filters);
            setSchedules(response);
        } catch (error) {
            setSchedulesError('Error al cargar los horarios');
            console.error(error);
            toast.error('Error al cargar los horarios');
        } finally {
            setIsLoadingSchedules(false);
        }
    };

    const fetchSchedulesBySection = async (sectionId: number) => {
        setIsLoadingSchedules(true);
        try {
            const response = await getSchedulesBySection(sectionId);
            setSchedules(response);
        } catch (error) {
            setSchedulesError('Error al cargar los horarios por sección');
            console.error(error);
            toast.error('Error al cargar los horarios por sección');
        } finally {
            setIsLoadingSchedules(false);
        }
    };

    const fetchSchedulesByTeacher = async (teacherId: number) => {
        setIsLoadingSchedules(true);
        try {
            const response = await getSchedulesByTeacher(teacherId);
            setSchedules(response);
        } catch (error) {
            setSchedulesError('Error al cargar los horarios por profesor');
            console.error(error);
            toast.error('Error al cargar los horarios por profesor');
        } finally {
            setIsLoadingSchedules(false);
        }
    };

    const handleCreateSchedule = async (data: ScheduleFormData) => {
        setIsSubmitting(true);
        try {
            await createSchedule(data);
            toast.success("Horario creado correctamente");
            await fetchSchedules();
            form.reset();
            return { success: true };
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
            
            toast.error(error.message || "Error al crear el horario");
            return { 
                success: false, 
                message: error.message || "Error desconocido",
                details: []
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSchedule = async (id: number, data: Partial<ScheduleFormData>) => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            await updateSchedule(id, data);
            toast.success("Horario actualizado correctamente");
            await fetchSchedules();
            return { success: true };
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data; 
            }
            toast.error("Error al actualizar el horario");
            console.error(error);
            return { success: false, message: "Error desconocido" };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = isEditMode && id ? 
        (data: ScheduleFormData) => handleUpdateSchedule(id, data) : 
        handleCreateSchedule;

    useEffect(() => {
        fetchSchedules();
    }, []);

    return {
        schedules,
        currentSchedule,
        isLoadingSchedules,
        schedulesError,
        isSubmitting,
        form,
        fetchSchedules,
        fetchSchedulesBySection,
        fetchSchedulesByTeacher,
        createSchedule: handleCreateSchedule,
        updateSchedule: handleUpdateSchedule,
        resetForm: () => form.reset(defaultValues),
        handleSubmit
    };
}