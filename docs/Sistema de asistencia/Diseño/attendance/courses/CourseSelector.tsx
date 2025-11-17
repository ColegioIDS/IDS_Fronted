/**
 * src/components/attendance/courses/CourseSelector.tsx
 * 
 * Selector de cursos para una sección específica
 */

"use client";

import React from "react";
import { BookOpen, Check } from "lucide-react";
import { Course } from "@/types/global";

interface CourseSelectorProps {
  courses: Course[];
  selectedCourseIds: number[];
  onToggleCourse: (courseId: number) => void;
}

export function CourseSelector({
  courses,
  selectedCourseIds,
  onToggleCourse,
}: CourseSelectorProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Selecciona los cursos
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          ({courses.length} disponible{courses.length !== 1 ? "s" : ""})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {courses.map((course) => {
          const isSelected = selectedCourseIds.includes(course.id);

          return (
            <button
              key={course.id}
              onClick={() => onToggleCourse(course.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm"
                  : "border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {course.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {course.code}
                  </p>
                  {course.area && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {course.area}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 p-1 rounded bg-blue-500 dark:bg-blue-600">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}