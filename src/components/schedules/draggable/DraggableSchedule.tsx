// components/schedules/draggable/DraggableSchedule.tsx
"use client";

import { useCallback } from "react";
import { Clock, User, MapPin, Edit, Trash2 } from "lucide-react";
import { useTheme } from "next-themes"; // ✅ AGREGAR
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Schedule } from "@/types/schedules";
import { TempSchedule } from "@/types/schedules.types";
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
  const { theme } = useTheme(); // ✅ AGREGAR
  const isDark = theme === 'dark'; // ✅ AGREGAR

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
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

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // ✅ NUEVO: Helper para obtener nombre del teacher
  const getTeacherName = () => {
    if (!schedule.teacher) return null;
    
    // Si tiene propiedad 'name' directamente
    if ('name' in schedule.teacher && schedule.teacher.name) {
      return schedule.teacher.name;
    }
    
    // Si tiene givenNames y lastNames (tipo User)
    if ('givenNames' in schedule.teacher && 'lastNames' in schedule.teacher) {
      return `${schedule.teacher.givenNames} ${schedule.teacher.lastNames}`;
    }
    
    return 'Sin nombre';
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "p-2 rounded-md border transition-all group",
        "cursor-grab active:cursor-grabbing select-none",
        isDark ? "hover:shadow-lg" : "hover:shadow-md", // ✅ MODIFICADO
        isTemp 
          ? isDark
            ? "border-orange-800 bg-gradient-to-br from-orange-900/30 to-orange-800/30" // ✅ NUEVO
            : "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100"
          : isDark
            ? "bg-gray-700 border-blue-800 hover:border-blue-600" // ✅ NUEVO
            : "bg-white border-blue-200 hover:border-blue-300"
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <span className={cn(
              "text-xs font-medium block truncate",
              isTemp 
                ? isDark ? "text-orange-300" : "text-orange-700" // ✅ MODIFICADO
                : isDark ? "text-blue-300" : "text-blue-700" // ✅ MODIFICADO
            )}>
              {schedule.course?.name || "Sin curso asignado"}
            </span>
            {isTemp && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "mt-1 text-[10px] h-4 px-1",
                  isDark 
                    ? "bg-orange-900/50 text-orange-300" // ✅ NUEVO
                    : "bg-orange-200 text-orange-700"
                )}
              >
                Pendiente
              </Badge>
            )}
          </div>

          <div
            data-no-drag="true"
            className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={stop}
            onPointerDown={stop}
          >
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-5 w-5 p-0",
                isTemp 
                  ? isDark ? "hover:bg-orange-900/50" : "hover:bg-orange-200" // ✅ MODIFICADO
                  : isDark ? "hover:bg-blue-900/50" : "hover:bg-blue-100" // ✅ MODIFICADO
              )}
              onClick={handleEdit}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-5 w-5 p-0",
                isDark 
                  ? "hover:bg-red-900/50 hover:text-red-400" // ✅ NUEVO
                  : "hover:bg-red-100 hover:text-red-600"
              )}
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* ✅ CORREGIDO: Usar helper para obtener nombre */}
        {schedule.teacher && (
          <div className={cn(
            "flex items-center gap-1 text-[11px]",
            isDark ? "text-gray-400" : "text-gray-600" // ✅ MODIFICADO
          )}>
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{getTeacherName()}</span>
          </div>
        )}

        {schedule.classroom && (
          <div className={cn(
            "flex items-center gap-1 text-[11px]",
            isDark ? "text-gray-400" : "text-gray-500" // ✅ MODIFICADO
          )}>
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{schedule.classroom}</span>
          </div>
        )}

        <div className={cn(
          "flex items-center gap-1 text-[11px]",
          isDark ? "text-gray-400" : "text-gray-500" // ✅ MODIFICADO
        )}>
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="font-mono text-[10px]">
            {schedule.startTime} - {schedule.endTime}
          </span>
        </div>
      </div>
    </div>
  );
}