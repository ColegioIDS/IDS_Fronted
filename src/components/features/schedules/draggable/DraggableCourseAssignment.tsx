// src/components/features/schedules/draggable/DraggableCourseAssignment.tsx
"use client";

import { useCallback } from "react";
import { BookOpen, User, GripVertical, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { CourseAssignment } from "@/types/schedules.types";
import { useDragManager } from "@/hooks/useDragManager";

interface DraggableCourseAssignmentProps {
  assignment: CourseAssignment;
  assignedHours?: number;
  maxHours?: number;
  isUsed?: boolean;
}

export function DraggableCourseAssignment({
  assignment,
  assignedHours = 0,
  maxHours = 40,
  isUsed = false
}: DraggableCourseAssignmentProps) {
  const { elementRef, startDrag } = useDragManager();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;

    startDrag(e, {
      id: assignment.id,
      type: 'courseAssignment',
    });
  }, [assignment.id, startDrag]);

  const percentage = maxHours > 0 ? (assignedHours / maxHours) * 100 : 0;

  const getHourStatus = () => {
    if (percentage > 90) {
      return { color: 'text-red-600', bgColor: isDark ? 'bg-red-900/30' : 'bg-red-50', borderColor: isDark ? 'border-red-800' : 'border-red-300', barColor: 'bg-red-600' };
    } else if (percentage > 70) {
      return { color: 'text-yellow-600', bgColor: isDark ? 'bg-yellow-900/30' : 'bg-yellow-50', borderColor: isDark ? 'border-yellow-800' : 'border-yellow-300', barColor: 'bg-yellow-600' };
    }
    return { color: 'text-blue-600', bgColor: isDark ? 'bg-blue-900/30' : 'bg-blue-50', borderColor: isDark ? 'border-blue-800' : 'border-blue-300', barColor: 'bg-blue-600' };
  };

  const status = getHourStatus();
  const courseName = assignment.course?.name || 'Sin curso';
  const teacherName = assignment.teacher
    ? `${assignment.teacher.givenNames} ${assignment.teacher.lastNames}`
    : 'Sin profesor';

  return (
    <div
      ref={elementRef}
      className={cn(
        "p-3 rounded-lg border-2 border-dashed transition-all select-none",
        "cursor-grab active:cursor-grabbing",
        "hover:scale-[1.02]",
        status.borderColor,
        status.bgColor,
        isUsed && 'opacity-60 cursor-not-allowed'
      )}
      onMouseDown={isUsed ? undefined : handleMouseDown}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* Course name */}
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen className="h-4 w-4 flex-shrink-0 text-green-600" />
            <span className={cn(
              "text-sm font-medium truncate",
              isDark ? 'text-green-300' : 'text-green-700'
            )}>
              {courseName}
            </span>
          </div>

          {/* Teacher name */}
          <div className="flex items-center gap-1.5 mb-2">
            <User className="h-4 w-4 flex-shrink-0 text-blue-600" />
            <span className={cn(
              "text-xs truncate",
              isDark ? 'text-blue-300' : 'text-blue-700'
            )}>
              {teacherName}
            </span>
          </div>

          {/* Assignment type badge */}
          {assignment.assignmentType && (
            <div className="text-xs mb-2">
              <span className={cn(
                "px-2 py-0.5 rounded text-white font-medium",
                assignment.assignmentType === 'titular' && 'bg-purple-600',
                assignment.assignmentType === 'apoyo' && 'bg-blue-600',
                assignment.assignmentType === 'temporal' && 'bg-yellow-600',
                assignment.assignmentType === 'suplente' && 'bg-orange-600'
              )}>
                {assignment.assignmentType.charAt(0).toUpperCase() + assignment.assignmentType.slice(1)}
              </span>
            </div>
          )}

          {/* Hours progress (if applicable) */}
          {maxHours > 0 && (
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex-1 rounded-full h-1.5 overflow-hidden",
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              )}>
                <div
                  className={cn("h-1.5 rounded-full transition-all", status.barColor)}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <span className={cn("text-xs font-medium whitespace-nowrap", status.color)}>
                {assignedHours.toFixed(1)}h
              </span>
            </div>
          )}
        </div>

        <GripVertical className={cn(
          "h-4 w-4 flex-shrink-0 mt-1",
          isDark ? 'text-gray-500' : 'text-gray-400'
        )} />
      </div>

      {/* Status indicator */}
      <div className={cn(
        "text-xs mt-2 flex items-center gap-1",
        isDark ? 'text-gray-400' : 'text-gray-600'
      )}>
        {isUsed && (
          <>
            <AlertCircle className="h-3 w-3" />
            <span>En uso</span>
          </>
        )}
        {!isUsed && (
          <span>Arrastra para programar</span>
        )}
      </div>
    </div>
  );
}
