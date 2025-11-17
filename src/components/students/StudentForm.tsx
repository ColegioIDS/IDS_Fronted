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
import ProtectedContent from '@/components/common/ProtectedContent'; // ✅ NUEVO

import { FormProvider, useFieldArray } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Loading from "../loading/loading";

type StudentFormProps = {
  isEditMode?: boolean;
  studentId?: number;
};

export function StudentForm({ isEditMode = false, studentId }: StudentFormProps) {
  // ✅ NUEVO: Usar el hook actualizado con enrollment data
  const {
    submitting,
    formMode,
    currentStudent,
    handleSubmit: submitStudent,
    parentDpiInfo,
    loadingDpi,
    searchParentByDPI,
    clearParentDpiInfo,
    enrollmentData, // ✅ NUEVO
    availableSections, // ✅ NUEVO
    loadingEnrollmentData, // ✅ NUEVO
    loadingSections, // ✅ NUEVO
    fetchEnrollmentData, // ✅ NUEVO
    loadSectionsByGrade, // ✅ NUEVO
    clearAvailableSections, // ✅ NUEVO
  } = useStudentForm();

  // ✅ Configurar formulario con react-hook-form
  const form = useForm({
    resolver: zodResolver(StudentSchema),
    defaultValues,
  });

  const { fields: authorizedFields, append: appendAuthorized, remove: removeAuthorized } = useFieldArray({
    control: form.control,
    name: "authorizedPersons",
  });

  // ✅ NUEVO: Cargar datos de inscripción al montar (solo para crear)
  useEffect(() => {
    if (!isEditMode) {
      fetchEnrollmentData();
    }
  }, [isEditMode, fetchEnrollmentData]);

  // ✅ NUEVO: Setear ciclo activo en el formulario cuando se carguen los datos
  useEffect(() => {
    if (enrollmentData?.activeCycle && !isEditMode) {
      form.setValue('enrollment.cycleId', enrollmentData.activeCycle.id);
      form.setValue('enrollment.status', 'ACTIVE');
    }
  }, [enrollmentData, isEditMode, form]);

  // ✅ Efecto para cargar datos del estudiante en modo edición
  useEffect(() => {
    if (isEditMode && currentStudent && formMode === 'edit') {
      form.reset({
        givenNames: currentStudent.givenNames,
        lastNames: currentStudent.lastNames,
        birthDate: currentStudent.birthDate ? 
          (typeof currentStudent.birthDate === 'string' ? 
            new Date(currentStudent.birthDate) : 
            currentStudent.birthDate
          ) : new Date(),
        birthPlace: currentStudent.birthPlace || '',
        nationality: currentStudent.nationality || '',
        gender: (currentStudent.gender === 'Masculino' || currentStudent.gender === 'Femenino' || currentStudent.gender === 'Otro') 
          ? currentStudent.gender 
          : undefined,
        codeSIRE: currentStudent.codeSIRE || '',
        
        address: {
          street: currentStudent.address?.street || '',
          zone: currentStudent.address?.zone || '',
          municipality: currentStudent.address?.municipality || '',
          department: currentStudent.address?.department || '',
        },

        livesWithText: currentStudent.livesWithText || '',
        financialResponsibleText: currentStudent.financialResponsibleText || '',
        siblingsCount: currentStudent.siblingsCount || 0,
        brothersCount: currentStudent.brothersCount || 0,
        sistersCount: currentStudent.sistersCount || 0,

        favoriteColor: currentStudent.favoriteColor || '',
        hobby: currentStudent.hobby || '',
        favoriteFood: currentStudent.favoriteFood || '',
        favoriteSubject: currentStudent.favoriteSubject || '',
        favoriteToy: currentStudent.favoriteToy || '',
        favoriteCake: currentStudent.favoriteCake || '',

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
            dpi: (parentLink.parent as any)?.dpi || '',
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

        emergencyContacts: currentStudent.emergencyContacts?.map(contact => ({
          name: contact.name || '',
          relationship: contact.relationship || '',
          phone: contact.phone || '',
          priority: contact.priority || 1,
        })) || [],

        authorizedPersons: currentStudent.authorizedPersons?.map(person => ({
          name: person.name || '',
          relationship: person.relationship || '',
          phone: person.phone || '',
        })) || [],

        siblings: currentStudent.siblings?.map(sibling => ({
          name: sibling.name || '',
          age: sibling.age || 0,
          gender: (sibling.gender === 'Masculino' || sibling.gender === 'Femenino' || sibling.gender === 'Otro') 
            ? sibling.gender 
            : undefined,
          birthOrder: sibling.birthOrder || 1,
        })) || [],

        academicRecords: currentStudent.academicRecords?.map(record => ({
          schoolName: record.schoolName,
          gradeCompleted: record.gradeCompleted,
          gradePromotedTo: record.gradePromotedTo,
          year: record.year,
        })) || [],

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

        enrollment: currentStudent.enrollments?.[0] ? {
          cycleId: currentStudent.enrollments[0].cycleId,
          gradeId: currentStudent.enrollments[0].section?.gradeId || 0,
          sectionId: currentStudent.enrollments[0].sectionId,
          status: currentStudent.enrollments[0].status as "ACTIVE" | "GRADUATED" | "TRANSFERRED" | "INACTIVE" | undefined,
        } : {
          cycleId: 0,
          gradeId: 0,
          sectionId: 0,
        },
      });
    }
  }, [isEditMode, currentStudent, formMode, form]);

  // ✅ NUEVO: Función para manejar cambio de grado
  const handleGradeChange = async (gradeId: number) => {
    const cycleId = form.getValues('enrollment.cycleId');
    
    if (!cycleId) {
      console.warn('No hay ciclo seleccionado');
      return;
    }

    // Limpiar sección seleccionada
    form.setValue('enrollment.sectionId', 0);
    clearAvailableSections();

    // Cargar secciones del grado en el ciclo activo
    await loadSectionsByGrade(cycleId, gradeId);
  };

  const onSubmit = async (data: z.infer<typeof StudentSchema>) => {
    try {
      console.log('📤 Enviando datos del formulario:', data);
      
      const convertPictures = (pictures: typeof data.pictures): Picture[] | undefined => {
        if (!pictures) return undefined;
        return pictures.map(pic => ({
          ...pic,
          kind: pic.kind || 'profile',
        }));
      };
      
      if (isEditMode) {
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
          parents: data.parents as any,
          emergencyContacts: data.emergencyContacts as any,
          authorizedPersons: data.authorizedPersons as any,
          siblings: data.siblings as any,
          academicRecords: data.academicRecords,
          busService: data.busService,
          pictures: convertPictures(data.pictures),
        };

        const result = await submitStudent(updatePayload);
        
        if (result.success) {
          console.log('✅ Estudiante actualizado exitosamente');
        } else {
          console.error('❌ Error al actualizar estudiante:', result.message);
        }
      } else {
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
          parents: data.parents as any,
          emergencyContacts: data.emergencyContacts as any,
          authorizedPersons: data.authorizedPersons as any,
          siblings: data.siblings as any,
          academicRecords: data.academicRecords,
          busService: data.busService,
          profileImage: data.profileImage as any,
          pictures: convertPictures(data.pictures),
          enrollment: {
            cycleId: data.enrollment.cycleId || 0,
            gradeId: data.enrollment.gradeId || 0,
            sectionId: data.enrollment.sectionId || 0,
            status: data.enrollment.status || 'ACTIVE',
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

  // ✅ NUEVO: Loading mejorado
  if (loadingEnrollmentData && !isEditMode) {
    return (
      <Loading
        variant="spinner"
        size="xl"
        text="Cargando datos del formulario..."
      />
    );
  }

  // ✅ NUEVO: Error si no hay datos de inscripción (solo para crear)
  if (!enrollmentData && !isEditMode) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error: No se pudieron cargar los datos de inscripción</p>
        <p className="text-sm text-gray-500 mt-2">
          Por favor, verifica que exista un ciclo escolar activo con grados asignados.
        </p>
      </div>
    );
  }

  return (
    <ProtectedContent
      requiredPermission={{ module: 'student', action: 'create' }}
    > 

    



      <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FaUserEdit />
            {isEditMode ? 'Editar Estudiante' : 'Registro de Estudiante'}
          </CardTitle>
          {/* ✅ NUEVO: Mostrar información del ciclo activo */}
          {!isEditMode && enrollmentData?.activeCycle && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Inscribiendo para el ciclo: <strong>{enrollmentData.activeCycle.name}</strong>
            </p>
          )}
        </CardHeader>

        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
              
              <PersonalDataSection />
              
              {!isEditMode && enrollmentData && (
                <EnrollmentSection 
                  activeCycle={enrollmentData.activeCycle}
                  availableGrades={enrollmentData.availableGrades}
                  availableSections={availableSections?.sections || []}
                  loadingSections={loadingSections}
                  onGradeChange={handleGradeChange}
                />
              )}
              
              <ParentsDataSection isEditMode={isEditMode} /> 
              <EmergencyInfoSection />
              <AcademicDataSection />
              <MedicalInfoSection />
              <AuthorizedPersonsSection
                fields={authorizedFields}
                append={appendAuthorized}
                remove={removeAuthorized}
              />
              <SponsorshipPreferencesSection />
              <SiblingsSection />
              <BusServiceSection />

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
                
                <div className="text-xs text-gray-500 text-center space-y-1">
                  {!isEditMode && enrollmentData?.activeCycle && (
                    <p>
                      El estudiante será inscrito en: <strong>{enrollmentData.activeCycle.name}</strong>
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

      {submitting && (
        <Loading
          overlay
          variant="spinner"
          size="xl"
          text={isEditMode ? "Actualizando estudiante..." : "Registrando estudiante..."}
        />
      )}



      
    </ProtectedContent>
  );
}