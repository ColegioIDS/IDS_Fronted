//src/components/features/students/sections/BusServiceSection.tsx
import { useFormContext } from 'react-hook-form';
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Bus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const BusServiceSection = () => {
  const { control, watch } = useFormContext();
  const hasService = watch("busService.hasService");

  return (
    <>
      <Separator className="my-12 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Bus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Servicio de Transporte
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Información del servicio de bus escolar
            </p>
          </div>
        </div>

        {/* Has Service Checkbox */}
        <FormField
          control={control}
          name="busService.hasService"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="flex-1 space-y-1">
                <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                  ¿Utiliza servicio de bus?
                </FormLabel>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Marque si el estudiante utiliza transporte escolar
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Service Details */}
        {hasService && (
          <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            {/* Info Alert */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300 ml-2">
                Completa los datos del servicio de transporte del estudiante
              </AlertDescription>
            </Alert>

            {/* Pickup and Dropoff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="busService.pickupPersonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Persona para Recogida
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre de quien recoge"
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
                name="busService.dropoffPersonName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Persona para Entrega
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre de quien entrega"
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
                name="busService.homeAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Domicilio
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Calle, zona, número"
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
                name="busService.referencePoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Puntos de Referencia
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cerca de..."
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
                name="busService.emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Contacto de Emergencia
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre y teléfono"
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
                name="busService.emergencyDeliveryPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Persona de Entrega en Emergencia
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre"
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
                name="busService.route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Ruta
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Ruta A, Ruta B"
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
                name="busService.monthlyFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Tarifa Mensual ($)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(Number(e.target.value) || null)}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Rules Agreement */}
            <FormField
              control={control}
              name="busService.acceptedRules"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1">
                    <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                      Acepta el reglamento de transporte
                    </FormLabel>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      El padre/encargado declara que acepta y cumplirá el reglamento de transporte escolar
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </>
  );
};
