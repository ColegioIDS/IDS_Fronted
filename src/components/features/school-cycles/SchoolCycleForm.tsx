'use client';

import { useState } from 'react';
import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ErrorAlert } from '@/components/shared/feedback/ErrorAlert';
import { schoolCycleService } from '@/services/school-cycle.service';
import { SchoolCycle, CreateSchoolCycleDto, UpdateSchoolCycleDto } from '@/types/school-cycle.types';
import { createSchoolCycleSchema, updateSchoolCycleSchema } from '@/schemas/school-cycle.schema';
import { handleApiError } from '@/utils/handleApiError';
import { cn } from '@/lib/utils';

// ==================== THEME SYSTEM ====================
type ModuleTheme = {
  bg: string;
  gradient: string;
  text: string;
  accent: string;
  border: string;
  hover: string;
};

const THEME_CONFIG = {
  'school-cycle': {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-blue-200 dark:border-blue-800',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-500',
    text: 'text-blue-900 dark:text-blue-100',
    accent: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/50',
  },
};

const getModuleTheme = (module: string): ModuleTheme => {
  return THEME_CONFIG[module as keyof typeof THEME_CONFIG] || THEME_CONFIG['school-cycle'];
};

// ==================== CALENDAR COMPONENT ====================
interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  mode?: 'single' | 'range';
  selected?: Date | null;
  onSelect?: (date: Date | undefined) => void;
}

const CalendarComponent = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, mode = 'single', selected, onSelect, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg',
        className
      )}
      {...props}
    >
      <DayPicker
        mode={mode as any}
        selected={selected || undefined}
        onSelect={onSelect}
        locale={es}
        showOutsideDays={false}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4',
          caption: 'flex justify-center pt-1 relative items-center',
          caption_label: 'text-sm font-semibold text-gray-900 dark:text-gray-100',
          nav: 'space-x-1 flex items-center',
          nav_button: cn(
            'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded'
          ),
          nav_button_previous: 'absolute left-1',
          nav_button_next: 'absolute right-1',
          table: 'w-full border-collapse space-y-1',
          head_row: 'flex',
          head_cell:
            'text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
          row: 'flex w-full mt-2',
          cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100/50 dark:[&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected])]:bg-gray-100 dark:[&:has([aria-selected])]:bg-gray-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
          day: cn(
            'p-0 relative w-9 h-9 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md'
          ),
          day_range_end: 'day-range-end',
          day_selected:
            'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 focus:bg-blue-700 dark:focus:bg-blue-800',
          day_today:
            'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-bold',
          day_outside:
            'day-outside text-gray-400 dark:text-gray-600 opacity-50 aria-selected:bg-gray-100/50 dark:aria-selected:bg-gray-800/50 aria-selected:text-gray-400 dark:aria-selected:text-gray-600 aria-selected:opacity-50',
          day_disabled:
            'text-gray-400 dark:text-gray-600 opacity-50',
          day_range_middle:
            'aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800 aria-selected:text-gray-900 dark:aria-selected:text-gray-100',
          day_hidden: 'invisible',
        }}
      />
    </div>
  )
);
CalendarComponent.displayName = 'Calendar';

