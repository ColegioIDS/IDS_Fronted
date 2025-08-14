// components/schedules/draggable/DraggableSchedule.tsx
"use client";

import { useCallback } from "react";
import { Clock, User, MapPin, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Schedule } from "@/types/schedules";
import  { TempSchedule } from "@/types/schedules.types";
import { useDragManager } from "@/hooks/useDragManager";

interface DraggableScheduleProps {
  schedule: Schedule | TempSchedule;
  onEdit: (schedule: Schedule | TempSchedule) => void;
  onDelete: (id: string | number) => void;
  isTemp?: boolean;
}

export function DraggableSchedule({ 
  schedule, 
  onEdit, 
  onDelete,
  isTemp = false
}: DraggableScheduleProps) {
  const { elementRef, startDrag } = useDragManager();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // No iniciar drag con otros botones que no sean el principal
    if (e.button !== 0) return;

    // No iniciar drag si el click viene del área de acciones
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-drag="true"]')) return;

    startDrag(e, {
      id: typeof schedule.id === 'string' ? 0 : schedule.id,
      type: 'schedule',
      name: schedule.course?.name || "Sin curso",
      data: schedule,
    });
  }, [schedule, startDrag]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(schedule);
  }, [schedule, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(schedule.id);
  }, [schedule.id, onDelete]);

  // util para cortar el drag desde los botones
  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "p-2 rounded-md border transition-all group",
        "cursor-grab active:cursor-grabbing select-none",
        "bg-white hover:shadow-md",
        isTemp 
          ? "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100" 
          : "border-blue-200 hover:border-blue-300"
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <span className={cn(
              "text-xs font-medium block truncate",
              isTemp ? "text-orange-700" : "text-blue-700"
            )}>
              {schedule.course?.name || "Sin curso asignado"}
            </span>
            {isTemp && (
              <Badge 
                variant="secondary" 
                className="mt-1 text-[10px] h-4 px-1 bg-orange-200 text-orange-700"
              >
                Pendiente
              </Badge>
            )}
          </div>

          {/* 🚫 Área no-draggable */}
          <div
            data-no-drag="true"
            className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={stop}
            onPointerDown={stop}
          >
            <Button
              size="sm"
              variant="ghost"
              className={cn("h-5 w-5 p-0", isTemp ? "hover:bg-orange-200" : "hover:bg-blue-100")}
              onClick={handleEdit}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {schedule.teacher && (
          <div className="flex items-center gap-1 text-[11px] text-gray-600">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{schedule.teacher.name}</span>
          </div>
        )}

        {schedule.classroom && (
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{schedule.classroom}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="font-mono text-[10px]">
            {schedule.startTime} - {schedule.endTime}
          </span>
        </div>
      </div>
    </div>
  );
}
