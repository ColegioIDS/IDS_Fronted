import { useFormContext } from 'react-hook-form';
import { Separator } from "@/components/ui/separator";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PillIcon, BrainIcon, StarIcon, TargetIcon } from "lucide-react";
import { CiMedicalCase as MedicalIcon } from "react-icons/ci";
import { FaAllergies as AllergyIcon } from "react-icons/fa";

export const MedicalInfoSection = () => {
  const { control, watch } = useFormContext();

  return (
    <>
      <Separator className="my-8 dark:bg-gray-700/80" />
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <MedicalIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Información Médica</h2>
        </div>

        <div className="space-y-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Enfermedades */}
          <FormField
            control={control}
            name="medicalInfo.hasDisease"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white dark:bg-gray-800">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    className="border-gray-300 data-[state=checked]:border-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2 font-medium">
                    <MedicalIcon className="w-4 h-4" />
                    ¿Tiene alguna enfermedad?
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Marque si el estudiante padece alguna enfermedad crónica o condición médica
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {watch("medicalInfo.hasDisease") && (
            <div className="animate-fade-in">
              <FormField
                control={control}
                name="medicalInfo.diseaseDetails"
                render={({ field }) => (
                  <FormItem className="ml-8">
                    <FormLabel className="text-sm font-medium">Detalles de la enfermedad</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Asma bronquial, requiere inhalador en caso de crisis"
                        className="resize-none bg-white dark:bg-gray-800"
                        {...field}
                        value={field.value || ""}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Alergias */}
          <FormField
            control={control}
            name="medicalInfo.hasAllergies"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white dark:bg-gray-800">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    className="border-gray-300 data-[state=checked]:border-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2 font-medium">
                    <AllergyIcon className="w-4 h-4" />
                    ¿Tiene alergias?
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Marque si el estudiante tiene alergias conocidas (alimentos, medicamentos, etc.)
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {watch("medicalInfo.hasAllergies") && (
            <div className="animate-fade-in">
              <FormField
                control={control}
                name="medicalInfo.allergiesDetails"
                render={({ field }) => (
                  <FormItem className="ml-8">
                    <FormLabel className="text-sm font-medium">Detalles de alergias</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Alergia a la penicilina, produce urticaria"
                        className="resize-none bg-white dark:bg-gray-800"
                        {...field}
                        value={field.value || ""}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Medicación */}
          <FormField
            control={control}
            name="medicalInfo.takesMedication"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white dark:bg-gray-800">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    className="border-gray-300 data-[state=checked]:border-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2 font-medium">
                    <PillIcon className="w-4 h-4" />
                    ¿Autoriza medicación en emergencias?
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Marque si se autoriza administrar algún medicamento en caso de emergencia
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {watch("medicalInfo.takesMedication") && (
            <div className="animate-fade-in">
              <FormField
                control={control}
                name="medicalInfo.medicationDetails"
                render={({ field }) => (
                  <FormItem className="ml-8">
                    <FormLabel className="text-sm font-medium">Detalles de la medicación</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Paracetamol 500mg cada 8 horas si presenta fiebre"
                        className="resize-none bg-white dark:bg-gray-800"
                        {...field}
                        value={field.value || ""}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Discapacidad de aprendizaje */}
          <FormField
            control={control}
            name="medicalInfo.hasLearningDisability"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white dark:bg-gray-800">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    className="border-gray-300 data-[state=checked]:border-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2 font-medium">
                    <BrainIcon className="w-4 h-4" />
                    ¿Tiene discapacidad de aprendizaje?
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Marque si el estudiante tiene alguna discapacidad de aprendizaje diagnosticada
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {watch("medicalInfo.hasLearningDisability") && (
            <div className="animate-fade-in">
              <FormField
                control={control}
                name="medicalInfo.disabilityDetails"
                render={({ field }) => (
                  <FormItem className="ml-8">
                    <FormLabel className="text-sm font-medium">Diagnóstico</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Diagnóstico de TDAH desde 2022, requiere apoyo en concentración"
                        className="resize-none bg-white dark:bg-gray-800"
                        {...field}
                        value={field.value || ""}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Fortalezas y áreas a mejorar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <FormField
              control={control}
              name="medicalInfo.strengths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <StarIcon className="w-4 h-4" />
                    Fortalezas del estudiante
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Excelente capacidad de análisis, creativo en soluciones"
                      className="resize-none bg-white dark:bg-gray-800"
                      {...field}
                      value={field.value || ''}
                      rows={3}
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
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <TargetIcon className="w-4 h-4" />
                    Áreas a mejorar
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Necesita mejorar en organización del tiempo"
                      className="resize-none bg-white dark:bg-gray-800"
                      {...field}
                      value={field.value || ''}
                      rows={3}
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