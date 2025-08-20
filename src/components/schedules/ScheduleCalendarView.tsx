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

// 🔥 CAMBIO: Usar contextos en lugar de useScheduleIntegration
import { useScheduleContext } from "@/context/ScheduleContext";
import { useSectionContext } from "@/context/SectionsContext";
import { useCourseContext } from "@/context/CourseContext";
import { useTeacherAvailabilityContext } from "@/context/TeacherContext";

import { useGradeScheduleConfigContext } from "@/context/ScheduleConfigContext";
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
  onBatchSave?: (changes: ScheduleChange[]) => Promise<{ success: boolean; }>; // Cambiar de void a objeto
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

  // 🔥 CAMBIO: Usar contextos individuales
  const { state: scheduleState, refreshSchedules } = useScheduleContext();
  const { state: sectionState } = useSectionContext();
  const { state: courseState } = useCourseContext();
  const { availableTeachers, assignedTeachers } = useTeacherAvailabilityContext();

  // 🔥 CAMBIO: Extraer datos de los contextos
  const schedules = scheduleState.schedules;
  const sections = sectionState.sections;
  const courses = courseState.courses;
  
  // 🔥 IMPORTANTE: Para el sidebar, solo mostrar profesores disponibles (que se pueden arrastrar)
  // 🔥 VALIDACIÓN: Garantizar que siempre sea un array
  const teachers = Array.isArray(availableTeachers) ? availableTeachers : [];
  
  // 🔥 CAMBIO: Determinar loading desde contextos
  const loading = {
    anyLoading: scheduleState.loading || sectionState.loading || courseState.loading
  };

  // 🔥 CAMBIO: Función de refresh actualizada
  const refreshAllData = async () => {
    await refreshSchedules();
    // Los otros contextos se manejan automáticamente
  };

  console.log('🎯 ScheduleCalendarView - Teachers for sidebar:', {
    availableTeachers: availableTeachers?.length || 0,
    assignedTeachers: assignedTeachers?.length || 0,
    teachersForSidebar: teachers.length
  });
  
  // Mantener el context específico de configuración
  const gradeScheduleContext = useGradeScheduleConfigContext();

  // Extraer propiedades específicas para configuración de horarios
  const currentConfig = gradeScheduleContext.state.currentScheduleConfig;
  const configsLoading = gradeScheduleContext.state.loading.general;
  const fetchConfigBySection = gradeScheduleContext.fetchScheduleConfigBySection;
  const createConfig = gradeScheduleContext.createScheduleConfig;
  const updateConfig = gradeScheduleContext.updateScheduleConfig;

  // Función para convertir workingDays de tu formato [0-6] a mi formato [1-7]
  const convertWorkingDaysToMyFormat = (workingDays: number[]): number[] => {
    return workingDays.map(day => day === 0 ? 7 : day); // 0 (domingo) -> 7, resto igual
  };

  // Función para convertir de mi formato [1-7] a tu formato [0-6]
  const convertWorkingDaysToYourFormat = (workingDays: number[]): number[] => {
    return workingDays.map(day => day === 7 ? 0 : day); // 7 (domingo) -> 0, resto igual
  };

  // Adaptador para convertir BreakSlots entre tipos
  const adaptBreakSlots = (breakSlots: import("@/types/schedule-config").BreakSlot[]): import("@/types/schedules.types").BreakSlot[] => {
    return breakSlots.map(slot => ({
      start: slot.start,
      end: slot.end,
      label: slot.label || 'DESCANSO' // Asegurar que label no sea undefined
    }));
  };

  // Generar timeSlots dinámicamente basado en la configuración de la sección
  const dynamicTimeSlots = useMemo((): TimeSlot[] => {
    
    if (!selectedSection || selectedSection === 0) {
      console.log('🔍 Sin sección seleccionada, usando DEFAULT_TIME_SLOTS');
      return DEFAULT_TIME_SLOTS;
    }

    if (!currentConfig) {
      console.log('🔍 Sin configuración para sección', selectedSection, ', usando DEFAULT_TIME_SLOTS');
      return DEFAULT_TIME_SLOTS;
    }

    // Generar slots dinámicamente
    try {
      console.log('🔍 Usando generador con configuración:', {
        startTime: currentConfig.startTime,
        endTime: currentConfig.endTime,
        classDuration: currentConfig.classDuration,
        breakSlots: currentConfig.breakSlots
      });
      
      const generatedSlots = ScheduleTimeGenerator.generateTimeSlots({
        startTime: currentConfig.startTime,
        endTime: currentConfig.endTime,
        classDuration: currentConfig.classDuration,
        breakSlots: adaptBreakSlots(currentConfig.breakSlots) // Usar adaptador
      });
      
      console.log('🔍 Slots generados exitosamente:', generatedSlots.length, 'slots');
      return generatedSlots;
    } catch (error) {
      console.error('🔴 Error generando timeSlots dinámicos:', error);
      console.log('🔍 Fallback a DEFAULT_TIME_SLOTS debido al error');
      return DEFAULT_TIME_SLOTS;
    }
  }, [selectedSection, currentConfig]);

  // Generar días de trabajo dinámicamente
  const dynamicWorkingDays = useMemo(() => {
    console.log('🔍 Generando dynamicWorkingDays para sección:', selectedSection);
    
    if (!selectedSection || selectedSection === 0) {
      console.log('🔍 Sin sección, usando días por defecto (Lun-Vie)');
      return ALL_DAYS_OF_WEEK.filter(day => [1, 2, 3, 4, 5].includes(day.value));
    }

    if (!currentConfig) {
      console.log('🔍 Sin config, usando días por defecto (Lun-Vie)');
      return ALL_DAYS_OF_WEEK.filter(day => [1, 2, 3, 4, 5].includes(day.value));
    }

    // Convertir workingDays de tu formato [0-6] a mi formato [1-7]
    const convertedDays = convertWorkingDaysToMyFormat(currentConfig.workingDays);
    const filteredDays = ALL_DAYS_OF_WEEK.filter(day => convertedDays.includes(day.value));
    
    console.log('🔍 Días de tu config:', currentConfig.workingDays);
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

    // Filtrar schedules que están marcados para eliminar en pendingChanges
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
      total: filteredRealSchedules.length + filteredTempSchedules.length,
      schedulesToDelete: schedulesToDelete.length,
      workingDays: dynamicWorkingDays.map(d => d.label).join(', '),
      timeSlots: dynamicTimeSlots.length
    });

    return [...filteredRealSchedules, ...filteredTempSchedules];
  }, [schedules, selectedSection, tempSchedules, pendingChanges, dynamicWorkingDays, dynamicTimeSlots]);

  // Organizar horarios por día y horario
  const scheduleGrid = useMemo(() => {
    const grid: { [key: string]: (Schedule | TempSchedule)[] } = {};
    
    // Solo considerar schedules de días que están configurados
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
    
    console.log('Schedule Grid generado con configuración dinámica:', {
      totalSlots: Object.keys(grid).length,
      workingDays: validDays,
      timeSlots: dynamicTimeSlots.length
    });
    
    return grid;
  }, [allSchedules, dynamicWorkingDays, dynamicTimeSlots]);

  // 🔥 CAMBIO: Calcular horas considerando todos los profesores (disponibles + asignados)
  const teacherHours = useMemo(() => {
    const hours: { [key: number]: number } = {};
    
    // Combinar profesores disponibles y asignados para mostrar sus horas
    const allTeachers = [
      ...(availableTeachers || []),
      ...(assignedTeachers || [])
    ];
    
    // Eliminar duplicados
    const uniqueTeachers = allTeachers.reduce((acc, teacher) => {
      if (!acc.find(t => t.id === teacher.id)) {
        acc.push(teacher);
      }
      return acc;
    }, [] as typeof allTeachers);
    
    allSchedules.forEach((schedule) => {
      if (schedule.teacherId && uniqueTeachers.find(t => t.id === schedule.teacherId)) {
        const startTime = new Date(`2000-01-01T${schedule.startTime}:00`);
        const endTime = new Date(`2000-01-01T${schedule.endTime}:00`);
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        hours[schedule.teacherId] = (hours[schedule.teacherId] || 0) + duration;
      }
    });
    
    return hours;
  }, [allSchedules, availableTeachers, assignedTeachers]);

  // Generar ID temporal único
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Función para manejar guardado de configuración usando tu infraestructura
  const handleConfigSave = useCallback(async (config: ScheduleConfig) => {
    console.log('🟢 ===== GUARDANDO CONFIGURACIÓN =====');
    console.log('🟢 Config recibida:', config);
    
    try {
      setIsSaving(true);
      
      // Convertir workingDays de mi formato [1-7] a tu formato [0-6]
      const configToSave = {
        ...config,
        workingDays: convertWorkingDaysToYourFormat(config.workingDays)
      };
      
      console.log('🟢 Config convertida para tu API:', configToSave);
      
      let result;
      if (currentConfig?.id) {
        // Actualizar existente
        console.log('🟢 Actualizando configuración existente ID:', currentConfig.id);
        result = await updateConfig(currentConfig.id, configToSave);
      } else {
        // Crear nueva
        console.log('🟢 Creando nueva configuración');
        result = await createConfig(configToSave);
      }
      
      if (result.success) {
        console.log('🟢 ✅ Configuración guardada exitosamente:', result);
        
        // Limpiar schedules temporales si la configuración cambió significativamente
        if (tempSchedules.length > 0) {
          const shouldClearSchedules = confirm(
            'La configuración de horarios ha cambiado. ¿Deseas limpiar los horarios temporales actuales?'
          );
          
          if (shouldClearSchedules) {
            setTempSchedules([]);
            setPendingChanges([]);
          }
        }
      } else {
        console.error('🔴 Error del servidor:', result.message);
        alert(`Error al guardar: ${result.message}`);
      }
    } catch (error: any) {
      console.error('🔴 Error guardando configuración:', error);
      alert('Error al guardar la configuración. Verifica tu conexión.');
    } finally {
      setIsSaving(false);
    }
  }, [currentConfig, updateConfig, createConfig, tempSchedules]);

  // Cargar configuración automáticamente al cambiar de sección
  useEffect(() => {
    if (selectedSection > 0) {
      console.log('🔄 Cargando configuración para nueva sección:', selectedSection);
      fetchConfigBySection(selectedSection).then(() => {
        console.log('📋 Configuración cargada automáticamente');
      }).catch((error: any) => {
        console.log('📋 Error cargando configuración o no existe:', error.message);
      });
    }
  }, [selectedSection, fetchConfigBySection]);

  // Manejar drop de elementos - ACTUALIZADO para validar configuración dinámica
  const handleDrop = useCallback((item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => {
    if (!selectedSection) return;
    
    // Validar que el día esté en los días de trabajo configurados
    if (currentConfig) {
      const convertedDays = convertWorkingDaysToMyFormat(currentConfig.workingDays);
      if (!convertedDays.includes(day)) {
        console.warn('⚠️ Día no configurado para esta sección:', day);
        const allowedDays = convertedDays.map(d => 
          ALL_DAYS_OF_WEEK.find(dayObj => dayObj.value === d)?.label
        ).join(', ');
        alert(`El día seleccionado no está configurado para esta sección. Días permitidos: ${allowedDays}`);
        return;
      }
    }
    
    // Validar que no sea un break slot
    if (timeSlot.isBreak || timeSlot.label.includes("RECREO") || timeSlot.label.includes("ALMUERZO")) {
      console.warn('⚠️ No se puede arrastrar a un slot de recreo/almuerzo');
      return;
    }

    // Buscar schedule existente en ese slot para esta sección
    const existingSchedule = tempSchedules.find(
      s => s.dayOfWeek === day && s.startTime === timeSlot.start && s.sectionId === selectedSection
    );

    const section = sections?.find(s => s.id === selectedSection);

    if (item.type === 'course') {
      const course = item.data as any;

      if (existingSchedule) {
        // ACTUALIZAR el curso del schedule existente
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
        // CREAR nuevo schedule con solo curso
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
        
        console.log('Creando schedule temporal de curso:', tempSchedule);
        setTempSchedules(prev => [...prev, tempSchedule]);
        setPendingChanges(prev => [...prev, {
          action: 'create',
          schedule: tempSchedule
        }]);
      }
      
    } else if (item.type === 'teacher') {
      const teacher = item.data as any;

      if (existingSchedule) {
        // ACTUALIZAR el maestro del schedule existente
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
        // CREAR nuevo schedule con solo maestro
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
        
        console.log('Creando schedule temporal de profesor:', tempSchedule);
        setTempSchedules(prev => [...prev, tempSchedule]);
        setPendingChanges(prev => [...prev, {
          action: 'create',
          schedule: tempSchedule
        }]);
      }
      
    } else if (item.type === 'schedule') {
      // Mover schedule existente
      const existingScheduleToMove = item.data as Schedule | TempSchedule;
      console.log('Moviendo schedule existente:', existingScheduleToMove);
      
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

  // Manejar eliminación de horarios
  const handleScheduleDelete = useCallback((id: string | number) => {
    console.log('🔴 handleScheduleDelete EJECUTADO con ID:', id, 'tipo:', typeof id);
    
    if (typeof id === 'string') {
      console.log('🔴 Eliminando schedule temporal:', id);
      
      setTempSchedules(prev => {
        const filtered = prev.filter(s => s.id !== id);
        console.log('🔴 TempSchedules después del filter:', filtered.length, 'antes:', prev.length);
        return filtered;
      });

      setPendingChanges(prev => {
        const filtered = prev.filter(change => change.schedule.id !== id);
        console.log('🔴 PendingChanges después del filter:', filtered.length);
        return filtered;
      });
      
    } else {
      console.log('🔴 Procesando eliminación de schedule real:', id);
      const schedule = schedules?.find(s => s.id === id);
      if (schedule) {
        console.log('🔴 Schedule encontrado para eliminar:', schedule);
        
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
      } else {
        console.log('🔴 ⚠️ Schedule no encontrado para ID:', id);
      }
    }
  }, [schedules]);

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
        // Fallback a operaciones individuales
        for (const change of pendingChanges) {
          switch (change.action) {
            case 'create':
              if (onCreateSchedule && change.schedule.courseId && change.schedule.sectionId) {
                const scheduleData: Partial<ScheduleFormValues> = {
                  sectionId: change.schedule.sectionId,
                  courseId: change.schedule.courseId,
                  teacherId: change.schedule.teacherId,
                  dayOfWeek: change.schedule.dayOfWeek,
                  startTime: change.schedule.startTime,
                  endTime: change.schedule.endTime,
                  classroom: change.schedule.classroom || undefined,
                };
                await onCreateSchedule(scheduleData);
              }
              break;
            case 'update':
              if (onUpdateSchedule && typeof change.schedule.id === 'number') {
                const scheduleData: Partial<ScheduleFormValues> = {
                  sectionId: change.schedule.sectionId,
                  courseId: change.schedule.courseId || undefined,
                  teacherId: change.schedule.teacherId,
                  dayOfWeek: change.schedule.dayOfWeek,
                  startTime: change.schedule.startTime,
                  endTime: change.schedule.endTime,
                  classroom: change.schedule.classroom || undefined,
                };
                await onUpdateSchedule(change.schedule.id, scheduleData);
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
      
      if (refreshAllData) {
        await refreshAllData();
      }
      
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, tempSchedules, onBatchSave, onCreateSchedule, onUpdateSchedule, onDeleteSchedule, refreshAllData]);

  const handleDiscardChanges = useCallback(() => {
    setTempSchedules([]);
    setPendingChanges([]);
  }, []);

  const handleSectionChange = useCallback((value: string) => {
    const newSectionId = parseInt(value);
    
    if (pendingChanges.length > 0 || tempSchedules.length > 0) {
      if (confirm('Tienes cambios sin guardar. ¿Deseas descartarlos y cambiar de sección?')) {
        handleDiscardChanges();
        setSelectedSection(newSectionId);
      }
    } else {
      setSelectedSection(newSectionId);
    }
  }, [pendingChanges, tempSchedules, handleDiscardChanges]);

  const hasUnsavedChanges = pendingChanges.length > 0 || tempSchedules.length > 0;
  const totalPendingChanges = pendingChanges.length;

  // Loading state - incluir carga de configuraciones y del hook integrado
  if (loading.anyLoading || configsLoading) {
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
        sections={sections || []}
        totalSchedules={allSchedules.length}
        pendingChanges={totalPendingChanges}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        currentConfig={currentConfig}
        onSectionChange={handleSectionChange}
        onSaveAll={handleSaveAll}
        onDiscardChanges={handleDiscardChanges}
        onConfigSave={handleConfigSave}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ScheduleSidebar
            courses={courses || []}
            teachers={teachers} // 🔥 Solo profesores disponibles para arrastrar
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