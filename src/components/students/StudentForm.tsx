import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StudentSchema, defaultValues } from "@/schemas/Students";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FaUserEdit } from "react-icons/fa";
import { Button } from "@/components/ui/button";

import { PersonalDataSection } from "./sections/PersonalDataSection";
import { EnrollmentSection } from "./sections/EnrollmentSection"; // ✅ NUEVO
import { ParentsDataSection } from "./sections/ParentsDataSection";
import { EmergencyInfoSection } from "./sections/EmergencyInfoSection";
import { AcademicDataSection } from "./sections/AcademicDataSection";
import { MedicalInfoSection } from "./sections/MedicalInfoSection";
import { AuthorizedPersonsSection } from "./sections/AuthorizedPersonsSection";
import { SponsorshipPreferencesSection } from "./sections/SponsorshipPreferencesSection";
import { SiblingsSection } from "./sections/SiblingsSection";
import { BusServiceSection } from "./sections/BusServiceSection";
import { useStudent } from "@/hooks/useStudent";
import { FormProvider, useFieldArray } from 'react-hook-form';

import Loading from "../loading/loading";

type UserFormProps = {
  isEditMode?: boolean;
  userId?: number;
};

export function StudentForm({ isEditMode = false, userId }: UserFormProps) {
  const {
    form,
    onSubmit,
    onError,
    student,
    isLoadingUsers,
    usersError,
    fetchUsers,
    isSubmitting,
    // ✅ NUEVO: Estados de enrollment
    cycles,           // ✅ ASEGURAR QUE ESTÉ AQUÍ
    activeCycle,
    grades,
    sections,
    handleGradeChange, // ✅ AGREGAR ESTA LÍNEA
  } = useStudent(isEditMode);

  const { fields: authorizedFields, append: appendAuthorized, remove: removeAuthorized } = useFieldArray({
    control: form.control,
    name: "authorizedPersons",
  });

  // ✅ NUEVO: Verificar que los datos necesarios estén cargados
  console.log('🎯 StudentForm - Datos disponibles:', {
    cycles: cycles?.length || 0,
    grades: grades?.length || 0,
    activeCycle: activeCycle?.name || 'No encontrado',
    isLoadingUsers
  });

  const isFormReady = !isLoadingUsers && cycles && grades && cycles.length > 0 && grades.length > 0;

  if (!isFormReady) {
    return (
      <Loading
        variant="spinner"
        size="xl"
        text="Cargando datos del formulario..."
      />
    );
  }

  return (
    <>
      <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FaUserEdit />
            {isEditMode ? 'Editar Estudiante' : 'Registro de Estudiante'}
          </CardTitle>
          {/* ✅ NUEVO: Mostrar información del ciclo activo */}
          {activeCycle && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Inscribiendo para el ciclo: <strong>{activeCycle.name}</strong>
            </p>
          )}
        </CardHeader>

        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
              
              {/* Datos Personales */}
              <PersonalDataSection />
              
              {/* ✅ NUEVO: Asignación Académica (Enrollment) */}
              <EnrollmentSection 
                cycles={cycles}
                activeCycle={activeCycle}
                grades={grades}
                sections={sections}
                onGradeChange={handleGradeChange}
              />
              
              {/* Padres/Tutores */}
              <ParentsDataSection />
              
              {/* Contactos de Emergencia */}
              <EmergencyInfoSection />
              
              {/* Historial Académico */}
              <AcademicDataSection />
              
              {/* Información Médica */}
              <MedicalInfoSection />
              
              {/* Personas Autorizadas */}
              <AuthorizedPersonsSection
                fields={authorizedFields}
                append={appendAuthorized}
                remove={removeAuthorized}
              />
              
              {/* Preferencias de Patrocinio */}
              <SponsorshipPreferencesSection />
              
              {/* Hermanos */}
              <SiblingsSection />
              
              {/* Servicio de Bus */}
              <BusServiceSection />

              {/* ✅ NUEVO: Botón de envío con validación mejorada */}
              <div className="flex flex-col gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (isEditMode ? 'Actualizando...' : 'Registrando...') 
                    : (isEditMode ? 'Actualizar Estudiante' : 'Registrar Estudiante')
                  }
                </Button>
                
                {/* Información adicional */}
                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>
                    El estudiante será inscrito en: <strong>{activeCycle?.name}</strong>
                  </p>
                  <p>
                    Asegúrese de completar todos los campos obligatorios antes de continuar.
                  </p>
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      {isSubmitting && (
        <Loading
          overlay
          variant="spinner"
          size="xl"
          text={isEditMode ? "Actualizando estudiante..." : "Registrando estudiante..."}
        />
      )}
    </>
  );
}