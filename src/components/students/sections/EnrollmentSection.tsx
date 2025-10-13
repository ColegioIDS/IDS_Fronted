//src/components/students/sections/EnrollmentSection.tsx
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
import { CalendarIcon, GraduationCapIcon, UsersIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/types/student';

// ✅ ACTUALIZADO: Props con datos del nuevo endpoint
interface EnrollmentSectionProps {
  activeCycle: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  availableGrades: Array<{
    id: number;
    name: string;
    level: string;
    isActive: boolean;
  }>;
  availableSections: Section[];
  loadingSections: boolean;
  onGradeChange: (gradeId: number) => Promise<void>;
}

export const EnrollmentSection = memo(function EnrollmentSection({ 
  activeCycle,
  availableGrades,
  availableSections,
  loadingSections,
  onGradeChange 
}: EnrollmentSectionProps) {
  const { control, watch, setValue } = useFormContext();

  const selectedGradeId = watch('enrollment.gradeId');
  const selectedCycleId = watch('enrollment.cycleId');

  console.log('📋 EnrollmentSection - Estado:', {
    activeCycle: activeCycle.name,
    availableGrades: availableGrades.length,
    availableSections: availableSections.length,
    selectedGradeId,
    loadingSections
  });

  // ✅ Manejar cambio de grado
  const handleGradeChange = useCallback(async (value: string) => {
    const gradeId = Number(value);
    console.log('🔄 Cambiando grado a:', gradeId);
    
    setValue('enrollment.gradeId', gradeId);
    setValue('enrollment.sectionId', 0);
    
    try {
      await onGradeChange(gradeId);
    } catch (error) {
      console.error('❌ Error al cargar secciones:', error);
    }
  }, [setValue, onGradeChange]);

  // ✅ Filtrar secciones con cupos disponibles
  const sectionsWithSpots = availableSections.filter(s => !s.isFull);
  const fullSections = availableSections.filter(s => s.isFull);

  return (
    <>
      <Separator className="my-8 dark:bg-gray-700/80" />
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Asignación Académica</h2>
        </div>

        {/* ✅ Información del ciclo activo */}
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CalendarIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Ciclo Activo:</strong> {activeCycle.name} ({new Date(activeCycle.startDate).toLocaleDateString()} - {new Date(activeCycle.endDate).toLocaleDateString()})
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          
          {/* Ciclo Escolar - Oculto pero presente */}
          <FormField
            control={control}
            name="enrollment.cycleId"
            render={({ field }) => (
              <input type="hidden" {...field} value={activeCycle.id} />
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
                  Grado <span className="text-red-500">*</span>
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
                      {availableGrades.length > 0 ? (
                        availableGrades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id.toString()}>
                            <div className="flex flex-col">
                              <span>{grade.name}</span>
                              <span className="text-xs text-gray-500">{grade.level}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          No hay grados disponibles para el ciclo actual
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
                {availableGrades.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {availableGrades.length} grados disponibles
                  </p>
                )}
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
                  Sección <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString() || ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={!selectedGradeId || selectedGradeId === 0 || loadingSections}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                      <SelectValue placeholder={
                        loadingSections 
                          ? "Cargando secciones..." 
                          : "Seleccionar sección"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSections ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          Cargando secciones...
                        </div>
                      ) : sectionsWithSpots.length > 0 ? (
                        <>
                          {sectionsWithSpots.map((section) => (
                            <SelectItem key={section.id} value={section.id.toString()}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>Sección {section.name}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {section.availableSpots}/{section.capacity}
                                  </Badge>
                                  {section.teacher && (
                                    <span className="text-xs text-gray-500">
                                      {section.teacher.givenNames}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                          {fullSections.length > 0 && (
                            <>
                              <div className="px-2 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800">
                                Secciones llenas
                              </div>
                              {fullSections.map((section) => (
                                <SelectItem 
                                  key={section.id} 
                                  value={section.id.toString()}
                                  disabled
                                >
                                  <div className="flex items-center justify-between w-full gap-4 opacity-50">
                                    <span>Sección {section.name}</span>
                                    <Badge variant="destructive" className="text-xs">
                                      Llena
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </>
                      ) : selectedGradeId > 0 ? (
                        <div className="p-2 text-sm text-amber-600 text-center">
                          <AlertCircle className="w-4 h-4 inline mr-2" />
                          No hay secciones con cupos disponibles
                        </div>
                      ) : (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          Primero seleccione un grado
                        </div>
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

          {/* Estado - Oculto */}
          <FormField
            control={control}
            name="enrollment.status"
            render={({ field }) => (
              <input type="hidden" {...field} value="active" />
            )}
          />
        </div>

        {/* ✅ Información de secciones disponibles */}
        {selectedGradeId > 0 && availableSections.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Resumen de Secciones
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="default">{sectionsWithSpots.length}</Badge>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Con cupos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{fullSections.length}</Badge>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Llenas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{availableSections.length}</Badge>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Total
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
});