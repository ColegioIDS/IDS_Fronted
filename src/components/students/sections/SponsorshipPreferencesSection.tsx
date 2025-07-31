import { GiftIcon, PaletteIcon, GamepadIcon, PizzaIcon, CakeIcon, BookOpenIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const SponsorshipPreferencesSection = () => {
  return (
    <>
      <Separator className="my-8 dark:bg-gray-700/80" />
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <GiftIcon className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold tracking-tight">Preferencias para Patrocinios</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Información sobre gustos del estudiante (para posibles regalos o apoyos)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <FormField
            name="favoriteColor"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <PaletteIcon className="w-4 h-4 opacity-70" />
                  Color Favorito
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Azul" 
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
            name="hobby"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <GamepadIcon className="w-4 h-4 opacity-70" />
                  Pasatiempo Favorito
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Fútbol" 
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
            name="favoriteToy"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <GamepadIcon className="w-4 h-4 opacity-70" />
                  Juguete Favorito
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Lego" 
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
            name="favoriteFood"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <PizzaIcon className="w-4 h-4 opacity-70" />
                  Comida Favorita
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Pizza" 
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
            name="favoriteCake"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <CakeIcon className="w-4 h-4 opacity-70" />
                  Pastel Favorito
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Chocolate" 
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
            name="favoriteSubject"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <BookOpenIcon className="w-4 h-4 opacity-70" />
                  Materia Favorita
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Matemáticas" 
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
    </>
  );
};