// ==================== DATE PICKER COMPONENT ====================
interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Seleccionar fecha',
      disabled = false,
      label,
      error,
      required = false,
      minDate,
      maxDate,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleDateChange = (date: Date | undefined) => {
      if (date) {
        if (minDate && date < minDate) return;
        if (maxDate && date > maxDate) return;
        onChange(date);
        setOpen(false);
      }
    };

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              disabled={disabled}
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-gray-500 dark:text-gray-400',
                error && 'border-red-500 dark:border-red-500'
              )}
            >
              {value ? (
                format(value, 'PPP', { locale: es })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CalendarComponent
              mode="single"
              selected={value}
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';

// ==================== FORM FIELD COMPONENT ====================
interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      required,
      helperText,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            className={cn(
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-500 dark:border-red-500 focus:ring-red-500',
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

// ==================== CHECKBOX CARD COMPONENT ====================
interface CheckboxCardProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  theme?: {
    bg: string;
    border: string;
    text: string;
    icon: string;
  };
}

function CheckboxCard({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  icon,
  theme,
}: CheckboxCardProps) {
  const defaultTheme = {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
  };

  const finalTheme = theme || defaultTheme;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border transition-all duration-300',
        'hover:shadow-md cursor-pointer',
        finalTheme.bg,
        finalTheme.border,
        disabled && 'opacity-50 cursor-not-allowed',
        checked && 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-current'
      )}
      onClick={() => !disabled && onChange(!checked)}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="mt-1"
      />
      <label
        htmlFor={id}
        className={cn(
          'flex-1 cursor-pointer',
          disabled && 'cursor-not-allowed'
        )}
      >
        <div className="flex items-start gap-2">
          {icon && (
            <div className={cn('flex-shrink-0 mt-0.5', finalTheme.icon)}>
              {icon}
            </div>
          )}
          <div>
            <p className={cn('font-medium text-gray-700 dark:text-gray-300', checked && finalTheme.text)}>
              {label}
            </p>
            {description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}

// ==================== MAIN FORM COMPONENT ====================
interface SchoolCycleFormProps {
  cycle?: SchoolCycle;
  onSuccess?: (cycle: SchoolCycle) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function SchoolCycleForm({
  cycle,
  onSuccess,
  onCancel,
  isLoading: externalLoading = false,
}: SchoolCycleFormProps) {
  const theme = getModuleTheme('school-cycle');
  const [formData, setFormData] = useState({
    name: cycle?.name || '',
    description: cycle?.description || '',
    academicYear: cycle?.academicYear?.toString() || new Date().getFullYear().toString(),
    startDate: cycle?.startDate ? new Date(cycle.startDate) : null,
    endDate: cycle?.endDate ? new Date(cycle.endDate) : null,
    isActive: cycle?.isActive || false,
    canEnroll: cycle?.canEnroll ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(externalLoading);
  const [apiError, setApiError] = useState<{ message: string; details?: string[] } | null>(null);

  const validateForm = () => {
    try {
      const schema = cycle ? updateSchoolCycleSchema : createSchoolCycleSchema;
      const dataToValidate = {
        ...formData,
        academicYear: formData.academicYear ? parseInt(formData.academicYear) : undefined,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
      };

      schema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (err: any) {
      const formErrors: Record<string, string> = {};
      if (err.errors) {
        err.errors.forEach((e: any) => {
          const path = e.path?.[0] || 'general';
          formErrors[path] = e.message;
        });
      }
      setErrors(formErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setApiError(null);

      const startDate = formData.startDate!.toISOString();
      const endDate = formData.endDate!.toISOString();

      let result: SchoolCycle;

      if (cycle) {
        const updateData: UpdateSchoolCycleDto = {};
        if (formData.name !== cycle.name) updateData.name = formData.name;
        if (formData.description !== (cycle.description || '')) updateData.description = formData.description;
        if (formData.academicYear !== (cycle.academicYear?.toString() || '')) {
          updateData.academicYear = parseInt(formData.academicYear);
        }
        if (startDate !== cycle.startDate) updateData.startDate = startDate;
        if (endDate !== cycle.endDate) updateData.endDate = endDate;
        if (formData.isActive !== cycle.isActive) updateData.isActive = formData.isActive;
        if (formData.canEnroll !== cycle.canEnroll) updateData.canEnroll = formData.canEnroll;

        result = await schoolCycleService.update(cycle.id, updateData);
      } else {
        const createData: CreateSchoolCycleDto = {
          name: formData.name,
          description: formData.description,
          academicYear: parseInt(formData.academicYear),
          startDate,
          endDate,
          isActive: formData.isActive,
          canEnroll: formData.canEnroll,
        };

        result = await schoolCycleService.create(createData);
      }

      onSuccess?.(result);
    } catch (err: any) {
      const handled = handleApiError(err, `Error al ${cycle ? 'actualizar' : 'crear'} ciclo escolar`);
      setApiError({
        message: handled.message,
        details: handled.details,
      });
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const isSubmitDisabled =
    isLoading ||
    !formData.name.trim() ||
    !formData.startDate ||
    !formData.endDate ||
    cycle?.isArchived ||
    externalLoading;

  const currentYear = new Date().getFullYear();
  const minDate = new Date(currentYear - 1, 0, 1);
  const maxDate = new Date(currentYear + 5, 11, 31);

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className={`${theme.bg} border-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme.gradient} bg-gradient-to-r text-white`}>
              <CalendarIcon className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className={theme.text}>
                {cycle ? 'Editar Ciclo Escolar' : 'Crear Nuevo Ciclo Escolar'}
              </CardTitle>
              <CardDescription className="mt-1">
                {cycle?.isArchived ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Este ciclo está cerrado y no puede ser modificado
                  </span>
                ) : (
                  <span>Completa los datos para {cycle ? 'actualizar' : 'crear'} un ciclo escolar</span>
                )}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {apiError && (
          <ErrorAlert 
            message={apiError.message} 
            title="Error al guardar" 
            details={apiError.details}
          />
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            Información Básica
          </h3>

          <FormField
            label="Nombre del Ciclo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Ciclo Escolar 2025"
            disabled={isLoading || cycle?.isArchived}
            error={errors.name}
            required
            helperText="Nombre único que identifique este ciclo académico"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del ciclo escolar (opcional)"
              disabled={isLoading || cycle?.isArchived}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          <FormField
            label="Año Académico"
            name="academicYear"
            type="number"
            min={2000}
            max={2099}
            value={formData.academicYear}
            onChange={handleChange}
            placeholder="2025"
            disabled={isLoading || cycle?.isArchived}
            error={errors.academicYear}
            required
            helperText="Año en el que ocurre este ciclo"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></span>
            Período del Ciclo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Fecha de Inicio"
              value={formData.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              error={errors.startDate}
              required
              minDate={minDate}
              maxDate={maxDate}
              placeholder="Seleccionar fecha de inicio"
            />

            <DatePicker
              label="Fecha de Fin"
              value={formData.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              error={errors.endDate}
              required
              minDate={formData.startDate || minDate}
              maxDate={maxDate}
              placeholder="Seleccionar fecha de fin"
            />
          </div>

          {formData.startDate && formData.endDate && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Duración: <span className="font-semibold">
                  {Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))} días
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400"></span>
            Configuración del Ciclo
          </h3>

          <CheckboxCard
            id="isActive"
            label="Activar este ciclo"
            description="Solo puede haber un ciclo activo a la vez en el sistema"
            checked={formData.isActive}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            disabled={isLoading || cycle?.isArchived}
            icon={<CheckCircle className="w-5 h-5" strokeWidth={2.5} />}
            theme={{
              bg: 'bg-blue-50 dark:bg-blue-950/30',
              border: 'border-blue-200 dark:border-blue-800',
              text: 'text-blue-600 dark:text-blue-400',
              icon: 'text-blue-600 dark:text-blue-400',
            }}
          />

          <CheckboxCard
            id="canEnroll"
            label="Permitir matrículas"
            description="Los estudiantes podrán realizar nuevas matrículas durante este período"
            checked={formData.canEnroll}
            onChange={(checked) => setFormData((prev) => ({ ...prev, canEnroll: checked }))}
            disabled={isLoading || cycle?.isArchived}
            icon={<CheckCircle className="w-5 h-5" strokeWidth={2.5} />}
            theme={{
              bg: 'bg-green-50 dark:bg-green-950/30',
              border: 'border-green-200 dark:border-green-800',
              text: 'text-green-600 dark:text-green-400',
              icon: 'text-green-600 dark:text-green-400',
            }}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
              className="transition-all duration-200"
            >
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`flex-1 ${theme.gradient} text-white font-medium rounded-lg transition-all duration-300 ${
              isSubmitDisabled && 'opacity-60 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {cycle ? 'Actualizar Ciclo' : 'Crear Ciclo'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}