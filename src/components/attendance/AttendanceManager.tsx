/**
 * src/components/attendance/AttendanceManager.tsx
 * ✅ VERSIÓN CORREGIDA - Basada en estructura JSON real del backend
 * 
 * El JSON tiene esta estructura:
 * grades[].grade.sections[].courseAssignments[].course
 * grades[].grade.sections[].enrollments[].student
 */

"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGlobal } from "@/hooks/useGlobal";
import { AttendanceHeader } from "./header/AttendanceHeader";
import { SectionCard } from "./section/SectionCard";
import {
  LoadingState,
  NoSectionsState,
} from "./states/EmptyAndLoadingStates";
import { useAttendanceManager, Section } from "@/hooks/useAttendanceManager";

export default function AttendanceManager() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );

  // ============================================
  // Detectar scope del usuario
  // ============================================

  const attendancePermission = user?.role?.permissions?.find(
    (p) => p.permission?.module === "attendance"
  );
  const userScope = attendancePermission?.scope || null;
  const isAdmin = userScope === "all";

  // ============================================
  // Queries según scope
  // ============================================

  const fullCycleQuery = useGlobal.getFullCycleStructure(1, isAdmin);
  const myCoursesQuery = useGlobal.getMyCoursesWithStudents(1, !isAdmin);

  // ============================================
  // Hook de lógica de asistencia
  // ============================================

  const {
    expandedSections,
    selectedCourses,
    savingStatus,
    toggleSection,
    toggleCourse,
    setStudentAttendance,
    getAttendanceStatus,
    countRecordedStudents,
    handleSaveAttendance,
  } = useAttendanceManager();

  // ============================================
  // Procesar secciones según scope - ✅ CORREGIDO
  // ============================================

  const visibleSections = useMemo<Section[]>(() => {
    // ============================================
    // PARA ADMIN: fullCycleStructure
    // ============================================
    if (isAdmin && fullCycleQuery.data) {
      const sections: Section[] = [];

      // ✅ CRÍTICO: Recorre grades[].grade.sections
      fullCycleQuery.data.grades.forEach((gc: any) => {
        // gc es { id, cycleId, gradeId, grade: {...} }
        
        gc.grade.sections.forEach((section: any) => {
          // section es { id, name, capacity, gradeId, teacherId, courseAssignments[], enrollments[] }
          
          const enrollments = section.enrollments || [];

          // ✅ CORRECTO: courseAssignments ya contiene course
          const courses = (section.courseAssignments || []).map(
            (ca: any) => ({
              id: ca.course.id,
              code: ca.course.code,
              name: ca.course.name,
              color: ca.course.color,
              area: ca.course.area,
              isActive: ca.course.isActive,
            })
          );

          console.log(`Sección ${section.name} - Cursos encontrados:`, courses);

          sections.push({
            id: section.id,
            name: section.name,
            students: enrollments.map((e: any) => ({
              id: e.student.id,
              codeSIRE: e.student.codeSIRE,
              givenNames: e.student.givenNames,
              lastNames: e.student.lastNames,
              gender: e.student.gender,
              birthDate: e.student.birthDate,
            })),
            courses: courses, // ✅ Poblado correctamente
          });
        });
      });

      console.log("Admin - Secciones procesadas:", sections);
      return sections;
    }

    // ============================================
    // PARA DOCENTE: myCoursesWithStudents
    // ============================================
    if (!isAdmin && myCoursesQuery.data) {
      const sectionsMap = new Map<number, Section>();

      myCoursesQuery.data.forEach((courseData: any) => {
        const sectionId = courseData.section.id;

        if (!sectionsMap.has(sectionId)) {
          const students = courseData.students.map((student: any) => ({
              id: student.id,
              codeSIRE: student.codeSIRE,
              givenNames: student.givenNames,
              lastNames: student.lastNames,
              gender: student.gender,
              birthDate: student.birthDate,
            }));
  
            sectionsMap.set(sectionId, {
              id: sectionId,
              name: courseData.section.name,
              students: Array.from(
                new Map(students.map((s: any) => [s.id, s])).values()
              ) as typeof students,
              courses: [],
            });
        }

        const section = sectionsMap.get(sectionId)!;
        const course = {
          id: courseData.course.id,
          code: courseData.course.code,
          name: courseData.course.name,
          color: courseData.course.color,
          area: courseData.course.area,
          isActive: courseData.course.isActive,
        };

        if (!section.courses.some((c) => c.id === course.id)) {
          section.courses.push(course);
        }
      });

      const result = Array.from(sectionsMap.values());
      console.log("Docente - Secciones procesadas:", result);
      return result;
    }

    return [];
  }, [isAdmin, fullCycleQuery.data, myCoursesQuery.data]);

  // ============================================
  // Loading state
  // ============================================

  const isLoading = isAdmin
    ? fullCycleQuery.isLoading
    : myCoursesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <LoadingState />
        </div>
      </div>
    );
  }

  // ============================================
  // No sections state
  // ============================================

  if (visibleSections.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <NoSectionsState isAdmin={isAdmin} />
        </div>
      </div>
    );
  }

  // ============================================
  // Main render
  // ============================================

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <AttendanceHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          userScope={userScope}
          visibleSectionsCount={visibleSections.length}
        />

        {/* Sections */}
        <div className="space-y-4">
          {visibleSections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            const selectedCourseIds = selectedCourses[section.id] || [];
            const selectedCourseObjects = section.courses.filter((c) =>
              selectedCourseIds.includes(c.id)
            );
            const recordedCount = countRecordedStudents(
              section.id,
              selectedCourseIds,
              section.students
            );

            return (
              <SectionCard
                key={section.id}
                section={section}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleSection(section.id)}
                selectedCourseIds={selectedCourseIds}
                onToggleCourse={(courseId) =>
                  toggleCourse(section.id, courseId)
                }
                recordedStudentCount={recordedCount}
                onStatusChange={setStudentAttendance}
                getStatus={getAttendanceStatus}
                onSave={() =>
                  handleSaveAttendance(
                    section.id,
                    selectedCourseIds,
                    () => {
                      console.log("Asistencia guardada exitosamente");
                    },
                    (error) => {
                      console.error("Error al guardar:", error);
                    }
                  )
                }
                savingState={savingStatus[section.id] || "idle"}
              />
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">
              Información de la sesión
            </p>
            <ul className="space-y-1">
              <li>
                • Scope:{" "}
                {userScope === "all" ? "Administrador" : "Docente"}
              </li>
              <li>• Secciones disponibles: {visibleSections.length}</li>
              <li>
                • Total de estudiantes:{" "}
                {visibleSections.reduce((sum, s) => sum + s.students.length, 0)}
              </li>
              <li>
                • Total de cursos:{" "}
                {visibleSections.reduce((sum, s) => sum + s.courses.length, 0)}
              </li>
              <li>
                • Fecha: {new Date(currentDate).toLocaleDateString("es-ES")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}