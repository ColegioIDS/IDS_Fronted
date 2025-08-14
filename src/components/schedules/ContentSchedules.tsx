// src/components/schedules/ContentSchedules.tsx - CORREGIDO
import React from "react";
import { ScheduleCalendarView } from "@/components/schedules/ScheduleCalendarView";
import { TeacherSelector } from "./TeacherSelector";
import { ScheduleFormComponent } from "./ScheduleFormComponent";
import { useScheduleContext } from "@/context/ScheduleContext";
import type { ScheduleChange } from "@/types/schedules.types";
import type { ScheduleFormValues } from "@/types/schedules";
import { deleteSchedule } from '@/services/schedule';

export default function ContentSchedules() {
  const { 
    createSchedule, 
    updateSchedule, 
    batchSave,
    fetchSchedules
  } = useScheduleContext();

  // Función helper para convertir null a undefined
  const normalizeScheduleData = (data: any): ScheduleFormValues => ({
    sectionId: data.sectionId,
    courseId: data.courseId,
    teacherId: data.teacherId || undefined, // null → undefined
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    classroom: data.classroom || undefined, // null → undefined
  });

  // Función para manejar guardado masivo
  const handleBatchSave = async (changes: ScheduleChange[]) => {
    console.log('🟢 ContentSchedules - handleBatchSave ejecutado con:', changes.length, 'cambios');
    
    try {
      // Separar por tipo de acción
      const creates = changes.filter(change => change.action === 'create');
      const updates = changes.filter(change => change.action === 'update');
      const deletes = changes.filter(change => change.action === 'delete');

      console.log('🟢 Cambios separados:', { 
        creates: creates.length, 
        updates: updates.length, 
        deletes: deletes.length 
      });

      // 1. Procesar eliminaciones primero
      for (const change of deletes) {
        if (typeof change.schedule.id === 'number') {
          console.log('🟢 Eliminando schedule ID:', change.schedule.id);
          await deleteSchedule(change.schedule.id);
        }
      }

      // 2. Procesar updates individuales
      for (const change of updates) {
        if (typeof change.schedule.id === 'number') {
          console.log('🟢 Actualizando schedule ID:', change.schedule.id);
          
          // Normalizar datos para update
          const updateData: Partial<ScheduleFormValues> = {
            sectionId: change.schedule.sectionId,
            courseId: change.schedule.courseId || undefined,
            teacherId: change.schedule.teacherId || undefined, // null → undefined
            dayOfWeek: change.schedule.dayOfWeek,
            startTime: change.schedule.startTime,
            endTime: change.schedule.endTime,
            classroom: change.schedule.classroom || undefined, // null → undefined
          };
          
          const result = await updateSchedule(change.schedule.id, updateData);
          
          if (!result.success) {
            throw new Error(result.message || 'Error actualizando schedule');
          }
        }
      }

      // 3. Procesar creaciones con batch
      if (creates.length > 0) {
        const schedulesToSave: ScheduleFormValues[] = creates
          .filter(change => change.schedule.courseId && change.schedule.sectionId)
          .map(change => normalizeScheduleData({
            sectionId: change.schedule.sectionId,
            courseId: change.schedule.courseId!,
            teacherId: change.schedule.teacherId, // Se normalizará en la función
            dayOfWeek: change.schedule.dayOfWeek,
            startTime: change.schedule.startTime,
            endTime: change.schedule.endTime,
            classroom: change.schedule.classroom, // Se normalizará en la función
          }));

        console.log('🟢 Schedules a crear:', schedulesToSave);

        if (schedulesToSave.length > 0) {
          const result = await batchSave(schedulesToSave);
          if (!result.success) {
            throw new Error(result.message || 'Error en guardado masivo');
          }
          console.log('🟢 ✅ Batch save exitoso:', result);
        }
      }

      // 4. Refrescar datos al final
      await fetchSchedules();

      return { success: true };
      
    } catch (error) {
      console.error('🔴 Error en handleBatchSave:', error);
      throw error;
    }
  };

  // Funciones individuales para operaciones CRUD
  const handleCreateSchedule = async (data: Partial<ScheduleFormValues>) => {
    console.log('🟢 Creando schedule individual:', data);
    
    // Validar datos requeridos
    if (!data.sectionId || !data.courseId || !data.dayOfWeek || !data.startTime || !data.endTime) {
      return { success: false, message: 'Datos requeridos faltantes' };
    }
    
    // Convertir a ScheduleFormValues completo y normalizar
    const completeData: ScheduleFormValues = normalizeScheduleData({
      sectionId: data.sectionId,
      courseId: data.courseId,
      teacherId: data.teacherId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      classroom: data.classroom,
    });
    
    return await createSchedule(completeData);
  };

  const handleUpdateSchedule = async (id: number, data: Partial<ScheduleFormValues>) => {
    console.log('🟢 Actualizando schedule individual:', id, data);
    
    // Normalizar datos para update
    const normalizedData: Partial<ScheduleFormValues> = {
      ...data,
      teacherId: data.teacherId || undefined, // null → undefined
      classroom: data.classroom || undefined, // null → undefined
    };
    
    return await updateSchedule(id, normalizedData);
  };

  const handleDeleteSchedule = async (id: number): Promise<void> => {
    console.log('🟢 Eliminando schedule individual:', id);
    try {
      await deleteSchedule(id);
      await fetchSchedules();
    } catch (error) {
      console.error('Error eliminando schedule:', error);
      throw error;
    }
  };

  return (
    <div className="p-4">
      <ScheduleCalendarView
        onBatchSave={handleBatchSave}
        onCreateSchedule={handleCreateSchedule}
        onUpdateSchedule={handleUpdateSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />
    </div>
  );
}