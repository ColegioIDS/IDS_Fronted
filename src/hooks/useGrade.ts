// src/hooks/useGrade.ts
import { useState, useEffect } from 'react';
import { Grade, GradeFormValues } from '@/types/grades';
import { getGrades, createGrade, updateGrade, getGradeById } from '@/services/gradeService';
import { gradeSchema, defaultValues } from "@/schemas/grade";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';


type GradeFormData = z.infer<typeof gradeSchema>;

export function useGrade(isEditMode: boolean = false, id?: number) {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isLoadingGrades, setIsLoadingGrades] = useState(true);
    const [gradesError, setGradesError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);

    const form = useForm<GradeFormData>({
        resolver: zodResolver(gradeSchema),
        defaultValues,
    });

    // Load grade data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadGradeData = async () => {
                try {
                    const grade = await getGradeById(id);
                    setCurrentGrade(grade);
                    form.reset({
                        name: grade.name,
                        level: grade.level,
                        order: grade.order,
                        isActive: grade.isActive,
                    });
                } catch (error) {
                    console.error('Error loading grade data:', error);
                    toast.error('Error al cargar los datos del grado');
                }
            };
            loadGradeData();
        }
    }, [isEditMode, id, form]);

    const fetchGrades = async () => {
        setIsLoadingGrades(true);
        setGradesError(null);
        try {
            const response = await getGrades();
            setGrades(response);
        } catch (error) {
            setGradesError('Error al cargar los grados');
            console.error(error);
            toast.error('Error al cargar los grados');
        } finally {
            setIsLoadingGrades(false);
        }
    };

    const handleCreateGrade = async (data: GradeFormData) => {
        setIsSubmitting(true);
        try {
            await createGrade(data);
            toast.success("Grado creado correctamente");
            await fetchGrades();
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
            
            toast.error(error.message || "Error al crear el grado");
            return { 
                success: false, 
                message: error.message || "Error desconocido",
                details: []
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateGrade = async (id: number, data: GradeFormData) => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            await updateGrade(id, data);
            toast.success("Grado actualizado correctamente");
            await fetchGrades();
            return { success: true };
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data; 
            }
            toast.error("Error al actualizar el grado");
            console.error(error);
            return { success: false, message: "Error desconocido" };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = isEditMode ? handleUpdateGrade : handleCreateGrade;

    useEffect(() => {
        fetchGrades();
    }, []);

    return {
        grades,
        currentGrade,
        isLoadingGrades,
        gradesError,
        isSubmitting,
        form,
        fetchGrades,
        createGrade: handleCreateGrade,
        updateGrade: handleUpdateGrade,
        resetForm: () => form.reset(defaultValues)
    };
}