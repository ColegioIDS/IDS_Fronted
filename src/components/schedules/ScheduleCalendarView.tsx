// components/schedules/ScheduleCalendarView.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Schedule, DayOfWeek, ScheduleFormValues } from "@/types/schedules";
import type { 
  DragItem, 
  TimeSlot, 
  TempSchedule, 
  ScheduleChange 
} from "@/types/schedules.types";
import { useScheduleContext } from "@/context/ScheduleContext";
import { useSectionContext } from "@/context/SectionContext";
import { useCourseContext } from "@/context/CourseContext";
import { useTeacherContext } from "@/context/TeacherContext";
import { ScheduleHeader } from "./calendar/ScheduleHeader";
import { ScheduleSidebar } from "./calendar/ScheduleSidebar";
import { ScheduleGrid } from "./calendar/ScheduleGrid";

interface ScheduleCalendarViewProps {
  selectedSectionId?: number;
  onScheduleClick?: (schedule: Schedule) => void;
  onCreateSchedule?: (data: Partial<ScheduleFormValues>) => void;
  onUpdateSchedule?: (id: number, data: Partial<ScheduleFormValues>) => void;
  onDeleteSchedule?: (id: number) => void;
  onBatchSave?: (changes: ScheduleChange[]) => Promise<void>;
}

