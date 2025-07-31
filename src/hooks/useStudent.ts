// src/hooks/useStudent.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { z } from 'zod';
import { getStudents, createStudent, getUserByDPI, getStudentById } from '@/services/useStudents';
import { StudentSchema, defaultValues, EnrollmentStatusSchema } from '@/schemas/Students';
import { Student } from '@/types/student';
import { cleanNulls } from '@/utils/cleanNulls';
import { ParentDpiResponse } from '@/types/student';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { deleteImageFromCloudinary } from '@/services/useCloudinary';


type StudentFormData = z.infer<typeof StudentSchema>;

export function useStudent(isEditMode: boolean = false, studentId?: number) {
    const [student, setStudent] = useState<Student[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState<string | null>(null);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentLoaded, setStudentLoaded] = useState(false);
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
            const response = await getUserByDPI(dpi); // asegúrate que también esté bien tipado
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
            const cleaned = {
                ...defaultValues,
                ...cleanedResponse,
            };
            form.reset(cleaned);
            setStudentLoaded(true)



        } catch (error: unknown) {
            console.error('Error al cargar el estudiante:', error);
            toast.error('Error al cargar los datos del estudiante');
        }
    };


    const onSubmit = async (data: StudentFormData) => {
        setIsSubmitting(true);
        const currentYear = new Date().getFullYear();

        const enrollmentStatusValidated = EnrollmentStatusSchema.parse("active");

        let uploadedPicture;
        if (data.profileImage instanceof File) {
            try {
                const result = await uploadImageToCloudinary(data.profileImage); // debes tener esta función
                uploadedPicture = {
                    url: result.url,
                    publicId: result.publicId,
                    kind: 'profile',
                    description: 'Foto de perfil del estudiante',
                };
            } catch (error) {
                console.error('Error al subir imagen a Cloudinary:', error);
                toast.error('No se pudo subir la imagen');



            }
        }

        const updatedData = {
            ...data,
            pictures: uploadedPicture ? [uploadedPicture] : undefined,
            academicRecords: data.academicRecords.map((record) => ({
                ...record,
                year: record.year || currentYear,
            })),
            codeSIRE: data.codeSIRE ?? undefined,
            enrollmentStatus: enrollmentStatusValidated,
            birthDate: data.birthDate.toISOString().split("T")[0],
            birthPlace: data.birthPlace ?? undefined,
            nationality: data.nationality ?? undefined,
            address: data.address
                ? {
                    street: data.address.street,
                    zone: data.address.zone,
                    municipality: data.address.municipality,
                    department: data.address.department,
                }
                : undefined,
            busService: data.busService
                ? {
                    ...data.busService,
                    signedDate: data.busService.signedDate
                        ? typeof data.busService.signedDate === "string"
                            ? data.busService.signedDate
                            : data.busService.signedDate.toISOString()
                        : null,
                }
                : undefined,
        };
        delete updatedData.profileImage;

        const cleanedData = cleanNulls(updatedData);
        console.log("Form", cleanedData);

        try {
            await createStudent(cleanedData);
            toast.success("Estudiante registrado correctamente");
        }

        catch (error) {
            console.error(error);
            toast.error("Error al registrar estudiante");

            if (uploadedPicture?.publicId) {
                try {
                    await deleteImageFromCloudinary(uploadedPicture.publicId);
                } catch (deleteError) {
                    console.warn("No se pudo eliminar la imagen de Cloudinary:", deleteError);
                }
            }
        }

        finally {
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
        studentData: form.getValues()
    };
}
