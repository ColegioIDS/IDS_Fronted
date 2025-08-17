//src\components\students\sections\EnrollmentSection.tsx
import { useFormContext } from 'react-hook-form';
import { useCallback, memo } from 'react';
import { Separator } from '@/components/ui/separator';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, GraduationCapIcon, UsersIcon } from 'lucide-react';

// ✅ CAMBIO: Recibir datos como props en lugar de usar el hook
interface EnrollmentSectionProps {
  cycles: any[];
  activeCycle: any;
  grades: any[];
  sections: any[];
  onGradeChange: (gradeId: number) => Promise<void>;
}

export const EnrollmentSection = memo(function EnrollmentSection({ 
  cycles, 
  activeCycle, 
  grades, 
  sections, 
  onGradeChange 
}: EnrollmentSectionProps) {
  const { control, watch, setValue } = useFormContext();

  // ✅ DEBUG: Verificar qué datos llegan como props
  console.log('📋 EnrollmentSection props:', {
    cycles: cycles?.length || 0,
    grades: grades?.length || 0,
    sections: sections?.length || 0,
    activeCycle: activeCycle?.name || 'No hay ciclo activo'
  });

  // Observar el grado seleccionado para cargar secciones
  const selectedGradeId = watch('enrollment.gradeId');
  console.log('👀 Grado seleccionado:', selectedGradeId);

  // ✅ CAMBIO: Manejar cambio de grado sin conflictos
  const handleGradeChange = useCallback(async (value: string) => {
    console.log('🔄 Iniciando cambio de grado:', value);
    const gradeId = Number(value);
    
    // Actualizar el valor en el formulario
    setValue('enrollment.gradeId', gradeId);
    
    // Resetear sección cuando cambia el grado
    setValue('enrollment.sectionId', 0);
    
    // Cargar secciones del nuevo grado
    try {
      console.log('🚀 Cargando secciones para grado:', gradeId);
      await onGradeChange(gradeId);
      console.log('✅ Secciones cargadas exitosamente');
    } catch (error) {
      console.error('❌ Error al cargar secciones:', error);
    }
  }, [setValue, onGradeChange]);

  return (
    <>
      <Separator className="my-8 dark:bg-gray-700/80" />
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Asignación Académica</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          
          {/* Ciclo Escolar */}
          <FormField
            control={control}
            name="enrollment.cycleId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="w-4 h-4 opacity-70" />
                  Ciclo Escolar
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString() || ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={!activeCycle} // Deshabilitar si no hay ciclo activo
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Seleccionar ciclo escolar" />
                    </SelectTrigger>
                    <SelectContent>
                      {cycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id.toString()}>
                          <div className="flex items-center gap-2">
                            {cycle.name}
                            {cycle.isActive && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Activo
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
                {activeCycle && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Ciclo activo: {activeCycle.name}
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Grado */}
          <FormField
            control={control}
            name="enrollment.gradeId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCapIcon className="w-4 h-4 opacity-70" />
                  Grado
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString() || ''}
                    onValueChange={handleGradeChange}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades && grades.length > 0 ? (
                        grades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id.toString()}>
                            <div className="flex flex-col">
                              <span>{grade.name}</span>
                              <span className="text-xs text-gray-500">{grade.level}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No hay grados disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Sección */}
          <FormField
            control={control}
            name="enrollment.sectionId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                  <UsersIcon className="w-4 h-4 opacity-70" />
                  Sección
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString() || ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={!selectedGradeId || selectedGradeId === 0}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Seleccionar sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>Sección {section.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              Cap: {section.capacity}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {sections.length === 0 && selectedGradeId > 0 && (
                        <SelectItem value="" disabled>
                          No hay secciones disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
                {!selectedGradeId && (
                  <p className="text-xs text-gray-500">
                    Primero seleccione un grado
                  </p>
                )}
              </FormItem>
            )}
          />

          {/* Estado (oculto, siempre activo para nuevos estudiantes) */}
          <FormField
            control={control}
            name="enrollment.status"
            render={({ field }) => (
              <input type="hidden" {...field} value="active" />
            )}
          />
        </div>

        {/* Información adicional */}
        {selectedGradeId > 0 && sections.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Información de Secciones Disponibles
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {sections.map((section) => (
                <div key={section.id} className="flex justify-between">
                  <span>Sección {section.name}:</span>
                  <span className="font-medium">{section.capacity} estudiantes</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
});