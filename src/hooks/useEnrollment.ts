// src/hooks/useEnrollment.ts
import { useState, useEffect } from 'react';
import { 
  EnrollmentResponse,
  EnrollmentDetailResponse,
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentFilterDto,
  EnrollmentStatsResponse,
  EnrollmentFormData,
  EnrollmentStatus
} from '@/types/enrollment.types';
import { 
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  graduateEnrollment,
  transferEnrollment,
  reactivateEnrollment,
  getEnrollmentsByStudent,
  getEnrollmentsByCycle,
  getEnrollmentsBySection,
  getActiveEnrollments,
  getEnrollmentStats,
  bulkGraduateEnrollments,
  bulkTransferEnrollments,
  buildEnrollmentFilters
} from '@/services/enrollment.service';
import { enrollmentSchema, defaultEnrollmentValues } from "@/schemas/enrollment";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type EnrollmentFormDataSchema = z.infer<typeof enrollmentSchema>;

export function useEnrollment(isEditMode: boolean = false, id?: number) {
    const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
    const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
    const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentEnrollment, setCurrentEnrollment] = useState<EnrollmentDetailResponse | null>(null);
    const [stats, setStats] = useState<EnrollmentStatsResponse | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<EnrollmentFilterDto>({});

    const form = useForm<EnrollmentFormDataSchema>({
        resolver: zodResolver(enrollmentSchema),
        defaultValues: defaultEnrollmentValues,
    });

    // Load enrollment data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadEnrollmentData = async () => {
                try {
                    const enrollment = await getEnrollmentById(id);
                    setCurrentEnrollment(enrollment);
                    form.reset({
                        studentId: enrollment.studentId,
                        cycleId: enrollment.cycleId,
                        gradeId: enrollment.gradeId,
                        sectionId: enrollment.sectionId,
                        status: enrollment.status as EnrollmentStatus,
                    });
                } catch (error) {
                    console.error('Error loading enrollment data:', error);
                    toast.error('Error al cargar los datos de la matrícula');
                }
            };
            loadEnrollmentData();
        }
    }, [isEditMode, id, form]);

    const fetchEnrollments = async (filters?: EnrollmentFilterDto) => {
        setIsLoadingEnrollments(true);
        setEnrollmentsError(null);
        try {
            const queryParams = filters ? buildEnrollmentFilters(filters) : undefined;
            const response = await getEnrollments(queryParams);
            setEnrollments(response);
            setCurrentFilters(filters || {});
        } catch (error) {
            setEnrollmentsError('Error al cargar las matrículas');
            console.error(error);
            toast.error('Error al cargar las matrículas');
        } finally {
            setIsLoadingEnrollments(false);
        }
    };

    const fetchEnrollmentStats = async (cycleId?: number) => {
        setIsLoadingStats(true);
        try {
            const statsData = await getEnrollmentStats(cycleId ? { cycleId: cycleId.toString() } : undefined);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading enrollment stats:', error);
            toast.error('Error al cargar estadísticas');
        } finally {
            setIsLoadingStats(false);
        }
    };

    const handleCreateEnrollment = async (data: EnrollmentFormDataSchema) => {
        setIsSubmitting(true);
        try {
            const enrollmentData: CreateEnrollmentDto = {
                studentId: data.studentId,
                cycleId: data.cycleId,
                gradeId: data.gradeId,
                sectionId: data.sectionId,
                status: data.status
            };

            const newEnrollment = await createEnrollment(enrollmentData);
            toast.success("Matrícula creada correctamente");
            await fetchEnrollments(currentFilters);
            form.reset();
            return { success: true, data: newEnrollment };
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
            
            toast.error(error.message || "Error al crear la matrícula");
            return { 
                success: false, 
                message: error.message || "Error desconocido",
                details: []
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateEnrollment = async (id: number, data: Partial<EnrollmentFormDataSchema>) => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            const updateData: UpdateEnrollmentDto = {};
            if (data.studentId !== undefined) updateData.studentId = data.studentId;
            if (data.cycleId !== undefined) updateData.cycleId = data.cycleId;
            if (data.gradeId !== undefined) updateData.gradeId = data.gradeId;
            if (data.sectionId !== undefined) updateData.sectionId = data.sectionId;
            if (data.status !== undefined) updateData.status = data.status;

            const updatedEnrollment = await updateEnrollment(id, updateData);
            toast.success("Matrícula actualizada correctamente");
            await fetchEnrollments(currentFilters);
            return { success: true, data: updatedEnrollment };
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data; 
            }
            toast.error("Error al actualizar la matrícula");
            console.error(error);
            return { success: false, message: "Error desconocido" };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEnrollment = async (id: number) => {
        try {
            await deleteEnrollment(id);
            toast.success("Matrícula eliminada correctamente");
            await fetchEnrollments(currentFilters);
            return { success: true };
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar la matrícula");
            return { success: false, message: error.message };
        }
    };

    // Status change handlers
    const handleGraduateEnrollment = async (id: number) => {
        try {
            const updatedEnrollment = await graduateEnrollment(id);
            toast.success("Estudiante graduado correctamente");
            await fetchEnrollments(currentFilters);
            return { success: true, data: updatedEnrollment };
        } catch (error: any) {
            toast.error(error.message || "Error al graduar estudiante");
            return { success: false, message: error.message };
        }
    };

    const handleTransferEnrollment = async (id: number) => {
        try {
            const updatedEnrollment = await transferEnrollment(id);
            toast.success("Estudiante transferido correctamente");
            await fetchEnrollments(currentFilters);
            return { success: true, data: updatedEnrollment };
        } catch (error: any) {
            toast.error(error.message || "Error al transferir estudiante");
            return { success: false, message: error.message };
        }
    };

    const handleReactivateEnrollment = async (id: number) => {
        try {
            const updatedEnrollment = await reactivateEnrollment(id);
            toast.success("Matrícula reactivada correctamente");
            await fetchEnrollments(currentFilters);
            return { success: true, data: updatedEnrollment };
        } catch (error: any) {
            toast.error(error.message || "Error al reactivar matrícula");
            return { success: false, message: error.message };
        }
    };

    // Bulk operations
    const handleBulkGraduate = async (ids: number[]) => {
        try {
            await bulkGraduateEnrollments(ids);
            toast.success(`${ids.length} estudiantes graduados correctamente`);
            await fetchEnrollments(currentFilters);
            return { success: true };
        } catch (error: any) {
            toast.error(error.message || "Error en graduación masiva");
            return { success: false, message: error.message };
        }
    };

    const handleBulkTransfer = async (ids: number[]) => {
        try {
            await bulkTransferEnrollments(ids);
            toast.success(`${ids.length} estudiantes transferidos correctamente`);
            await fetchEnrollments(currentFilters);
            return { success: true };
        } catch (error: any) {
            toast.error(error.message || "Error en transferencia masiva");
            return { success: false, message: error.message };
        }
    };

    // Specialized fetch functions
    const fetchEnrollmentsByStudent = async (studentId: number) => {
        try {
            const enrollments = await getEnrollmentsByStudent(studentId);
            return { success: true, data: enrollments };
        } catch (error: any) {
            toast.error(error.message || "Error al cargar matrículas del estudiante");
            return { success: false, message: error.message };
        }
    };

    const fetchEnrollmentsByCycle = async (cycleId: number) => {
        try {
            const enrollments = await getEnrollmentsByCycle(cycleId);
            return { success: true, data: enrollments };
        } catch (error: any) {
            toast.error(error.message || "Error al cargar matrículas del ciclo");
            return { success: false, message: error.message };
        }
    };

    const fetchEnrollmentsBySection = async (sectionId: number) => {
        try {
            const enrollments = await getEnrollmentsBySection(sectionId);
            return { success: true, data: enrollments };
        } catch (error: any) {
            toast.error(error.message || "Error al cargar matrículas de la sección");
            return { success: false, message: error.message };
        }
    };

    const fetchActiveEnrollments = async (cycleId?: number) => {
        try {
            const enrollments = await getActiveEnrollments(cycleId);
            setEnrollments(enrollments);
            return { success: true, data: enrollments };
        } catch (error: any) {
            toast.error(error.message || "Error al cargar matrículas activas");
            return { success: false, message: error.message };
        }
    };

    // Get enrollment by ID
    const fetchEnrollmentById = async (id: number, includeRelations: boolean = true) => {
        try {
            const enrollment = await getEnrollmentById(id, includeRelations);
            return { success: true, data: enrollment };
        } catch (error: any) {
            toast.error(error.message || "Error al cargar la matrícula");
            return { success: false, message: error.message };
        }
    };

    const handleSubmit = isEditMode ? handleUpdateEnrollment : handleCreateEnrollment;

    // Initial load
    useEffect(() => {
        fetchEnrollments();
    }, []);

    return {
        // Data
        enrollments,
        currentEnrollment,
        stats,
        currentFilters,

        // Loading states
        isLoadingEnrollments,
        isLoadingStats,
        enrollmentsError,
        isSubmitting,

        // Form
        form,

        // CRUD operations
        fetchEnrollments,
        fetchEnrollmentById,
        createEnrollment: handleCreateEnrollment,
        updateEnrollment: handleUpdateEnrollment,
        deleteEnrollment: handleDeleteEnrollment,

        // Status operations
        graduateEnrollment: handleGraduateEnrollment,
        transferEnrollment: handleTransferEnrollment,
        reactivateEnrollment: handleReactivateEnrollment,

        // Bulk operations
        bulkGraduate: handleBulkGraduate,
        bulkTransfer: handleBulkTransfer,

        // Specialized queries
        fetchEnrollmentsByStudent,
        fetchEnrollmentsByCycle,
        fetchEnrollmentsBySection,
        fetchActiveEnrollments,

        // Stats
        fetchEnrollmentStats,

        // Utils
        resetForm: () => form.reset(defaultEnrollmentValues),
        refreshData: () => fetchEnrollments(currentFilters)
    };
}