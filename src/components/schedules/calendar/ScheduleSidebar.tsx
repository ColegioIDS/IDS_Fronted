// components/schedules/calendar/ScheduleSidebar.tsx
"use client";

import { BookOpen, User, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { ScheduleChange } from "@/types/schedules.types";
import { DraggableCourse } from "../draggable/DraggableCourse";
import { DraggableTeacher } from "../draggable/DraggableTeacher";

// ✅ Importar tipos de schedules (simplificados)
import type { Course as SimpleCourse, Teacher as SimpleTeacher } from "@/types/schedules";
// ✅ Importar tipos completos para los draggables
import type { Course as FullCourse, CourseArea } from "@/types/courses";
import type { User as FullUser } from "@/types/user";
interface ScheduleSidebarProps {
  courses: SimpleCourse[];
  teachers: SimpleTeacher[];
  teacherHours: { [key: number]: number };
  pendingChanges: ScheduleChange[];
  tempSchedulesCount: number;
  hasUnsavedChanges: boolean;
}

export function ScheduleSidebar({
  courses,
  teachers,
  teacherHours,
  pendingChanges,
  tempSchedulesCount,
  hasUnsavedChanges
}: ScheduleSidebarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const createdCount = pendingChanges.filter(c => c.action === 'create').length + tempSchedulesCount;
  const updatedCount = pendingChanges.filter(c => c.action === 'update').length;
  const deletedCount = pendingChanges.filter(c => c.action === 'delete').length;

  const adaptCourse = (course: SimpleCourse): FullCourse => ({
    id: course.id,
    code: course.code,
    name: course.name,
    area: (course.area as CourseArea) || null, // ✅ Cast a CourseArea
    color: course.color || '',
    isActive: true,
    createdAt: new Date().toISOString(), // ✅ String ISO
    updatedAt: new Date().toISOString()  // ✅ String ISO
  });

  const adaptTeacher = (teacher: SimpleTeacher): FullUser => ({
    id: teacher.id,
    username: teacher.email.split('@')[0],
    givenNames: teacher.givenNames,
    lastNames: teacher.lastNames,
    email: teacher.email,
    gender: 'OTHER',
    canAccessPlatform: true,
    isActive: true,
    accountVerified: true,
    createdAt: new Date().toISOString(), // ✅ String ISO
    updatedAt: new Date().toISOString(), // ✅ String ISO
  
  });
  return (
    <div className="space-y-4">
      {/* Panel de Cursos */}
      <Card className={`backdrop-blur-sm border-0 shadow-xl overflow-hidden ${
        isDark 
          ? 'bg-gray-800/95 border-gray-700' 
          : 'bg-white/95'
      }`}>
        <CardHeader className={`pb-3 border-b ${
          isDark
            ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-gray-700'
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-gray-200'
        }`}>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              isDark ? 'bg-green-900/50' : 'bg-green-100'
            }`}>
              <BookOpen className={`h-4 w-4 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <span className={isDark ? 'text-green-300' : 'text-green-800'}>
              Cursos Disponibles
            </span>
            <Badge 
              variant="secondary" 
              className={`ml-auto ${
                isDark 
                  ? 'bg-green-900/50 text-green-300' 
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {courses?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <ScrollArea className="h-[250px] pr-3">
            <div className="space-y-2">
              {courses?.map((course) => (
                <DraggableCourse
                  key={course.id}
                  course={adaptCourse(course)} // ✅ Adaptar tipo
                />
              ))}
              {(!courses || courses.length === 0) && (
                <div className={`text-center py-8 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No hay cursos disponibles
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Panel de Profesores */}
      <Card className={`backdrop-blur-sm border-0 shadow-xl overflow-hidden ${
        isDark 
          ? 'bg-gray-800/95 border-gray-700' 
          : 'bg-white/95'
      }`}>
        <CardHeader className={`pb-3 border-b ${
          isDark
            ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-gray-700'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
        }`}>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              isDark ? 'bg-blue-900/50' : 'bg-blue-100'
            }`}>
              <User className={`h-4 w-4 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <span className={isDark ? 'text-blue-300' : 'text-blue-800'}>
              Profesores
            </span>
            <Badge 
              variant="secondary" 
              className={`ml-auto ${
                isDark 
                  ? 'bg-blue-900/50 text-blue-300' 
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {teachers?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-2">
              {teachers?.map((teacher) => (
                <DraggableTeacher
                  key={teacher.id}
                  teacher={adaptTeacher(teacher)} // ✅ Adaptar tipo
                  assignedHours={teacherHours[teacher.id] || 0}
                />
              ))}
              {(!teachers || teachers.length === 0) && (
                <div className={`text-center py-8 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No hay profesores disponibles
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Panel de Cambios Pendientes */}
      {hasUnsavedChanges && (
        <Card className={`shadow-xl overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-800/50'
            : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
        }`}>
          <CardHeader className={`pb-3 border-b ${
            isDark ? 'border-orange-800/50' : 'border-orange-200'
          }`}>
            <CardTitle className={`text-lg flex items-center gap-2 ${
              isDark ? 'text-orange-300' : 'text-orange-800'
            }`}>
              <div className={`p-1.5 rounded-lg ${
                isDark ? 'bg-orange-900/50' : 'bg-orange-100'
              }`}>
                <AlertCircle className={`h-4 w-4 animate-pulse ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
              <span>Cambios Pendientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {createdCount > 0 && (
                <div className={`flex items-center justify-between p-2 rounded-lg ${
                  isDark 
                    ? 'bg-green-900/30 border border-green-800/50' 
                    : 'bg-green-50'
                }`}>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-green-300' : 'text-green-700'
                  }`}>
                    ✨ Nuevos horarios
                  </span>
                  <Badge className={
                    isDark 
                      ? 'bg-green-700 text-white' 
                      : 'bg-green-600 text-white'
                  }>
                    +{createdCount}
                  </Badge>
                </div>
              )}
              
              {updatedCount > 0 && (
                <div className={`flex items-center justify-between p-2 rounded-lg ${
                  isDark 
                    ? 'bg-blue-900/30 border border-blue-800/50' 
                    : 'bg-blue-50'
                }`}>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    ✏️ Modificaciones
                  </span>
                  <Badge className={
                    isDark 
                      ? 'bg-blue-700 text-white' 
                      : 'bg-blue-600 text-white'
                  }>
                    {updatedCount}
                  </Badge>
                </div>
              )}
              
              {deletedCount > 0 && (
                <div className={`flex items-center justify-between p-2 rounded-lg ${
                  isDark 
                    ? 'bg-red-900/30 border border-red-800/50' 
                    : 'bg-red-50'
                }`}>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-red-300' : 'text-red-700'
                  }`}>
                    🗑️ Eliminaciones
                  </span>
                  <Badge className={
                    isDark 
                      ? 'bg-red-700 text-white' 
                      : 'bg-red-600 text-white'
                  }>
                    -{deletedCount}
                  </Badge>
                </div>
              )}
              
              <div className={`pt-2 border-t ${
                isDark ? 'border-orange-800/50' : 'border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Total de cambios
                  </span>
                  <span className={`text-lg font-bold ${
                    isDark ? 'text-orange-300' : 'text-orange-700'
                  }`}>
                    {createdCount + updatedCount + deletedCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}