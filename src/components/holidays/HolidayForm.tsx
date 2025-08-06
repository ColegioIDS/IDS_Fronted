
//src\components\holidays\HolidayForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  holidaySchema,
  HolidayFormData,
  defaultValues as defaultHolidayValues,
} from "@/schemas/holiday.schema";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HolidayFormProps {
  onSubmit: (values: HolidayFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<HolidayFormData>;
  serverError?: {
    message: string;
    details: string[];
  } | null;
  bimesters: {
    id: number;
    name: string;
  }[];
}

export function HolidayForm({
  onSubmit,
  isLoading = false,
  serverError = null,
  defaultValues,
  bimesters,
}: HolidayFormProps) {
  const form = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      ...defaultHolidayValues,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Bimestre */}
        {/* <FormField
                    control={form.control}
                    name="bimesterId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bimestre *</FormLabel>
                            <Select 
                                onValueChange={(value) => field.onChange(Number(value))} 
                                value={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un bimestre" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-[90002]">
                                    {bimesters.map((bimester) => (
                                        <SelectItem key={bimester.id} value={bimester.id.toString()}>
                                            {bimester.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}
<p className="text-sm text-muted-foreground">
  Bimestre seleccionado: {form.watch("bimesterId")}
</p>



        {/* Fecha del feriado */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha del feriado *</FormLabel>
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
                        ? format(new Date(field.value), "PPP", { locale: es })
                        : "Selecciona una fecha"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[90002]" align="start">
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

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Día de la Independencia"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recuperado */}
        <FormField
          control={form.control}
          name="isRecovered"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>¿Día recuperado?</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Si está marcado, indica que el día de clase será recuperado.
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
            onClick={() => form.reset(defaultHolidayValues)}
            disabled={isLoading}
          >
            <AiOutlineClear className="mr-2" /> Limpiar
          </Button>

          <Button type="submit" disabled={isLoading}>
            <FaRegSave className="mr-2" />
            {isLoading ? "Guardando..." : "Guardar Feriado"}
          </Button>
        </div>
      </form>
    </Form>
  );
}