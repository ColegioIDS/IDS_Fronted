"use client";

import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gradeSchema, GradeFormValues, defaultValues as defaultGradeValues } from "@/schemas/grade";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaRegSave } from "react-icons/fa";
import { AiOutlineClear } from "react-icons/ai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GradeFormProps {
  onSubmit: (values: GradeFormValues) => void;
  isLoading?: boolean;
  defaultValues?: GradeFormValues;
  serverError?: {
    message: string;
    details: string[];
  } | null;
}

export function GradeForm({
  onSubmit,
  isLoading = false,
  serverError = null,
  defaultValues,
}: GradeFormProps) {
  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: defaultGradeValues,
  });

  // Resetear el formulario cuando cambian los defaultValues
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    } else {
      form.reset(defaultGradeValues);
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Grado *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Primero Básico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem className="w-full"> {/* <- Asegura que el contenedor tenga full width */}
              <FormLabel>Nivel Educativo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full"> {/* <- Aquí también */}
                    <SelectValue placeholder="Selecciona un nivel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="z-[90002] w-full"> {/* <- Asegura ancho completo */}
                  <SelectItem value="Primaria">Primaria</SelectItem>
                  <SelectItem value="Secundaria">Secundaria</SelectItem>
                  <SelectItem value="Kinder">Kinder</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 1"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>¿Grado activo?</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Si está activo, estará disponible para matrículas.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
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
            onClick={() => form.reset(defaultValues || defaultGradeValues)}
            disabled={isLoading}
          >
            <AiOutlineClear className="mr-2" /> Limpiar
          </Button>

          <Button type="submit" disabled={isLoading}>
            <FaRegSave className="mr-2" />
            {isLoading ? "Guardando..." : "Guardar Grado"}
          </Button>
        </div>
      </form>
    </Form>
  );
}