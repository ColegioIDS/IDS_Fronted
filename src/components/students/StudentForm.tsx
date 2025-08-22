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
import { EnrollmentSection } from "./sections/EnrollmentSection";
import { ParentsDataSection } from "./sections/ParentsDataSection";
import { EmergencyInfoSection } from "./sections/EmergencyInfoSection";
import { AcademicDataSection } from "./sections/AcademicDataSection";
import { MedicalInfoSection } from "./sections/MedicalInfoSection";
import { AuthorizedPersonsSection } from "./sections/AuthorizedPersonsSection";
import { SponsorshipPreferencesSection } from "./sections/SponsorshipPreferencesSection";
import { SiblingsSection } from "./sections/SiblingsSection";
import { BusServiceSection } from "./sections/BusServiceSection";
import { Student, CreateStudentPayload, Picture } from "@/types/student";
import { useStudentForm } from "@/context/StudentContext";
import { useSchoolCycleContext } from "@/context/SchoolCycleContext";
import { useGradeContext } from "@/context/GradeContext";
import { useSectionContext } from "@/context/SectionsContext";

import { FormProvider, useFieldArray } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Loading from "../loading/loading";

type StudentFormProps = {
  isEditMode?: boolean;
  studentId?: number;
};

export function StudentForm({ isEditMode = false, studentId }: StudentFormProps) {
  // ✅ CORREGIDO: Usar el context de estudiantes
  const {
    submitting,
    formMode,
    currentStudent,
    handleSubmit: submitStudent,
    parentDpiInfo,
    loadingDpi,
    searchParentByDPI,
    clearParentDpiInfo
  } = useStudentForm();

  // ✅ CORREGIDO: Usar contexts externos con nombres correctos
  const { 
    activeCycle, 
    cycles, 
    isLoading: cyclesLoading 
  } = useSchoolCycleContext();
  
const { 
  state: { grades, loading: gradesLoading },
  fetchGrades
} = useGradeContext();



useEffect(() => {
  if (grades.length === 0 && !gradesLoading) {
    fetchGrades();
  }
}, [grades.length, gradesLoading, fetchGrades]);
  
const { 
  state: { sections, loading: sectionsLoading },
  fetchSectionsByGrade 
} = useSectionContext();

  // ✅ Estado local para el formulario
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);

  // ✅ Configurar formulario con react-hook-form
  const form = useForm({
    resolver: zodResolver(StudentSchema),
    defaultValues,
  });

  const { fields: authorizedFields, append: appendAuthorized, remove: removeAuthorized } = useFieldArray({
    control: form.control,
    name: "authorizedPersons",
  });

  // ✅ CORREGIDO: Efecto para cargar datos del estudiante en modo edición
  useEffect(() => {
    if (isEditMode && currentStudent && formMode === 'edit') {
      // Resetear formulario con datos del estudiante
      form.reset({
        // Datos personales
        givenNames: currentStudent.givenNames,
        lastNames: currentStudent.lastNames,
        // ✅ CORREGIDO: Manejar fecha correctamente
       
birthDate: currentStudent.birthDate ? 
  (typeof currentStudent.birthDate === 'string' ? 
    new Date(currentStudent.birthDate) : 
    currentStudent.birthDate
  ) : new Date(),


        birthPlace: currentStudent.birthPlace || '',
        nationality: currentStudent.nationality || '',
        // ✅ CORREGIDO: Manejar gender con tipos correctos
        gender: (currentStudent.gender === 'Masculino' || currentStudent.gender === 'Femenino' || currentStudent.gender === 'Otro') 
          ? currentStudent.gender 
          : undefined,
        codeSIRE: currentStudent.codeSIRE || '',
        
        // Dirección
        address: {
          street: currentStudent.address?.street || '',
          zone: currentStudent.address?.zone || '',
          municipality: currentStudent.address?.municipality || '',
          department: currentStudent.address?.department || '',
        },

        // Información familiar
        livesWithText: currentStudent.livesWithText || '',
        financialResponsibleText: currentStudent.financialResponsibleText || '',
        siblingsCount: currentStudent.siblingsCount || 0,
        brothersCount: currentStudent.brothersCount || 0,
        sistersCount: currentStudent.sistersCount || 0,

        // Preferencias personales
        favoriteColor: currentStudent.favoriteColor || '',
        hobby: currentStudent.hobby || '',
        favoriteFood: currentStudent.favoriteFood || '',
        favoriteSubject: currentStudent.favoriteSubject || '',
        favoriteToy: currentStudent.favoriteToy || '',
        favoriteCake: currentStudent.favoriteCake || '',

        // Información médica
        medicalInfo: currentStudent.medicalInfo ? {
          hasDisease: currentStudent.medicalInfo.hasDisease,
          diseaseDetails: currentStudent.medicalInfo.diseaseDetails || '',
          takesMedication: currentStudent.medicalInfo.takesMedication,
          medicationDetails: currentStudent.medicalInfo.medicationDetails || '',
          hasAllergies: currentStudent.medicalInfo.hasAllergies,
          allergiesDetails: currentStudent.medicalInfo.allergiesDetails || '',
          emergencyMedicationAllowed: currentStudent.medicalInfo.emergencyMedicationAllowed,
          hasLearningDisability: currentStudent.medicalInfo.hasLearningDisability,
          disabilityDetails: currentStudent.medicalInfo.disabilityDetails || '',
          strengths: currentStudent.medicalInfo.strengths || '',
          areasToImprove: currentStudent.medicalInfo.areasToImprove || '',
        } : undefined,

        // ✅ CORREGIDO: Padres con validaciones de nullish
    // Replace the parents mapping in the useEffect
// ✅ REEMPLAZAR las líneas 119-143:
parents: currentStudent.parents?.map(parentLink => {
  if (!parentLink.parent) return {
    dpi: '',
    givenNames: '',
    lastNames: '',
    phone: '',
    email: '',
    relationshipType: undefined,
    isPrimaryContact: false,
    hasLegalCustody: false,
    livesWithStudent: false,
    financialResponsible: false,
    occupation: '',
    workplace: '',
  };
  
  return {
    // ✅ CORREGIDO: Acceder al dpi desde el User, no desde parent
    dpi: (parentLink.parent as any)?.dpi || '', // Type assertion temporal
    givenNames: parentLink.parent.givenNames,
    lastNames: parentLink.parent.lastNames,
    phone: parentLink.parent.phone || '',
    email: parentLink.parent.email || '',
    relationshipType: parentLink.relationshipType,
    isPrimaryContact: parentLink.isPrimaryContact || false,
    hasLegalCustody: parentLink.hasLegalCustody || false,
    livesWithStudent: parentLink.livesWithStudent || false,
    financialResponsible: parentLink.financialResponsible || false,
    occupation: parentLink.parent.parentDetails?.occupation || '',
    workplace: parentLink.parent.parentDetails?.workplace || '',
  };
}) || [],

        // ✅ CORREGIDO: Contactos de emergencia con tipos correctos
        emergencyContacts: currentStudent.emergencyContacts?.map(contact => ({
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone || '', // Convertir null a string vacío
          priority: contact.priority || 1,
        })) || [],

        // Personas autorizadas
        authorizedPersons: currentStudent.authorizedPersons?.map(person => ({
          name: person.name,
          relationship: person.relationship,
          phone: person.phone || '',
        })) || [],

        // ✅ CORREGIDO: Hermanos con tipos de gender correctos
        siblings: currentStudent.siblings?.map(sibling => ({
          name: sibling.name,
          age: sibling.age,
          gender: (sibling.gender === 'Masculino' || sibling.gender === 'Femenino' || sibling.gender === 'Otro') 
            ? sibling.gender 
            : undefined,
          birthOrder: sibling.birthOrder || 1,
        })) || [],

        // Historial académico
        academicRecords: currentStudent.academicRecords?.map(record => ({
          schoolName: record.schoolName,
          gradeCompleted: record.gradeCompleted,
          gradePromotedTo: record.gradePromotedTo,
          year: record.year,
        })) || [],

        // Servicio de bus
        busService: currentStudent.busService ? {
          hasService: currentStudent.busService.hasService,
          pickupPersonName: currentStudent.busService.pickupPersonName || '',
          dropoffPersonName: currentStudent.busService.dropoffPersonName || '',
          homeAddress: currentStudent.busService.homeAddress || '',
          referencePoints: currentStudent.busService.referencePoints || '',
          emergencyContact: currentStudent.busService.emergencyContact || '',
          emergencyDeliveryPerson: currentStudent.busService.emergencyDeliveryPerson || '',
          route: currentStudent.busService.route || '',
          monthlyFee: currentStudent.busService.monthlyFee || 0,
          acceptedRules: currentStudent.busService.acceptedRules,
        } : undefined,

        // ✅ CORREGIDO: Enrollment con tipos correctos
        enrollment: currentStudent.enrollments?.[0] ? {
          cycleId: currentStudent.enrollments[0].cycleId,
          gradeId: currentStudent.enrollments[0].section?.gradeId || 0,
          sectionId: currentStudent.enrollments[0].sectionId,
          status: currentStudent.enrollments[0].status as "active" | "graduated" | "transferred" | "inactive" | undefined,
        } : {
          cycleId: activeCycle?.id || 0,
          gradeId: 0,
          sectionId: 0,
        },
      });

      // Configurar grado seleccionado si existe enrollment
     if (currentStudent.enrollments?.[0]?.section?.gradeId) {
  setSelectedGradeId(currentStudent.enrollments[0].section.gradeId);
  fetchSectionsByGrade(currentStudent.enrollments[0].section.gradeId); // Remove .toString()
}
    }
  }, [isEditMode, currentStudent, formMode, form, activeCycle, fetchSectionsByGrade]);

  // ✅ CORREGIDO: Función para manejar cambio de grado (async)
