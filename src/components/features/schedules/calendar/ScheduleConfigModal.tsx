// src/components/features/schedules/calendar/ScheduleConfigModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Clock, Calendar } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import type { ScheduleConfig, BreakSlot, DayOfWeek } from "@/types/schedules.types";
import { toast } from "sonner";

interface ScheduleConfigModalProps {
  isOpen: boolean;
  sectionId: number;
  sectionName: string;
  currentConfig?: ScheduleConfig | null;
  onSave: (config: ScheduleConfig) => Promise<void>;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes', shortLabel: 'Lun' },
  { value: 2, label: 'Martes', shortLabel: 'Mar' },
  { value: 3, label: 'Miércoles', shortLabel: 'Mié' },
  { value: 4, label: 'Jueves', shortLabel: 'Jue' },
  { value: 5, label: 'Viernes', shortLabel: 'Vie' },
  { value: 6, label: 'Sábado', shortLabel: 'Sáb' },
  { value: 7, label: 'Domingo', shortLabel: 'Dom' },
];

const PRESET_CONFIGS = {
  STANDARD: {
    label: 'Horario Estándar',
    workingDays: [1, 2, 3, 4, 5],
    startTime: "07:00",
    endTime: "17:00",
    classDuration: 45,
    breakSlots: [
      { start: "10:00", end: "10:15", label: "RECREO" },
      { start: "13:15", end: "14:00", label: "ALMUERZO" }
    ]
  },
  INTENSIVE: {
    label: 'Horario Intensivo',
    workingDays: [1, 2, 3, 4, 5],
    startTime: "07:00",
    endTime: "13:00",
    classDuration: 50,
    breakSlots: [
      { start: "09:30", end: "09:45", label: "RECREO" }
    ]
  },
  EXTENDED: {
    label: 'Horario Extendido',
    workingDays: [1, 2, 3, 4, 5, 6],
    startTime: "07:00",
    endTime: "18:00",
    classDuration: 40,
    breakSlots: [
      { start: "09:20", end: "09:35", label: "RECREO 1" },
      { start: "12:00", end: "13:00", label: "ALMUERZO" },
      { start: "15:20", end: "15:35", label: "RECREO 2" }
    ]
  }
};

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

  const [formData, setFormData] = useState({
    workingDays: [1, 2, 3, 4, 5] as number[],
    startTime: '07:00',
    endTime: '17:00',
    classDuration: 45,
    breakSlots: [] as BreakSlot[],
  });

  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with current config
  useEffect(() => {
    if (currentConfig) {
      setFormData({
        workingDays: currentConfig.workingDays || [1, 2, 3, 4, 5],
        startTime: currentConfig.startTime || '07:00',
        endTime: currentConfig.endTime || '17:00',
        classDuration: currentConfig.classDuration || 45,
        breakSlots: currentConfig.breakSlots || [],
      });
    }
  }, [currentConfig]);

  if (!isOpen) return null;

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort((a, b) => a - b)
    }));
  };

  const handlePresetLoad = (presetKey: keyof typeof PRESET_CONFIGS) => {
    const preset = PRESET_CONFIGS[presetKey];
    setFormData({
      workingDays: [...preset.workingDays],
      startTime: preset.startTime,
      endTime: preset.endTime,
      classDuration: preset.classDuration,
      breakSlots: preset.breakSlots.map(slot => ({ ...slot })),
    });
  };

  const handleAddBreakSlot = () => {
    setFormData(prev => ({
      ...prev,
      breakSlots: [
        ...prev.breakSlots,
        { start: '12:00', end: '13:00', label: 'DESCANSO' }
      ]
    }));
  };

  const handleRemoveBreakSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      breakSlots: prev.breakSlots.filter((_, i) => i !== index)
    }));
  };

  const handleBreakSlotChange = (index: number, field: keyof BreakSlot, value: string) => {
    setFormData(prev => ({
      ...prev,
      breakSlots: prev.breakSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const calculateTotalSlots = () => {
    try {
      const startTime = new Date(`2000-01-01T${formData.startTime}:00`);
      const endTime = new Date(`2000-01-01T${formData.endTime}:00`);
      const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      
      const breakMinutes = formData.breakSlots.reduce((total, slot) => {
        try {
          const breakStart = new Date(`2000-01-01T${slot.start}:00`);
          const breakEnd = new Date(`2000-01-01T${slot.end}:00`);
          return total + (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
        } catch {
          return total;
        }
      }, 0);
      
      const result = Math.floor((totalMinutes - breakMinutes) / formData.classDuration);
      return isNaN(result) ? 0 : result;
    } catch {
      return 0;
    }
  };

  const handleSave = async () => {
    // Validations
    if (formData.workingDays.length === 0) {
      toast.error('Selecciona al menos un día laborable');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Ingresa hora de inicio y fin');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('La hora de inicio debe ser menor a la hora de fin');
      return;
    }

    if (formData.classDuration <= 0 || formData.classDuration > 240) {
      toast.error('Duración de clase inválida (1-240 minutos)');
      return;
    }

    // Validate break slots don't overlap
    if (formData.breakSlots.length > 1) {
      const sortedBreaks = [...formData.breakSlots].sort((a, b) => a.start.localeCompare(b.start));
      
      for (let i = 0; i < sortedBreaks.length - 1; i++) {
        const current = sortedBreaks[i];
        const next = sortedBreaks[i + 1];
        
        if (current.end > next.start) {
          toast.error(`Los recreos se solapan: ${current.label || 'Recreo ' + (i + 1)} (${current.start}-${current.end}) con ${next.label || 'Recreo ' + (i + 2)} (${next.start}-${next.end})`);
          return;
        }
      }
    }

    // Validate break slots are within working hours
    for (let i = 0; i < formData.breakSlots.length; i++) {
      const slot = formData.breakSlots[i];
      
      if (slot.start < formData.startTime || slot.end > formData.endTime) {
        toast.error(`El recreo "${slot.label}" (${slot.start}-${slot.end}) está fuera del horario laboral (${formData.startTime}-${formData.endTime})`);
        return;
      }
      
      if (slot.start >= slot.end) {
        toast.error(`El recreo "${slot.label}" tiene una hora de fin inválida`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const configToSave: ScheduleConfig = {
        id: currentConfig?.id || 0,
        sectionId: sectionId,
        workingDays: formData.workingDays as DayOfWeek[],
        startTime: formData.startTime,
        endTime: formData.endTime,
        classDuration: formData.classDuration,
        breakSlots: formData.breakSlots,
        createdAt: currentConfig?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(configToSave);
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    isDark 
      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b rounded-t-xl ${
          isDark 
            ? 'bg-gradient-to-r from-blue-900 to-purple-900 border-gray-700' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 border-gray-200'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Configurar Horarios</h2>
                <p className={isDark ? "text-blue-200" : "text-blue-100"}>
                  Sección: {sectionName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Configuraciones Predefinidas */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <Clock className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              Configuraciones Predefinidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(PRESET_CONFIGS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetLoad(key as keyof typeof PRESET_CONFIGS)}
                  className={`p-4 border rounded-lg transition-colors text-left ${
                    isDark
                      ? 'border-gray-700 hover:border-blue-600 hover:bg-blue-900/30'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className={`font-medium mb-2 ${
                    isDark ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {preset.label}
                  </div>
                  <div className={`text-sm space-y-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div>📅 {preset.workingDays.length} días</div>
                    <div>⏰ {preset.startTime} - {preset.endTime}</div>
                    <div>📚 {preset.classDuration} min/clase</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Días de Trabajo */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
              Días de Trabajo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  onClick={() => handleDayToggle(day.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.workingDays.includes(day.value)
                      ? isDark
                        ? 'border-blue-600 bg-blue-900/50 text-blue-300'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDark
                        ? 'border-gray-700 hover:border-gray-600 text-gray-300'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{day.shortLabel}</div>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {day.label}
                  </div>
                </button>
              ))}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Días seleccionados: {formData.workingDays.map(d => 
                DAYS_OF_WEEK.find(day => day.value === d)?.shortLabel
              ).join(', ')}
            </div>
          </div>

          {/* Horarios y Duración */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Hora de Inicio
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Hora de Fin
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Duración por Clase (min)
              </label>
              <select
                value={formData.classDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, classDuration: Number(e.target.value) }))}
                className={inputClasses}
              >
                <option value={30}>30 minutos</option>
                <option value={40}>40 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={50}>50 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
              </select>
            </div>
          </div>

          {/* Recreos y Descansos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>
                Recreos y Descansos
              </h3>
              <Button
                onClick={handleAddBreakSlot}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.breakSlots.map((slot, index) => (
                <div key={index} className={`grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="space-y-1">
                    <label className={`block text-xs font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Inicio
                    </label>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => handleBreakSlotChange(index, 'start', e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-xs font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Fin
                    </label>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => handleBreakSlotChange(index, 'end', e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block text-xs font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Etiqueta
                    </label>
                    <input
                      type="text"
                      value={slot.label || ''}
                      onChange={(e) => handleBreakSlotChange(index, 'label', e.target.value)}
                      placeholder="RECREO, ALMUERZO, etc."
                      className={inputClasses}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => handleRemoveBreakSlot(index)}
                      variant="outline"
                      size="sm"
                      className={`${
                        isDark
                          ? 'text-red-400 hover:bg-red-900/50 border-gray-600'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vista Previa */}
          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <h4 className={`font-medium mb-2 ${
              isDark ? 'text-blue-300' : 'text-blue-800'
            }`}>
              Vista Previa
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className={`font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Días:
                </span>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {formData.workingDays.map(d => 
                    DAYS_OF_WEEK.find(day => day.value === d)?.shortLabel
                  ).join(', ')}
                </div>
              </div>
              <div>
                <span className={`font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Horario:
                </span>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {formData.startTime} - {formData.endTime}
                </div>
              </div>
              <div>
                <span className={`font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Duración:
                </span>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {formData.classDuration} min
                </div>
              </div>
              <div>
                <span className={`font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Total Slots:
                </span>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  ~{calculateTotalSlots()} clases/día
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t rounded-b-xl ${
          isDark 
            ? 'bg-gray-750 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSaving}
              className={isDark ? 'border-gray-600 hover:bg-gray-600' : ''}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
