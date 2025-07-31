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
import { useStudent } from '@/hooks/useStudent';

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
  const { fetchParentByDpi } = useStudent();
  const form = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parents',
  });

  const [usedRelationships, setUsedRelationships] = useState<string[]>([]);
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

  // Función para verificar si un DPI existe (simulada)
  const checkDpiExists = async (dpi: string): Promise<boolean> => {
    // Integra aquí tu hook real para verificar el DPI
    console.log("Verificando DPI:", dpi);
    return false;
  };

  // Manejar cambio de DPI
  const handleDpiChange = async (index: number, dpi: string) => {
    if (dpi.length >= 13) {
      const currentDpi = form.getValues(`parents.${index}.newParent.dpi`);

      if (isEditMode && dpi === currentDpi) {
        return; // No hagas nada si es el mismo DPI en edición
      }

      const response = await fetchParentByDpi(dpi) as ParentDpiResponse;

      if (response?.user) {
        const { user, parentDetails, parentLinks } = response;
        console.log(parentLinks)

        const givenNames = form.getValues(`parents.${index}.newParent.givenNames`);
        if (!givenNames || !isEditMode) {
          setValue(`parents.${index}.newParent.givenNames`, user.firstName);
          setValue(`parents.${index}.newParent.lastNames`, user.lastName);
          setValue(`parents.${index}.newParent.phone`, user.phone ?? '');
          setValue(`parents.${index}.newParent.email`, user.email ?? '');
          setValue(`parents.${index}.newParent.details.dpiIssuedAt`, parentDetails?.dpiIssuedAt ?? '');
          setValue(`parents.${index}.newParent.details.occupation`, parentDetails?.occupation ?? '');
          setValue(`parents.${index}.newParent.details.workplace`, parentDetails?.workplace ?? '');
          setValue(`parents.${index}.newParent.details.workPhone`, parentDetails?.workPhone ?? '');
        }
      }
    }
  };


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
                          className="bg-background/50 hover:bg-background/70 transition-colors"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
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
                          disabled={isDisabled}
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
                          disabled={isDisabled}
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
                          disabled={isDisabled}
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
                          disabled={isDisabled}
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
                          disabled={isDisabled}
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
                          disabled={isDisabled}
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
                          disabled={isDisabled}
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
      </div>
    </div>
  );
};