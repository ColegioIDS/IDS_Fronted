//src/components/features/students/sections/SponsorshipPreferencesSection.tsx
import { Gift, Palette, Gamepad2, Pizza, Cake, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const SponsorshipPreferencesSection = () => {
  const { control } = useFormContext();

  const preferences = [
    { name: "favoriteColor", label: "Color Favorito", icon: Palette, placeholder: "Ej: Azul" },
    { name: "hobby", label: "Pasatiempo Favorito", icon: Gamepad2, placeholder: "Ej: Fútbol" },
    { name: "favoriteToy", label: "Juguete Favorito", icon: Gamepad2, placeholder: "Ej: Lego" },
    { name: "favoriteFood", label: "Comida Favorita", icon: Pizza, placeholder: "Ej: Pizza" },
    { name: "favoriteCake", label: "Pastel Favorito", icon: Cake, placeholder: "Ej: Chocolate" },
    { name: "favoriteSubject", label: "Materia Favorita", icon: BookOpen, placeholder: "Ej: Matemáticas" },
  ];

  return (
    <>
      <Separator className="my-12 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Gift className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Preferencias para Patrocinios
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Gustos del estudiante para posibles regalos o apoyos
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-300 ml-2">
            Esta información es útil para patrocinadores que deseen hacer regalos apropiados al estudiante
          </AlertDescription>
        </Alert>

        {/* Preferences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preferences.map((pref) => {
            const IconComponent = pref.icon;
            return (
              <FormField
                key={pref.name}
                control={control}
                name={pref.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <IconComponent className="w-4 h-4 opacity-70" />
                      {pref.label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={pref.placeholder}
                        {...field}
                        value={field.value ?? ""}
                        className="h-9 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};
