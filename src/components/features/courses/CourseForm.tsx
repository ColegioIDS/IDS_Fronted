// src/components/features/courses/CourseForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Save,
  X,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Palette,
  Code,
  Lock,
} from 'lucide-react';
import { CourseFormValues, CourseArea, Course } from '@/types/courses';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { coursesService } from '@/services/courses.service';

// Validación con Zod
const courseSchema = z.object({
  code: z
    .string()
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(20, 'El código no puede exceder 20 caracteres'),
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  area: z
    .enum(['Científica', 'Humanística', 'Sociales', 'Tecnológica', 'Artística', 'Idiomas', 'Educación Física'] as const)
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color debe ser válido (ej: #FF0000)')
    .optional()
    .nullable(),
  isActive: z.boolean(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  courseId?: number;
  initialData?: Course;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const courseAreas: CourseArea[] = [
  'Científica',
  'Humanística',
  'Sociales',
  'Tecnológica',
  'Artística',
  'Idiomas',
  'Educación Física',
];

export function CourseForm({ courseId, initialData, onSuccess, onCancel }: CourseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [previewColor, setPreviewColor] = useState<string>('#6366F1');

  // Validar permisos
  const { hasPermission } = useAuth();
  const isEdit = !!courseId && !!initialData;
  const requiredPermission = isEdit ? 'update' : 'create';
  const hasRequiredPermission = hasPermission('course', requiredPermission);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: '',
      name: '',
      area: null,
      color: null,
      isActive: true,
    },
  });

  const color = watch('color');
  const isActive = watch('isActive');
  const areaValue = watch('area');

  // Actualizar preview color
  useEffect(() => {
    if (color && /^#[0-9A-F]{6}$/i.test(color)) {
      setPreviewColor(color);
    }
  }, [color]);

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code,
        name: initialData.name,
        area: initialData.area || null,
        color: initialData.color || null,
        isActive: initialData.isActive,
      });
      setPreviewColor(initialData.color || '#6366F1');
    }
  }, [initialData, reset]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsLoading(true);
      setGlobalError(null);

      // Validar permisos en el servidor antes de procesar
      if (!hasRequiredPermission) {
        throw new Error(
          `No tienes permiso para ${isEdit ? 'editar' : 'crear'} cursos`
        );
      }

      // Enviar al backend
      if (isEdit && courseId) {
        await coursesService.updateCourse(courseId, data);
        toast.success('Curso actualizado exitosamente');
      } else {
        await coursesService.createCourse(data);
        toast.success('Curso creado exitosamente');
      }

      onSuccess?.();
    } catch (err: any) {
      const message = err.message || 'Error al procesar el curso';
      setGlobalError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {isEdit ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isEdit
                ? 'Actualiza los detalles del curso'
                : 'Ingresa los datos para crear un nuevo curso'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Permission Error */}
        {!hasRequiredPermission && (
          <Alert variant="destructive" className="mb-6">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              No tienes permiso para {isEdit ? 'editar' : 'crear'} cursos. 
              Contacta al administrador si crees que esto es un error.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Global error */}
          {globalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          )}

          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="code" className="flex items-center gap-2 text-sm font-medium">
              <Code className="w-4 h-4 text-gray-500" />
              Código del Curso <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              placeholder="ej: MATH-101"
              {...register('code')}
              className={`h-11 ${errors.code ? 'border-red-500 dark:border-red-400' : ''}`}
              disabled={isLoading}
            />
            {errors.code && (
              <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.code.message}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="w-4 h-4 text-gray-500" />
              Nombre del Curso <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="ej: Matemáticas Avanzadas"
              {...register('name')}
              className={`h-11 ${errors.name ? 'border-red-500 dark:border-red-400' : ''}`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Grid para Área y Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Área */}
            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-medium">
                Área del Curso
              </Label>
              <Select
                value={areaValue || 'none'}
                onValueChange={(value) => {
                  if (value === 'none') {
                    setValue('area', null);
                  } else {
                    setValue('area', value as CourseArea);
                  }
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900">
                  <SelectItem value="none">Sin área</SelectItem>
                  {courseAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color" className="flex items-center gap-2 text-sm font-medium">
                <Palette className="w-4 h-4 text-gray-500" />
                Color Identificador
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  placeholder="#FF0000"
                  {...register('color')}
                  className="h-11 w-20 cursor-pointer"
                  disabled={isLoading}
                />
                <Input
                  type="text"
                  placeholder="#6366F1"
                  value={color || ''}
                  onChange={(e) => setValue('color', e.target.value)}
                  className={`h-11 flex-1 ${errors.color ? 'border-red-500 dark:border-red-400' : ''}`}
                  disabled={isLoading}
                />
                {color && /^#[0-9A-F]{6}$/i.test(color) && (
                  <div
                    className="w-12 h-11 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                )}
              </div>
              {errors.color && (
                <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.color.message}
                </p>
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div>
              <Label className="text-base font-medium text-gray-900 dark:text-gray-100">
                Estado del Curso
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isActive
                  ? 'El curso está disponible para usar'
                  : 'El curso está inactivo'}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
              disabled={isLoading}
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !hasRequiredPermission}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEdit ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isEdit ? 'Actualizar Curso' : 'Crear Curso'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
