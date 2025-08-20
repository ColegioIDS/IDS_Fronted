// src/hooks/useStudent.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { z } from 'zod';
import { getStudents, createStudent, getUserByDPI, getStudentById } from '@/services/useStudents';
import { StudentSchema, defaultValues } from '@/schemas/Students';
import { Student, CreateStudentPayload } from '@/types/student';
import { cleanNulls } from '@/utils/cleanNulls';
import { ParentDpiResponse } from '@/types/student';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { deleteImageFromCloudinary } from '@/services/useCloudinary';

// ✅ NUEVO: Importar contexts
import { useCyclesContext } from '@/context/CyclesContext';
import { useGradeContext } from '@/context/GradeContext';
import { useSectionContext } from '@/context/SectionsContext';

type StudentFormData = z.infer<typeof StudentSchema>;

export function useStudent(isEditMode: boolean = false, studentId?: number) {
    const [student, setStudent] = useState<Student[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentLoaded, setStudentLoaded] = useState(false);
    
    // ✅ NUEVO: Estado local para secciones filtradas
    const [filteredSections, setFilteredSections] = useState<any[]>([]);
    
    // ✅ NUEVO: Usar contexts 
    const { cycles } = useCyclesContext();
    const { grades } = useGradeContext();
    const { sections } = useSectionContext();
    
    // ✅ NUEVO: Obtener ciclo activo
    const activeCycle = cycles.find(cycle => cycle.isActive) || null;

    const form = useForm<StudentFormData>({
        resolver: zodResolver(StudentSchema),
        defaultValues,
    });

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        setUsersError(null);
        try {
            const response = await getStudents();
            setStudent(response);
        } catch (error) {
            setUsersError('Error al cargar los estudiantes');
            console.error(error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const fetchParentByDpi = async (dpi: string): Promise<ParentDpiResponse | null> => {
        try {
            if (!dpi || dpi.length < 8) return null;
            const response = await getUserByDPI(dpi);
            return response;
        } catch (error) {
            console.error('Error al obtener usuario por DPI:', error);
            return null;
        }
    };

    const fetchStudentById = async (id: number): Promise<void> => {
        try {
            const response: Student | null = await getStudentById(id);
            if (!response) {
                toast.error('Estudiante no encontrado');
                return;
            }

            const cleanedResponse = cleanNulls(response);
            
            // ✅ NUEVO: Convertir enrollment a formato de formulario
            let enrollmentData = {
                cycleId: activeCycle?.id || 0,
                gradeId: 0,
                sectionId: 0,
                status: 'active' as 'active' | 'inactive' | 'graduated' | 'transferred',
            };

            // Si el estudiante tiene enrollments activos, usar el primero
            if (response.enrollments && response.enrollments.length > 0) {
                const activeEnrollment = response.enrollments.find(e => e.status === 'active') || response.enrollments[0];
                enrollmentData = {
                    cycleId: activeEnrollment.cycleId,
                    gradeId: activeEnrollment.gradeId,
                    sectionId: activeEnrollment.sectionId,
                    status: activeEnrollment.status as 'active' | 'inactive' | 'graduated' | 'transferred',
                };
                
                // Si hay un grado seleccionado, filtrar las secciones
                if (activeEnrollment.gradeId) {
                    const gradeSections = sections.filter(s => s.gradeId === activeEnrollment.gradeId);
                    setFilteredSections(gradeSections);
                }
            }

            const cleaned = {
                ...defaultValues,
                ...cleanedResponse,
                enrollment: enrollmentData,
            };

            form.reset(cleaned);
            setStudentLoaded(true);

        } catch (error: unknown) {
            console.error('Error al cargar el estudiante:', error);
            toast.error('Error al cargar los datos del estudiante');
        }
    };

    // ✅ CORREGIDO: Función para manejar cambio de grado sin afectar el formulario
    const handleGradeChange = useCallback(async (gradeId: number) => {
        console.log('🔄 Cambiando grado a:', gradeId);
        
        if (gradeId > 0) {
            // Filtrar secciones localmente sin hacer fetch
            const gradeSections = sections.filter(section => section.gradeId === gradeId);
            console.log('📚 Secciones filtradas:', gradeSections.length);
            setFilteredSections(gradeSections);
        } else {
            setFilteredSections([]);
        }
    }, [sections]);

    const onSubmit = async (data: StudentFormData) => {

        console.log("📋 Datos del formulario:", data);

        setIsSubmitting(true);
        const currentYear = new Date().getFullYear();

        // ✅ VALIDACIÓN: Verificar que se haya seleccionado un ciclo activo
        if (!activeCycle) {
            toast.error('No hay un ciclo escolar activo');
            setIsSubmitting(false);
            return;
        }

        // ✅ VALIDACIÓN: Verificar campos de enrollment
        if (data.enrollment.gradeId === 0) {
            toast.error('Debe seleccionar un grado');
            setIsSubmitting(false);
            return;
        }

        if (data.enrollment.sectionId === 0) {
            toast.error('Debe seleccionar una sección');
            setIsSubmitting(false);
            return;
        }

        let uploadedPicture;
        if (data.profileImage instanceof File) {
            try {
                const result = await uploadImageToCloudinary(data.profileImage);
                uploadedPicture = {
                    url: result.url,
                    publicId: result.publicId,
                    kind: 'profile',
                    description: 'Foto de perfil del estudiante',
                };
            } catch (error) {
                console.error('Error al subir imagen a Cloudinary:', error);
                toast.error('No se pudo subir la imagen');
                setIsSubmitting(false);
                return;
            }
        }

        // ✅ ACTUALIZADO: Estructura de datos para el backend
        const updatedData: CreateStudentPayload = {
            // Datos básicos del estudiante
            givenNames: data.givenNames,
            lastNames: data.lastNames,
            birthDate: data.birthDate,
            birthPlace: data.birthPlace ?? undefined,
            nationality: data.nationality ?? undefined,
            gender: data.gender,
            livesWithText: data.livesWithText ?? undefined,
            financialResponsibleText: data.financialResponsibleText ?? undefined,
            siblingsCount: data.siblingsCount,
            brothersCount: data.brothersCount,
            sistersCount: data.sistersCount,
            favoriteColor: data.favoriteColor,
            hobby: data.hobby,
            favoriteFood: data.favoriteFood,
            favoriteSubject: data.favoriteSubject,
            favoriteToy: data.favoriteToy,
            favoriteCake: data.favoriteCake,
            codeSIRE: data.codeSIRE ?? undefined,

            // ✅ NUEVO: Enrollment (obligatorio)
            enrollment: {
                cycleId: activeCycle.id, // Usar ciclo activo
                gradeId: data.enrollment.gradeId,
                sectionId: data.enrollment.sectionId,
                status: data.enrollment.status,
            },

            // Relaciones
            pictures: uploadedPicture ? [uploadedPicture] : undefined,
            academicRecords: data.academicRecords?.map((record) => ({
                ...record,
                year: record.year || currentYear,
            })),
            address: data.address ? {
                street: data.address.street,
                zone: data.address.zone,
                municipality: data.address.municipality,
                department: data.address.department,
            } : undefined,
            busService: data.busService ? {
                ...data.busService,
                signedDate: data.busService.signedDate
                    ? typeof data.busService.signedDate === "string"
                        ? data.busService.signedDate
                        : data.busService.signedDate.toISOString()
                    : null,
            } : undefined,
            medicalInfo: data.medicalInfo,
            parents: data.parents,
            emergencyContacts: data.emergencyContacts,
            authorizedPersons: data.authorizedPersons,
            siblings: data.siblings,
            sponsorships: undefined,
        };

        const cleanedData = cleanNulls(updatedData);
        console.log("Form data:", cleanedData);

        try {
            await createStudent(cleanedData);
            toast.success("Estudiante registrado correctamente");
           // router.push('/students');
        } catch (error) {
            console.error(error);
            toast.error("Error al registrar estudiante");

            if (uploadedPicture?.publicId) {
                try {
                    await deleteImageFromCloudinary(uploadedPicture.publicId);
                } catch (deleteError) {
                    console.warn("No se pudo eliminar la imagen de Cloudinary:", deleteError);
                }
            }
        } finally {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setIsSubmitting(false);
        }
    };

    const onError = (errors: any) => {
        console.log("📋 Valores actuales:", form.getValues());
        console.error('❌ Errores de validación:', errors);
        toast.error('Revisa los campos del formulario');
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (isEditMode && studentId) {
            fetchStudentById(studentId);
        }
    }, [isEditMode, studentId]);

    // ✅ NUEVO: Efecto para actualizar enrollment por defecto con ciclo activo
    useEffect(() => {
        if (activeCycle && !isEditMode) {
            form.setValue('enrollment.cycleId', activeCycle.id);
        }
    }, [activeCycle, isEditMode, form]);

    // ✅ NUEVO: Observar cambios en el grado seleccionado
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'enrollment.gradeId' && value.enrollment?.gradeId) {
                handleGradeChange(value.enrollment.gradeId);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, handleGradeChange]);

    return {
        student,
        isLoadingUsers,
        usersError,
        fetchUsers,
        form,
        onSubmit,
        onError,
        isSubmitting,
        fetchParentByDpi,
        fetchStudentById,
        studentLoaded,
        studentData: form.getValues(),
        
        // ✅ CORREGIDO: Retornar secciones filtradas en lugar de todas
        cycles,
        activeCycle,
        grades,
        sections: filteredSections, // Usar secciones filtradas
        handleGradeChange,
    };
}