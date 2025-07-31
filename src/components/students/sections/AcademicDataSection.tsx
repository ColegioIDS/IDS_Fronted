import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GraduationCapIcon, SchoolIcon, BookOpenIcon } from 'lucide-react';
export function AcademicDataSection() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "academicRecords",
  });

  return (
    <>
      {/* Sección de Datos Académicos - Versión Mejorada */}
      <Separator className="my-8 dark:bg-gray-700/80" />
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <GraduationCapIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Datos Académicos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <FormField
            control={control}
            name="academicRecords.0.schoolName"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <SchoolIcon className="w-4 h-4 opacity-70" />
                  Nombre de la Escuela
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Colegio San Andrés"
                    {...field}
                    value={field.value || ''}
                    className="bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />



          <FormField
            control={control}
            name="academicRecords.0.gradeCompleted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grado Completado</FormLabel>
                <FormControl>
                  <Input placeholder="Grado Completado" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="academicRecords.0.gradePromotedTo"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <BookOpenIcon className="w-4 h-4 opacity-70" />
                  Grado Actual
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 4to de secundaria"
                    {...field}
                    value={field.value || ''}
                    className="bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
}