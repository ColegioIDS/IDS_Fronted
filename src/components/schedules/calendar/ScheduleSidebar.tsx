// components/schedules/calendar/ScheduleSidebar.tsx
"use client";

import { BookOpen, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types/courses";
import type { User as Teacher } from "@/types/user";
import type { ScheduleChange } from "@/types/schedules.types";
import { DraggableCourse } from "../draggable/DraggableCourse";
import { DraggableTeacher } from "../draggable/DraggableTeacher";

interface ScheduleSidebarProps {
  courses: Course[];
  teachers: Teacher[];
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
  const createdCount = pendingChanges.filter(c => c.action === 'create').length + tempSchedulesCount;
  const updatedCount = pendingChanges.filter(c => c.action === 'update').length;
  const deletedCount = pendingChanges.filter(c => c.action === 'delete').length;

  return (
    <div className="space-y-4">
      {/* Panel de Cursos */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-green-800">Cursos Disponibles</span>
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
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
                  course={course}
                />
              ))}
              {(!courses || courses.length === 0) && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No hay cursos disponibles
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Panel de Profesores */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-blue-800">Profesores</span>
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
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
                  teacher={teacher}
                  assignedHours={teacherHours[teacher.id] || 0}
                />
              ))}
              {(!teachers || teachers.length === 0) && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No hay profesores disponibles
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Panel de Cambios Pendientes */}
      {hasUnsavedChanges && (
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-orange-200">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600 animate-pulse" />
              </div>
              <span>Cambios Pendientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {createdCount > 0 && (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700 font-medium">
                    ✨ Nuevos horarios
                  </span>
                  <Badge className="bg-green-600 text-white">
                    +{createdCount}
                  </Badge>
                </div>
              )}
              
              {updatedCount > 0 && (
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">
                    ✏️ Modificaciones
                  </span>
                  <Badge className="bg-blue-600 text-white">
                    {updatedCount}
                  </Badge>
                </div>
              )}
              
              {deletedCount > 0 && (
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm text-red-700 font-medium">
                    🗑️ Eliminaciones
                  </span>
                  <Badge className="bg-red-600 text-white">
                    -{deletedCount}
                  </Badge>
                </div>
              )}
              
              <div className="pt-2 border-t border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Total de cambios
                  </span>
                  <span className="text-lg font-bold text-orange-700">
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