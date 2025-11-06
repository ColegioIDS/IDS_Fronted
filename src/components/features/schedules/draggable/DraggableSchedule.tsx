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
    onDelete(schedule.id);
  }, [schedule.id, onDelete]);

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const courseData = getCourseData();
  const teacherData = getTeacherData();

  return (
    <div
      ref={elementRef}
      className={cn(
        "p-2 rounded-md border transition-all group",
        "cursor-grab active:cursor-grabbing select-none",
        isDark ? "hover:shadow-lg shadow-black/20" : "hover:shadow-md",
        isTemp
          ? isDark
            ? "border-orange-700 bg-gradient-to-br from-orange-900/40 to-orange-800/40 hover:from-orange-900/50 hover:to-orange-800/50"
            : "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200"
          : isDark
            ? "bg-gray-750 border-blue-700 hover:border-blue-600 hover:bg-gray-700"
            : "bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50"
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <span className={cn(
              "text-xs font-medium block truncate",
              isTemp
                ? isDark ? "text-orange-300" : "text-orange-700"
                : isDark ? "text-blue-300" : "text-blue-700"
            )}>
              {courseData?.name || "Sin curso asignado"}
            </span>
            {isTemp && (
              <Badge
                variant="secondary"
                className={cn(
                  "mt-1 text-[10px] h-4 px-1",
                  isDark
                    ? "bg-orange-900/50 text-orange-300"
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
                  ? isDark ? "hover:bg-orange-900/50" : "hover:bg-orange-200"
                  : isDark ? "hover:bg-blue-900/50" : "hover:bg-blue-100"
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
                  ? "hover:bg-red-900/50 hover:text-red-400"
                  : "hover:bg-red-100 hover:text-red-600"
              )}
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {teacherData && (
          <div className={cn(
            "flex items-center gap-1 text-[11px]",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{getTeacherName()}</span>
          </div>
        )}

        {schedule.classroom && (
          <div className={cn(
            "flex items-center gap-1 text-[11px]",
            isDark ? "text-gray-400" : "text-gray-500"
          )}>
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{schedule.classroom}</span>
          </div>
        )}

        <div className={cn(
          "flex items-center gap-1 text-[11px]",
          isDark ? "text-gray-400" : "text-gray-500"
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
