//src/components/features/students/sections/EmergencyInfoSection.tsx
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Phone } from "lucide-react";
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function EmergencyInfoSection() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  return (
    <>
      <Separator className="my-12 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Contactos de Emergencia
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Personas a contactar en caso de emergencia
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => append({ name: '', relationship: '', phone: '' })}
            className="shrink-0 bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Contacto
          </Button>
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <Phone className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No hay contactos de emergencia. Haz clic en "Agregar Contacto" para añadir uno.
              </p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-between">
                  <div className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-xs font-semibold text-orange-700 dark:text-orange-300">
                    Contacto #{index + 1}
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
                      name={`emergencyContacts.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Nombre
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Juan Pérez"
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
                      name={`emergencyContacts.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Relación
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Tío, Vecino, etc."
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
                      name={`emergencyContacts.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+502 1234 5678"
                              {...field}
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
