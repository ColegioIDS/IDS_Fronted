"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

import {
    bimesterSchema,
    BimesterFormData,
    defaultValues as defaultBimesterValues,
} from "@/schemas/bimester.schema";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, InfoIcon, Save, X } from "lucide-react";

// Context y tipos
import { useCycleBimesters } from "@/context/newBimesterContext";
import { SchoolCycle } from "@/types/SchoolCycle";
import { Bimester } from "@/types/SchoolBimesters";

interface BimesterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCycle: SchoolCycle | null;
    bimesterToEdit?: Bimester | null;
}

export default function BimesterDialog({
    isOpen,
    onClose,
    selectedCycle,
    bimesterToEdit = null,
}: BimesterDialogProps) {
    // ✅ Hook del ciclo específico
    const {
        bimesters: cycleBimesters,
        createBimester,
        updateBimester,
        isMutating
    } = useCycleBimesters(selectedCycle?.id);
const [isFormInitialized, setIsFormInitialized] = useState(false);

    // ✅ Determinar modo
    const isEditing = Boolean(bimesterToEdit);
    const mode = isEditing ? 'edit' : 'create';

    // ✅ Estadísticas del ciclo
    const cycleStats = useMemo(() => {
        if (!cycleBimesters || cycleBimesters.length === 0) {
            return {
                totalBimesters: 0,
                hasActiveBimester: false,
                activeBimesterNumber: null,
            };
        }

        const activeBimester = cycleBimesters.find((b: Bimester) => b.isActive);
        return {
            totalBimesters: cycleBimesters.length,
            hasActiveBimester: Boolean(activeBimester),
            activeBimesterNumber: activeBimester?.number || null,
        };
    }, [cycleBimesters]);

    // ✅ Formulario
    const form = useForm<BimesterFormData>({
        resolver: zodResolver(bimesterSchema),
        defaultValues: {
            ...defaultBimesterValues,
            // Si estamos editando, usar los valores del bimestre
            ...(bimesterToEdit && {
                name: bimesterToEdit.name,
                number: bimesterToEdit.number,
                startDate: new Date(bimesterToEdit.startDate),
                endDate: new Date(bimesterToEdit.endDate),
                weeksCount: bimesterToEdit.weeksCount || 8,
                isActive: bimesterToEdit.isActive || false,
            })
        },
    });
// ✅ Efecto para inicializar el formulario cuando se abre para editar
useEffect(() => {
    if (isOpen) {
        if (bimesterToEdit) {
            // Modo edición: cargar valores del bimestre
            form.reset({
                name: bimesterToEdit.name,
                number: bimesterToEdit.number,
                startDate: new Date(bimesterToEdit.startDate),
                endDate: new Date(bimesterToEdit.endDate),
                weeksCount: bimesterToEdit.weeksCount || 8,
                isActive: bimesterToEdit.isActive || false,
            });
        } else {
            // Modo creación: valores por defecto
            form.reset(defaultBimesterValues);
        }
        setIsFormInitialized(true);
    } else {
        // Modal cerrado: limpiar estado
        setIsFormInitialized(false);
    }
}, [isOpen, bimesterToEdit, form]);

// ✅ Auto-sugerir número de bimestre (solo en creación)
useEffect(() => {
    if (mode === 'create' && isFormInitialized && cycleStats.totalBimesters >= 0) {
        const suggestedNumber = cycleStats.totalBimesters + 1;
        if (suggestedNumber <= 4) {
            form.setValue('number', suggestedNumber);
        }
    }
}, [cycleStats.totalBimesters, mode, form, isFormInitialized]);

// ✅ Auto-sugerir nombre (solo en creación y después de inicializar)
useEffect(() => {
    if (mode === 'create' && selectedCycle && isFormInitialized) {
        const currentNumber = form.watch('number');
        if (currentNumber) {
            const suggestedName = `Bimestre ${currentNumber} - ${selectedCycle.name}`;
            // Solo sugerir si el campo está vacío o tiene el valor por defecto
            const currentName = form.getValues('name');
            if (!currentName || currentName === '' || currentName === defaultBimesterValues.name) {
                form.setValue('name', suggestedName);
            }
        }
    }
}, [form.watch('number'), selectedCycle, mode, form, isFormInitialized]);

    // ✅ Envío del formulario
    const handleSubmit = async (values: BimesterFormData) => {
        if (!selectedCycle) {
            toast.error('No hay ciclo seleccionado');
            return;
        }

        try {
            console.log(`🎯 ${mode === 'create' ? 'Creando' : 'Actualizando'} bimestre en ciclo:`, selectedCycle.id, values);

            if (mode === 'create') {
                await createBimester({
                    name: values.name,
                    number: values.number,
                    startDate: values.startDate,
                    endDate: values.endDate,
                    weeksCount: values.weeksCount,
                    isActive: values.isActive,
                });
                toast.success('Bimestre creado correctamente');
            } else {
                if (typeof bimesterToEdit?.id === "number") {
                    await updateBimester(bimesterToEdit.id, {
                        name: values.name,
                        number: values.number,
                        startDate: values.startDate,
                        endDate: values.endDate,
                        weeksCount: values.weeksCount,
                        isActive: values.isActive,
                    });
                    toast.success('Bimestre actualizado correctamente');
                } else {
                    toast.error('ID de bimestre no válido para actualizar');
                    return;
                }
            }

            handleClose();
        } catch (error) {
            console.error('❌ Error al guardar bimestre:', error);
            toast.error('Error al guardar el bimestre');
        }
    };

    // ✅ Cerrar y limpiar
    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {mode === 'create' ? 'Crear Bimestre' : 'Editar Bimestre'}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedCycle ? (
                            <>
                                Ciclo Escolar: <strong>{selectedCycle.name}</strong>
                                {selectedCycle.isActive && (
                                    <span className="ml-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                                        Activo
                                    </span>
                                )}
                            </>
                        ) : (
                            'Selecciona un ciclo escolar para continuar'
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* ✅ Advertencias */}
                {!selectedCycle && (
                    <Alert variant="destructive">
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Sin Ciclo Seleccionado</AlertTitle>
                        <AlertDescription>
                            Debes seleccionar un ciclo escolar antes de crear o editar bimestres.
                        </AlertDescription>
                    </Alert>
                )}

                {cycleStats.hasActiveBimester && mode === 'create' && (
                    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                        <InfoIcon className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800 dark:text-amber-200">
                            Bimestre Activo Existente
                        </AlertTitle>
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                            Ya existe un bimestre activo (Bimestre {cycleStats.activeBimesterNumber}).
                            Si activas este nuevo bimestre, el anterior se desactivará automáticamente.
                        </AlertDescription>
                    </Alert>
                )}

                {/* ✅ Formulario */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Bimestre *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={`Ej: Bimestre ${cycleStats.totalBimesters + 1} - ${selectedCycle?.name || '2025'}`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Número */}
                            <FormField
                                control={form.control}
                                name="number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Bimestre *</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el número" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {[1, 2, 3, 4].map((num) => {
                                                    const exists = cycleBimesters?.some((b: Bimester) => b.number === num) || false;
                                                    const isCurrentEdit = bimesterToEdit?.number === num;
                                                    
                                                    return (
                                                        <SelectItem
                                                            key={num}
                                                            value={num.toString()}
                                                            className="flex items-center justify-between"
                                                        >
                                                            <span>Bimestre {num}</span>
                                                            {exists && mode === 'create' && !isCurrentEdit && (
                                                                <span className="text-xs text-amber-600 ml-2">
                                                                    (Ya existe)
                                                                </span>
                                                            )}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Fecha inicio */}
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
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? format(field.value, "PPP", { locale: es })
                                                            : "Selecciona una fecha"}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    locale={es}
                                                    disabled={(date) => {
                                                        if (!selectedCycle) return false;
                                                        const cycleStart = new Date(selectedCycle.startDate);
                                                        const cycleEnd = new Date(selectedCycle.endDate);
                                                        return date < cycleStart || date > cycleEnd;
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fecha fin */}
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
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? format(field.value, "PPP", { locale: es })
                                                            : "Selecciona una fecha"}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    locale={es}
                                                    disabled={(date) => {
                                                        if (!selectedCycle) return false;
                                                        const cycleStart = new Date(selectedCycle.startDate);
                                                        const cycleEnd = new Date(selectedCycle.endDate);
                                                        const startDate = form.getValues('startDate');
                                                        const minDate = startDate ? startDate : cycleStart;
                                                        return date < minDate || date > cycleEnd;
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Semanas */}
                            <FormField
                                control={form.control}
                                name="weeksCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de semanas *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={12}
                                                placeholder="8"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <div className="text-xs text-muted-foreground">
                                            Generalmente 8 semanas por bimestre
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Info visual */}
                            <div className="flex items-center justify-center">
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <div className="text-sm font-medium text-muted-foreground">
                                        Bimestre {form.watch('number') || '?'}
                                    </div>
                                    <div className="text-lg font-bold">
                                        {selectedCycle?.name || 'Sin ciclo'}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Total en ciclo: {cycleStats.totalBimesters}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Switch activo */}
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">¿Bimestre activo?</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Si está activo, se utilizará como bimestre actual para evaluaciones.
                                            {cycleStats.hasActiveBimester && mode === 'create' && (
                                                <div className="text-amber-600 mt-1 text-xs">
                                                    ⚠️ Desactivará el bimestre activo actual (Bimestre {cycleStats.activeBimesterNumber}).
                                                </div>
                                            )}
                                        </div>
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

                        {/* Botones */}
                        <div className="flex justify-between pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isMutating}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                disabled={isMutating || !selectedCycle}
                            >
                                {isMutating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {mode === 'create' ? 'Creando...' : 'Actualizando...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {mode === 'create' ? 'Crear Bimestre' : 'Actualizar Bimestre'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}