const handleGradeChange = async (gradeId: number) => {
  setSelectedGradeId(gradeId);
  await fetchSectionsByGrade(gradeId); // Remove .toString()
  form.setValue('enrollment.sectionId', 0);
};

const onSubmit = async (data: z.infer<typeof StudentSchema>) => {
  try {
    console.log('📤 Enviando datos del formulario:', data);
    
    // ✅ FUNCIÓN HELPER: Convertir pictures del formulario a tipo Picture
    const convertPictures = (pictures: typeof data.pictures): Picture[] | undefined => {
      if (!pictures) return undefined;
      return pictures.map(pic => ({
        ...pic,
        kind: pic.kind || 'profile', // Asegurar que kind no sea undefined
      }));
    };
    
    if (isEditMode) {
      // ✅ MODO EDICIÓN: Usar Partial<Student> (SIN profileImage)
      const updatePayload: Partial<Student> = {
        givenNames: data.givenNames,
        lastNames: data.lastNames,
        birthDate: new Date(data.birthDate),
        birthPlace: data.birthPlace,
        nationality: data.nationality,
        gender: data.gender,
        codeSIRE: data.codeSIRE,
        livesWithText: data.livesWithText,
        financialResponsibleText: data.financialResponsibleText,
        siblingsCount: data.siblingsCount,
        brothersCount: data.brothersCount,
        sistersCount: data.sistersCount,
        favoriteColor: data.favoriteColor,
        hobby: data.hobby,
        favoriteFood: data.favoriteFood,
        favoriteSubject: data.favoriteSubject,
        favoriteToy: data.favoriteToy,
        favoriteCake: data.favoriteCake,
        address: data.address,
        medicalInfo: data.medicalInfo,
        parents: data.parents,
        emergencyContacts: data.emergencyContacts,
        authorizedPersons: data.authorizedPersons,
        siblings: data.siblings,
        academicRecords: data.academicRecords,
        busService: data.busService,
        // ❌ REMOVER: profileImage (no existe en Student)
        pictures: convertPictures(data.pictures),
      };

      const result = await submitStudent(updatePayload);
      
      if (result.success) {
        console.log('✅ Estudiante actualizado exitosamente');
      } else {
        console.error('❌ Error al actualizar estudiante:', result.message);
      }
    } else {
      // ✅ MODO CREACIÓN: Usar CreateStudentPayload (CON profileImage)
      if (!data.enrollment) {
        console.error('❌ Enrollment es requerido para crear estudiante');
        return;
      }

      const createPayload: CreateStudentPayload = {
        givenNames: data.givenNames,
        lastNames: data.lastNames,
        birthDate: new Date(data.birthDate),
        birthPlace: data.birthPlace,
        nationality: data.nationality,
        gender: data.gender,
        codeSIRE: data.codeSIRE,
        livesWithText: data.livesWithText,
        financialResponsibleText: data.financialResponsibleText,
        siblingsCount: data.siblingsCount,
        brothersCount: data.brothersCount,
        sistersCount: data.sistersCount,
        favoriteColor: data.favoriteColor,
        hobby: data.hobby,
        favoriteFood: data.favoriteFood,
        favoriteSubject: data.favoriteSubject,
        favoriteToy: data.favoriteToy,
        favoriteCake: data.favoriteCake,
        address: data.address,
        medicalInfo: data.medicalInfo,
        parents: data.parents,
        emergencyContacts: data.emergencyContacts,
        authorizedPersons: data.authorizedPersons,
        siblings: data.siblings,
        academicRecords: data.academicRecords,
        busService: data.busService,
        profileImage: data.profileImage, // ✅ SÍ incluir en creación
        pictures: convertPictures(data.pictures),
        // ✅ ENROLLMENT OBLIGATORIO para creación
        enrollment: {
          cycleId: data.enrollment.cycleId,
          gradeId: data.enrollment.gradeId,
          sectionId: data.enrollment.sectionId,
          status: data.enrollment.status,
        }
      };

      const result = await submitStudent(createPayload);
      
      if (result.success) {
        console.log('✅ Estudiante creado exitosamente');
      } else {
        console.error('❌ Error al crear estudiante:', result.message);
      }
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
};



  const onError = (errors: any) => {
    console.error('❌ Errores de validación:', errors);
  };

  // ✅ CORREGIDO: Verificar si los datos están listos
  const isDataLoading = cyclesLoading || gradesLoading;
  const isFormReady = !isDataLoading && cycles && grades && cycles.length > 0 && grades.length > 0;

  console.log('🎯 StudentForm - Estados:', {
    isDataLoading,
    cyclesCount: cycles?.length || 0,
    gradesCount: grades?.length || 0,
    activeCycle: activeCycle?.name || 'No encontrado',
    formMode,
    isEditMode,
    currentStudent: currentStudent?.id || 'No cargado'
  });

  // ✅ LOADING: Mientras cargan los datos
  if (isDataLoading) {
    return (
      <Loading
        variant="spinner"
        size="xl"
        text="Cargando datos del formulario..."
      />
    );
  }

  // ✅ ERROR: Si no hay datos básicos
  if (!isFormReady) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error: No se pudieron cargar los datos necesarios</p>
        <p className="text-sm text-gray-500 mt-2">
          Ciclos: {cycles?.length || 0}, Grados: {grades?.length || 0}
        </p>
      </div>
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
          {/* ✅ Mostrar información del ciclo activo */}
          {activeCycle && (
            <p className="text-sm text-green-600 dark:text-green-400">
              {isEditMode ? 'Editando estudiante' : 'Inscribiendo para el ciclo'}: <strong>{activeCycle.name}</strong>
            </p>
          )}
        </CardHeader>

        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
              
              {/* Datos Personales */}
               <PersonalDataSection />
              
              {!isEditMode && (
                <EnrollmentSection 
                  cycles={cycles}
                  activeCycle={activeCycle}
                  grades={grades}
                  sections={sections}
                  //selectedGradeId={selectedGradeId}
                  onGradeChange={handleGradeChange}
                  //sectionsLoading={sectionsLoading}
                />
              )}
              
              {/* ✅ CORREGIDO: Padres/Tutores sin props extras */}
             <ParentsDataSection isEditMode={isEditMode} /> 
              
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

              {/* ✅ Botón de envío */}
              <div className="flex flex-col gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  disabled={submitting}
                >
                  {submitting 
                    ? (isEditMode ? 'Actualizando...' : 'Registrando...') 
                    : (isEditMode ? 'Actualizar Estudiante' : 'Registrar Estudiante')
                  }
                </Button>
                
                {/* Información adicional */}
                <div className="text-xs text-gray-500 text-center space-y-1">
                  {!isEditMode && activeCycle && (
                    <p>
                      El estudiante será inscrito en: <strong>{activeCycle.name}</strong>
                    </p>
                  )}
                  <p>
                    Asegúrese de completar todos los campos obligatorios antes de continuar.
                  </p>
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      {/* ✅ Loading overlay durante envío */}
      {submitting && (
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