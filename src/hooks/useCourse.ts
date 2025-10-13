// src/hooks/useCourse.ts
import { useState, useEffect } from 'react';
import { 
  Course, 
  CourseFormValues, 
  CourseWithRelations,
  CourseGradeRelation, // Asegúrate de importar este tipo
  CourseFilters // Asegúrate de importar este tipo
} from '@/types/courses';
import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  getCourseById,
  getCourseGrades,
  addCourseGrade,
  removeCourseGrade
} from '@/services/useCourses';
import { courseSchema, defaultCourseValues } from "@/schemas/courses";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

type CourseFormData = z.infer<typeof courseSchema>;

export function useCourse(isEditMode: boolean = false, id?: number) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [coursesError, setCoursesError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<CourseWithRelations | null>(null);
    const [courseGrades, setCourseGrades] = useState<CourseGradeRelation[]>([]);

    const form = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: defaultCourseValues,
    });

    // Load course data when in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadCourseData = async () => {
                try {
                    const course = await getCourseById(id);
                    setCurrentCourse(course);
                    form.reset({
                        code: course.code,
                        name: course.name,
                        area: course.area || null,
                        color: course.color || null,
                        isActive: course.isActive,
                    });

                    // Load associated grades
                    const grades = await getCourseGrades(id);
                    setCourseGrades(grades);
                } catch (error) {
                    console.error('Error loading course data:', error);
                    toast.error('Error al cargar los datos del curso');
                }
            };
            loadCourseData();
        }
    }, [isEditMode, id, form]);

    const fetchCourses = async (filters?: CourseFilters) => {
        setIsLoadingCourses(true);
        setCoursesError(null);
        try {
            const response = await getCourses(filters);
            setCourses(response);
        } catch (error) {
            setCoursesError('Error al cargar los cursos');
            console.error(error);
            toast.error('Error al cargar los cursos');
        } finally {
            setIsLoadingCourses(false);
        }
    };

    const handleCreateCourse = async (data: CourseFormData) => {
        setIsSubmitting(true);
        try {
            const newCourse = await createCourse(data);
            toast.success("Curso creado correctamente");
            await fetchCourses();
            form.reset();
            return { success: true, data: newCourse };
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
            
            toast.error(error.message || "Error al crear el curso");
            return { 
                success: false, 
                message: error.message || "Error desconocido",
                details: []
            };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCourse = async (id: number, data: Partial<CourseFormData>) => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            const updatedCourse = await updateCourse(id, data);
            //toast.success("Curso actualizado correctamente");
            await fetchCourses();
            return { success: true, data: updatedCourse };
        } catch (error: any) {
            if (error.response?.data) {
                return error.response.data; 
            }
            toast.error("Error al actualizar el curso");
            console.error(error);
            return { success: false, message: "Error desconocido" };
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = isEditMode ? handleUpdateCourse : handleCreateCourse;

    // Course-Grade relations management
    const handleAddCourseGrade = async (gradeId: number, isCore: boolean = true) => {
        if (!currentCourse?.id) return;

        try {
            const relation = await addCourseGrade(currentCourse.id, gradeId, isCore);
            const updatedGrades = await getCourseGrades(currentCourse.id);
            setCourseGrades(updatedGrades);
            toast.success("Grado agregado al curso correctamente");
            return { success: true, data: relation };
        } catch (error: any) {
            toast.error(error.message || "Error al agregar grado al curso");
            return { success: false, message: error.message };
        }
    };

    const handleRemoveCourseGrade = async (gradeId: number) => {
        if (!currentCourse?.id) return;

        try {
            await removeCourseGrade(currentCourse.id, gradeId);
            const updatedGrades = await getCourseGrades(currentCourse.id);
            setCourseGrades(updatedGrades);
            toast.success("Grado removido del curso correctamente");
            return { success: true };
        } catch (error: any) {
            toast.error(error.message || "Error al remover grado del curso");
            return { success: false, message: error.message };
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return {
        courses,
        currentCourse,
        courseGrades,
        isLoadingCourses,
        coursesError,
        isSubmitting,
        form,
        fetchCourses,
        createCourse: handleCreateCourse,
        updateCourse: handleUpdateCourse,
        addCourseGrade: handleAddCourseGrade,
        removeCourseGrade: handleRemoveCourseGrade,
        resetForm: () => form.reset(defaultCourseValues)
    };
}