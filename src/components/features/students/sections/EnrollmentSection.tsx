//src/components/features/students/sections/EnrollmentSection.tsx
import { useFormContext } from 'react-hook-form';
import { useCallback, memo, useMemo } from 'react';
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
import { CalendarIcon, GraduationCapIcon, UsersIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface EnrollmentSectionProps {
  activeCycle?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    grades?: Array<{
      id: number;
      name: string;
      level: string;
      order: number;
      sections?: Array<{
        id: number;
        name: string;
        capacity: number;
        gradeId: number;
        teacher?: any;
      }>;
    }>;
  };
  allCycles?: Array<{
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    grades?: any[];
  }>;
  availableSections?: any[];
  loadingSections?: boolean;
  onGradeChange?: (gradeId: number) => Promise<void>;
}

export const EnrollmentSection = memo(function EnrollmentSection({ 
  activeCycle,
  allCycles,
  availableSections,
  loadingSections,
  onGradeChange 
}: EnrollmentSectionProps) {
  const { control, watch, setValue } = useFormContext();

  const selectedGradeId = watch('enrollment.gradeId');
  const selectedCycleId = watch('enrollment.cycleId');

  const availableCycles = allCycles || (activeCycle ? [activeCycle] : []);
  
  // Asegurar que selectedCycleId sea un número para comparación correcta
  const cycleIdAsNumber = typeof selectedCycleId === 'string' ? Number(selectedCycleId) : selectedCycleId;
  
  const selectedCycle = availableCycles.find(c => c.id === cycleIdAsNumber) || activeCycle;
  const availableGrades = selectedCycle?.grades || [];

  const handleGradeChange = useCallback((value: string) => {
    const gradeId = Number(value);
    setValue('enrollment.gradeId', gradeId);
    setValue('enrollment.sectionId', 0);
    
    if (onGradeChange) {
      onGradeChange(gradeId).catch((error) => {
      });
    }
  }, [setValue, onGradeChange]);

  const sectionsForSelectedGrade = useMemo(() => {
    if (!selectedGradeId) return [];
    const selectedGrade = availableGrades.find(g => g.id === selectedGradeId);
    return selectedGrade?.sections || [];
  }, [selectedGradeId, availableGrades]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Separator className="my-12 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      
      <div className="space-y-6">
        {/* Header con ícono y título */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <CalendarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Asignación Académica
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Ciclo, grado y sección del estudiante
            </p>
          </div>
        </div>

        {/* Alert del ciclo activo - Mejorado */}
        {activeCycle && (
          <div className="relative overflow-hidden rounded-lg border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-50/70 dark:from-blue-950/30 dark:to-blue-950/20 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-gray-100">Ciclo Activo:</strong> 
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                  {activeCycle.name} 
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                    ({formatDate(activeCycle.startDate)} - {formatDate(activeCycle.endDate)})
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid de selecciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Ciclo Escolar */}
          <FormField
            control={control}
            name="enrollment.cycleId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Ciclo Escolar <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString() || ''}
                    onValueChange={(value) => {
                      const cycleId = Number(value);
                      field.onChange(cycleId);
                      setValue('enrollment.gradeId', 0);
                      setValue('enrollment.sectionId', 0);
                    }}
                  >
                    <SelectTrigger className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:border-orange-400 dark:hover:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0 dark:focus:ring-orange-400 transition-colors">
                      <SelectValue placeholder="Seleccionar ciclo" />
                    </SelectTrigger>
                    <SelectContent className="border border-gray-200 dark:border-gray-700">
                      {availableCycles.length > 0 ? (
                        availableCycles.map((cycle) => (
                          <SelectItem 
                            key={cycle.id} 
                            value={cycle.id.toString()}
                            className="py-2 text-sm"
                          >
                            <span>{cycle.name}</span>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-center text-gray-500">
                          No hay ciclos
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Grado */}
          <FormField
            control={control}
            name="enrollment.gradeId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCapIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Grado <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString() || ''}
                    onValueChange={handleGradeChange}
                  >
                    <SelectTrigger className="w-full h-10 px-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:border-orange-400 dark:hover:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0 dark:focus:ring-orange-400 transition-colors">
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent className="border border-gray-200 dark:border-gray-700">
                      {availableGrades.length > 0 ? (
                        availableGrades.map((grade) => (
                          <SelectItem 
                            key={grade.id} 
                            value={grade.id.toString()}
                            className="py-2 text-sm"
                          >
                            <span>{grade.name}</span>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-center text-gray-500">
                          No hay grados
                        </div>
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
                <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Sección <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString() || ''}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={!selectedGradeId || sectionsForSelectedGrade.length === 0}
                  >
                    <SelectTrigger className={`w-full h-10 px-3 text-sm rounded-md border transition-colors ${
                      !selectedGradeId || sectionsForSelectedGrade.length === 0
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0 dark:focus:ring-orange-400'
                    }`}>
                      <SelectValue placeholder="Seleccionar sección" />
                    </SelectTrigger>
                    <SelectContent className="border border-gray-200 dark:border-gray-700">
                      {sectionsForSelectedGrade.length > 0 ? (
                        sectionsForSelectedGrade.map((section: any) => (
                          <SelectItem 
                            key={section.id} 
                            value={section.id.toString()}
                            className="py-2 text-sm"
                          >
                            <span>{section.name}</span>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-center text-gray-500">
                          {selectedGradeId ? 'No hay secciones' : 'Selecciona grado'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
});