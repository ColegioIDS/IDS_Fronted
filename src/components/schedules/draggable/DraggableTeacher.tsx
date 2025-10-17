// components/schedules/draggable/DraggableTeacher.tsx
"use client";

import { useCallback } from "react";
import { User, GripVertical } from "lucide-react";
import { useTheme } from "next-themes"; // ✅ AGREGAR
import { cn } from "@/lib/utils";
import type { User as Teacher } from "@/types/user";
import { useDragManager } from "@/hooks/useDragManager";

interface DraggableTeacherProps {
  teacher: Teacher;
  assignedHours: number;
  maxHours?: number;
}

export function DraggableTeacher({ 
  teacher, 
  assignedHours, 
  maxHours = 40 
}: DraggableTeacherProps) {
  const { elementRef, startDrag } = useDragManager();
  const { theme } = useTheme(); // ✅ AGREGAR
  const isDark = theme === 'dark'; // ✅ AGREGAR
  const percentage = (assignedHours / maxHours) * 100;
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startDrag(e, {
      id: teacher.id,
      type: 'teacher',
      name: `${teacher.givenNames} ${teacher.lastNames}`,
      data: teacher,
    });
  }, [teacher, startDrag]);

  // ✅ MODIFICADO: Colores con soporte dark mode
  const getStatusColors = () => {
    if (percentage > 90) {
      return isDark ? {
        border: "border-red-800",
        bg: "bg-red-900/30",
        text: "text-red-300",
        hover: "hover:bg-red-900/50",
        bar: "bg-red-600"
      } : {
        border: "border-red-300",
        bg: "bg-red-50",
        text: "text-red-700",
        hover: "hover:bg-red-100",
        bar: "bg-red-500"
      };
    } else if (percentage > 70) {
      return isDark ? {
        border: "border-yellow-800",
        bg: "bg-yellow-900/30",
        text: "text-yellow-300",
        hover: "hover:bg-yellow-900/50",
        bar: "bg-yellow-600"
      } : {
        border: "border-yellow-300",
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        hover: "hover:bg-yellow-100",
        bar: "bg-yellow-500"
      };
    } else {
      return isDark ? {
        border: "border-blue-800",
        bg: "bg-blue-900/30",
        text: "text-blue-300",
        hover: "hover:bg-blue-900/50",
        bar: "bg-blue-600"
      } : {
        border: "border-blue-300",
        bg: "bg-blue-50",
        text: "text-blue-700",
        hover: "hover:bg-blue-100",
        bar: "bg-blue-500"
      };
    }
  };

  const colors = getStatusColors();
  
  return (
    <div
      ref={elementRef}
      className={cn(
        "p-3 rounded-lg border-2 border-dashed transition-all",
        "cursor-grab active:cursor-grabbing select-none",
        "transform hover:scale-[1.02]",
        colors.border,
        colors.bg,
        colors.text,
        colors.hover
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {teacher.givenNames} {teacher.lastNames}
          </div>
          {teacher.teacherDetails?.academicDegree && (
            <div className={cn(
              "text-xs truncate",
              isDark ? "text-gray-400" : "text-gray-500" // ✅ MODIFICADO
            )}>
              {teacher.teacherDetails.academicDegree}
            </div>
          )}
        </div>
        <GripVertical className={cn(
          "h-4 w-4 flex-shrink-0",
          isDark ? "text-gray-500" : "text-gray-400" // ✅ MODIFICADO
        )} />
      </div>
      
      <div className="mt-2 flex items-center gap-2">
        <div className={cn(
          "flex-1 rounded-full h-1.5 overflow-hidden",
          isDark ? "bg-gray-700" : "bg-gray-200" // ✅ MODIFICADO
        )}>
          <div 
            className={cn("h-1.5 rounded-full transition-all", colors.bar)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium whitespace-nowrap">
          {assignedHours.toFixed(1)}h/{maxHours}h
        </span>
      </div>
    </div>
  );
}