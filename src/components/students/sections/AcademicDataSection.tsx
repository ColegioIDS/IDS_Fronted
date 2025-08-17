//src\components\students\sections\AcademicDataSection.tsx
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
import { GraduationCapIcon, SchoolIcon, BookOpenIcon, CalendarIcon } from 'lucide-react';

export function AcademicDataSection() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "academicRecords",
  });

  const addAcademicRecord = () => {
    append({
      schoolName: "",
      gradeCompleted: "",
      gradePromotedTo: "",
      year: new Date().getFullYear(),
    });
  };

  return (
    <>
      <Separator className="my-8 dark:bg-gray-700/80" />
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Historial Académico</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAcademicRecord}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Registro
          </Button>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Nombre de la Escuela */}
              <FormField
                control={control}
                name={`academicRecords.${index}.schoolName`}
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

              {/* Grado Completado */}
              <FormField
                control={control}
                name={`academicRecords.${index}.gradeCompleted`}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <GraduationCapIcon className="w-4 h-4 opacity-70" />
                      Grado Completado
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 3ro Primaria"
                        {...field}
                        value={field.value || ''}
                        className="bg-white dark:bg-gray-800"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Grado Promovido */}
              <FormField
                control={control}
                name={`academicRecords.${index}.gradePromotedTo`}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <BookOpenIcon className="w-4 h-4 opacity-70" />
                      Promovido a
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 4to Primaria"
                        {...field}
                        value={field.value || ''}
                        className="bg-white dark:bg-gray-800"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Año y Botón Eliminar */}
              <div className="space-y-2">
                <FormField
                  control={control}
                  name={`academicRecords.${index}.year`}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <CalendarIcon className="w-4 h-4 opacity-70" />
                        Año
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2024"
                            {...field}
                            value={field.value || new Date().getFullYear()}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-white dark:bg-gray-800"
                          />
                        </FormControl>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            className="px-3"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BookOpenIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay registros académicos. Agregue al menos uno.</p>
            <Button
              type="button"
              variant="outline"
              onClick={addAcademicRecord}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Registro
            </Button>
          </div>
        )}
      </div>
    </>
  );
}