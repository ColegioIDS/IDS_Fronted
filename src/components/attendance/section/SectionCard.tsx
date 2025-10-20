/**
 * src/components/attendance/section/SectionCard.tsx
 * 
 * Tarjeta de sección expandible con cursos y estudiantes
 */

"use client";

import React from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import { Course, Student } from "@/types/global";
import { AttendanceStatus } from "@/types/attendanceTypes";
import { CourseSelector } from "../courses/CourseSelector";
import { AttendanceTable } from "../table/AttendanceTable";
import { SaveButton } from "../save/SaveButton";

interface SectionCardProps {
  section: {
    id: number;
    name: string;
    courses: Course[];
    students: Student[];
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedCourseIds: number[];
  onToggleCourse: (courseId: number) => void;
  recordedStudentCount: number;
  onStatusChange: (studentId: number, courseId: number, status: AttendanceStatus) => void;
  getStatus: (studentId: number, courseId: number) => AttendanceStatus;
  onSave: () => void;
  savingState: "idle" | "saving" | "success" | "error";
}

export function SectionCard({
  section,
  isExpanded,
  onToggleExpand,
  selectedCourseIds,
  onToggleCourse,
  recordedStudentCount,
  onStatusChange,
  getStatus,
  onSave,
  savingState,
}: SectionCardProps) {
  const selectedCourses = section.courses.filter((c) =>
    selectedCourseIds.includes(c.id)
  );

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-b border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {section.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{section.students.length} estudiantes</span>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <span>{section.courses.length} cursos disponibles</span>
            </div>
          </div>
        </div>

        {selectedCourseIds.length > 0 && (
          <div className="text-right ml-4 flex-shrink-0">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Progreso
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {recordedStudentCount}/{section.students.length}
            </div>
          </div>
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-800">
          {/* Course Selector */}
          <CourseSelector
            courses={section.courses}
            selectedCourseIds={selectedCourseIds}
            onToggleCourse={onToggleCourse}
          />

          {/* Attendance Table */}
          {selectedCourses.length > 0 ? (
            <>
              <AttendanceTable
                students={section.students}
                selectedCourses={selectedCourses}
                onStatusChange={onStatusChange}
                getStatus={getStatus}
              />

              {/* Save Button */}
              <SaveButton
                savingState={savingState}
                onSave={onSave}
                disabled={savingState !== "idle"}
              />
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Selecciona al menos un curso para registrar asistencia
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}