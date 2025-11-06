// src/components/features/schedules/calendar/ScheduleSidebar.tsx
"use client";

import { BookOpen, AlertCircle, Plus, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { ScheduleChange, CourseAssignment } from "@/types/schedules.types";
import { DraggableCourseAssignment } from "@/components/features/schedules/draggable";

interface ScheduleSidebarProps {
  courseAssignments: CourseAssignment[];
  assignmentHours?: { [key: number]: number };
  pendingChanges: ScheduleChange[];
  hasUnsavedChanges: boolean;
}

export function ScheduleSidebar({
  courseAssignments,
  assignmentHours = {},
  pendingChanges,
  hasUnsavedChanges
}: ScheduleSidebarProps) {
  const createdCount = pendingChanges.filter(c => c.action === 'create').length;
  const updatedCount = pendingChanges.filter(c => c.action === 'update').length;
  const deletedCount = pendingChanges.filter(c => c.action === 'delete').length;

  return (
    <div className="space-y-4">
      {/* Pending Changes Panel */}
      {hasUnsavedChanges && (
        <Card className="shadow-xl overflow-hidden bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3 border-b border-orange-200 dark:border-orange-800">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-900 dark:text-orange-300">
              <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <AlertCircle className="h-4 w-4 animate-pulse text-orange-600 dark:text-orange-400" />
              </div>
              <span>Cambios Pendientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {createdCount > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Nuevos horarios
                    </span>
                  </div>
                  <Badge className="bg-green-600 dark:bg-green-700 text-white">
                    +{createdCount}
                  </Badge>
                </div>
              )}

              {updatedCount > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Modificaciones
                    </span>
                  </div>
                  <Badge className="bg-blue-600 dark:bg-blue-700 text-white">
                    {updatedCount}
                  </Badge>
                </div>
              )}

              {deletedCount > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      Eliminaciones
                    </span>
                  </div>
                  <Badge className="bg-red-600 dark:bg-red-700 text-white">
                    -{deletedCount}
                  </Badge>
                </div>
              )}

              <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Total de cambios
                  </span>
                  <span className="text-lg font-bold text-orange-700 dark:text-orange-300">
                    {createdCount + updatedCount + deletedCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Assignments Panel */}
      <Card className="backdrop-blur-sm border-0 shadow-xl overflow-hidden bg-white/95 dark:bg-gray-800/95 dark:border-gray-700">
        <CardHeader className="pb-3 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span>
              Asignaciones
            </span>
            <Badge
              variant="secondary"
              className="ml-auto bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300"
            >
              {courseAssignments?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <ScrollArea className="h-[300px] sm:h-[400px] lg:h-[500px] pr-3">
            <div className="space-y-2">
              {courseAssignments?.map((assignment) => (
                <DraggableCourseAssignment
                  key={assignment.id}
                  assignment={assignment}
                  assignedHours={assignmentHours[assignment.id] || 0}
                  maxHours={40}
                />
              ))}
              {(!courseAssignments || courseAssignments.length === 0) && (
                <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                  No hay asignaciones disponibles
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
