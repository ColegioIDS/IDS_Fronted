// components/schedules/ScheduleCalendarView.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTheme } from 'next-themes';
import type { Schedule, DayOfWeek, ScheduleFormValues } from "@/types/schedules";
import type { 
  DragItem, 
  TimeSlot, 
  TempSchedule, 
  ScheduleChange
} from "@/types/schedules.types";
import type { ScheduleConfig } from "@/types/schedule-config";
import { 
  DEFAULT_TIME_SLOTS,
  ALL_DAYS_OF_WEEK,
  ScheduleTimeGenerator
} from "@/types/schedules.types";

// ✅ NUEVO: Solo usar el hook useSchedule
import { useSchedule } from "@/hooks/useSchedule";

import { ScheduleHeader } from "./calendar/ScheduleHeader";
import { ScheduleSidebar } from "./calendar/ScheduleSidebar";
import { ScheduleGrid } from "./calendar/ScheduleGrid";
import { toast } from "sonner";

interface ScheduleCalendarViewProps {
  selectedSectionId?: number;
  onScheduleClick?: (schedule: Schedule) => void;
  onCreateSchedule?: (data: Partial<ScheduleFormValues>) => Promise<{ success: boolean; message?: string; }>;
  onUpdateSchedule?: (id: number, data: Partial<ScheduleFormValues>) => Promise<{ success: boolean; message?: string; }>;
  onDeleteSchedule?: (id: number) => Promise<void>;
  onBatchSave?: (changes: ScheduleChange[]) => Promise<{ success: boolean; }>;
  className?: string;
}

