import { FaRegTrashAlt } from "react-icons/fa";
import { User, Mail, Phone, Briefcase, Building, IdCard } from "lucide-react";
import { useFieldArray, useWatch } from "react-hook-form";
import { Separator } from '@/components/ui/separator';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

// ✅ NUEVO: Importar el context de estudiantes
import { useStudentForm } from '@/context/StudentContext';

import type { ParentDpiResponse } from "@/types/student"

// Definimos tipos para las relaciones
type RelationshipOption = {
  value: string;
  label: string;
};

// Tipo para los padres (ajusta según tu esquema real)
type ParentFormValues = {
  relationshipType: string;
  newParent: {
    givenNames: string;
    lastNames: string;
    dpi: string;
    birthDate: Date;
    gender: string;
    phone: string;
    email: string | null;
    details: {
      dpiIssuedAt: string;
      occupation: string;
      workplace: string;
      workPhone: string | null;
    };
  };
};

export const ParentsDataSection = ({ isEditMode = false }: { isEditMode?: boolean }) => {
  const { control, setValue } = useFormContext();
  const form = useFormContext();

  // ✅ NUEVO: Usar el context de estudiantes para búsqueda de DPI
  const {
    parentDpiInfo,
    loadingDpi,
    searchParentByDPI,
    clearParentDpiInfo
  } = useStudentForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parents',
  });

  const [usedRelationships, setUsedRelationships] = useState<string[]>([]);
  const [searchingDpiIndex, setSearchingDpiIndex] = useState<number | null>(null);
  const parents = useWatch({ control, name: 'parents' }) as ParentFormValues[];

  // Actualizar relaciones usadas cuando cambian los padres
  useEffect(() => {
    if (parents) {
      const relationships = parents.map((p: ParentFormValues) => p.relationshipType);
      setUsedRelationships(relationships);
    }
  }, [parents]);

  // Opciones de relación disponibles
  const allRelationshipOptions: RelationshipOption[] = [
    { value: "Padre", label: "Padre" },
    { value: "Madre", label: "Madre" },
    { value: "Tutor", label: "Tutor" },
    { value: "Otro", label: "Otro" },
  ];

  // Filtrar relaciones no utilizadas
  const availableRelationships = allRelationshipOptions.filter(
    (rel: RelationshipOption) => !usedRelationships.includes(rel.value)
  );

 const handleDpiChange = async (index: number, dpi: string) => {
  console.log("handleDpiChange llamado:", { index, dpi, length: dpi.length });
  
  if (dpi.length >= 13) { // DPI completo
    const currentDpi = form.getValues(`parents.${index}.newParent.dpi`);
    console.log("DPI actual vs nuevo:", { currentDpi, newDpi: dpi });

    // ✅ IMPORTANTE: Limpiar información previa antes de buscar
    clearParentDpiInfo();

    // Si estamos en modo edición y el DPI no cambió, no hacer nada
    if (isEditMode && dpi === currentDpi) {
      console.log("En modo edición y DPI no cambió, saliendo...");
      return;
    }

    try {
      console.log("Iniciando búsqueda de DPI para índice:", index);
      setSearchingDpiIndex(index);
      
      // ✅ Buscar padre por DPI usando el context
      const result = await searchParentByDPI(dpi);
      console.log("Resultado de búsqueda:", result);
      
    } catch (error) {
      console.error('Error al buscar padre por DPI:', error);
      // ✅ Limpiar estados en caso de error
      setSearchingDpiIndex(null);
    }
  }
};



