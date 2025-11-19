// components/schedules/calendar/ScheduleConfigModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Plus, Trash2, Save } from 'lucide-react';
import { useTheme } from 'next-themes'; // ✅ AGREGAR
import { Button } from '@/components/ui/button';
import type { ScheduleConfig, BreakSlot } from '@/types/schedule-config';
import { ALL_DAYS_OF_WEEK, PRESET_CONFIGS } from '@/types/schedules.types';

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
  const { theme } = useTheme(); // ✅ AGREGAR
  const isDark = theme === 'dark'; // ✅ AGREGAR

  const [config, setConfig] = useState<Omit<ScheduleConfig, 'id' | 'createdAt' | 'updatedAt'>>({
    sectionId: 0,
    workingDays: [1, 2, 3, 4, 5],
    startTime: "07:00",
    endTime: "17:00",
    classDuration: 45,
    breakSlots: [
      { start: "10:00", end: "10:15", label: "RECREO" },
      { start: "13:15", end: "14:00", label: "ALMUERZO" }
    ]
  });

  const convertToDisplayFormat = (dbDays: number[]): number[] => {
    return dbDays.map(day => day === 0 ? 7 : day);
  };

  const convertToDBFormat = (displayDays: number[]): number[] => {
    return displayDays.map(day => day === 7 ? 0 : day);
  };

  useEffect(() => {
    if (currentConfig) {
      const displayWorkingDays = convertToDisplayFormat(currentConfig.workingDays);
      setConfig({
        sectionId: currentConfig.sectionId,
        workingDays: displayWorkingDays,
        startTime: currentConfig.startTime,
        endTime: currentConfig.endTime,
        classDuration: currentConfig.classDuration,
        breakSlots: currentConfig.breakSlots || []
      });
    } else {
      setConfig(prev => ({
        ...prev,
        sectionId: sectionId,
        workingDays: [1, 2, 3, 4, 5]
      }));
    }
  }, [currentConfig, sectionId]);

  const handleDayToggle = (dayValue: number) => {
    setConfig(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayValue)
        ? prev.workingDays.filter(d => d !== dayValue)
        : [...prev.workingDays, dayValue].sort()
    }));
  };

  const handlePresetLoad = (presetKey: keyof typeof PRESET_CONFIGS) => {
    const preset = PRESET_CONFIGS[presetKey];
    setConfig(prev => ({
      ...prev,
      workingDays: [...preset.workingDays],
      startTime: preset.startTime,
      endTime: preset.endTime,
      classDuration: preset.classDuration,
      breakSlots: preset.breakSlots.map(slot => ({ ...slot })),
      sectionId: sectionId
    }));
  };

  const addBreakSlot = () => {
    setConfig(prev => ({
      ...prev,
      breakSlots: [...prev.breakSlots, { start: "12:00", end: "13:00", label: "DESCANSO" }]
    }));
  };

  const updateBreakSlot = (index: number, field: keyof BreakSlot, value: string) => {
    setConfig(prev => ({
      ...prev,
      breakSlots: prev.breakSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const removeBreakSlot = (index: number) => {
    setConfig(prev => ({
      ...prev,
      breakSlots: prev.breakSlots.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalSlots = () => {
    try {
      const startTime = new Date(`2000-01-01T${config.startTime}:00`);
      const endTime = new Date(`2000-01-01T${config.endTime}:00`);
      const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      
      const breakMinutes = config.breakSlots.reduce((total, slot) => {
        try {
          const breakStart = new Date(`2000-01-01T${slot.start}:00`);
          const breakEnd = new Date(`2000-01-01T${slot.end}:00`);
          return total + (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
        } catch {
          return total;
        }
      }, 0);
      
      const result = Math.floor((totalMinutes - breakMinutes) / config.classDuration);
      return isNaN(result) ? 0 : result;
    } catch {
      return 0;
    }
  };

  const handleSave = async () => {
    if (!config.sectionId || config.sectionId === 0) {
      alert('Error: ID de sección no válido');
      return;
    }
    
    if (config.workingDays.length === 0) {
      alert('Error: Debes seleccionar al menos un día de trabajo');
      return;
    }
    
    if (!config.startTime || !config.endTime) {
      alert('Error: Debes especificar horario de inicio y fin');
      return;
    }
    
    if (config.startTime >= config.endTime) {
      alert('Error: La hora de inicio debe ser menor que la hora de fin');
      return;
    }

    const configForDB = {
      ...config,
      workingDays: convertToDBFormat(config.workingDays)
    } as ScheduleConfig;
    
    await onSave(configForDB);
  };

  if (!isOpen) return null;

  // ✅ NUEVO: Clases de input según tema
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
                <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-200"}`}>
                  ID: {sectionId}
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
                    {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className={`text-sm space-y-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {preset.workingDays.length} días</div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {preset.startTime} - {preset.endTime}</div>
                    <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {preset.classDuration} min/clase</div>
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
              {ALL_DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  onClick={() => handleDayToggle(day.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    config.workingDays.includes(day.value)
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
              Días seleccionados: {config.workingDays.map(d => 
                ALL_DAYS_OF_WEEK.find(day => day.value === d)?.shortLabel
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
                value={config.startTime}
                onChange={(e) => setConfig(prev => ({ ...prev, startTime: e.target.value }))}
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
                value={config.endTime}
                onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
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
                value={config.classDuration}
                onChange={(e) => setConfig(prev => ({ ...prev, classDuration: Number(e.target.value) }))}
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
                onClick={addBreakSlot}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
            
            <div className="space-y-3">
              {config.breakSlots.map((slot, index) => (
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
                      onChange={(e) => updateBreakSlot(index, 'start', e.target.value)}
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
                      onChange={(e) => updateBreakSlot(index, 'end', e.target.value)}
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
                      onChange={(e) => updateBreakSlot(index, 'label', e.target.value)}
                      placeholder="RECREO, ALMUERZO, etc."
                      className={inputClasses}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => removeBreakSlot(index)}
                      variant="outline"
                      size="sm"
                      className={`${
                        isDark
                          ? 'text-red-400 hover:bg-red-900/50'
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
                  {config.workingDays.map(d => 
                    ALL_DAYS_OF_WEEK.find(day => day.value === d)?.shortLabel
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
                  {config.startTime} - {config.endTime}
                </div>
              </div>
              <div>
                <span className={`font-medium ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Duración:
                </span>
                <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {config.classDuration} min
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
            
            {process.env.NODE_ENV === 'development' && (
              <div className={`mt-3 pt-3 border-t ${
                isDark ? 'border-blue-800' : 'border-blue-200'
              }`}>
                <div className={`text-xs ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  <div><strong>Debug:</strong> SectionId: {config.sectionId}</div>
                  <div><strong>WorkingDays (display):</strong> [{config.workingDays.join(', ')}]</div>
                  <div><strong>WorkingDays (BD):</strong> [{convertToDBFormat(config.workingDays).join(', ')}]</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
              Guardar Configuración
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}