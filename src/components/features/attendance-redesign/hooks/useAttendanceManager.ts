/**
 * src/components/features/attendance-redesign/hooks/useAttendanceManager.ts
 *
 * Hook personalizado para gestionar el estado de asistencia
 */

import { useState, useCallback } from "react";
import { AttendanceStatus } from "@/types/attendanceTypes";
import { Student } from "@/types/global";

export interface Section {
  id: number;
  name: string;
  students: Student[];
  courses: Array<{
    id: number;
    code: string;
    name: string;
    color?: string;
    area?: string;
    isActive: boolean;
  }>;
}

interface AttendanceRecord {
  [studentId: number]: {
    [courseId: number]: AttendanceStatus;
  };
}

interface SavingStatus {
  [sectionId: number]: "idle" | "saving" | "success" | "error";
}

export function useAttendanceManager() {
  // Estado de secciones expandidas
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  // Estado de cursos seleccionados por sección
  const [selectedCourses, setSelectedCourses] = useState<{
    [sectionId: number]: number[];
  }>({});

  // Estado de asistencia: { studentId: { courseId: status } }
  const [attendanceState, setAttendanceState] = useState<AttendanceRecord>({});

  // Estado de guardado por sección
  const [savingStatus, setSavingStatus] = useState<SavingStatus>({});

  // Expandir/colapsar sección
  const toggleSection = useCallback((sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  // Seleccionar/deseleccionar curso en una sección
  const toggleCourse = useCallback((sectionId: number, courseId: number) => {
    setSelectedCourses((prev) => {
      const currentCourses = prev[sectionId] || [];
      const isSelected = currentCourses.includes(courseId);

      return {
        ...prev,
        [sectionId]: isSelected
          ? currentCourses.filter((id) => id !== courseId)
          : [...currentCourses, courseId],
      };
    });
  }, []);

  // Establecer estado de asistencia para un estudiante y curso
  const setStudentAttendance = useCallback(
    (studentId: number, courseId: number, status: AttendanceStatus) => {
      setAttendanceState((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [courseId]: status,
        },
      }));
    },
    []
  );

  // Obtener estado de asistencia de un estudiante en un curso
  const getAttendanceStatus = useCallback(
    (studentId: number, courseId: number): AttendanceStatus => {
      return attendanceState[studentId]?.[courseId] || "pending";
    },
    [attendanceState]
  );

  // Contar estudiantes con asistencia registrada en los cursos seleccionados
  const countRecordedStudents = useCallback(
    (sectionId: number, selectedCourseIds: number[], students: Student[]): number => {
      if (selectedCourseIds.length === 0) return 0;

      return students.filter((student) => {
        // Un estudiante cuenta como "registrado" si tiene al menos un estado
        // diferente a "pending" en cualquiera de los cursos seleccionados
        return selectedCourseIds.some((courseId) => {
          const status = attendanceState[student.id]?.[courseId];
          return status && status !== "pending";
        });
      }).length;
    },
    [attendanceState]
  );

  // Guardar asistencia de una sección
  const handleSaveAttendance = useCallback(
    async (
      sectionId: number,
      selectedCourseIds: number[],
      onSuccess?: () => void,
      onError?: (error: string) => void
    ) => {
      setSavingStatus((prev) => ({ ...prev, [sectionId]: "saving" }));

      try {
        // TODO: Aquí se debe integrar con el servicio de backend
        // Por ahora, simulamos un guardado exitoso

        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Log de la asistencia que se guardaría
        console.log("[useAttendanceManager] Saving attendance:", {
          sectionId,
          selectedCourseIds,
          attendanceData: attendanceState,
        });

        setSavingStatus((prev) => ({ ...prev, [sectionId]: "success" }));

        // Reset a idle después de 2 segundos
        setTimeout(() => {
          setSavingStatus((prev) => ({ ...prev, [sectionId]: "idle" }));
        }, 2000);

        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("[useAttendanceManager] Error saving attendance:", error);
        setSavingStatus((prev) => ({ ...prev, [sectionId]: "error" }));

        // Reset a idle después de 3 segundos
        setTimeout(() => {
          setSavingStatus((prev) => ({ ...prev, [sectionId]: "idle" }));
        }, 3000);

        if (onError) {
          onError(error instanceof Error ? error.message : "Error desconocido");
        }
      }
    },
    [attendanceState]
  );

  return {
    // Estado
    expandedSections,
    selectedCourses,
    attendanceState,
    savingStatus,

    // Acciones
    toggleSection,
    toggleCourse,
    setStudentAttendance,
    getAttendanceStatus,
    countRecordedStudents,
    handleSaveAttendance,
  };
}
