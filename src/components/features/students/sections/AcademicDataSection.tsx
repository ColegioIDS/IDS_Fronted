//src/components/features/students/sections/AcademicDataSection.tsx
import { Button } from "@/components/ui/button";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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
      <Separator className="my-12 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Historial Académico
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Registro de estudios previos del estudiante
              </p>
            </div>
          </div>
          <Button 
            type="button" 
            variant="default" 
            size="sm" 
            onClick={addAcademicRecord}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Registro
          </Button>
        </div>

        {/* Academic Records List */}
        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No hay registros académicos. Haz clic en "Agregar Registro" para añadir uno.
              </p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div 
                key={field.id} 
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                {/* Record Number Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-block px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    Registro #{index + 1}
                  </div>
                  {fields.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Record Fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={control}
                    name={`academicRecords.${index}.schoolName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Escuela/Colegio
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Colegio San Andrés" 
                            {...field} 
                            value={field.value || ''}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`academicRecords.${index}.gradeCompleted`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Grado Completado
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="3ro Primaria" 
                            {...field} 
                            value={field.value || ''}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`academicRecords.${index}.gradePromotedTo`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Promovido a
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="4to Primaria" 
                            {...field} 
                            value={field.value || ''}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`academicRecords.${index}.year`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Año
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={new Date().getFullYear().toString()}
                            {...field} 
                            value={field.value || ''}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
