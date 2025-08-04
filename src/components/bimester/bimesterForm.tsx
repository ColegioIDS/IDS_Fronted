"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    bimesterSchema,
    BimesterFormData,
    defaultValues as defaultBimesterValues,
} from "@/schemas/bimester.schema";

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

interface BimesterFormProps {
    onSubmit: (values: BimesterFormData) => void;
    isLoading?: boolean;
    defaultValues?: Partial<BimesterFormData>;
    serverError?: {
        message: string;
        details: string[];
    } | null;
}

export function BimesterForm({
    onSubmit,
    isLoading = false,
    serverError = null,
    defaultValues,
}: BimesterFormProps) {
    const form = useForm<BimesterFormData>({
        resolver: zodResolver(bimesterSchema),
        defaultValues: {
            ...defaultBimesterValues,
            ...defaultValues,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nombre del Bimestre */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Bimestre *</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Bimestre I - 2025" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Número del Bimestre */}
                <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número de Bimestre *</FormLabel>
                           <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>

                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el número" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-[90002]">
                                    {[1, 2, 3, 4].map((num) => (
                                        <SelectItem key={num} value={num.toString()}>
                                            Bimestre {num}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

                {/* Semanas */}
                <FormField
                    control={form.control}
                    name="weeksCount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Semanas *</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    max={12}
                                    placeholder="Ej: 8"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
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
                                <FormLabel>¿Bimestre activo?</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Si está activo, se utilizará como bimestre actual.
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
                        onClick={() => form.reset(defaultBimesterValues)}
                        disabled={isLoading}
                    >
                        <AiOutlineClear className="mr-2" /> Limpiar
                    </Button>

                    <Button type="submit" disabled={isLoading}>
                        <FaRegSave className="mr-2" />
                        {isLoading ? "Guardando..." : "Guardar Bimestre"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}