export function ScheduleCalendarView({
  selectedSectionId,
  onScheduleClick,
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onBatchSave,
}: ScheduleCalendarViewProps) {
  const [selectedSection, setSelectedSection] = useState<number>(selectedSectionId || 0);
  const [tempSchedules, setTempSchedules] = useState<TempSchedule[]>([]);
  const [pendingChanges, setPendingChanges] = useState<ScheduleChange[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const { schedules, fetchSchedules } = useScheduleContext();
  const { sections, isLoadingSections: sectionsLoading } = useSectionContext();
  const { courses, isLoadingCourses: coursesLoading } = useCourseContext();
  const { teachers, isLoading: teachersLoading } = useTeacherContext();

  // Combinar horarios reales y temporales
  const allSchedules = useMemo(() => {
    const realSchedules = schedules?.filter(schedule => schedule.sectionId === selectedSection) || [];
    const sectionTempSchedules = tempSchedules.filter(schedule => schedule.sectionId === selectedSection);
    console.log('AllSchedules combinados:', {
      realSchedules: realSchedules.length,
      tempSchedules: sectionTempSchedules.length,
      total: realSchedules.length + sectionTempSchedules.length
    });
    return [...realSchedules, ...sectionTempSchedules];
  }, [schedules, selectedSection, tempSchedules]);

  // Organizar horarios por día y horario
  const scheduleGrid = useMemo(() => {
    const grid: { [key: string]: (Schedule | TempSchedule)[] } = {};
    
    allSchedules.forEach((schedule) => {
      const key = `${schedule.dayOfWeek}-${schedule.startTime}`;
      if (!grid[key]) {
        grid[key] = [];
      }
      grid[key].push(schedule);
    });
    
    console.log('Schedule Grid generado:', Object.keys(grid).length, 'slots con horarios');
    return grid;
  }, [allSchedules]);

  // Calcular horas asignadas por profesor
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

  // Generar ID temporal único
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Manejar drop de elementos
 /*   const handleDrop = useCallback((item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => {
    console.log('HandleDrop ejecutado:', { item, day, timeSlot });
    
    if (!selectedSection || timeSlot.label.includes("RECREO") || timeSlot.label.includes("ALMUERZO")) {
      console.log('Drop cancelado: sin sección o es recreo/almuerzo');
      return;
    }

     setTempSchedules(prev =>
    prev.filter(s => !(s.dayOfWeek === day && s.startTime === timeSlot.start && s.sectionId === selectedSection))
  );

    if (item.type === 'course') {
      const course = item.data as any;
      const tempSchedule: TempSchedule = {
        id: generateTempId(),
        sectionId: selectedSection,
        courseId: item.id,
        teacherId: null,
        dayOfWeek: day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        classroom: null,
        course: course ? {
          id: course.id,
          name: course.name
        } : null,
        teacher: null,
        section: sections?.find(s => s.id === selectedSection),
        isTemp: true,
      };
      
      console.log('Creando schedule temporal de curso:', tempSchedule);
      setTempSchedules(prev => [...prev, tempSchedule]);
      setPendingChanges(prev => [...prev, {
        action: 'create',
        schedule: tempSchedule
      }]);
      
    } else if (item.type === 'teacher') {
      const teacher = item.data as any;
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
        teacher: teacher ? { 
          id: teacher.id,
          name: item.name 
        } : null,
        section: sections?.find(s => s.id === selectedSection),
        isTemp: true,
      };
      
      console.log('Creando schedule temporal de profesor:', tempSchedule);
      setTempSchedules(prev => [...prev, tempSchedule]);
      setPendingChanges(prev => [...prev, {
        action: 'create',
        schedule: tempSchedule
      }]);
      
   } else if (item.type === 'schedule') {
    const existingSchedule = item.data as Schedule | TempSchedule;
    console.log('Moviendo schedule existente:', existingSchedule);

    if ('isTemp' in existingSchedule && existingSchedule.isTemp) {
      // 🔹 Eliminar el original del array antes de agregar el actualizado
      setTempSchedules(prev => prev.filter(s => s.id !== existingSchedule.id));

      const updatedSchedule: TempSchedule = {
        ...existingSchedule,
        dayOfWeek: day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
      };

      setTempSchedules(prev => [...prev, updatedSchedule]);
      setPendingChanges(prev =>
        prev.map(change =>
          change.schedule.id === existingSchedule.id
            ? { ...change, schedule: updatedSchedule }
            : change
        )
      );
    } else {
        const updatedSchedule = {
          ...existingSchedule,
          dayOfWeek: day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
        } as Schedule;
        
        setPendingChanges(prev => {
          const existingChangeIndex = prev.findIndex(
            change => change.schedule.id === existingSchedule.id && change.action === 'update'
          );
          
          if (existingChangeIndex >= 0) {
            const newChanges = [...prev];
            newChanges[existingChangeIndex] = {
              action: 'update',
              schedule: updatedSchedule,
              originalSchedule: existingSchedule as Schedule
            };
            return newChanges;
          } else {
            return [...prev, {
              action: 'update',
              schedule: updatedSchedule,
              originalSchedule: existingSchedule as Schedule
            }];
          }
        });
      }
    }
  }, [selectedSection, sections]); 
 */

 /*    const handleDrop = useCallback((item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => {
    if (!selectedSection || timeSlot.label.includes("RECREO") || timeSlot.label.includes("ALMUERZO")) {
      return;
    }

    if (item.type === 'course') {
      // Crear horario temporal para curso
      const tempSchedule: TempSchedule = {
        id: generateTempId(),
        sectionId: selectedSection,
        courseId: item.id,
        teacherId: undefined,
        dayOfWeek: day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        classroom: undefined,
        course: item.data,
        teacher: undefined,
        section: sections?.find(s => s.id === selectedSection),
        isTemp: true,
      };
      
      setTempSchedules(prev => [...prev, tempSchedule]);
      
      // Agregar a cambios pendientes
      setPendingChanges(prev => [...prev, {
        action: 'create',
        schedule: tempSchedule
      }]);
      
    } else if (item.type === 'teacher') {
      // Crear horario temporal para profesor
      const tempSchedule: TempSchedule = {
        id: generateTempId(),
        sectionId: selectedSection,
        courseId: undefined,
        teacherId: item.id,
        dayOfWeek: day,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        classroom: undefined,
        course: undefined,
        teacher: { name: item.name, ...item.data },
        section: sections?.find(s => s.id === selectedSection),
        isTemp: true,
      };
      
      setTempSchedules(prev => [...prev, tempSchedule]);
      
      // Agregar a cambios pendientes
      setPendingChanges(prev => [...prev, {
        action: 'create',
        schedule: tempSchedule
      }]);
      
    } else if (item.type === 'schedule') {
      // Mover horario existente
      const existingSchedule = item.data as Schedule | TempSchedule;
      
      if ('isTemp' in existingSchedule && existingSchedule.isTemp) {
        // Es un horario temporal, solo actualizarlo
        const updatedSchedule: TempSchedule = {
          ...existingSchedule,
          dayOfWeek: day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
        };
        
        setTempSchedules(prev => 
          prev.map(s => s.id === existingSchedule.id ? updatedSchedule : s)
        );
        
        // Actualizar en cambios pendientes
        setPendingChanges(prev => 
          prev.map(change => 
            change.schedule.id === existingSchedule.id 
              ? { ...change, schedule: updatedSchedule }
              : change
          )
        );
      } else {
        // Es un horario real, crear un cambio de actualización
        const updatedSchedule = {
          ...existingSchedule,
          dayOfWeek: day,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
        } as Schedule;
        
        setPendingChanges(prev => {
          const existingChangeIndex = prev.findIndex(
            change => change.schedule.id === existingSchedule.id && change.action === 'update'
          );
          
          if (existingChangeIndex >= 0) {
            // Actualizar cambio existente
            const newChanges = [...prev];
            newChanges[existingChangeIndex] = {
              action: 'update',
              schedule: updatedSchedule,
              originalSchedule: existingSchedule as Schedule
            };
            return newChanges;
          } else {
            // Nuevo cambio de actualización
            return [...prev, {
              action: 'update',
              schedule: updatedSchedule,
              originalSchedule: existingSchedule as Schedule
            }];
          }
        });
      }
    }
  }, [selectedSection, sections]);
 */
const handleDrop = useCallback((item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => {
  if (!selectedSection || timeSlot.label.includes("RECREO") || timeSlot.label.includes("ALMUERZO")) {
    return;
  }

  // Buscar todos los schedules existentes en ese slot para esta sección
  const existingSchedules = tempSchedules.filter(
    s => s.dayOfWeek === day && s.startTime === timeSlot.start && s.sectionId === selectedSection
  );

  let existingSchedule = existingSchedules[0]; // asumimos como base el primero (si hay uno)

  // Si ya hay uno con el mismo tipo, lo reemplazamos. Si no, lo agregamos.
  const section = sections?.find(s => s.id === selectedSection);

  if (item.type === 'course') {
    const course = item.data as any;

    // Si ya hay un schedule en ese slot para esa sección, actualiza el curso
    if (existingSchedule) {
      const updatedSchedule = {
        ...existingSchedule,
        courseId: item.id,
        course: {
          id: course.id,
          name: course.name
        },
      };
      setTempSchedules(prev =>
        prev.map(s => s.id === existingSchedule!.id ? updatedSchedule : s)
      );
      setPendingChanges(prev =>
        prev.map(change =>
          change.schedule.id === existingSchedule!.id
            ? { ...change, schedule: updatedSchedule }
            : change
        )
      );
    } else {
      // Crear nuevo si no hay nada
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
      const updatedSchedule = {
        ...existingSchedule,
        teacherId: item.id,
        teacher: {
          id: teacher.id,
          name: item.name
        },
      };
      setTempSchedules(prev =>
        prev.map(s => s.id === existingSchedule!.id ? updatedSchedule : s)
      );
      setPendingChanges(prev =>
        prev.map(change =>
          change.schedule.id === existingSchedule!.id
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
  }

}, [selectedSection, sections, tempSchedules]);


  // Manejar eliminación de horarios - MEJORADO CON MÁS DEBUG
// Manejar eliminación de horarios
const handleScheduleDelete = useCallback((id: string | number) => {
  console.log('🔴 handleScheduleDelete EJECUTADO con ID:', id, 'tipo:', typeof id);
  console.log('🔴 TempSchedules antes:', tempSchedules.map(s => ({ id: s.id, type: typeof s.id })));
  console.log('🔴 Schedules reales:', schedules?.map(s => ({ id: s.id, type: typeof s.id })));
  
  if (typeof id === 'string') {
    console.log('🔴 Eliminando schedule temporal:', id);

    // 1️⃣ Quitar del estado de temporales
    setTempSchedules(prev => {
      const filtered = prev.filter(s => s.id !== id);
      console.log('🔴 TempSchedules después del filter:', filtered.length, 'antes:', prev.length);
      return filtered;
    });

    // 2️⃣ Agregar un "delete" a pendingChanges para que el grid lo oculte
    setPendingChanges(prev => {
      const filtered = prev.filter(change => change.schedule.id !== id);
      const deletedSchedule = tempSchedules.find(s => s.id === id);

      // Solo agregamos si existía en tempSchedules
      if (deletedSchedule) {
        return [
          ...filtered,
          { action: 'delete' as const, schedule: deletedSchedule }
        ];
      }
      return filtered;
    });

  } else {
    console.log('🔴 Procesando eliminación de schedule real:', id);
    const schedule = schedules?.find(s => s.id === id);
    if (schedule) {
      console.log('🔴 Schedule encontrado para eliminar:', schedule);
      setPendingChanges(prev => {
        const newChanges = [...prev, {
          action: 'delete' as const,
          schedule: schedule,
          originalSchedule: schedule
        }];
        console.log('🔴 Nuevos pending changes:', newChanges.length);
        return newChanges;
      });
    } else {
      console.log('🔴 ⚠️ Schedule no encontrado para ID:', id);
    }
  }
}, [schedules, tempSchedules]);

  // Guardar todos los cambios
  const handleSaveAll = useCallback(async () => {
    if (pendingChanges.length === 0 && tempSchedules.length === 0) return;

    setIsSaving(true);
    try {
      if (onBatchSave) {
        await onBatchSave(pendingChanges);
      } else {
        for (const change of pendingChanges) {
          switch (change.action) {
            case 'create':
              if (onCreateSchedule) {
                const scheduleData: Partial<ScheduleFormValues> = {
                  sectionId: change.schedule.sectionId,
                  courseId: change.schedule.courseId || undefined,
                  teacherId: change.schedule.teacherId || undefined,
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
                  teacherId: change.schedule.teacherId || undefined,
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
      
      if (fetchSchedules) {
        await fetchSchedules();
      }
      
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, tempSchedules, onBatchSave, onCreateSchedule, onUpdateSchedule, onDeleteSchedule, fetchSchedules]);

  // Descartar cambios
  const handleDiscardChanges = useCallback(() => {
    setTempSchedules([]);
    setPendingChanges([]);
  }, []);

  // Cambiar de sección
  const handleSectionChange = useCallback((value: string) => {
    if (pendingChanges.length > 0 || tempSchedules.length > 0) {
      if (confirm('Tienes cambios sin guardar. ¿Deseas descartarlos y cambiar de sección?')) {
        handleDiscardChanges();
        setSelectedSection(parseInt(value));
      }
    } else {
      setSelectedSection(parseInt(value));
    }
  }, [pendingChanges, tempSchedules, handleDiscardChanges]);

  const hasUnsavedChanges = pendingChanges.length > 0 || tempSchedules.length > 0;

  // Loading state
  if (sectionsLoading || coursesLoading || teachersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  console.log('🟢 Renderizando ScheduleCalendarView con handleScheduleDelete:', !!handleScheduleDelete);

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <ScheduleHeader
        selectedSection={selectedSection}
        sections={sections || []}
        totalSchedules={allSchedules.length}
        pendingChanges={pendingChanges.length + tempSchedules.length}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSectionChange={handleSectionChange}
        onSaveAll={handleSaveAll}
        onDiscardChanges={handleDiscardChanges}
      />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ScheduleSidebar
            courses={courses || []}
            teachers={teachers || []}
            teacherHours={teacherHours}
            pendingChanges={pendingChanges}
            tempSchedulesCount={tempSchedules.length}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>

        {/* Grid */}
        <div className="lg:col-span-3">
          <ScheduleGrid
            scheduleGrid={scheduleGrid}
            pendingChanges={pendingChanges}
            onDrop={handleDrop}
            onScheduleEdit={(schedule) => onScheduleClick?.(schedule as Schedule)}
            onScheduleDelete={handleScheduleDelete}
          />
        </div>
      </div>
    </div>
  );
}