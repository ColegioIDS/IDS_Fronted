/**
 * src/components/attendance/save/SaveButton.tsx
 * 
 * Botón de guardar con estados de carga y feedback
 */

"use client";

import React from "react";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SaveButtonProps {
  savingState: "idle" | "saving" | "success" | "error";
  onSave: () => void;
  disabled?: boolean;
}

export function SaveButton({
  savingState,
  onSave,
  disabled = false,
}: SaveButtonProps) {
  const isLoading = savingState === "saving";
  const isSuccess = savingState === "success";
  const isError = savingState === "error";

  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
      {isLoading && (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Guardando...</span>
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">¡Guardado exitosamente!</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Error al guardar</span>
        </div>
      )}

      <button
        onClick={onSave}
        disabled={disabled || isLoading}
        className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ${
          disabled || isLoading
            ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
            : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-sm hover:shadow-md"
        }`}
      >
        <Save className="w-4 h-4" />
        Guardar Asistencia
      </button>
    </div>
  );
}