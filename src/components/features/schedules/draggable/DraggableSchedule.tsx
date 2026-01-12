// src/components/features/schedules/draggable/DraggableSchedule.tsx
"use client";

import { useCallback } from "react";
import { Clock, User, MapPin, Edit, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Schedule } from "@/types/schedules.types";
import type { TempSchedule } from "@/types/schedules.types";
import { useDragManager } from "@/hooks/useDragManager";

interface DraggableScheduleProps {
  schedule: Schedule | TempSchedule;
  onEdit: (schedule: Schedule | TempSchedule) => void;
  onDelete: (schedule: Schedule | TempSchedule) => void;
  isTemp?: boolean;
  isMarkedForDeletion?: boolean;
}

export function DraggableSchedule({
  schedule,
  onEdit,
  onDelete,
  isTemp = false,
  isMarkedForDeletion = false
}: DraggableScheduleProps) {
  const { elementRef, startDrag } = useDragManager();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get course assignment data depending on schedule type
  const getCourseData = () => {
    const scheduleWithAssignment = schedule as any;
    if (scheduleWithAssignment.courseAssignment?.course) {
      return scheduleWithAssignment.courseAssignment.course;
    }
    return null;
  };

  const getTeacherData = () => {
    const scheduleWithAssignment = schedule as any;
    if (scheduleWithAssignment.courseAssignment?.teacher) {
      return scheduleWithAssignment.courseAssignment.teacher;
    }
    return null;
  };

  const getTeacherName = () => {
    const teacher = getTeacherData();
    if (!teacher) return null;

    if ('name' in teacher && teacher.name) {
      return teacher.name;
    }

    if ('givenNames' in teacher && 'lastNames' in teacher) {
      return `${teacher.givenNames} ${teacher.lastNames}`;
    }

    return 'Sin nombre';
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-drag="true"]')) return;

    const courseData = getCourseData();

    startDrag(e, {
      id: typeof schedule.id === 'string' ? 0 : schedule.id,
      type: 'schedule',
    });
  }, [schedule, startDrag]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(schedule);
  }, [schedule, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(schedule);
  }, [schedule, onDelete]);

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const courseData = getCourseData();
  const teacherData = getTeacherData();
  
  // Get course color and generate dynamic styles
  const courseColor = courseData?.color || '#3b82f6'; // Default blue

  return (
    <div
      ref={elementRef}
      className={cn(
        "p-3 rounded-lg border-2 transition-all group relative overflow-hidden",
        "cursor-grab active:cursor-grabbing select-none",
        "max-w-full w-full overflow-hidden backdrop-blur-sm",
        isDark ? "hover:shadow-lg shadow-black/20" : "hover:shadow-md",
        isMarkedForDeletion
          ? isDark
            ? "border-dashed border-red-500/80 bg-gradient-to-br from-red-900/40 to-red-800/40 hover:from-red-900/50 hover:to-red-800/50 opacity-70"
            : "border-dashed border-red-400/80 bg-gradient-to-br from-red-50/90 to-red-100/90 hover:from-red-100 hover:to-red-150 opacity-70"
          : isTemp
            ? isDark
              ? "border-orange-500/60 bg-gradient-to-br from-orange-900/30 to-orange-800/30 hover:from-orange-900/40 hover:to-orange-800/40"
              : "border-orange-400/60 bg-gradient-to-br from-orange-50/80 to-orange-100/80 hover:from-orange-100 hover:to-orange-150"
            : ""
      )}
      style={!isTemp && !isMarkedForDeletion ? {
        borderColor: `${courseColor}66`,
        backgroundColor: isDark 
          ? `${courseColor}12` 
          : `${courseColor}0a`,
      } : undefined}
      onMouseDown={handleMouseDown}
    >
      {/* Decorative top bar with course color */}
      <div 
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-md"
        style={{ backgroundColor: courseColor }}
      />
      
      <div className="space-y-1.5 pt-2 overflow-hidden">
        <div className="flex items-start justify-between gap-1 min-w-0">
          <div className="flex-1 min-w-0 overflow-hidden max-w-full">
            <span className={cn(
              "text-xs font-semibold block truncate max-w-full",
              isMarkedForDeletion && "line-through opacity-50",
              isTemp
                ? isDark ? "text-orange-300" : "text-orange-700"
                : isDark ? "text-gray-100" : "text-gray-800"
            )}
            style={!isTemp ? { color: courseColor } : undefined}
            >
              {courseData?.name || "Sin curso asignado"}
            </span>
            {isMarkedForDeletion && (
              <Badge
                className={cn(
                  "mt-1 text-[10px] h-5 px-1.5 font-semibold border",
                  isDark
                    ? "bg-red-900/60 text-red-100 border-red-700"
                    : "bg-red-100 text-red-800 border-red-300"
                )}
              >
                🗑️ Para eliminar
              </Badge>
            )}
            {isTemp && !isMarkedForDeletion && (
              <Badge
                className={cn(
                  "mt-1 text-[10px] h-5 px-1.5 font-semibold border",
                  isDark
                    ? "bg-orange-900/60 text-orange-100 border-orange-700"
                    : "bg-orange-100 text-orange-800 border-orange-300"
                )}
              >
                ⏳ Pendiente
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
                "h-6 w-6 p-0 transition-colors",
                isTemp
                  ? isDark ? "hover:bg-orange-900/70 text-orange-400" : "hover:bg-orange-200 text-orange-600"
                  : isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-200"
              )}
              style={!isTemp ? { color: courseColor } : undefined}
              onClick={handleEdit}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-6 w-6 p-0 transition-colors",
                isDark
                  ? "hover:bg-red-900/70 text-red-400"
                  : "hover:bg-red-100 text-red-600"
              )}
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Teacher info */}
        {teacherData && (
          <div className={cn(
            "flex items-center gap-1.5 text-[10px] min-w-0 overflow-hidden font-medium",
            isMarkedForDeletion && "line-through opacity-50",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            <User className="h-3 w-3 flex-shrink-0 opacity-70" />
            <span className="truncate">{getTeacherName()}</span>
          </div>
        )}

        {/* Classroom info */}
        {schedule.classroom && (
          <div className={cn(
            "flex items-center gap-1.5 text-[10px] min-w-0 overflow-hidden",
            isMarkedForDeletion && "line-through opacity-50",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            <MapPin className="h-3 w-3 flex-shrink-0 opacity-70" />
            <span className="truncate">{schedule.classroom}</span>
          </div>
        )}

        {/* Time info */}
        <div className={cn(
          "flex items-center gap-1.5 text-[10px] min-w-0 overflow-hidden font-mono border-t pt-1.5",
          isMarkedForDeletion && "line-through opacity-50",
          isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-600"
        )}>
          <Clock className="h-3 w-3 flex-shrink-0 opacity-70" />
          <span className="truncate font-semibold">
            {schedule.startTime} - {schedule.endTime}
          </span>
        </div>
      </div>
    </div>
  );
}
