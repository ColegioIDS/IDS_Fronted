// src/components/sections/SectionFormDialog.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  createSectionSchema, 
  CreateSectionSchemaType, 
  defaultSectionValues 
} from '@/schemas/section';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Save, 
  X, 
  AlertCircle,
  Loader2,
  RotateCcw,
  Users,
  GraduationCap
} from 'lucide-react';
import { useGradeOptions } from '@/context/GradeContext';
import { useGradeContext } from '@/context/GradeContext';
// CORREGIDO: Usar el hook de availability en lugar del genérico
import { useTeacherAvailabilityContext } from '@/context/TeacherContext';
import { useSectionForm } from '@/context/SectionsContext';
import { Section } from '@/types/sections';

interface SectionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingSection?: Section | null;
}

export default function SectionFormDialog({
  isOpen,
  onClose,
  editingSection,
}: SectionFormDialogProps) {
  // Context hooks
  const { grades, loading: isLoadingGrades } = useGradeOptions();
  const { fetchGrades } = useGradeContext();
  
  // CORREGIDO: Usar el hook específico para availability
  const { 
    availabilityData,
    loading: isLoadingTeachers, 
    fetchAvailability
  } = useTeacherAvailabilityContext();

  // Combinar profesores disponibles y asignados
  const allTeachers = [
    ...(availabilityData?.available || []),
    ...(availabilityData?.assigned || [])
  ];

  // Debug temporal
  console.log('Teachers debug (availability):', { 
    availabilityData, 
    allTeachers, 
    isLoadingTeachers 
  });
  
  const {
    submitting,
    formMode,
    currentSection,
    handleSubmit: contextHandleSubmit,
    startEdit,
    startCreate,
    cancelForm
  } = useSectionForm();

  // Local state
  const [isInitialized, setIsInitialized] = useState(false);
  const [serverError, setServerError] = useState<{
    message: string;
    details: string[];
  } | null>(null);

  // Form setup
  const form = useForm<CreateSectionSchemaType>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: defaultSectionValues,
  });

  // Determine form data source and mode
  const formData = editingSection || currentSection;
  const isEditMode = !!editingSection || formMode === 'edit';

  // Cargar grados al abrir el dialog
  useEffect(() => {
    if (isOpen && grades.length === 0 && !isLoadingGrades) {
      fetchGrades();
    }
  }, [isOpen, grades.length, isLoadingGrades, fetchGrades]);

  // CORREGIDO: Cargar availability data al abrir el dialog
  useEffect(() => {
    if (isOpen) {
      // Cargar availability con exclusión de sección si estamos editando
      const excludeSectionId = editingSection?.id;
      fetchAvailability(excludeSectionId);
    }
  }, [isOpen, editingSection?.id, fetchAvailability]);

  // Initialize form context when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (editingSection) {
        startEdit(editingSection.id);
      } else {
        startCreate();
      }
      setIsInitialized(false); // Reset initialization when dialog opens
    }
  }, [isOpen, editingSection, startEdit, startCreate]);

  // Initialize form when data is available
  useEffect(() => {
    if (isOpen && !isInitialized && !isLoadingGrades && !isLoadingTeachers) {
      const values = formData ? {
        name: formData.name,
        capacity: formData.capacity,
        gradeId: formData.gradeId.toString(),
        teacherId: formData.teacherId?.toString() || 'no-teacher',
      } : defaultSectionValues;
      
      form.reset(values);
      setIsInitialized(true);
    }
  }, [isOpen, formData, form, isLoadingGrades, isLoadingTeachers, isInitialized]);

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
  const onSubmit = useCallback(async (values: CreateSectionSchemaType) => {
    setServerError(null);
    
    try {
      const formValues = {
        name: values.name,
        capacity: values.capacity,
        gradeId: parseInt(values.gradeId),
        teacherId: values.teacherId && values.teacherId !== 'no-teacher' 
          ? parseInt(values.teacherId) 
          : null,
      };

      const result = await contextHandleSubmit(formValues);
      
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
      console.error('Form submission error:', error);
      setServerError({
        message: error.message || 'Error al procesar la solicitud',
        details: error.details || []
      });
    }
  }, [contextHandleSubmit]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    form.reset(defaultSectionValues);
    setServerError(null);
    setIsInitialized(false);
    cancelForm();
    onClose();
  }, [form, cancelForm, onClose]);

  // Handle clear/reset
  const handleClear = useCallback(() => {
    const values = formData ? {
      name: formData.name,
      capacity: formData.capacity,
      gradeId: formData.gradeId.toString(),
      teacherId: formData.teacherId?.toString() || 'no-teacher',
    } : defaultSectionValues;
    
    form.reset(values);
    setServerError(null);
  }, [form, formData]);

  // Get dialog title
  const getDialogTitle = () => {
    if (editingSection) {
      return `Editar Sección: ${editingSection.grade.name} - ${editingSection.name}`;
    }
    if (formMode === 'edit' && currentSection) {
      return `Editar Sección: ${currentSection.grade?.name} - ${currentSection.name}`;
    }
    return 'Crear Nueva Sección';
  };

  // CORREGIDO: Función para determinar si un profesor está disponible
  const isTeacherAvailable = (teacher: any) => {
    // Si estamos editando y el profesor actual es el mismo, siempre está disponible
    if (isEditMode && formData?.teacherId === teacher.id) {
      return true;
    }
    // Un profesor está disponible si está en la lista de available
    return availabilityData?.available?.some(available => available.id === teacher.id) || false;
  };

  // CORREGIDO: Función para obtener el estado de un profesor
  const getTeacherStatus = (teacher: any) => {
    if (isTeacherAvailable(teacher)) {
      return { available: true, text: 'Disponible', color: 'text-green-600' };
    }
    
    // Buscar en assigned para obtener información de asignación
    const assignedTeacher = availabilityData?.assigned?.find(assigned => assigned.id === teacher.id);
    if (assignedTeacher && (assignedTeacher as any).currentAssignment) {
      const assignment = (assignedTeacher as any).currentAssignment;
      return { 
        available: false, 
        text: `Asignado a ${assignment.gradeName} - ${assignment.sectionName}`, 
        color: 'text-orange-600' 
      };
    }
    
    return { available: false, text: 'Asignado', color: 'text-orange-600' };
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
          {/* Nombre de la sección */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Nombre de la Sección *
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: A, B, C..." 
                    {...field}
                    disabled={submitting}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Ingresa una letra o nombre corto para identificar la sección
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Capacidad */}
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Capacidad *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Ej: 25"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={submitting}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Número máximo de estudiantes que puede tener la sección
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Select de Grado */}
          <FormField
            control={form.control}
            name="gradeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Grado *
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={submitting || isLoadingGrades}
                >
                  <FormControl>
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Selecciona un grado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem
                        key={grade.id}
                        value={grade.id.toString()}
                      >
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-blue-500" />
                          <span>{grade.name} - {grade.level}</span>
                        </div>
                      </SelectItem>
                    ))}
                    {grades.length === 0 && !isLoadingGrades && (
                      <SelectItem value="no-grades" disabled>
                        No hay grados disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500">
                  Selecciona el grado al que pertenecerá esta sección
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Select de Profesor - CORREGIDO con availability data */}
          <FormField
            control={form.control}
            name="teacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Profesor (Opcional)
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'no-teacher' ? '' : value)}
                  value={field.value || 'no-teacher'}
                  disabled={submitting || isLoadingTeachers}
                >
                  <FormControl>
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Selecciona un profesor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no-teacher">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Sin asignar</span>
                      </div>
                    </SelectItem>
                    
                    {/* Profesores disponibles */}
                    {availabilityData?.available && availabilityData.available.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-gray-500 bg-green-50">
                          Profesores disponibles ({availabilityData.available.length})
                        </div>
                        {availabilityData.available.map((teacher) => (
                          <SelectItem
                            key={teacher.id}
                            value={teacher.id.toString()}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-green-500" />
                                <span>{teacher.givenNames} {teacher.lastNames}</span>
                                {teacher.teacherDetails?.isHomeroomTeacher && (
                                  <span className="ml-2 text-xs bg-blue-100 px-1 rounded">
                                    Titular
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-green-600">
                                Disponible
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}

                    {/* Profesores ya asignados (solo si estamos editando y el profesor actual está asignado) */}
                    {isEditMode && formData?.teacherId && availabilityData?.assigned && (
                      <>
                        {availabilityData.assigned
                          .filter(teacher => teacher.id === formData.teacherId)
                          .map((teacher) => {
                            const assignment = (teacher as any).currentAssignment;
                            return (
                              <SelectItem
                                key={teacher.id}
                                value={teacher.id.toString()}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span>{teacher.givenNames} {teacher.lastNames}</span>
                                    {teacher.teacherDetails?.isHomeroomTeacher && (
                                      <span className="ml-2 text-xs bg-blue-100 px-1 rounded">
                                        Titular
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-blue-600">
                                    Actual
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                      </>
                    )}

                    {/* Mostrar profesores ya asignados solo como referencia (deshabilitados) */}
                    {availabilityData?.assigned && availabilityData.assigned.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-gray-500 bg-orange-50">
                          Profesores ya asignados ({availabilityData.assigned.length})
                        </div>
                        {availabilityData.assigned
                          .filter(teacher => !(isEditMode && teacher.id === formData?.teacherId))
                          .map((teacher) => {
                            const assignment = (teacher as any).currentAssignment;
                            return (
                              <SelectItem
                                key={teacher.id}
                                value={teacher.id.toString()}
                                disabled
                              >
                                <div className="flex flex-col opacity-60">
                                  <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4 text-orange-500" />
                                    <span>{teacher.givenNames} {teacher.lastNames}</span>
                                    {teacher.teacherDetails?.isHomeroomTeacher && (
                                      <span className="ml-2 text-xs bg-blue-100 px-1 rounded">
                                        Titular
                                      </span>
                                    )}
                                  </div>
                                  {assignment && (
                                    <span className="text-xs text-orange-600 ml-6">
                                      {assignment.gradeName} - {assignment.sectionName}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                      </>
                    )}

                    {allTeachers.length === 0 && !isLoadingTeachers && (
                      <SelectItem value="no-teachers" disabled>
                        No hay profesores disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500">
                  Asigna un profesor responsable de esta sección (opcional)
                  {availabilityData?.stats && (
                    <span className="block mt-1">
                      <span className="text-green-600">
                        {availabilityData.stats.available} disponible(s)
                      </span>
                      {availabilityData.stats.assigned > 0 && (
                        <span className="text-orange-600 ml-2">
                          • {availabilityData.stats.assigned} asignado(s)
                        </span>
                      )}
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
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
                    {isEditMode ? 'Actualizar Sección' : 'Crear Sección'}
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
          {editingSection && (
            <DialogDescription className="text-sm text-gray-600">
              Capacidad actual: {editingSection.capacity} estudiantes • 
              {editingSection.teacher 
                ? `Profesor: ${editingSection.teacher.givenNames} ${editingSection.teacher.lastNames}`
                : 'Sin profesor asignado'
              }
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