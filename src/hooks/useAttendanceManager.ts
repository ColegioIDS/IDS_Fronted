/**
 * src/hooks/useAttendanceManager.ts
 * 
 * Hook para manejar la lógica del gestor de asistencia
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { AttendanceStatus, AttendanceRecord } from "@/types/attendanceTypes";
import { Course, Student } from "@/types/global";

export interface Section {
  id: number;
  name: string;
  students: Student[];
  courses: Course[];
}

export function useAttendanceManager() {
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Record<number, number[]>>({});
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [savingStatus, setSavingStatus] = useState<
    Record<number, "idle" | "saving" | "success" | "error">
  >({});

  // Toggle sección expandida
  const toggleSection = useCallback((sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  // Toggle curso seleccionado
  const toggleCourse = useCallback((sectionId: number, courseId: number) => {
    setSelectedCourses((prev) => {
      const courses = prev[sectionId] || [];
      return {
        ...prev,
        [sectionId]: courses.includes(courseId)
          ? courses.filter((id) => id !== courseId)
          : [...courses, courseId],
      };
    });
  }, []);

  // Establecer estado de asistencia
  const setStudentAttendance = useCallback(
    (studentId: number, courseId: number, status: AttendanceStatus) => {
      setAttendance((prev) => {
        const existing = prev.find(
          (a) => a.studentId === studentId && a.courseId === courseId
        );

        if (existing) {
          return prev.map((a) =>
            a.studentId === studentId && a.courseId === courseId
              ? { ...a, status }
              : a
          );
        } else {
          return [...prev, { studentId, courseId, status }];
        }
      });
    },
    []
  );

  // Obtener estado de asistencia
  const getAttendanceStatus = useCallback(
    (studentId: number, courseId: number): AttendanceStatus => {
      const record = attendance.find(
        (a) => a.studentId === studentId && a.courseId === courseId
      );
      return record?.status || "pending";
    },
    [attendance]
  );

  // Contar estudiantes registrados
  const countRecordedStudents = useCallback(
    (sectionId: number, courseIds: number[], students: Student[]) => {
      if (courseIds.length === 0) return 0;

      return students.filter((student) =>
        courseIds.some((courseId) =>
          attendance.some(
            (a) => a.studentId === student.id && a.courseId === courseId
          )
        )
      ).length;
    },
    [attendance]
  );

  // Guardar asistencia
  const handleSaveAttendance = useCallback(
    async (
      sectionId: number,
      selectedCourseIds: number[],
      onSuccess?: () => void,
      onError?: (message: string) => void
    ) => {
      setSavingStatus((prev) => ({ ...prev, [sectionId]: "saving" }));

      try {
        // Filtrar records para guardar
        const recordsToSave = attendance.filter((a) =>
          selectedCourseIds.includes(a.courseId)
        );

        // TODO: Conectar con tu backend
        console.log("Records to save:", recordsToSave);

        // Simulación
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setSavingStatus((prev) => ({ ...prev, [sectionId]: "success" }));

        setTimeout(() => {
          setSavingStatus((prev) => ({ ...prev, [sectionId]: "idle" }));
          setAttendance((prev) =>
            prev.filter((a) => !selectedCourseIds.includes(a.courseId))
          );
          setSelectedCourses((prev) => ({ ...prev, [sectionId]: [] }));
          onSuccess?.();
        }, 2000);
      } catch (error) {
        setSavingStatus((prev) => ({ ...prev, [sectionId]: "error" }));
        setTimeout(() => {
          setSavingStatus((prev) => ({ ...prev, [sectionId]: "idle" }));
        }, 2000);
        onError?.(error instanceof Error ? error.message : "Error desconocido");
      }
    },
    [attendance]
  );

  return {
    expandedSections,
    selectedCourses,
    attendance,
    savingStatus,
    toggleSection,
    toggleCourse,
    setStudentAttendance,
    getAttendanceStatus,
    countRecordedStudents,
    handleSaveAttendance,
  };
}