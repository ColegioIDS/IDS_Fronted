//src/components/features/students/sections/ParentsDataSection.tsx
import { User, Mail, Phone, Briefcase, Building, IdCard, Plus, Trash2, AlertCircle, CheckCircle, Users, Check } from "lucide-react";
import { useFieldArray, useWatch, useFormContext } from "react-hook-form";
import { Separator } from '@/components/ui/separator';
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { studentsService } from '@/services/students.service';

type RelationshipOption = {
  value: string;
  label: string;
};

type DpiValidationState = {
  isLoading: boolean;
  isValid: boolean;
  error: string | null;
};

export const ParentsDataSection = ({ isEditMode = false }: { isEditMode?: boolean }) => {
  const { control, setValue, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parents',
  });

  const [dpiValidation, setDpiValidation] = useState<Record<number, DpiValidationState>>({});
  const [usedRelationships, setUsedRelationships] = useState<string[]>([]);
  const parents = useWatch({ control, name: 'parents' });

  useEffect(() => {
    if (parents) {
      const relationships = parents.map((p: any) => p.relationshipType);
      setUsedRelationships(relationships);
    }
  }, [parents]);

  const allRelationshipOptions: RelationshipOption[] = [
    { value: "Padre", label: "Padre" },
    { value: "Madre", label: "Madre" },
    { value: "Tutor", label: "Tutor" },
    { value: "Abuelo", label: "Abuelo" },
    { value: "Tío", label: "Tío" },
    { value: "Otro", label: "Otro" },
  ];

  const availableRelationships = allRelationshipOptions.filter(
    (rel) => !usedRelationships.includes(rel.value)
  );

  const handleDpiChange = async (index: number, dpi: string) => {
    if (dpi.length !== 13) {
      setDpiValidation(prev => ({
        ...prev,
        [index]: { isLoading: false, isValid: false, error: null }
      }));
      return;
    }

    try {
      setDpiValidation(prev => ({
        ...prev,
        [index]: { isLoading: true, isValid: false, error: null }
      }));

      const result = await studentsService.validateParentDPI(dpi);
      
      // El servicio retorna response.data.data que tiene userInfo
      if (result.userInfo) {
        const user = result.userInfo;
        
        // Auto-fill campos con datos del usuario registrado
        setValue(`parents.${index}.newParent.givenNames`, user.givenNames || '');
        setValue(`parents.${index}.newParent.lastNames`, user.lastNames || '');
        setValue(`parents.${index}.newParent.phone`, user.phone || '');
        setValue(`parents.${index}.newParent.email`, user.email || '');
        
        // Auto-fill detalles laborales si existen
        if (user.parentDetails) {
          setValue(`parents.${index}.newParent.details.occupation`, user.parentDetails.occupation || '');
          setValue(`parents.${index}.newParent.details.workplace`, user.parentDetails.workplace || '');
          setValue(`parents.${index}.newParent.details.workPhone`, user.parentDetails.workPhone || '');
          setValue(`parents.${index}.newParent.details.dpiIssuedAt`, user.parentDetails.dpiIssuedAt || '');
        }

        setDpiValidation(prev => ({
          ...prev,
          [index]: { isLoading: false, isValid: true, error: null }
        }));
      } else {
        setDpiValidation(prev => ({
          ...prev,
          [index]: { isLoading: false, isValid: false, error: 'DPI no encontrado en el sistema' }
        }));
      }
    } catch (err: any) {
      setDpiValidation(prev => ({
        ...prev,
        [index]: { isLoading: false, isValid: false, error: err.message || 'Error al validar DPI' }
      }));
    }
  };

  return (
    <>
      <Separator className="my-12 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Datos de Padres o Encargados
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Información de los padres o tutores legales del estudiante
              </p>
            </div>
          </div>
          {availableRelationships.length > 0 && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                append({
                  relationshipType: availableRelationships[0].value,
                  newParent: {
                    givenNames: '',
                    lastNames: '',
                    dpi: '',
                    phone: '',
                    email: null,
                    birthDate: undefined,
                    gender: undefined,
                    details: {
                      dpiIssuedAt: '',
                      occupation: '',
                      workplace: '',
                      email: undefined,
                      workPhone: undefined,
                    },
                  },
                  isPrimaryContact: fields.length === 0,
                  hasLegalCustody: fields.length === 0,
                  financialResponsible: false,
                  livesWithStudent: true,
                  emergencyContactPriority: fields.length + 1,
                });
              }}
              className="shrink-0 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Padre
            </Button>
          )}
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300 ml-2">
            Ingresa el DPI para cargar automáticamente los datos del padre/encargado registrado en el sistema
          </AlertDescription>
        </Alert>

        {/* Parents List */}
        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="p-6 text-center rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No hay padres/encargados registrados. Haz clic en "Agregar Padre" para añadir uno.
              </p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Padre/Encargado #{index + 1}
                    </div>
                    <FormField
                      control={control}
                      name={`parents.${index}.relationshipType`}
                      render={({ field }) => (
                        <FormItem className="flex-1 m-0">
                          <Select value={field.value} onValueChange={(value) => {
                            // Solo permitir cambiar si la nueva relación no está duplicada
                            const otherRelationships = parents
                              .filter((_: any, i: number) => i !== index)
                              .map((p: any) => p.relationshipType);
                            
                            if (!otherRelationships.includes(value)) {
                              field.onChange(value);
                            }
                          }}>
                            <FormControl>
                              <SelectTrigger className="w-40 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allRelationshipOptions.map((rel) => {
                                // Mostrar solo si no está usado por otro padre (o si es el actual)
                                const isUsedByOther = usedRelationships.filter((_: any, idx: number) => idx !== index).includes(rel.value);
                                
                                return (
                                  <SelectItem 
                                    key={rel.value} 
                                    value={rel.value}
                                    disabled={isUsedByOther && field.value !== rel.value}
                                  >
                                    {rel.label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-4">
                  {/* DPI con validación */}
                  <FormField
                    control={control}
                    name={`parents.${index}.newParent.dpi`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          DPI
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              placeholder="13 dígitos"
                              maxLength={13}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleDpiChange(index, e.target.value);
                              }}
                              disabled={dpiValidation[index]?.isLoading}
                              className="h-9 text-sm pr-10"
                            />
                          </FormControl>
                          {dpiValidation[index]?.isValid && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                          )}
                          {dpiValidation[index]?.error && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                          )}
                        </div>
                        {dpiValidation[index]?.error && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {dpiValidation[index].error}
                          </p>
                        )}
                        {dpiValidation[index]?.isValid && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Datos cargados correctamente
                          </p>
                        )}
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Nombres y Apellidos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`parents.${index}.newParent.givenNames`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Nombres
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Juan" 
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
                      name={`parents.${index}.newParent.lastNames`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Apellidos
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Pérez García" 
                              {...field} 
                              value={field.value || ''}
                              className="h-9 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Teléfono y Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`parents.${index}.newParent.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+502 1234 5678" 
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
                      name={`parents.${index}.newParent.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="correo@ejemplo.com" 
                              {...field} 
                              value={field.value || ''}
                              className="h-9 text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Lugar de emisión DPI */}
                  <FormField
                    control={control}
                    name={`parents.${index}.newParent.details.dpiIssuedAt`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          Lugar de Emisión del DPI
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Guatemala, Huehuetenango, etc." 
                            {...field} 
                            value={field.value || ''}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Ocupación y Lugar de trabajo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name={`parents.${index}.newParent.details.occupation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Ocupación
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ingeniero, Vendedor, etc." 
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
                      name={`parents.${index}.newParent.details.workplace`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Lugar de Trabajo
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nombre de la empresa" 
                              {...field} 
                              value={field.value || ''}
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
            ))
          )}
        </div>
      </div>
    </>
  );
};
