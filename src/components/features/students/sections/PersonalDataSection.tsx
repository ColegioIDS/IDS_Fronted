//src\components\features\students\sections\PersonalDataSection.tsx
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CiCalendarDate as CalendarIcon } from "react-icons/ci";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import ImageUpload from '@/components/form/UploadImage/image-upload-simple';
import { useEffect, useState, useMemo } from "react";
import { studentsService } from "@/services/students.service";
import { Combobox } from "@/components/ui/combobox";

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

interface PersonalDataSectionProps {
  isEditMode?: boolean;
}

export const PersonalDataSection = ({ isEditMode = false }: PersonalDataSectionProps) => {
  const { control, register, watch, setValue } = useFormContext();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const selectedDepartmentId = watch('address.department');

  // Cargar departamentos y municipios al montar
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoadingLocations(true);
        const data = await studentsService.getDepartmentsWithMunicipalities();
        setDepartments(data || []);
      } catch (error) {
        setDepartments([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    loadLocations();
  }, []);

  // Obtener municipios del departamento seleccionado
  const selectedDepartment = useMemo(() => {
    return departments.find(d => d.id.toString() === selectedDepartmentId?.toString());
  }, [selectedDepartmentId, departments]);

  const municipalities = selectedDepartment?.municipalities || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Datos Personales del Alumno
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Información básica e identificación del estudiante
          </p>
        </div>
      </div>

      {/* Sección 0: Código SIRE y CUI */}
      <div className="space-y-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          Identificación del Estudiante
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código SIRE */}
          <FormField
            control={control}
            name="codeSIRE"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Código SIRE
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese el código SIRE del estudiante"
                    {...field}
                    value={field.value || ""}
                    className="h-9 text-sm bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Código CUI */}
          <FormField
            control={control}
            name="cui"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  CUI <span className="text-gray-500 text-xs font-normal">(Opcional - letras y números)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: ABC123456 (mínimo 4 caracteres)"
                    {...field}
                    value={field.value || ""}
                    className="h-9 text-sm bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Foto de Perfil - OPCIONAL */}
      <FormField
        control={control}
        name="profileImage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Foto de Perfil
              <span className="text-xs text-gray-500 font-normal">(Opcional)</span>
            </FormLabel>
            <FormControl>
              <ImageUpload
                value={field.value ?? null}
                onChange={(file) => field.onChange(file)}
                onRemove={() => field.onChange(null)}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Sección 1: Información Personal Básica */}
      <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Información Personal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombres */}
          <FormField
            control={control}
            name="givenNames"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombres <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Juan Carlos" 
                    {...field} 
                    className="h-9 text-sm"
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
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Apellidos <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Pérez García" 
                    {...field} 
                    className="h-9 text-sm"
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
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="h-9 text-sm pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span className="text-gray-500">Selecciona una fecha</span>
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
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Género <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecciona un género" />
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

      {/* Sección 2: Lugar de Nacimiento y Nacionalidad */}
      <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <GlobeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Procedencia
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lugar de Nacimiento */}
          <FormField
            control={control}
            name="birthPlace"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lugar de Nacimiento
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="El Tejar, Chimaltenango"
                    {...field}
                    value={field.value || ""}
                    className="h-9 text-sm"
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
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nacionalidad
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Guatemalteco/a"
                    {...field}
                    value={field.value || ""}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Pueblo de Nacimiento */}
          <FormField
            control={control}
            name="birthTown"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pueblo de Nacimiento
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ciudad de Guatemala"
                    {...field}
                    value={field.value || ""}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Idioma Materno */}
          <FormField
            control={control}
            name="nativeLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Idioma Materno
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Español"
                    {...field}
                    value={field.value || ""}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Segundo Idioma */}
          <FormField
            control={control}
            name="secondLanguage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Segundo Idioma
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Inglés"
                    {...field}
                    value={field.value || ""}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Etnicidad */}
          <FormField
            control={control}
            name="ethnicity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Etnicidad
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ladino, Maya, Garifuna, etc."
                    {...field}
                    value={field.value || ""}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Sección 2.5: Servicios y Accesos */}
      <div className="space-y-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <GlobeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Servicios y Accesos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Acceso a Biblioteca */}
          <FormField
            control={control}
            name="hasLibrary"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-blue-900/10">
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  ¿Acceso a Biblioteca?
                </FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Servicio de Almuerzos */}
          <FormField
            control={control}
            name="hasLunches"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-blue-900/10">
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  ¿Servicio de Almuerzos?
                </FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Sección 3: Dirección de Residencia */}
      <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <HomeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Dirección de Residencia
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Calle y Número */}
          <FormField
            control={control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Calle y Número
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Av. Siempre Viva 123"
                    {...field}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Zona */}
          <FormField
            control={control}
            name="address.zone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Zona
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Zona 15"
                    {...field}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Departamento - PRIMERO */}
          <FormField
            control={control}
            name="address.department"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Departamento <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Combobox
                    options={departments.map((dept) => ({
                      label: dept.name,
                      value: dept.id.toString(),
                    }))}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset municipio cuando cambia departamento
                      setValue('address.municipality', '');
                    }}
                    placeholder={loadingLocations ? 'Cargando...' : 'Selecciona un departamento'}
                    searchPlaceholder="Buscar departamento..."
                    emptyText="No hay departamentos"
                    disabled={loadingLocations}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Municipio - SEGUNDO */}
          <FormField
            control={control}
            name="address.municipality"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Municipio <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Combobox
                    options={municipalities.map((mun: any) => ({
                      label: mun.name,
                      value: mun.id.toString(),
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={
                      !selectedDepartmentId 
                        ? 'Selecciona un departamento primero' 
                        : municipalities.length === 0 
                          ? 'No hay municipios' 
                          : 'Selecciona un municipio'
                    }
                    searchPlaceholder="Buscar municipio..."
                    emptyText="Sin municipios"
                    disabled={!selectedDepartmentId || municipalities.length === 0}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Sección 4: Información Familiar */}
      <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Información Familiar
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ¿Con quién vive? */}
          <FormField
            control={control}
            name="livesWithText"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ¿Con quién vive?
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Madre, padre, abuelos, etc."
                    {...field}
                    value={field.value || ""}
                    className="h-9 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* ¿Quién sostendrá los estudios? */}
          <FormField
            control={control}
            name="financialResponsibleText"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Responsable Financiero
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre del responsable"
                    {...field}
                    value={field.value || ""}
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
  );
};
