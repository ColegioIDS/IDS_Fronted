"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, InfoIcon, Save, X, Calendar as CalendarDays, Clock, AlertTriangle } from "lucide-react";

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
    // ✅ Verificar permisos
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('bimester', 'create');
    const canUpdate = hasPermission('bimester', 'update');

    // Hook del ciclo específico
    const {
        bimesters: cycleBimesters,
        createBimester,
        updateBimester,
        isMutating
    } = useCycleBimesters(selectedCycle?.id);

    const [isFormInitialized, setIsFormInitialized] = useState(false);

    // Determinar modo
    const isEditing = Boolean(bimesterToEdit);
    const mode = isEditing ? 'edit' : 'create';

    // Verificar si tiene el permiso necesario
    const hasRequiredPermission = mode === 'create' ? canCreate : canUpdate;

    // Estadísticas del ciclo
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

    // Formulario
    const form = useForm<BimesterFormData>({
        resolver: zodResolver(bimesterSchema),
        defaultValues: {
            ...defaultBimesterValues,
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

    // Inicializar formulario cuando se abre
    useEffect(() => {
        if (isOpen) {
            if (bimesterToEdit) {
                form.reset({
                    name: bimesterToEdit.name,
                    number: bimesterToEdit.number,
                    startDate: new Date(bimesterToEdit.startDate),
                    endDate: new Date(bimesterToEdit.endDate),
                    weeksCount: bimesterToEdit.weeksCount || 8,
                    isActive: bimesterToEdit.isActive || false,
                });
            } else {
                form.reset(defaultBimesterValues);
            }
            setIsFormInitialized(true);
        } else {
            setIsFormInitialized(false);
        }
    }, [isOpen, bimesterToEdit, form]);

    // Auto-sugerir número (solo en creación)
    useEffect(() => {
        if (mode === 'create' && isFormInitialized && cycleStats.totalBimesters >= 0) {
            const suggestedNumber = cycleStats.totalBimesters + 1;
            if (suggestedNumber <= 4) {
                form.setValue('number', suggestedNumber);
            }
        }
    }, [cycleStats.totalBimesters, mode, form, isFormInitialized]);

    // Auto-sugerir nombre (solo en creación)
    useEffect(() => {
        if (mode === 'create' && selectedCycle && isFormInitialized) {
            const currentNumber = form.watch('number');
            if (currentNumber) {
                const suggestedName = `Bimestre ${currentNumber} - ${selectedCycle.name}`;
                const currentName = form.getValues('name');
                if (!currentName || currentName === '' || currentName === defaultBimesterValues.name) {
                    form.setValue('name', suggestedName);
                }
            }
        }
    }, [form.watch('number'), selectedCycle, mode, form, isFormInitialized]);

    // Envío del formulario
    const handleSubmit = async (values: BimesterFormData) => {
        if (!selectedCycle) {
            toast.error('No hay ciclo seleccionado');
            return;
        }

        if (!hasRequiredPermission) {
            toast.error('No tienes permisos para realizar esta acción');
            return;
        }

        try {
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
                    toast.error('ID de bimestre no válido');
                    return;
                }
            }

            handleClose();
        } catch (error) {
            console.error('❌ Error al guardar bimestre:', error);
            toast.error('Error al guardar el bimestre');
        }
    };

    // Cerrar y limpiar
    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-primary" />
                        {mode === 'create' ? 'Crear Nuevo Bimestre' : 'Editar Bimestre'}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 text-base mt-2">
                        {selectedCycle ? (
                            <>
                                <span>Ciclo Escolar:</span>
                                <strong className="text-foreground">{selectedCycle.name}</strong>
                                {selectedCycle.isActive && (
                                    <span className="ml-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Activo
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-destructive">No hay ciclo seleccionado</span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <Separator />

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-6 py-4">
                        {/* Advertencias */}
                        {!selectedCycle && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Sin Ciclo Seleccionado</AlertTitle>
                                <AlertDescription>
                                    Debes seleccionar un ciclo escolar antes de crear o editar bimestres.
                                </AlertDescription>
                            </Alert>
                        )}

                        {!hasRequiredPermission && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Sin Permisos</AlertTitle>
                                <AlertDescription>
                                    No tienes permisos para {mode === 'create' ? 'crear' : 'editar'} bimestres.
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

                        {/* Info Card */}
                        <Card className="bg-muted/50 border-dashed">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-primary">
                                            {form.watch('number') || '?'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Número</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary">
                                            {cycleStats.totalBimesters}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Total en ciclo</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-primary">
                                            {form.watch('weeksCount') || 8}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Semanas</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Formulario */}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                {/* Sección: Información Básica */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <InfoIcon className="h-5 w-5 text-primary" />
                                        Información Básica
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        disabled={!hasRequiredPermission}
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
                                                                    >
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <span>Bimestre {num}</span>
                                                                            {exists && mode === 'create' && !isCurrentEdit && (
                                                                                <span className="text-xs text-amber-600 ml-2">
                                                                                    (Ya existe)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
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
                                                    <FormLabel>Número de Semanas *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={12}
                                                            placeholder="8"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                            disabled={!hasRequiredPermission}
                                                        />
                                                    </FormControl>
                                                    <p className="text-xs text-muted-foreground">
                                                        Generalmente 8 semanas por bimestre
                                                    </p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Nombre completo */}
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
                                                        disabled={!hasRequiredPermission}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                {/* Sección: Período del Bimestre */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                        Período del Bimestre
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Fecha inicio */}
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Fecha de Inicio *</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                    disabled={!hasRequiredPermission}
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
                                                    <FormLabel>Fecha de Finalización *</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                    disabled={!hasRequiredPermission}
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
                                </div>

                                <Separator />

                                {/* Sección: Estado */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Estado del Bimestre</h3>
                                    
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/50">
                                                <div className="space-y-0.5 flex-1">
                                                    <FormLabel className="text-base font-semibold">
                                                        ¿Marcar como bimestre activo?
                                                    </FormLabel>
                                                    <div className="text-sm text-muted-foreground">
                                                        El bimestre activo se utilizará como período actual para evaluaciones y registros.
                                                        {cycleStats.hasActiveBimester && mode === 'create' && (
                                                            <div className="text-amber-600 dark:text-amber-400 mt-2 text-xs flex items-center gap-1">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Desactivará automáticamente el Bimestre {cycleStats.activeBimesterNumber}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={!hasRequiredPermission}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
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
                            onClick={form.handleSubmit(handleSubmit)}
                            disabled={isMutating || !selectedCycle || !hasRequiredPermission}
                        >
                            {isMutating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {mode === 'create' ? 'Creando...' : 'Actualizando...'}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {mode === 'create' ? 'Crear Bimestre' : 'Guardar Cambios'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}