export function ScheduleCalendarView({
  selectedSectionId,
  onScheduleClick,
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onBatchSave,
  className = ""
}: ScheduleCalendarViewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedSection, setSelectedSection] = useState<number>(selectedSectionId || 0);
  const [tempSchedules, setTempSchedules] = useState<TempSchedule[]>([]);
  const [pendingChanges, setPendingChanges] = useState<ScheduleChange[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ NUEVO: Usar el hook consolidado
const { 
  formData,
  schedules,
  teacherAvailability,
  isLoading,
  loadFormData 
} = useSchedule({ 
  autoLoadFormData: true,        // ✅ AGREGAR
  autoLoadAvailability: true     // ✅ AGREGAR
});

  // ✅ NUEVO: Extraer datos del formData consolidado
  const sections = formData?.grades.flatMap(grade => grade.sections) || [];
  console.log('📚 Sections disponibles:', formData)  ;
  const courses = formData?.grades.flatMap(grade => grade.courses) || [];
  const allTeachers = formData?.teachers || [];
  
  // ✅ NUEVO: Filtrar profesores disponibles (sin horarios asignados en la sección actual)
  const teachers = useMemo(() => {
    if (!selectedSection || !teacherAvailability) return allTeachers;
    
    // Obtener IDs de profesores ya asignados en esta sección
    const assignedTeacherIds = schedules
      .filter(s => s.sectionId === selectedSection && s.teacherId)
      .map(s => s.teacherId);
    
    // Retornar todos los profesores (pueden estar asignados en otras secciones)
    // La disponibilidad se maneja en el sidebar
    return allTeachers;
  }, [allTeachers, selectedSection, schedules, teacherAvailability]);

  // ✅ NUEVO: Obtener configuración de la sección seleccionada
  const currentConfig = useMemo(() => {
    if (!selectedSection || !formData?.scheduleConfigs) return null;
    return formData.scheduleConfigs.find(config => config.sectionId === selectedSection) || null;
  }, [selectedSection, formData?.scheduleConfigs]);

  console.log('🎯 ScheduleCalendarView - Teachers:', {
    allTeachers: allTeachers.length,
    availableForSidebar: teachers.length,
    selectedSection
  });

  // Función para convertir workingDays de formato [0-6] a [1-7]
  const convertWorkingDaysToMyFormat = (workingDays: any): number[] => {
    if (!Array.isArray(workingDays)) return [1, 2, 3, 4, 5]; // Default Lun-Vie
    return workingDays.map((day: number) => day === 0 ? 7 : day);
  };

  // Función para convertir de formato [1-7] a [0-6]
  const convertWorkingDaysToYourFormat = (workingDays: number[]): number[] => {
    return workingDays.map(day => day === 7 ? 0 : day);
  };

  // Adaptador para BreakSlots
  const adaptBreakSlots = (breakSlots: any): import("@/types/schedules.types").BreakSlot[] => {
    if (!Array.isArray(breakSlots)) return [];
    return breakSlots.map((slot: any) => ({
      start: slot.start,
      end: slot.end,
      label: slot.label || 'DESCANSO'
    }));
  };

  // Generar timeSlots dinámicamente
  const dynamicTimeSlots = useMemo((): TimeSlot[] => {
    if (!selectedSection || selectedSection === 0) {
      console.log('🔍 Sin sección seleccionada, usando DEFAULT_TIME_SLOTS');
      return DEFAULT_TIME_SLOTS;
    }

    if (!currentConfig) {
      console.log('🔍 Sin configuración para sección', selectedSection, ', usando DEFAULT_TIME_SLOTS');
      return DEFAULT_TIME_SLOTS;
    }

    try {
      console.log('🔍 Generando slots con configuración:', {
        startTime: currentConfig.startTime,
        endTime: currentConfig.endTime,
        classDuration: currentConfig.classDuration,
        breakSlots: currentConfig.breakSlots
      });
      
      const generatedSlots = ScheduleTimeGenerator.generateTimeSlots({
        startTime: currentConfig.startTime,
        endTime: currentConfig.endTime,
        classDuration: currentConfig.classDuration,
        breakSlots: adaptBreakSlots(currentConfig.breakSlots)
      });
      
      console.log('🔍 Slots generados:', generatedSlots.length);
      return generatedSlots;
    } catch (error) {
      console.error('🔴 Error generando timeSlots:', error);
      return DEFAULT_TIME_SLOTS;
    }
  }, [selectedSection, currentConfig]);

  // Generar días de trabajo dinámicamente
  const dynamicWorkingDays = useMemo(() => {
    console.log('🔍 Generando dynamicWorkingDays para sección:', selectedSection);
    
    if (!selectedSection || selectedSection === 0 || !currentConfig) {
      console.log('🔍 Sin config, usando días por defecto (Lun-Vie)');
      return ALL_DAYS_OF_WEEK.filter(day => [1, 2, 3, 4, 5].includes(day.value));
    }

    const convertedDays = convertWorkingDaysToMyFormat(currentConfig.workingDays);
    const filteredDays = ALL_DAYS_OF_WEEK.filter(day => convertedDays.includes(day.value));
    
    console.log('🔍 Días de config:', currentConfig.workingDays);
    console.log('🔍 Días convertidos:', convertedDays);
    console.log('🔍 Días filtrados:', filteredDays.map(d => d.label));
    
    return filteredDays;
  }, [selectedSection, currentConfig]);

  // Combinar horarios reales y temporales
  const allSchedules = useMemo(() => {
    if (!selectedSection) return [];
    
    const realSchedules = schedules?.filter(schedule => 
      schedule.sectionId === selectedSection
    ) || [];
    
    const sectionTempSchedules = tempSchedules.filter(schedule => 
      schedule.sectionId === selectedSection
    );

    const schedulesToDelete = pendingChanges
      .filter(change => change.action === 'delete')
      .map(change => change.schedule.id);

    const filteredRealSchedules = realSchedules.filter(
      schedule => !schedulesToDelete.includes(schedule.id)
    );

    const filteredTempSchedules = sectionTempSchedules.filter(
      schedule => !schedulesToDelete.includes(schedule.id)
    );

    console.log('AllSchedules combinados:', {
      realSchedules: filteredRealSchedules.length,
      tempSchedules: filteredTempSchedules.length,
      total: filteredRealSchedules.length + filteredTempSchedules.length
    });

    return [...filteredRealSchedules, ...filteredTempSchedules];
  }, [schedules, selectedSection, tempSchedules, pendingChanges]);

  // Organizar horarios por día y horario
  const scheduleGrid = useMemo(() => {
    const grid: { [key: string]: (Schedule | TempSchedule)[] } = {};
    
    const validDays = dynamicWorkingDays.map(d => d.value);
    
    allSchedules
      .filter(schedule => validDays.includes(schedule.dayOfWeek))
      .forEach((schedule) => {
        const key = `${schedule.dayOfWeek}-${schedule.startTime}`;
        if (!grid[key]) {
          grid[key] = [];
        }
        grid[key].push(schedule);
      });
    
    console.log('Schedule Grid generado:', {
      totalSlots: Object.keys(grid).length,
      workingDays: validDays,
      timeSlots: dynamicTimeSlots.length
    });
    
    return grid;
  }, [allSchedules, dynamicWorkingDays, dynamicTimeSlots]);

  // Calcular horas de maestros
  const teacherHours = useMemo(() => {
    const hours: { [key: number]: number } = {};
    
    allSchedules.forEach((schedule) => {
      if (schedule.teacherId) {
        const startTime = new Date(`2000-01-01T${schedule.startTime}:00`);
        const endTime = new Date(`2000-01-01T${schedule.endTime}:00`);
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        hours[schedule.teacherId] = (hours[schedule.teacherId] || 0) + duration;
      }
    });
    
    return hours;
  }, [allSchedules]);

  // Generar ID temporal
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // ✅ AGREGAR: Handler para guardar configuración
const handleConfigSave = useCallback(async (config: any) => {
  try {
    // Aquí llamarías a tu endpoint de configuración
    // Por ahora, solo mostramos que funciona
    console.log('💾 Guardando configuración:', config);
    
    toast.success('Configuración guardada exitosamente');
    
    // Recargar datos para reflejar cambios
    await loadFormData();
  } catch (error) {
    console.error('Error guardando configuración:', error);
    toast.error('Error al guardar configuración');
  }
}, [loadFormData]);

  // Manejar drop de elementos
  const handleDrop = useCallback((item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => {
    if (!selectedSection) return;
    
    // Validar día
    if (currentConfig) {
      const convertedDays = convertWorkingDaysToMyFormat(currentConfig.workingDays);
      if (!convertedDays.includes(day)) {
        const allowedDays = convertedDays.map(d => 
          ALL_DAYS_OF_WEEK.find(dayObj => dayObj.value === d)?.label
        ).join(', ');
        toast.error(`El día seleccionado no está configurado. Días permitidos: ${allowedDays}`);
        return;
      }
    }
    
    // Validar que no sea break
    if (timeSlot.isBreak || timeSlot.label.includes("RECREO") || timeSlot.label.includes("ALMUERZO")) {
      toast.warning('No se puede asignar en horarios de recreo/almuerzo');
      return;
    }

    const existingSchedule = tempSchedules.find(
      s => s.dayOfWeek === day && s.startTime === timeSlot.start && s.sectionId === selectedSection
    );

    const section = sections?.find(s => s.id === selectedSection);

    if (item.type === 'course') {
      const course = item.data as any;

      if (existingSchedule) {
        const updatedSchedule: TempSchedule = {
          ...existingSchedule,
          courseId: item.id,
          course: {
            id: course.id,
            name: course.name
          },
        };
        
        setTempSchedules(prev =>
          prev.map(s => s.id === existingSchedule.id ? updatedSchedule : s)
        );
        
        setPendingChanges(prev =>
          prev.map(change =>
            change.schedule.id === existingSchedule.id
              ? { ...change, schedule: updatedSchedule }
              : change
          )
        );
      } else {
        const tempSchedule: TempSchedule = {
          id: generateTempId(),
          sectionId: selectedSection,
          courseId: item.id,
          teacherId: null,
          dayOfWeek: day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          classroom: null,
          course: {
            id: course.id,
            name: course.name
          },
          teacher: null,
          section,
          isTemp: true,
        };
        
        setTempSchedules(prev => [...prev, tempSchedule]);
        setPendingChanges(prev => [...prev, {
          action: 'create',
          schedule: tempSchedule
        }]);
      }
      
    } else if (item.type === 'teacher') {
      const teacher = item.data as any;

      if (existingSchedule) {
        const updatedSchedule: TempSchedule = {
          ...existingSchedule,
          teacherId: item.id,
          teacher: {
            id: teacher.id,
            name: item.name
          },
        };
        
        setTempSchedules(prev =>
          prev.map(s => s.id === existingSchedule.id ? updatedSchedule : s)
        );
        
        setPendingChanges(prev =>
          prev.map(change =>
            change.schedule.id === existingSchedule.id
              ? { ...change, schedule: updatedSchedule }
              : change
          )
        );
      } else {
        const tempSchedule: TempSchedule = {
          id: generateTempId(),
          sectionId: selectedSection,
          courseId: null,
          teacherId: item.id,
          dayOfWeek: day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          classroom: null,
          course: null,
          teacher: {
            id: teacher.id,
            name: item.name
          },
          section,
          isTemp: true,
        };
        
        setTempSchedules(prev => [...prev, tempSchedule]);
        setPendingChanges(prev => [...prev, {
          action: 'create',
          schedule: tempSchedule
        }]);
      }
      
    } else if (item.type === 'schedule') {
      const existingScheduleToMove = item.data as Schedule | TempSchedule;
      
      if ('isTemp' in existingScheduleToMove && existingScheduleToMove.isTemp) {
        const updatedSchedule: TempSchedule = {
          ...existingScheduleToMove,
          dayOfWeek: day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
        };
        
        setTempSchedules(prev => 
          prev.map(s => s.id === existingScheduleToMove.id ? updatedSchedule : s)
        );
        
        setPendingChanges(prev => 
          prev.map(change => 
            change.schedule.id === existingScheduleToMove.id 
              ? { ...change, schedule: updatedSchedule }
              : change
          )
        );
      } else {
        const updatedSchedule = {
          ...existingScheduleToMove,
          dayOfWeek: day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
        } as Schedule;
        
        setPendingChanges(prev => {
          const existingChangeIndex = prev.findIndex(
            change => change.schedule.id === existingScheduleToMove.id && change.action === 'update'
          );
          
          if (existingChangeIndex >= 0) {
            const newChanges = [...prev];
            newChanges[existingChangeIndex] = {
              action: 'update',
              schedule: updatedSchedule,
              originalSchedule: existingScheduleToMove as Schedule
            };
            return newChanges;
          } else {
            return [...prev, {
              action: 'update',
              schedule: updatedSchedule,
              originalSchedule: existingScheduleToMove as Schedule
            }];
          }
        });
      }
    }
  }, [selectedSection, sections, tempSchedules, currentConfig]);

  // Manejar eliminación
  const handleScheduleDelete = useCallback((id: string | number) => {
    console.log('🔴 Eliminando schedule:', id);
    
    if (typeof id === 'string') {
      setTempSchedules(prev => prev.filter(s => s.id !== id));
      setPendingChanges(prev => prev.filter(change => change.schedule.id !== id));
    } else {
      const schedule = schedules?.find(s => s.id === id);
      if (schedule) {
        setPendingChanges(prev => {
          const existingChangeIndex = prev.findIndex(
            change => change.schedule.id === id
          );
          
          if (existingChangeIndex >= 0) {
            const newChanges = [...prev];
            newChanges[existingChangeIndex] = {
              action: 'delete',
              schedule: schedule,
              originalSchedule: schedule
            };
            return newChanges;
          } else {
            return [...prev, {
              action: 'delete',
              schedule: schedule,
              originalSchedule: schedule
            }];
          }
        });
      }
    }
  }, [schedules]);

  // Guardar todos los cambios
  const handleSaveAll = useCallback(async () => {
    if (pendingChanges.length === 0 && tempSchedules.length === 0) return;

    setIsSaving(true);
    try {
      if (onBatchSave) {
        const result = await onBatchSave(pendingChanges);
        if (!result.success) {
          throw new Error('Error en guardado masivo');
        }
      } else {
        for (const change of pendingChanges) {
          switch (change.action) {
            case 'create':
              if (onCreateSchedule && change.schedule.courseId && change.schedule.sectionId) {
                await onCreateSchedule({
                  sectionId: change.schedule.sectionId,
                  courseId: change.schedule.courseId,
                  teacherId: change.schedule.teacherId,
                  dayOfWeek: change.schedule.dayOfWeek,
                  startTime: change.schedule.startTime,
                  endTime: change.schedule.endTime,
                  classroom: change.schedule.classroom || undefined,
                });
              }
              break;
            case 'update':
              if (onUpdateSchedule && typeof change.schedule.id === 'number') {
                await onUpdateSchedule(change.schedule.id, {
                  sectionId: change.schedule.sectionId,
                  courseId: change.schedule.courseId || undefined,
                  teacherId: change.schedule.teacherId,
                  dayOfWeek: change.schedule.dayOfWeek,
                  startTime: change.schedule.startTime,
                  endTime: change.schedule.endTime,
                  classroom: change.schedule.classroom || undefined,
                });
              }
              break;
            case 'delete':
              if (onDeleteSchedule && typeof change.schedule.id === 'number') {
                await onDeleteSchedule(change.schedule.id);
              }
              break;
          }
        }
      }

      setTempSchedules([]);
      setPendingChanges([]);
      await loadFormData(); // Refrescar datos
      
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, tempSchedules, onBatchSave, onCreateSchedule, onUpdateSchedule, onDeleteSchedule, loadFormData]);

  const handleDiscardChanges = useCallback(() => {
    setTempSchedules([]);
    setPendingChanges([]);
  }, []);

  const handleSectionChange = useCallback((value: string) => {
    const newSectionId = parseInt(value);
    
    if (pendingChanges.length > 0 || tempSchedules.length > 0) {
      if (confirm('Tienes cambios sin guardar. ¿Deseas descartarlos?')) {
        handleDiscardChanges();
        setSelectedSection(newSectionId);
      }
    } else {
      setSelectedSection(newSectionId);
    }
  }, [pendingChanges, tempSchedules, handleDiscardChanges]);

  const hasUnsavedChanges = pendingChanges.length > 0 || tempSchedules.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center space-y-4">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto ${
            isDark ? 'border-blue-400' : 'border-blue-500'
          }`}></div>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Cargando información...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-4 min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
    } ${className}`}>
<ScheduleHeader
  selectedSection={selectedSection}
  sections={sections} // ✅ SIMPLE: Sin adaptadores
  totalSchedules={allSchedules.length}
  pendingChanges={pendingChanges.length}
  isSaving={isSaving}
  hasUnsavedChanges={hasUnsavedChanges}
  currentConfig={currentConfig} // ✅ SIMPLE: Sin adaptadores
  onSectionChange={handleSectionChange}
  onSaveAll={handleSaveAll}
  onDiscardChanges={handleDiscardChanges}
  onConfigSave={handleConfigSave}
/>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ScheduleSidebar
            courses={courses}
            teachers={teachers}
            teacherHours={teacherHours}
            pendingChanges={pendingChanges}
            tempSchedulesCount={tempSchedules.length}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>

        <div className="lg:col-span-3">
          <ScheduleGrid
            scheduleGrid={scheduleGrid}
            pendingChanges={pendingChanges}
            timeSlots={dynamicTimeSlots}
            workingDays={dynamicWorkingDays}
            onDrop={handleDrop}
            onScheduleEdit={(schedule) => onScheduleClick?.(schedule as Schedule)}
            onScheduleDelete={handleScheduleDelete}
          />
        </div>
      </div>
    </div>
  );
}