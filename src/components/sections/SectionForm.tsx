// src/components/sections/SectionForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sectionSchema, SectionFormValues, defaultValues as defaultSectionValues } from '@/schemas/section';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { FaRegSave } from 'react-icons/fa';
import { AiOutlineClear } from 'react-icons/ai';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGradeContext } from '@/context/GradeContext';
import { useTeachers } from '@/hooks/useTeachers';

interface SectionFormProps {
  onSubmit: (values: SectionFormValues) => void;
  isLoading?: boolean;
  serverError?: {
    message: string;
    details: string[];
  } | null;
  editMode?: boolean;
  currentSection?: SectionFormValues;
  onCancel?: () => void; // Nueva prop para manejar cancelación
}

export function SectionForm({
  onSubmit,
  isLoading = false,
  serverError = null,
  editMode = false,
  currentSection,
  onCancel,
}: SectionFormProps) {
  const { grades, isLoadingGrades: isLoadingGrades } = useGradeContext();
  const { teachers, isLoading: isLoadingTeachers } = useTeachers();
  const [isInitialized, setIsInitialized] = useState(false);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: defaultSectionValues,
  });

  // Efecto para manejar la inicialización
  useEffect(() => {
    if (!isInitialized && !isLoadingGrades && !isLoadingTeachers) {
      const values = currentSection || defaultSectionValues;
      form.reset(values);
      setIsInitialized(true);
    }
  }, [currentSection, form, isLoadingGrades, isLoadingTeachers, isInitialized]);

  // Efecto optimizado para Fast Refresh
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = form.watch((value, { name, type }) => {
      // Solo manejar cambios que no sean de blur
      if (name && type !== 'blur') {
        const currentValue = form.getValues(name as keyof SectionFormValues);
        // Solo actualizar si el valor realmente cambió
        if (currentValue !== value[name as keyof SectionFormValues]) {
          form.setValue(name as keyof SectionFormValues, value[name as keyof SectionFormValues] ?? null, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, isInitialized]);

  if (!isInitialized) {
    return <div className="p-4">Cargando formulario...</div>;
  }



  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Sección *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: A, B, C..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ej: 25"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Select de Grado con key forzada */}
          <FormField
            control={form.control}
            name="gradeId"
            render={({ field }) => (
              <FormItem key={`grade-${field.value}`} className="w-full">
                <FormLabel>Grado *</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(Number(val));
                  }}
                  value={field.value?.toString() ?? ''}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un grado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[90002] w-full">
                    {grades.map((grade) => (
                      <SelectItem
                        key={grade.id}
                        value={grade.id.toString()}
                      >
                        {grade.name} - {grade.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Select de Profesor con key forzada */}
          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem key={`teacher-${field.value}`} className="w-full">
                <FormLabel>Profesor (Opcional)</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val ? Number(val) : null);
                  }}
                  value={field.value?.toString() ?? ''}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un profesor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[90002] w-full">
                    {teachers.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        {teacher.givenNames} {teacher.lastNames}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />



          {serverError && (
            <Alert variant="destructive">
              <IoAlertCircleOutline className="h-4 w-4" />
              <AlertTitle>{serverError.message}</AlertTitle>
              <AlertDescription>
                {serverError.details?.length > 0 && (
                  <ul className="list-disc list-inside text-sm">
                    {serverError.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset(currentSection || defaultSectionValues);
                onCancel?.(); // Llama a la función de cancelación si existe
              }}
              disabled={isLoading}
            >
              <AiOutlineClear className="mr-2" />
              {editMode ? 'Descartar cambios' : 'Limpiar'}
            </Button>

            <Button type="submit" disabled={isLoading}>
              <FaRegSave className="mr-2" />
              {isLoading
                ? "Guardando..."
                : editMode
                  ? "Guardar Cambios"
                  : "Crear Sección"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}