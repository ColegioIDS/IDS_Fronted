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
    isSubmitting
  } = useStudent(isEditMode);

  const { fields: authorizedFields, append: appendAuthorized, remove: removeAuthorized } = useFieldArray({
    control: form.control,
    name: "authorizedPersons",
  });


  return (

    <>
      <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FaUserEdit />
            {isEditMode ? 'Editar Usuario' : 'Registro de Estudiante'}
          </CardTitle>
        </CardHeader>


        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">

              <PersonalDataSection />
              <ParentsDataSection />
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


              <Button type="submit" className="w-full">
                {isEditMode ? 'Actualizar Estudiante' : 'Registrar Estudiante'}
              </Button>
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
