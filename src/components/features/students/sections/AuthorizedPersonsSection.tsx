//src/components/features/students/sections/AuthorizedPersonsSection.tsx
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function AuthorizedPersonsSection() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "authorizedPersons",
  });

  return (
    <>
      <Separator className="my-12 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Personas Autorizadas
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Personas autorizadas para recoger al estudiante
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => append({ name: '', relationship: '', phone: undefined })}
            className="shrink-0 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Persona
          </Button>
        </div>

        {/* Persons List */}
        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No hay personas autorizadas. Haz clic en "Agregar Persona" para añadir una.
              </p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-green-300 dark:hover:border-green-700 transition-colors"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-between">
                  <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-xs font-semibold text-green-700 dark:text-green-300">
                    Persona Autorizada #{index + 1}
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

                {/* Card Body */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={control}
                      name={`authorizedPersons.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Nombre Completo
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombre completo"
                              {...field}
                              className="h-9 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`authorizedPersons.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Relación
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Vecino, Amigo, etc."
                              {...field}
                              className="h-9 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name={`authorizedPersons.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+502 1234 5678"
                              {...field}
                              value={field.value || ''}
                              className="h-9 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
