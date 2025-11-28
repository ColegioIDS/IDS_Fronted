// src/components/features/students/StudentEditForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StudentSchema } from '@/schemas/Students';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { studentsService } from '@/services/students.service';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Student } from '@/types/students.types';

// Import sections
import {
  PersonalDataSection,
  EnrollmentSection,
  ParentsDataSection,
  MedicalInfoSection,
  AcademicDataSection,
  EmergencyInfoSection,
  AuthorizedPersonsSection,
  BusServiceSection,
  SiblingsSection,
  SponsorshipPreferencesSection,
} from './sections';

interface StudentEditFormProps {
  studentId: number;
  onSuccess?: () => void;
}

export const StudentEditForm: React.FC<StudentEditFormProps> = ({
  studentId,
  onSuccess,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm({
    resolver: zodResolver(StudentSchema),
    mode: 'onBlur',
  });

  // ✅ Función para limpiar datos antes de enviar (igual que en create form)
  const cleanDataForSubmission = (obj: any): any => {
    const cleaned: any = {};

    Object.entries(obj).forEach(([key, value]) => {
      // Ignorar profileImage pero MANTENER pictures (ya subidas a Cloudinary)
      if (key === 'profileImage') {
        return;
      }

      // ✅ Preservar pictures si existe
      if (key === 'pictures' && value !== null && value !== undefined) {
        cleaned[key] = value;
        return;
      }

      if (value instanceof Date) {
        // Preservar Date objects
        cleaned[key] = value;
        return;
      }

      if (key === 'medicalInfo' && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        const cleanedMedical: any = {};
        Object.entries(value).forEach(([medKey, medValue]) => {
          if (medValue !== null && medValue !== undefined) {
            cleanedMedical[medKey] = medValue;
          }
        });
        // Solo incluir si tiene algo
        if (Object.keys(cleanedMedical).length > 0) {
          cleaned[key] = cleanedMedical;
        }
        return;
      }

      if (value === null || value === undefined) {
        return;
      }

      if (value instanceof File) {
        // Preservar Files
        cleaned[key] = value;
        return;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        // Si es un objeto (pero no File ni Array), limpiar recursivamente
        const cleanedObject = cleanDataForSubmission(value);
        // Solo incluir si tiene propiedades después de limpiar
        if (Object.keys(cleanedObject).length > 0) {
          cleaned[key] = cleanedObject;
        }
      } else if (Array.isArray(value)) {
        // Si es un array, limpiar cada elemento
        const cleanedArray = value.map(item => {
          if (item instanceof Date || item instanceof File) {
            return item;
          }
          return typeof item === 'object' ? cleanDataForSubmission(item) : item;
        });
        cleaned[key] = cleanedArray;
      } else {
        // Valores primitivos
        cleaned[key] = value;
      }
    });

    return cleaned;
  };

  // Cargar datos del estudiante y datos de enrollment al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [student, enrollmentFormData] = await Promise.all([
          studentsService.getStudentById(studentId),
          studentsService.getEnrollmentFormData(),
        ]);


        setStudentData(student);
        setEnrollmentData(enrollmentFormData);

        // Preparar datos para el formulario
        const formData = {
          givenNames: student.givenNames,
          lastNames: student.lastNames,
          birthDate: student.birthDate,
          birthPlace: student.birthPlace,
          nationality: student.nationality,
          gender: student.gender,
          livesWithText: student.livesWithText,
          financialResponsibleText: student.financialResponsibleText,
          siblingsCount: student.siblingsCount,
          brothersCount: student.brothersCount,
          sistersCount: student.sistersCount,
          favoriteColor: student.favoriteColor,
          hobby: student.hobby,
          favoriteFood: student.favoriteFood,
          favoriteSubject: student.favoriteSubject,
          favoriteToy: student.favoriteToy,
          favoriteCake: student.favoriteCake,

          // ✅ Mapear pictures a profileImage
          profileImage: student.pictures && student.pictures.length > 0 
            ? {
                url: student.pictures[0].url,
                publicId: student.pictures[0].publicId,
                kind: 'profile',
                description: student.pictures[0].description,
              }
            : null,

          // Medical
          medicalInfo: student.medicalInfo ? {
            hasDisease: student.medicalInfo.hasDisease || false,
            diseaseDetails: student.medicalInfo.diseaseDetails || undefined,
            takesMedication: student.medicalInfo.takesMedication || false,
            medicationDetails: student.medicalInfo.medicationDetails || undefined,
            hasAllergies: student.medicalInfo.hasAllergies || false,
            allergiesDetails: student.medicalInfo.allergiesDetails || undefined,
            emergencyMedicationAllowed: student.medicalInfo.emergencyMedicationAllowed || false,
            emergencyMedicationDetails: student.medicalInfo.emergencyMedicationDetails || undefined,
            hasLearningDisability: student.medicalInfo.hasLearningDisability || false,
            disabilityDetails: student.medicalInfo.disabilityDetails || undefined,
            strengths: student.medicalInfo.strengths || undefined,
            areasToImprove: student.medicalInfo.areasToImprove || undefined,
          } : {},

          // Academic records - Asegurar al menos un registro
          academicRecords: student.academicRecords && student.academicRecords.length > 0 
            ? student.academicRecords 
            : [{
                schoolName: '',
                gradeCompleted: '',
                gradePromotedTo: '',
                year: new Date().getFullYear(),
              }],

          // Bus service
          busService: student.busService || { hasService: false, acceptedRules: false },

          // Emergency contacts
          emergencyContacts: student.emergencyContacts || [],

          // Authorized persons
          authorizedPersons: student.authorizedPersons || [],

          // Sponsorships
          sponsorships: student.sponsorships || [],

          // Siblings
          siblings: student.siblings || [],

          // Address - Transformar estructura del backend
          address: student.address ? {
            street: student.address.street || '',
            zone: student.address.zone || '',
            municipality: (student.address.municipalityId || student.address.municipality)?.toString() || '',
            department: (student.address.departmentId || student.address.department)?.toString() || '',
          } : {
            street: '',
            zone: '',
            municipality: '',
            department: '',
          },

          // Parents - Transformar estructura del backend al formato del formulario
          parents: student.parents?.map((p: any) => ({
            userId: p.parent?.id || null,
            newParent: p.parent ? {
              givenNames: p.parent.givenNames || '',
              lastNames: p.parent.lastNames || '',
              dpi: p.parent.dpi || '',
              phone: p.parent.phone || '',
              email: p.parent.email || '',
              birthDate: p.parent.birthDate ? new Date(p.parent.birthDate) : undefined,
              gender: p.parent.gender || undefined,
              details: {
                dpiIssuedAt: p.parent.parentDetails?.dpiIssuedAt || '',
                occupation: p.parent.parentDetails?.occupation || '',
                workplace: p.parent.parentDetails?.workplace || '',
                workPhone: p.parent.parentDetails?.workPhone || '',
              },
            } : undefined,
            relationshipType: p.relationshipType || '',
            isPrimaryContact: p.isPrimaryContact || false,
            hasLegalCustody: p.hasLegalCustody || false,
            financialResponsible: p.financialResponsible || false,
            livesWithStudent: p.livesWithStudent || false,
            emergencyContactPriority: p.emergencyContactPriority || 0,
          })) || [],

          // Enrollment (del primer enrollment)
          enrollment: student.enrollments?.[0]
            ? {
                cycleId: student.enrollments[0].cycleId,
                gradeId: student.enrollments[0].gradeId,
                sectionId: student.enrollments[0].sectionId,
                status: student.enrollments[0].status,
              }
            : { cycleId: 0, gradeId: 0, sectionId: 0, status: 'ACTIVE' },
        };

        form.reset(formData as any);
      } catch (err: any) {
        setError('Error al cargar los datos del estudiante');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [studentId, form]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails([]);

      // ✅ Si hay profileImage (File), subirlo a Cloudinary
      let processedData = { ...data };

      if (data.profileImage instanceof File) {
        try {
          const cloudinaryResponse = await uploadImageToCloudinary(
            data.profileImage,
            'students/profile'
          );

          // ✅ Reemplazar el File con el objeto de Cloudinary
          processedData.pictures = [
            {
              url: cloudinaryResponse.url,
              publicId: cloudinaryResponse.publicId,
              kind: 'profile',
              description: 'Foto de perfil del estudiante',
            },
          ];
        } catch (err: any) {
          const errorMsg = `Error al subir imagen: ${err.message}`;
          setError(errorMsg);
          setErrorDetails([errorMsg]);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
      }

      // ✅ Limpiar datos antes de enviar
      processedData = cleanDataForSubmission(processedData);


      // Actualizar estudiante
      await studentsService.updateStudent(studentId, processedData);

      toast.success('✅ Estudiante actualizado correctamente');

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/(admin)/students/list');
      }
    } catch (err: any) {
      let errorMessage = 'Error desconocido al actualizar estudiante';
      let details: string[] = [];

      // Intentar obtener datos del error de diferentes formas
      const errorData = err.response?.data || err.data || err.message;

      if (errorData) {
        // Si es un objeto con estructura de respuesta
        if (typeof errorData === 'object') {
          if (errorData.message) {
            errorMessage = errorData.message;
          }

          if (Array.isArray(errorData.details)) {
            details = errorData.details;
          } else if (errorData.details && typeof errorData.details === 'object') {
            // Si details es un objeto, convertir a array de strings
            details = Object.entries(errorData.details).map(([key, value]: any) => {
              if (typeof value === 'object' && value.message) {
                return `${key}: ${value.message}`;
              }
              return `${key}: ${value}`;
            });
          }
        } else if (typeof errorData === 'string') {
          // Si es solo un string
          errorMessage = errorData;
        }
      }

      // Setear los estados
      setError(errorMessage);
      setErrorDetails(details);

      // Mostrar toast
      toast.error(errorMessage, {
        description: details.length > 0 ? details.slice(0, 3).join('\n') : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando datos del estudiante...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="border-gray-300 dark:border-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Editar Estudiante
            </h1>
            {studentData && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {studentData.givenNames} {studentData.lastNames}
              </p>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              <div className="font-semibold">{error}</div>
              {errorDetails.length > 0 && (
                <div className="mt-2 text-sm">
                  <div className="font-semibold mb-1">Detalles del error:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {errorDetails.map((detail: string, idx: number) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Data */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Datos Personales</CardTitle>
              </CardHeader>
              <CardContent>
                <PersonalDataSection />
              </CardContent>
            </Card>

            {/* Enrollment */}
            {enrollmentData && (
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle>Inscripción Académica</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnrollmentSection activeCycle={enrollmentData.cycles?.[0]} />
                </CardContent>
              </Card>
            )}

            {/* Medical Info */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Información Médica</CardTitle>
              </CardHeader>
              <CardContent>
                <MedicalInfoSection />
              </CardContent>
            </Card>

            {/* Academic Records */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Antecedentes Académicos</CardTitle>
              </CardHeader>
              <CardContent>
                <AcademicDataSection />
              </CardContent>
            </Card>

            {/* Emergency Info */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Información de Emergencia</CardTitle>
              </CardHeader>
              <CardContent>
                <EmergencyInfoSection />
              </CardContent>
            </Card>

            {/* Authorized Persons */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Personas Autorizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <AuthorizedPersonsSection />
              </CardContent>
            </Card>

            {/* Bus Service */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Servicio de Transporte</CardTitle>
              </CardHeader>
              <CardContent>
                <BusServiceSection />
              </CardContent>
            </Card>

            {/* Siblings */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Hermanos/Hermanas</CardTitle>
              </CardHeader>
              <CardContent>
                <SiblingsSection />
              </CardContent>
            </Card>

            {/* Parents */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Datos de Padres/Guardianes</CardTitle>
              </CardHeader>
              <CardContent>
                <ParentsDataSection />
              </CardContent>
            </Card>

            {/* Sponsorship */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Preferencias de Becas</CardTitle>
              </CardHeader>
              <CardContent>
                <SponsorshipPreferencesSection />
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end sticky bottom-0 bg-gray-50 dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 min-w-32"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
