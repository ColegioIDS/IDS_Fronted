/**
 * src/components/attendance/states/EmptyAndLoadingStates.tsx
 * 
 * Estados vacíos y de cargando
 */

"use client";

import React from "react";
import { Loader2, BookOpen, AlertCircle } from "lucide-react";

export function LoadingState() {
  return (
    <div className="py-24 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
    </div>
  );
}

export function NoSectionsState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="py-24 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
          <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-600" />
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
        {isAdmin
          ? "No hay secciones disponibles"
          : "No tienes secciones con cursos asignados"}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        {isAdmin
          ? "Contacta con administración para configurar las secciones"
          : "Contacta con administración para que te asignen cursos"}
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="py-12">
      <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Error
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}