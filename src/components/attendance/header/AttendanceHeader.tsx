/**
 * src/components/attendance/header/AttendanceHeader.tsx
 * 
 * Header del gestor de asistencia con información de scope y fecha
 */

"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface AttendanceHeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  userScope: string | null;
  visibleSectionsCount: number;
}

export function AttendanceHeader({
  currentDate,
  onDateChange,
  userScope,
  visibleSectionsCount,
}: AttendanceHeaderProps) {
  const isAdmin = userScope === "all";

  return (
    <div className="mb-8 space-y-4 border-b border-gray-200 pb-6 dark:border-gray-800">
      {/* Título */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registro de Asistencia
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin
              ? "Gestiona la asistencia de todos los estudiantes"
              : "Registra asistencia de tus cursos"}
          </p>
        </div>
      </div>

      {/* Información de estado */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Fecha */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Fecha:
          </label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Información de scope */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            SCOPE:
          </span>
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {userScope === "all" ? "Administrador" : "Docente"}
          </span>
        </div>

        {/* Contador de secciones */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            SECCIONES:
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {visibleSectionsCount}
          </span>
        </div>
      </div>
    </div>
  );
}