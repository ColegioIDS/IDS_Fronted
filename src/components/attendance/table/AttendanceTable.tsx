/**
 * src/components/attendance/table/AttendanceTable.tsx
 * 
 * Tabla para registrar asistencia de estudiantes
 */

"use client";

import React from "react";
import { Course, Student } from "@/types/global";
import { AttendanceStatus, ATTENDANCE_STATUSES } from "@/types/attendanceTypes";

interface AttendanceTableProps {
  students: Student[];
  selectedCourses: Course[];
  onStatusChange: (studentId: number, courseId: number, status: AttendanceStatus) => void;
  getStatus: (studentId: number, courseId: number) => AttendanceStatus;
}

export function AttendanceTable({
  students,
  selectedCourses,
  onStatusChange,
  getStatus,
}: AttendanceTableProps) {
  if (students.length === 0 || selectedCourses.length === 0) {
    return null;
  }


  console.log("Rendering AttendanceTable with students:", students);

  return (
    <div className="mb-8 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Registra asistencia para {selectedCourses.length} curso{selectedCourses.length !== 1 ? "s" : ""}
      </h3>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Header */}
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 w-48">
                  Estudiante
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 w-24">
                  Matrícula
                </th>
                {selectedCourses.map((course) => (
                  <th
                    key={course.id}
                    className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 min-w-32"
                  >
                    <span className="inline-block px-2 py-1 rounded bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 text-xs font-bold">
                      {course.code}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {students.map((student, idx) => (
                <tr
                  key={student.id}
                  className={`border-b border-gray-200 dark:border-gray-800 transition-colors ${
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-950"
                      : "bg-gray-50 dark:bg-gray-900"
                  } hover:bg-blue-50 dark:hover:bg-blue-950`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {student.givenNames} {student.lastNames}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {student.codeSIRE}
                  </td>
                  {selectedCourses.map((course) => {
                    const status = getStatus(student.id, course.id);
                    const statusConfig = ATTENDANCE_STATUSES.find(
                      (s) => s.value === status
                    );

                    return (
                      <td
                        key={course.id}
                        className="px-4 py-3 text-center"
                      >
                        <div className="flex gap-1 justify-center">
                          {ATTENDANCE_STATUSES.map((statusOption) => {
                            const isSelected = status === statusOption.value;

                            return (
                              <button
                                key={statusOption.value}
                                onClick={() =>
                                  onStatusChange(
                                    student.id,
                                    course.id,
                                    statusOption.value
                                  )
                                }
                                className={`px-2.5 py-1.5 rounded font-bold text-xs transition-all duration-200 border ${
                                  isSelected
                                    ? `${statusOption.className} border-current`
                                    : "border-transparent opacity-50 hover:opacity-75"
                                }`}
                                title={statusOption.label}
                              >
                                {statusOption.icon}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}