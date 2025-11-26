//src/components/features/students/sections/SiblingsSection.tsx
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { Users, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
      <Separator className="my-12 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
            <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hermanos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Información de los hermanos del estudiante
            </p>
          </div>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <FormField
            control={control}
            name="brothersCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
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
                    className="h-9 text-sm"
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
              <FormItem>
                <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
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
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Total de Hermanos
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                readOnly
                value={totalSiblings}
                className="h-9 text-sm bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </FormControl>
          </FormItem>
        </div>

        {/* Lista detallada de hermanos */}
        {totalSiblings > 0 && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300 ml-2">
                Completa los datos de los {totalSiblings} hermano{totalSiblings > 1 ? 's' : ''}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {siblings.map((_, index) => (
                <div
                  key={`sibling-${index}`}
                  className="relative p-4 space-y-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-semibold text-white bg-cyan-600 dark:bg-cyan-500 rounded-full">
                      {index + 1}
                    </span>
                    {totalSiblings > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSibling(index)}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={control}
                      name={`siblings.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Nombre Completo
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nombre"
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
                      name={`siblings.${index}.age`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Edad
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              value={field.value ?? 0}
                              onChange={(e) => field.onChange(Math.max(0, parseInt(e.target.value) || 0))}
                              className="h-9 text-sm"
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
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Género
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Selecciona" />
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
          </div>
        )}

        {totalSiblings === 0 && (
          <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              El estudiante no tiene hermanos registrados
            </p>
          </div>
        )}
      </div>
    </>
  );
};
