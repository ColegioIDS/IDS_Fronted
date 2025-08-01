"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  schoolCycleSchema,
  SchoolCycleFormValues,
  defaultValues as defaultCycleValues,
} from "@/schemas/SchoolCycle";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaRegSave } from "react-icons/fa";
import { AiOutlineClear } from "react-icons/ai";

import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from 'date-fns/locale';

interface CycleFormProps {
  onSubmit: (values: SchoolCycleFormValues) => void;
  isLoading?: boolean;
  defaultValues?: SchoolCycleFormValues; // <--- Recibimos defaultValues como prop
  serverError?: {
    message: string;
    details: string[];
  } | null;
}

export function CycleForm({
  onSubmit,
  isLoading = false,
  serverError = null,
  defaultValues, 
}: CycleFormProps) {
  const form = useForm<SchoolCycleFormValues>({
    resolver: zodResolver(schoolCycleSchema),
    defaultValues: defaultValues ?? defaultCycleValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Ciclo *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ciclo Escolar 2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha de inicio */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de inicio *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? format(new Date(field.value), "PPP",  { locale: es })
                        : "Selecciona una fecha"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 z-[90002]"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha de fin */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de fin *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? format(new Date(field.value), "PPP",  { locale: es })
                        : "Selecciona una fecha"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 z-[90002]"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date)}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Activo */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>¿Ciclo activo?</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Si está activo, se utilizará como ciclo escolar principal.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Cerrado */}
        <FormField
          control={form.control}
          name="isClosed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>¿Ciclo cerrado?</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Si se marca como cerrado, no se podrán inscribir más
                  estudiantes.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Errores del servidor */}
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

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            <AiOutlineClear className="mr-2" /> Limpiar
          </Button>

          <Button type="submit" disabled={isLoading}>
            <FaRegSave className="mr-2" />
            {isLoading ? "Guardando..." : "Guardar Ciclo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
