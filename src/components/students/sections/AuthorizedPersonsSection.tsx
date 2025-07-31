import { useFormContext } from 'react-hook-form';
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FaRegTrashAlt, FaPlus, FaUser, FaUserTag, FaPhone } from 'react-icons/fa';

interface AuthorizedPersonsSectionProps {
  fields: any[];
  append: (data: any) => void;
  remove: (index: number) => void;
}

export const AuthorizedPersonsSection = ({ fields, append, remove }: AuthorizedPersonsSectionProps) => {
  const { control } = useFormContext();

  return (
    <>
      <Separator className="my-8 dark:bg-gray-700/80" />
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <FaUser className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Personas Autorizadas</h2>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div 
              key={field.id} 
              className="relative p-6 space-y-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-600 transition-colors"
                aria-label="Eliminar contacto"
              >
                <FaRegTrashAlt className="w-4 h-4" />
              </button>

              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </span>
                Contacto autorizado #{index + 1}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`authorizedPersons.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <FaUser className="w-3 h-3 opacity-70" />
                        Nombre completo
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: María González" 
                          {...field} 
                          value={field.value ?? ''}
                          className="bg-white dark:bg-gray-800"
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
                    <FormItem className="space-y-1">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <FaUserTag className="w-3 h-3 opacity-70" />
                        Relación
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Madre/Tío/Abuelo" 
                          {...field} 
                          value={field.value ?? ''}
                          className="bg-white dark:bg-gray-800"
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
                    <FormItem className="space-y-1">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <FaPhone className="w-3 h-3 opacity-70" />
                        Teléfono
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: 5551234567" 
                          {...field} 
                          value={field.value ?? ''}
                          className="bg-white dark:bg-gray-800"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ name: "", relationship: "", phone: "" })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/90 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Agregar otra persona autorizada
          </button>
        </div>
      </div>
    </>
  );
};