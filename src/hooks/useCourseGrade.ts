// src/hooks/useCourseGrade.ts
import { useState, useEffect } from 'react';
import { 
  CourseGradeWithRelations,
  CourseGradeFormValues
} from '@/types/course-grade.types';
import { 
  getCourseGrades, 
  createCourseGrade, 
  updateCourseGrade, 
  getCourseGradeById,
  getCourseGradesByCourse,
  getCourseGradesByGrade,
  deleteCourseGrade
} from '@/services/course-grade';
import { courseGradeSchema, defaultValues } from "@/schemas/courseGradeSchema";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type CourseGradeFormData = z.infer<typeof courseGradeSchema>;

export function useCourseGrade(isEditMode: boolean = false, id?: number) {
    const [courseGrades, setCourseGrades] = useState<CourseGradeWithRelations[]>([]);
    const [isLoadingCourseGrades, setIsLoadingCourseGrades] = useState(true);
    const [courseGradesError, setCourseGradesError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentCourseGrade, setCurrentCourseGrade] = useState<CourseGradeWithRelations | null>(null);

    const form = useForm<CourseGradeFormData>({
        resolver: zodResolver(courseGradeSchema),
        defaultValues,
    });

    // Load course grade data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadCourseGradeData = async () => {
                try {
                    const courseGrade = await getCourseGradeById(id);
                    setCurrentCourseGrade(courseGrade);
                    form.reset({
                        courseId: courseGrade.courseId,
                        gradeId: courseGrade.gradeId,
                        isCore: courseGrade.isCore,
                    });
                } catch (error) {
                    console.error('Error loading course grade data:', error);
                    toast.error('Error al cargar los datos de la relación curso-grado');
                }
            };
            loadCourseGradeData();
        }
    }, [isEditMode, id, form]);

    const fetchCourseGrades = async (filters?: { courseId?: number; gradeId?: number; isCore?: boolean }) => {
        setIsLoadingCourseGrades(true);
        setCourseGradesError(null);
        try {
            const response = await getCourseGrades(filters);
            setCourseGrades(response);
        } catch (error) {
            setCourseGradesError('Error al cargar las relaciones curso-grado');
            console.error(error);
            toast.error('Error al cargar las relaciones curso-grado');
        } finally {
            setIsLoadingCourseGrades(false);
        }
    };

    const fetchByCourse = async (courseId: number) => {
        try {
            const response = await getCourseGradesByCourse(courseId);
            return response;
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar las relaciones por curso');
            throw error;
        }
    };

    const fetchByGrade = async (gradeId: number) => {
        try {
            const response = await getCourseGradesByGrade(gradeId);
            return response;
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar las relaciones por grado');
            throw error;
        }
    };

    const handleCreateCourseGrade = async (data: CourseGradeFormData) => {
        setIsSubmitting(true);
        try {
            await createCourseGrade(data);
            toast.success("Relación curso-grado creada correctamente");
            await fetchCourseGrades();
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
            
            toast.error(error.message || "Error al crear la relación curso-grado");
            return { 
                success: false, 
                message: error.message || "Error desconocido",
                details: []
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCourseGrade = async (id: number, data: CourseGradeFormData) => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            await updateCourseGrade(id, data);
            toast.success("Relación curso-grado actualizada correctamente");
            await fetchCourseGrades();
            return { success: true };
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data; 
            }
            toast.error("Error al actualizar la relación curso-grado");
            console.error(error);
            return { success: false, message: "Error desconocido" };
        } finally {
            setIsSubmitting(false);
        }
    };


      const handleDeleteCourseGrade = async (id: number) => {
        try {
            await deleteCourseGrade(id);
            toast.success("Relación curso-grado eliminada correctamente");
            
            // Actualizamos la lista después de eliminar
            await fetchCourseGrades();
            
            return { success: true };
        } catch (error: any) {
            console.error("Error al eliminar:", error);
            
            if (error.response?.data) {
                toast.error(error.response.data.message || "Error al eliminar");
                return {
                    success: false,
                    message: error.response.data.message,
                    details: error.response.data.details || []
                };
            }
            
            toast.error(error.message || "Error al eliminar la relación");
            return {
                success: false,
                message: error.message || "Error desconocido",
                details: []
            };
        }
    };

    // Función para eliminar múltiples relaciones
    const handleDeleteMultiple = async (ids: number[]) => {
        try {
            // Podrías implementar un endpoint batch delete en el servicio
            // o hacer múltiples llamadas individuales
            const results = await Promise.all(
                ids.map(id => deleteCourseGrade(id))
            );
            
            toast.success(`${ids.length} relaciones eliminadas correctamente`);
            await fetchCourseGrades();
            
            return { success: true };
        } catch (error) {
            console.error("Error eliminando múltiples:", error);
            toast.error("Error al eliminar algunas relaciones");
            return { success: false };
        }
    };




    const handleSubmit = isEditMode ? handleUpdateCourseGrade : handleCreateCourseGrade;

    useEffect(() => {
        fetchCourseGrades();
    }, []);

    return {
        courseGrades,
        currentCourseGrade,
        isLoadingCourseGrades,
        courseGradesError,
        isSubmitting,
        form,
        fetchCourseGrades,
        fetchByCourse,
        fetchByGrade,
        createCourseGrade: handleCreateCourseGrade,
        updateCourseGrade: handleUpdateCourseGrade,
        resetForm: () => form.reset(defaultValues),

          deleteCourseGrade: handleDeleteCourseGrade,
        deleteMultipleCourseGrades: handleDeleteMultiple
    };
}