//src\components\students\sections\PersonalDataSection.tsx.tsx
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CiCalendarDate as CalendarIcon } from "react-icons/ci";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import ImageUpload from '@/components/form/UploadImage/image-upload';


import { 
  UserCircle as UserCircleIcon,
  User as UserIcon,
  CalendarDays as CalendarDaysIcon,
  VenetianMask as VenetianMaskIcon,
  MapPin as MapPinIcon,
  Globe as GlobeIcon,
  Home as HomeIcon,
  Wallet as WalletIcon,
  Users as UsersIcon
} from "lucide-react";

export const PersonalDataSection = () => {
  const { control, register, watch, setValue } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <UserCircleIcon className="h-6 w-6" />
          Datos Personales del Alumno
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Información básica e identificación del estudiante
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">



      <FormField
                control={control}
                name="profileImage"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Foto de Perfil</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? null}
                        onChange={(file) => field.onChange(file)}
                        onRemove={() => field.onChange(null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


        {/* Nombre */}
        <FormField
          control={control}
          name="givenNames"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <UserIcon className="h-4 w-4 opacity-70" />
                Nombres
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Juan Carlos" 
                  {...field} 
                  className="bg-background/50 hover:bg-background/70 transition-colors"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Apellidos */}
        <FormField
          control={control}
          name="lastNames"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <UserIcon className="h-4 w-4 opacity-70" />
                Apellidos
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Pérez García" 
                  {...field} 
                  className="bg-background/50 hover:bg-background/70 transition-colors"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Fecha de Nacimiento */}
        <FormField
          control={control}
          name="birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4 opacity-70" />
                Fecha de Nacimiento
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className="pl-3 text-left font-normal hover:bg-background/70 transition-colors"
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    locale={es}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Género */}
        <FormField
          control={control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <VenetianMaskIcon className="h-4 w-4 opacity-70" />
                Género
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="hover:bg-background/70 transition-colors">
                    <SelectValue placeholder="Selecciona un género" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Masculino" className="hover:bg-accent">
                    Masculino
                  </SelectItem>
                  <SelectItem value="Femenino" className="hover:bg-accent">
                    Femenino
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Lugar de Nacimiento */}
        <FormField
          control={control}
          name="birthPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4 opacity-70" />
                Lugar de Nacimiento
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="El Tejar, Chimaltenango"
                  {...field}
                  value={field.value || ""}
                  className="bg-background/50 hover:bg-background/70 transition-colors"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Nacionalidad */}
        <FormField
          control={control}
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <GlobeIcon className="h-4 w-4 opacity-70" />
                Nacionalidad
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Guatemalteco/a"
                  {...field}
                  value={field.value || ""}
                  className="bg-background/50 hover:bg-background/70 transition-colors"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Dirección - Grupo */}
        <div className="md:col-span-2 space-y-4  rounded-lg ">
          <h3 className="font-medium flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-primary" />
            Dirección de Residencia
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calle y Número</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Av. Siempre Viva 123"
                      {...field}
                      className="bg-background/50 hover:bg-background/70 transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address.zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Zona 15"
                      {...field}
                      className="bg-background/50 hover:bg-background/70 transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address.municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Municipio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Villa Nueva"
                      {...field}
                      className="bg-background/50 hover:bg-background/70 transition-colors"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address.department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="hover:bg-background/70 transition-colors">
                        <SelectValue placeholder="Selecciona un departamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Guatemala" className="hover:bg-accent">
                        Guatemala
                      </SelectItem>
                      <SelectItem value="Chimaltenango" className="hover:bg-accent">
                        Chimaltenango
                      </SelectItem>
                      {/* Agrega más departamentos según necesites */}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Información adicional */}
        <FormField
          control={control}
          name="financialResponsibleText"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <WalletIcon className="h-4 w-4 opacity-70" />
                ¿Quién sostendrá los estudios?
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre del responsable"
                  {...field}
                  value={field.value || ""}
                  className="bg-background/50 hover:bg-background/70 transition-colors"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="livesWithText"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4 opacity-70" />
                ¿Con quién vive?
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Con madre, padre, abuelos, etc."
                  {...field}
                  value={field.value || ""}
                  className="bg-background/50 hover:bg-background/70 transition-colors"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};