// src/components/grades/GradeFormDialog.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGradeForm } from '@/context/GradeContext';
import { gradeSchema, defaultValues } from '@/schemas/grade';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BookOpen, 
  Save, 
  X, 
  Baby, 
  GraduationCap,
  AlertCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { Grade } from '@/types/grades';

type GradeFormData = z.infer<typeof gradeSchema>;

interface GradeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingGrade?: Grade | null;
}

export default function GradeFormDialog({ 
  isOpen, 
  onClose, 
  editingGrade 
}: GradeFormDialogProps) {
  // Context hooks
  const {
    submitting,
    formMode,
    currentGrade,
    handleSubmit: contextHandleSubmit,
    startEdit,
    startCreate,
    cancelForm
  } = useGradeForm();

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [serverError, setServerError] = useState<{
    message: string;
    details: string[];
  } | null>(null);

  // Form setup
  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues,
  });

  // Determine form data source and mode
  const formData = editingGrade || currentGrade;
  const isEditMode = !!editingGrade || formMode === 'edit';

  // Initialize form context when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (editingGrade) {
        startEdit(editingGrade.id);
      } else {
        startCreate();
      }
      setIsInitialized(false); // Reset initialization when dialog opens
    }
  }, [isOpen, editingGrade, startEdit, startCreate]);

  // Initialize form when data is available
  useEffect(() => {
    if (isOpen && !isInitialized) {
      const values = formData ? {
        name: formData.name,
        level: formData.level,
        order: formData.order,
        isActive: formData.isActive,
      } : defaultValues;
      
      form.reset(values);
      setIsInitialized(true);
    }
  }, [isOpen, formData, form, isInitialized]);

  // Clear server error when form values change
  useEffect(() => {
    if (serverError) {
      const subscription = form.watch(() => {
        setServerError(null);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, serverError]);

  // Handle form submission
  const onSubmit = useCallback(async (data: GradeFormData) => {
    setServerError(null);
    
    try {
      const result = await contextHandleSubmit(data);
      
      if (result && !result.success) {
        setServerError({
          message: result.message || 'Error de validación',
          details: (result as any).details || []
        });
        return;
      }

      // Success - close dialog
      handleClose();
    } catch (error: any) {
      
      // Handle server validation errors
      if (error.response?.data?.details) {
        error.response.data.details.forEach((detail: any) => {
          if (detail.field && detail.field in data) {
            form.setError(detail.field as keyof GradeFormData, {
              type: 'server',
              message: detail.message
            });
          }
        });
      }
      
      setServerError({
        message: error.message || 'Error al procesar la solicitud',
        details: error.details || []
      });
    }
  }, [contextHandleSubmit]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    form.reset(defaultValues);
    setServerError(null);
    setIsInitialized(false);
    cancelForm();
    onClose();
  }, [form, cancelForm, onClose]);

  // Handle clear/reset
  const handleClear = useCallback(() => {
    const values = formData ? {
      name: formData.name,
      level: formData.level,
      order: formData.order,
      isActive: formData.isActive,
    } : defaultValues;
    
    form.reset(values);
    setServerError(null);
  }, [form, formData]);

  // Helper functions
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Kinder':
        return <Baby className="h-4 w-4 text-pink-500" />;
      case 'Primaria':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'Secundaria':
        return <GraduationCap className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDialogTitle = () => {
    if (editingGrade) {
      return `Editar Grado: ${editingGrade.name}`;
    }
    if (formMode === 'edit' && currentGrade) {
      return `Editar Grado: ${currentGrade.name}`;
    }
    return 'Crear Nuevo Grado';
  };

  const hasFormErrors = Object.keys(form.formState.errors).length > 0;

  // Dialog content
  const renderContent = () => {
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando formulario...</span>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre del grado */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Nombre del Grado *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Primer Grado, Quinto de Primaria..."
                    {...field}
                    disabled={submitting}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Ingresa un nombre descriptivo para el grado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nivel educativo */}
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Nivel Educativo *
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={submitting}
                >
                  <FormControl>
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Selecciona un nivel educativo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Kinder">
                      <div className="flex items-center space-x-2">
                        <Baby className="h-4 w-4 text-pink-500" />
                        <span>Kinder</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Primaria">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span>Primaria</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Secundaria">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        <span>Secundaria</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500">
                  Define a qué nivel educativo pertenece este grado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Orden */}
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Orden de Visualización *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    min="1"
                    max="20"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    disabled={submitting}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Número que determina el orden de aparición (1 = primero)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estado activo */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 space-y-0 bg-gray-50">
                <div className="space-y-1">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Estado del Grado
                  </FormLabel>
                  <FormDescription className="text-xs text-gray-500 max-w-xs">
                    {field.value 
                      ? 'El grado estará disponible para inscripciones y será visible en el sistema'
                      : 'El grado estará oculto y no permitirá nuevas inscripciones'
                    }
                  </FormDescription>
                </div>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      field.value ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {field.value ? 'Activo' : 'Inactivo'}
                    </span>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={submitting}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Server error alert */}
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{serverError.message}</AlertTitle>
              {serverError.details?.length > 0 && (
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm mt-2">
                    {serverError.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </AlertDescription>
              )}
            </Alert>
          )}

          {/* Form errors alert */}
          {hasFormErrors && !serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Por favor, corrige los errores en el formulario antes de continuar.
              </AlertDescription>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              disabled={submitting}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{isEditMode ? 'Descartar cambios' : 'Limpiar'}</span>
            </Button>
            
            <Button
              type="submit"
              disabled={submitting || hasFormErrors}
              className={`flex items-center space-x-2 ${
                isEditMode 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>
                    {isEditMode ? 'Actualizar Grado' : 'Crear Grado'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <div className={`p-2 rounded-lg ${
              isEditMode ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              <BookOpen className={`h-5 w-5 ${
                isEditMode ? 'text-purple-600' : 'text-blue-600'
              }`} />
            </div>
            <span>{getDialogTitle()}</span>
          </DialogTitle>
          {editingGrade && (
            <DialogDescription className="text-sm text-gray-600">
              Nivel: {editingGrade.level} • Orden: {editingGrade.order} • 
              Estado: {editingGrade.isActive ? 'Activo' : 'Inactivo'}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}