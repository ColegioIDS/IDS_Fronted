// components/schedules/calendar/DroppableTimeSlot.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Schedule, DayOfWeek } from "@/types/schedules";
import type { TimeSlot, DragItem, TempSchedule } from "@/types/schedules.types";
import { DraggableSchedule } from "../draggable/DraggableSchedule";
import { useDragManager } from "@/hooks/useDragManager";
import { Badge } from "@/components/ui/badge"

interface DroppableTimeSlotProps {
  day: DayOfWeek;
  timeSlot: TimeSlot;
  schedules: (Schedule | TempSchedule)[];
  onDrop: (item: DragItem, day: DayOfWeek, timeSlot: TimeSlot) => void;
  onScheduleEdit: (schedule: Schedule | TempSchedule) => void;
  onScheduleDelete: (id: string | number) => void;
  isBreakTime?: boolean;
}

export function DroppableTimeSlot({ 
  day, 
  timeSlot, 
  schedules, 
  onDrop, 
  onScheduleEdit, 
  onScheduleDelete,
  isBreakTime = false
}: DroppableTimeSlotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const { getDragState } = useDragManager();

  // Verificar si es tiempo de recreo/almuerzo
  const isRecreation = isBreakTime || 
    timeSlot.label.includes("RECREO") || 
    timeSlot.label.includes("ALMUERZO");

  const handleMouseEnter = useCallback(() => {
    const dragState = getDragState();
    if (dragState.isDragging && !isRecreation) {
      setIsHovered(true);
    }
  }, [isRecreation, getDragState]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleMouseUp = useCallback(() => {
    const dragState = getDragState();
    if (dragState.isDragging && dragState.dragItem && isHovered && !isRecreation) {
      onDrop(dragState.dragItem, day, timeSlot);
      setIsHovered(false);
    }
  }, [day, timeSlot, isHovered, isRecreation, onDrop, getDragState]);

  // Función mejorada para manejar la eliminación
  const handleScheduleDelete = useCallback((scheduleId: string | number) => {
    console.log('Eliminando schedule:', scheduleId, 'del slot:', day, timeSlot.label);
    onScheduleDelete(scheduleId);
  }, [onScheduleDelete, day, timeSlot.label]);

  // Función mejorada para manejar la edición
  const handleScheduleEdit = useCallback((schedule: Schedule | TempSchedule) => {
    console.log('Editando schedule:', schedule.id, 'del slot:', day, timeSlot.label);
    onScheduleEdit(schedule);
  }, [onScheduleEdit, day, timeSlot.label]);

  // Renderizado para tiempos de recreo/almuerzo
  if (isRecreation) {
    return (
      <div
        ref={dropRef}
        className={cn(
          "min-h-[80px] p-2 border transition-all",
          "bg-gradient-to-br from-gray-100 to-gray-50",
          "border-gray-300",
          "flex items-center justify-center"
        )}
      >
        <div className="text-gray-500 text-sm font-medium">
          {timeSlot.label}
        </div>
      </div>
    );
  }

  // Renderizado normal para slots disponibles
  return (
    <div
      ref={dropRef}
      className={cn(
        "min-h-[80px] p-2 border transition-all relative",
        isHovered && "bg-blue-50 border-blue-300 border-dashed border-2",
        !isHovered && "bg-gray-50 border-gray-200 hover:bg-white"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
    >
      <div className="space-y-1">
        {/* Renderizar horarios existentes con key más específica */}
        {schedules.map((schedule) => (
          <DraggableSchedule
            key={`${schedule.id}-${day}-${timeSlot.start}-${timeSlot.end}`}
            schedule={schedule}
            onEdit={handleScheduleEdit}
            onDelete={handleScheduleDelete}
            isTemp={'isTemp' in schedule && schedule.isTemp}
          />
        ))}
        
        {/* Indicador de drop cuando está vacío */}
        {schedules.length === 0 && isHovered && (
          <div className="flex items-center justify-center h-12 text-blue-500 text-sm animate-pulse">
            <Plus className="h-4 w-4 mr-1" />
            <span>Soltar aquí</span>
          </div>
        )}
        
        {/* Indicador de múltiples horarios */}
        {schedules.length > 1 && (
          <div className="absolute top-1 right-1">
            <Badge 
              variant="secondary" 
              className="text-[10px] h-4 px-1 bg-yellow-100 text-yellow-700"
            >
              {schedules.length} clases
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}