useEffect(() => {
  if (parentDpiInfo && searchingDpiIndex !== null) {
    const { user, parentDetails } = parentDpiInfo.data || {};
    
    if (user) {
      console.log("Llenando campos para índice:", searchingDpiIndex);
      console.log("Datos del usuario:", user);
      console.log("Detalles del padre:", parentDetails);
      
      // ✅ IMPORTANTE: Usar los nombres correctos de los campos del API
      // firstName/lastName en lugar de givenNames/lastNames
      setValue(`parents.${searchingDpiIndex}.newParent.givenNames`, user.firstName || '');
      setValue(`parents.${searchingDpiIndex}.newParent.lastNames`, user.lastName || '');
      setValue(`parents.${searchingDpiIndex}.newParent.phone`, user.phone || '');
      setValue(`parents.${searchingDpiIndex}.newParent.email`, user.email || '');
      
      // ✅ Llenar datos adicionales del parentDetails si existen
      if (parentDetails) {
        setValue(`parents.${searchingDpiIndex}.newParent.details.dpiIssuedAt`, parentDetails.dpiIssuedAt || '');
        setValue(`parents.${searchingDpiIndex}.newParent.details.occupation`, parentDetails.occupation || '');
        setValue(`parents.${searchingDpiIndex}.newParent.details.workplace`, parentDetails.workplace || '');
        setValue(`parents.${searchingDpiIndex}.newParent.details.workPhone`, parentDetails.workPhone || '');
        
        // ✅ Si el parentDetails tiene email, usar ese en lugar del user.email
        if (parentDetails.email) {
          setValue(`parents.${searchingDpiIndex}.newParent.email`, parentDetails.email);
        }
      }
      
      // ✅ NUEVO: Verificar que los valores se están estableciendo
      setTimeout(() => {
        const currentValues = form.getValues(`parents.${searchingDpiIndex}`);
        console.log("Valores después del setValue:", currentValues);
      }, 100);
      
      // ✅ Limpiar después de procesar
      setTimeout(() => {
        clearParentDpiInfo();
        setSearchingDpiIndex(null);
      }, 1000);
    } else {
      console.log("No se encontró información del usuario");
    }
  }
}, [parentDpiInfo, searchingDpiIndex, form, setValue, clearParentDpiInfo]);


  return (
    <div className="space-y-6">
      <Separator className="my-6" />
      <div className="space-y-6">
        <div className="pb-1">
          <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
            <User className="h-6 w-6" />
            Datos de Padres o Encargados
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Información de los padres o tutores legales del estudiante
          </p>
        </div>

        {fields.map((field, index) => {
          const dpiValue = parents?.[index]?.newParent?.dpi || '';
          const isDisabled = !dpiValue;
          const isSearching = searchingDpiIndex === index && loadingDpi;

          return (
            <div key={field.id} className="relative p-6 border rounded-lg">
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
                aria-label="Eliminar padre/encargado"
              >
                <FaRegTrashAlt className="h-5 w-5" />
              </button>

              {/* Relación y DPI en la misma línea */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <FormField
                  control={control}
                  name={`parents.${index}.relationshipType`}
                  render={({ field }) => {
                    // Asegurarnos de que field.value tenga un valor válido
                    const value = field.value || '';

                    return (
                      <FormItem className="w-full max-w-full p-0">
                        <FormLabel className="text-base">Relación con el estudiante</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Actualizar relaciones usadas
                            const newRelationships = [...usedRelationships];
                            newRelationships[index] = value;
                            setUsedRelationships(newRelationships);
                          }}
                          value={value} // Usamos el valor sanitizado
                          disabled={isDisabled}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full hover:bg-background/70 transition-colors">
                              <SelectValue placeholder="Selecciona la relación">
                                {value ? allRelationshipOptions.find(r => r.value === value)?.label : "Selecciona la relación"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="w-full">
                            {availableRelationships.map((rel) => (
                              <SelectItem
                                key={rel.value}
                                value={rel.value}
                                disabled={usedRelationships.includes(rel.value) && rel.value !== value}
                                className="hover:bg-accent w-full"
                              >
                                {rel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={control}
                  name={`parents.${index}.newParent.dpi`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <IdCard className="h-4 w-4 opacity-70" />
                        DPI
                        {isSearching && (
                          <span className="ml-2 text-xs text-blue-600">Buscando...</span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234 56789 0101"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            field.onChange(e);
                            handleDpiChange(index, e.target.value);
                          }}
                          disabled={isSearching}
                          className="bg-background/50 hover:bg-background/70 transition-colors"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                      {/* ✅ NUEVO: Mostrar estado de búsqueda */}
                      {parentDpiInfo && searchingDpiIndex === index && (
                        <p className="text-xs text-green-600 mt-1">
                        ✓ Padre encontrado: {parentDpiInfo.data?.user?.firstName} {parentDpiInfo.data?.user?.lastName}

                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField
                  control={control}
                  name={`parents.${index}.newParent.givenNames`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <User className="h-4 w-4 opacity-70" />
                        Nombres
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan Carlos"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isDisabled || isSearching}
                          className="bg-background/50 hover:bg-background/70 transition-colors disabled:opacity-70"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`parents.${index}.newParent.lastNames`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <User className="h-4 w-4 opacity-70" />
                        Apellidos
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pérez García"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isDisabled || isSearching}
                          className="bg-background/50 hover:bg-background/70 transition-colors disabled:opacity-70"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Documentación y contacto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <FormField
                  control={control}
                  name={`parents.${index}.newParent.details.dpiIssuedAt`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extendido en</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Guatemala"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isDisabled || isSearching}
                          className="bg-background/50 hover:bg-background/70 transition-colors disabled:opacity-70"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`parents.${index}.newParent.phone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Phone className="h-4 w-4 opacity-70" />
                        Teléfono
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234 5678"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isDisabled || isSearching}
                          className="bg-background/50 hover:bg-background/70 transition-colors disabled:opacity-70"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Información laboral */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`parents.${index}.newParent.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Mail className="h-4 w-4 opacity-70" />
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="correo@ejemplo.com"
                          type="email"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isDisabled || isSearching}
                          className="bg-background/50 hover:bg-background/70 transition-colors disabled:opacity-70"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`parents.${index}.newParent.details.occupation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4 opacity-70" />
                        Profesión/Ocupación
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingeniero, Doctor, etc."
                          {...field}
                          value={field.value ?? ''}
                          disabled={isDisabled || isSearching}
                          className="bg-background/50 hover:bg-background/70 transition-colors disabled:opacity-70"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`parents.${index}.newParent.details.workplace`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Building className="h-4 w-4 opacity-70" />
                        Lugar de Trabajo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Empresa o Institución"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isDisabled || isSearching}
                          className="bg-background/50 hover:bg-background/70 transition-colors disabled:opacity-70"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          );
        })}

        <div className="flex justify-center">
          <Button
            type="button"
            onClick={() => {
              // Determinar la relación predeterminada (primera disponible)
              const defaultRelationship = availableRelationships.length > 0
                ? availableRelationships[0].value
                : 'Otro';

              append({
                relationshipType: defaultRelationship,
                newParent: {
                  givenNames: '',
                  lastNames: '',
                  dpi: '',
                  birthDate: new Date(),
                  gender: 'Masculino',
                  phone: '',
                  email: null,
                  details: {
                    dpiIssuedAt: '',
                    occupation: '',
                    workplace: '',
                    workPhone: null,
                  },
                },
              });
            }}
            variant="outline"
            className="gap-2"
            disabled={availableRelationships.length === 0}
          >
            <User className="h-4 w-4" />
            Agregar padre o encargado
          </Button>
        </div>

        {/* ✅ NUEVO: Información de ayuda */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Al ingresar un DPI completo (13 dígitos), el sistema buscará automáticamente 
            si el padre ya está registrado y completará sus datos.
          </p>
        </div>
      </div>
    </div>
  );
};