// src/components/features/schedules/calendar/ScheduleConfigModal.tsx
"use client";

import { X, Save } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import type { ScheduleConfig } from "@/types/schedules.types";

interface ScheduleConfigModalProps {
  isOpen: boolean;
  sectionId: number;
  sectionName: string;
  currentConfig?: ScheduleConfig | null;
  onSave: (config: ScheduleConfig) => Promise<void>;
  onClose: () => void;
}

export function ScheduleConfigModal({
  isOpen,
  sectionId,
  sectionName,
  currentConfig,
  onSave,
  onClose
}: ScheduleConfigModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleSave = async () => {
    if (currentConfig) {
      await onSave(currentConfig);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-2xl max-w-2xl w-full ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`p-6 border-b ${
          isDark
            ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-gray-700'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 border-gray-200'
        } text-white rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Configurar Horarios</h2>
              <p>Sección: {sectionName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Configuración de Horarios
            </label>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Los componentes de configuración se cargarán aquí.
            </p>
            {currentConfig && (
              <div className={`mt-4 p-4 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <p className="text-sm">Inicio: {currentConfig.startTime}</p>
                <p className="text-sm">Fin: {currentConfig.endTime}</p>
                <p className="text-sm">Duración: {currentConfig.classDuration} min</p>
              </div>
            )}
          </div>
        </div>

        <div className={`p-6 border-t rounded-b-xl ${
          isDark
            ? 'bg-gray-700 border-gray-600'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className={isDark ? 'border-gray-600 hover:bg-gray-600' : ''}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
