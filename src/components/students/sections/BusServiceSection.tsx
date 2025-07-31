import { Separator } from "@/components/ui/separator";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { FaBus, FaUser, FaMapMarkerAlt, FaExclamationTriangle, FaPhone } from "react-icons/fa";

export const BusServiceSection = () => {
  const { control, watch } = useFormContext();
  const hasBusService = watch("busService.hasService");

  return (
    <>
      <Separator className="my-8 dark:bg-gray-700/80" />
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <FaBus className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Servicio de Bus</h2>
        </div>

        <FormField
          control={control}
          name="busService.hasService"
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
                <FormLabel className="font-medium">¿Utiliza el servicio de bus escolar?</FormLabel>
                <FormDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Marque si el estudiante utiliza el transporte escolar proporcionado por la institución
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {hasBusService && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <FormField
              control={control}
              name="busService.pickupPersonName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <FaUser className="w-4 h-4 opacity-70" />
                    Persona que recoge
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
              name="busService.dropoffPersonName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <FaUser className="w-4 h-4 opacity-70" />
                    Persona que deja
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Juan Pérez" 
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
              name="busService.homeAddress"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <FaMapMarkerAlt className="w-4 h-4 opacity-70" />
                    Dirección de recogida
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Calle Principal #123, Colonia Centro" 
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
              name="busService.referencePoints"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <FaMapMarkerAlt className="w-4 h-4 opacity-70" />
                    Puntos de referencia
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Frente al parque, junto a la farmacia" 
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
              name="busService.emergencyContact"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <FaExclamationTriangle className="w-4 h-4 opacity-70" />
                    Contacto de emergencia
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Ana Martínez - 5551234567" 
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
              name="busService.emergencyDeliveryPerson"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <FaUser className="w-4 h-4 opacity-70" />
                    Persona de entrega (emergencia)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: Roberto Sánchez - 5557654321" 
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
        )}
      </div>
    </>
  );
};