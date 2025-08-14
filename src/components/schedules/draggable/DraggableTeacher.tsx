// components/schedules/draggable/DraggableTeacher.tsx
"use client";

import { useCallback } from "react";
import { User, GripVertical } from "lucide-react";
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
  const percentage = (assignedHours / maxHours) * 100;
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startDrag(e, {
      id: teacher.id,
      type: 'teacher',
      name: `${teacher.givenNames} ${teacher.lastNames}`,
      data: teacher,
    });
  }, [teacher, startDrag]);

  // Determinar el estado visual basado en las horas asignadas
  const getStatusColors = () => {
    if (percentage > 90) {
      return {
        border: "border-red-300",
        bg: "bg-red-50",
        text: "text-red-700",
        hover: "hover:bg-red-100",
        bar: "bg-red-500"
      };
    } else if (percentage > 70) {
      return {
        border: "border-yellow-300",
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        hover: "hover:bg-yellow-100",
        bar: "bg-yellow-500"
      };
    } else {
      return {
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
            <div className="text-xs text-gray-500 truncate">
              {teacher.teacherDetails.academicDegree}
            </div>
          )}
        </div>
        <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
      
      {/* Barra de progreso de horas */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
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