// components/schedules/draggable/DraggableCourse.tsx
"use client";

import { useCallback } from "react";
import { BookOpen, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/courses";
import { useDragManager } from "@/hooks/useDragManager";

interface DraggableCourseProps {
  course: Course;
  isUsed?: boolean;
}

export function DraggableCourse({ course, isUsed = false }: DraggableCourseProps) {
  const { elementRef, startDrag } = useDragManager();
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startDrag(e, {
      id: course.id,
      type: 'course',
      name: course.name,
      data: course,
    });
  }, [course, startDrag]);

  return (
    <div
      ref={elementRef}
      className={cn(
        "p-3 rounded-lg border-2 border-dashed transition-all select-none",
        "cursor-grab active:cursor-grabbing",
        "border-green-300 bg-green-50 text-green-700",
        "hover:bg-green-100 hover:border-green-400",
        "transform hover:scale-[1.02]"
      )}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium truncate flex-1">{course.name}</span>
        <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>
      <div className="mt-1 text-xs text-gray-600">
        {isUsed ? "En uso" : "Arrastra para programar"}
      </div>
    </div>
  );
}