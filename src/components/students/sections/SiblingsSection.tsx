import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { FaMale, FaFemale, FaUsers, FaRegTrashAlt } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const SiblingsSection = () => {
  const { control, setValue, getValues } = useFormContext();

  // Contadores de hermanos
  const brothersCount = useWatch({ control, name: "brothersCount" }) || 0;
  const sistersCount = useWatch({ control, name: "sistersCount" }) || 0;
  const totalSiblings = Number(brothersCount) + Number(sistersCount);

  // Estado para manejar los hermanos existentes
  const [siblings, setSiblings] = useState<any[]>(getValues("siblings") || []);


   useEffect(() => {
    setValue("siblingsCount", totalSiblings);
  }, [totalSiblings, setValue]);

  // Sincronizar la lista de hermanos con el total
  useEffect(() => {
    const currentSiblings = getValues("siblings") || [];

    if (totalSiblings > currentSiblings.length) {
      // Agregar nuevos hermanos
      const newSiblings = [...currentSiblings];
      while (newSiblings.length < totalSiblings) {
        newSiblings.push({ name: "", age: 0, gender: "" });
      }
      setValue("siblings", newSiblings);
      setSiblings(newSiblings);
    } else if (totalSiblings < currentSiblings.length) {
      // Eliminar hermanos extras
      const newSiblings = currentSiblings.slice(0, totalSiblings);
      setValue("siblings", newSiblings);
      setSiblings(newSiblings);
    }
  }, [totalSiblings, getValues, setValue]);

  const removeSibling = (index: number) => {
    const newSiblings = [...siblings];
    newSiblings.splice(index, 1);
    setValue("siblings", newSiblings);
    setSiblings(newSiblings);

    // Ajustar los contadores
    const gender = siblings[index].gender;
    if (gender === "Masculino") {
      setValue("brothersCount", Math.max(0, brothersCount - 1));
    } else if (gender === "Femenino") {
      setValue("sistersCount", Math.max(0, sistersCount - 1));
    }
  };

  return (
    <>
      <Separator className="my-8 dark:bg-gray-700/80" />
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <FaUsers className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Hermanos</h2>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <FormField
            control={control}
            name="brothersCount"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <FaMale className="w-4 h-4" />
                  Hermanos Varones
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Math.max(0, parseInt(e.target.value) || 0))}
                    className="bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="sistersCount"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <FaFemale className="w-4 h-4" />
                  Hermanas Mujeres
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Math.max(0, parseInt(e.target.value) || 0))}
                    className="bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormItem className="space-y-2">
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <FaUsers className="w-4 h-4" />
              Total de Hermanos
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                readOnly
                value={totalSiblings}
                className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                name="siblingsCount"
              />
            </FormControl>
          </FormItem>
        </div>

        {/* Lista detallada de hermanos - se genera automáticamente */}
        {totalSiblings > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles de Hermanos ({totalSiblings})</h3>

            {siblings.map((_, index) => (
              <div
                key={`sibling-${index}`}
                className="relative p-6 space-y-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <button
                  type="button"
                  onClick={() => removeSibling(index)}
                  className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-600 transition-colors"
                  aria-label="Eliminar hermano"
                >
                  <FaRegTrashAlt className="w-4 h-4" />
                </button>

                <h4 className="text-sm font-medium">Hermano/a {index + 1}</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name={`siblings.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre completo"
                            {...field}
                            className="bg-white dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`siblings.${index}.age`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">Edad</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Edad"
                            {...field}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-white dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`siblings.${index}.gender`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm font-medium">Género</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-gray-800">
                              <SelectValue placeholder="Selecciona género" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};