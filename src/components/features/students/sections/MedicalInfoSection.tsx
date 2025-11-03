//src/components/features/students/sections/MedicalInfoSection.tsx
import { useFormContext } from 'react-hook-form';
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Shield, Activity } from "lucide-react";
import { CiMedicalCase as MedicalIcon } from "react-icons/ci";

export const MedicalInfoSection = () => {
  const { control, watch } = useFormContext();

  return (
    <>
      <Separator className="my-12 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30">
            <MedicalIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Información Médica
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Datos de salud y necesidades especiales del estudiante
            </p>
          </div>
        </div>

        {/* Sección 1: Condiciones Médicas */}
        <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            Condiciones Médicas
          </h3>

          <div className="space-y-4">
            {/* Enfermedades */}
            <FormField
              control={control}
              name="medicalInfo.hasDisease"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800/50">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1">
                    <FormLabel className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer">
                      ¿Tiene alguna enfermedad crónica?
                    </FormLabel>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Marque si el estudiante padece alguna enfermedad crónica o de larga duración
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {watch("medicalInfo.hasDisease") && (
              <FormField
                control={control}
                name="medicalInfo.diseaseDetails"
                render={({ field }) => (
                  <FormItem className="ml-6 border-l-2 border-red-300 dark:border-red-800 pl-4">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Detalles de la enfermedad
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe la enfermedad, síntomas o cuidados especiales..." 
                        {...field} 
                        value={field.value || ""} 
                        rows={3}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            {/* Alergias */}
            <FormField
              control={control}
              name="medicalInfo.hasAllergies"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800/50">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1">
                    <FormLabel className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer">
                      ¿Tiene alergias?
                    </FormLabel>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Marque si el estudiante tiene alergias alimentarias, medicamentosas o de otro tipo
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {watch("medicalInfo.hasAllergies") && (
              <FormField
                control={control}
                name="medicalInfo.allergiesDetails"
                render={({ field }) => (
                  <FormItem className="ml-6 border-l-2 border-orange-300 dark:border-orange-800 pl-4">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Detalles de las alergias
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Especifica el tipo de alergia (comida, medicinas, etc.)..." 
                        {...field} 
                        value={field.value || ""} 
                        rows={3}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            {/* Medicamentos */}
            <FormField
              control={control}
              name="medicalInfo.takesMedication"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800/50">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1">
                    <FormLabel className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer">
                      ¿Toma medicamentos regularmente?
                    </FormLabel>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Marque si el estudiante consume medicamentos de forma regular
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {watch("medicalInfo.takesMedication") && (
              <FormField
                control={control}
                name="medicalInfo.medicationDetails"
                render={({ field }) => (
                  <FormItem className="ml-6 border-l-2 border-purple-300 dark:border-purple-800 pl-4">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Detalles de los medicamentos
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Especifica qué medicamentos toma, dosis y horarios..." 
                        {...field} 
                        value={field.value || ""} 
                        rows={3}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            {/* Autorización de Medicación en Emergencias */}
            <FormField
              control={control}
              name="medicalInfo.emergencyMedicationAllowed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-green-200 dark:border-green-800 p-3 bg-green-50 dark:bg-green-900/10">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1">
                    <FormLabel className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer">
                      ¿Autoriza medicación en emergencias?
                    </FormLabel>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Autoriza al colegio a administrar medicamentos de emergencia si es necesario
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {watch("medicalInfo.emergencyMedicationAllowed") && (
              <FormField
                control={control}
                name="medicalInfo.emergencyMedicationDetails"
                render={({ field }) => (
                  <FormItem className="ml-6 border-l-2 border-green-300 dark:border-green-800 pl-4">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Medicamentos permitidos en emergencias
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Especifica qué medicamentos autoriza en caso de emergencia..." 
                        {...field} 
                        value={field.value || ""} 
                        rows={3}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            {/* Discapacidades */}
            <FormField
              control={control}
              name="medicalInfo.hasLearningDisability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800/50">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1">
                    <FormLabel className="font-medium text-sm text-gray-900 dark:text-white cursor-pointer">
                      ¿Tiene discapacidades o necesidades especiales?
                    </FormLabel>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Marque si el estudiante requiere apoyos especiales o adaptaciones
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {watch("medicalInfo.hasLearningDisability") && (
              <FormField
                control={control}
                name="medicalInfo.disabilityDetails"
                render={({ field }) => (
                  <FormItem className="ml-6 border-l-2 border-blue-300 dark:border-blue-800 pl-4">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Detalles de la discapacidad o necesidad especial
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe el tipo de discapacidad y adaptaciones necesarias..." 
                        {...field} 
                        value={field.value || ""} 
                        rows={3}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Sección 2: Fortalezas y Áreas de Mejora */}
        <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
            Desarrollo y Desempeño
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="medicalInfo.strengths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fortalezas
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe las fortalezas del estudiante..." 
                      {...field} 
                      value={field.value || ""} 
                      rows={3}
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="medicalInfo.areasToImprove"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Áreas de Mejora
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Áreas en las que el estudiante necesita mejorar..." 
                      {...field} 
                      value={field.value || ""} 
                      rows={3}
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
};
