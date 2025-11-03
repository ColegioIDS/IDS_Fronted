// src/components/features/students/StudentCreateForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StudentSchema, defaultValues } from '@/schemas/Students';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { studentsService } from '@/services/students.service';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';

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
import { QuickTestDataButton } from './QuickTestDataButton';

export const StudentCreateForm: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorDetails, setErrorDetails] = React.useState<string[]>([]);
  const [enrollmentData, setEnrollmentData] = React.useState<any>(null);
  const [loadingEnrollmentData, setLoadingEnrollmentData] = React.useState(true);

  const form = useForm({
    resolver: zodResolver(StudentSchema),
    defaultValues,
  });

  // Cargar datos de enrollment al montar
  useEffect(() => {
    const loadEnrollmentData = async () => {
      try {
        setLoadingEnrollmentData(true);
        const data = await studentsService.getEnrollmentFormData();
        setEnrollmentData(data);

        // Establecer ciclo activo
        if (data.activeCycle) {
          form.setValue('enrollment.cycleId', data.activeCycle.id);
          form.setValue('enrollment.status', 'active');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos de enrollment');
        console.error('Error loading enrollment data:', err);
      } finally {
        setLoadingEnrollmentData(false);
      }
    };

    loadEnrollmentData();
  }, [form]);

  // Cargar secciones cuando cambia el grado
  const handleGradeChange = React.useCallback(async (gradeId: number) => {
    // Las secciones ya vienen en el ciclo, no necesitamos hacer otra llamada API
    // Este callback ahora solo es un placeholder para futuras extensiones
    console.log('Grade changed to:', gradeId);
  }, []);

  // ✅ NUEVO: Función para limpiar datos null/undefined de forma inteligente
  // Preserva booleanos, Dates, Files y estructura de medicalInfo
  const cleanDataForSubmission = (data: any): any => {
    if (!data || typeof data !== 'object') return data;
    
    // ✅ Preservar Dates, Files y otros objetos especiales
    if (data instanceof Date || data instanceof File) {
      return data;
    }
    
    const cleaned: any = {};
    
    Object.entries(data).forEach(([key, value]) => {
      // ✅ Preservar Dates (birthDate, etc.)
      if (value instanceof Date) {
        cleaned[key] = value;
        return;
      }
      
      // Preserve medicalInfo estructura completa si existe
      if (key === 'medicalInfo' && typeof value === 'object' && value !== null && !(value instanceof Date)) {
        const cleanedMedical: any = {};
        Object.entries(value).forEach(([medKey, medValue]) => {
          // Preservar booleans y valores válidos
          if (typeof medValue === 'boolean' || (medValue !== null && medValue !== undefined)) {
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
        // Para secciones como medicalInfo, no incluir el objeto completo si es null
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
          processedData.profileImage = {
            url: cloudinaryResponse.url,
            publicId: cloudinaryResponse.publicId,
            kind: 'profile',
            description: 'Foto de perfil del estudiante',
          };
        } catch (err: any) {
          const errorMsg = `Error al subir imagen: ${err.message}`;
          setError(errorMsg);
          setErrorDetails([errorMsg]);
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
      } else if (data.profileImage === null || data.profileImage === undefined) {
        processedData.profileImage = null;
      }

      // ✅ NUEVO: Limpiar datos antes de enviar
      processedData = cleanDataForSubmission(processedData);

      // Validar campos requeridos
      const hasInvalidEnrollment = !processedData.enrollment?.cycleId || 
                                    !processedData.enrollment?.gradeId || 
                                    !processedData.enrollment?.sectionId;
      
      if (hasInvalidEnrollment) {
        const errorMsg = '⚠️ Debe seleccionar Ciclo, Grado y Sección';
        setError(errorMsg);
        setErrorDetails([errorMsg]);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      console.log('📊 Datos listos para enviar al servidor');
      console.log('📊 Payload final:', processedData);

      const response = await studentsService.createStudentWithEnrollment(processedData);
      console.log('✅ Estudiante creado exitosamente:', response);

      // Mostrar éxito y resetear
      toast.success('✅ Estudiante creado exitosamente');
    //            form.reset(defaultValues);
      setError(null);
      setErrorDetails([]);
      
    } catch (err: any) {
      // ✅ Manejar errores del backend con detalles
      let errorMessage = 'Error desconocido al crear estudiante';
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

  if (loadingEnrollmentData) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Crear Nuevo Estudiante</CardTitle>
            {/* Botón para llenar datos rápidamente - Oculto para producción */}
            <QuickTestDataButton />
          </CardHeader>
          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertDescription className="ml-2">
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-red-800 dark:text-red-300 text-base">{error}</p>
                    </div>
                    {errorDetails.length > 0 && (
                      <div className="bg-white dark:bg-gray-900/50 rounded p-3 border border-red-200 dark:border-red-800">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Detalles del error:</p>
                        <ul className="space-y-2">
                          {errorDetails.map((detail, index) => (
                            <li key={index} className="text-xs text-red-700 dark:text-red-300 flex gap-2">
                              <span className="text-red-500">•</span>
                              <span className="break-words">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Datos Personales */}
            <PersonalDataSection />

            {/* Enrollment */}
            {enrollmentData && (
              <EnrollmentSection
                activeCycle={enrollmentData.activeCycle}
                allCycles={enrollmentData.cycles}
                onGradeChange={handleGradeChange}
              />
            )}

            {/* Información Médica */}
            <MedicalInfoSection />

            {/* Datos Académicos */}
            <AcademicDataSection />

            {/* Hermanos */}
            <SiblingsSection />

            {/* Padres */}
            <ParentsDataSection />

            {/* Información de Emergencia */}
            <EmergencyInfoSection />

            {/* Personas Autorizadas */}
            <AuthorizedPersonsSection />

            {/* Servicio de Bus */}
            <BusServiceSection />

            {/* Preferencias para Patrocinios */}
            <SponsorshipPreferencesSection />

            {/* Botones de acción */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                onClick={async () => {
                  const result = await form.trigger();
                  if (!result) {
                    // ✅ NUEVO: Console log detallado de errores
                    const errors = form.formState.errors;
                    console.error('❌ ERRORES DE VALIDACIÓN:');
                    console.error('Total de errores:', Object.keys(errors).length);
                    console.table(errors);
                    
                    // Detalles específicos
                    Object.entries(errors).forEach(([field, error]: any) => {
                      if (error?.message) {
                        console.warn(`⚠️ ${field}: ${error.message}`);
                      }
                      if (error?.type) {
                        console.warn(`   Tipo de error: ${error.type}`);
                      }
                    });
                    
                    setError('Por favor completa todos los campos requeridos marcados en rojo');
                  } else {
                    console.log('✅ VALIDACIÓN EXITOSA - Formulario completado correctamente');
                    console.log('Datos válidos:', form.getValues());
                    setError(null);
                    alert('✅ Formulario válido. Ahora puedes hacer clic en Crear Estudiante');
                  }
                }}
                className="flex-1"
                variant="secondary"
              >
                Validar Formulario
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className="flex-1"
                title={!form.formState.isValid ? "Por favor valida el formulario primero" : "Crear estudiante"}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Estudiante'
                )}
              </Button>
              {/* Botón Debug - Oculto para producción */}
              {/* 
              <Button
                type="button"
                onClick={async () => {
                  const data = form.getValues();
                  await onSubmit(data);
                }}
                disabled={loading}
                className="flex-1"
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar (Debug)'
                )}
              </Button>
              */}
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(defaultValues)}
              >
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};
