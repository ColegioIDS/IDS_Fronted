// src/components/roles/RoleForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleFormSchema, RoleFormValues } from "@/schemas/role";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaRegSave } from "react-icons/fa";
import { AiOutlineClear } from "react-icons/ai";


interface RoleFormProps {
    onSubmit: (values: RoleFormValues) => void;
    isLoading?: boolean;
    defaultValues?: RoleFormValues;
    serverError?: {
        message: string;
        details?: string[];
    } | null;
}


export function RoleForm({
    onSubmit,
    isLoading = false,
    defaultValues = {
        name: "",
        description: "",
        isActive: true,
    },
    serverError = null,

}: RoleFormProps) {
    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleFormSchema),
        defaultValues,
    });


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo Nombre */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Rol *</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Administrador" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo Descripción */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ej: Acceso completo al sistema"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campo Estado Activo */}
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Rol activo</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Si está desactivado, no se podrá asignar a usuarios
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

                {serverError && (
                    <div className="grid w-full max-w-xl items-start gap-4">


                        <Alert variant="destructive">
                            <IoAlertCircleOutline className="h-4 w-4" />
                            <AlertTitle>{serverError.message}</AlertTitle>
                            <AlertDescription>

                                {serverError.details && serverError.details.length > 0 && (
                                    <ul className="list-inside list-disc text-sm">

                                        {serverError.details.map((detail, index) => (
                                            <li key={index}>{detail}</li>
                                        ))}
                                    </ul>
                                )}


                            </AlertDescription>
                        </Alert>

                    </div>



                )}



                {/* Botones de acción */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button" // 👈 importante
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={isLoading}
                    >
                        <AiOutlineClear /> Limpiar
                    </Button>

                    <Button
                        type="submit" // 👈 importante
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                    >
                        <FaRegSave /> {isLoading ? "Guardando..." : "Guardar Rol"}
                    </Button>
                </div>

            </form>
        </Form>
    );
}