// components/schedules/calendar/ScheduleConfigModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ScheduleConfig, BreakSlot } from '@/types/schedule-config'; // Usar tus tipos
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
  // Estado interno del modal - usa formato display [1-7] para fácil manejo de UI
  const [config, setConfig] = useState<Omit<ScheduleConfig, 'id' | 'createdAt' | 'updatedAt'>>({
    sectionId: 0,
    workingDays: [1, 2, 3, 4, 5], // Formato display [1-7] (Lun-Vie por defecto)
    startTime: "07:00",
    endTime: "17:00",
    classDuration: 45,
    breakSlots: [
      { start: "10:00", end: "10:15", label: "RECREO" },
      { start: "13:15", end: "14:00", label: "ALMUERZO" }
    ]
  });

  // Función para convertir de formato BD [0-6] a formato display [1-7]
  const convertToDisplayFormat = (dbDays: number[]): number[] => {
    return dbDays.map(day => day === 0 ? 7 : day); // 0 (domingo) -> 7, resto igual
  };

  // Función para convertir de formato display [1-7] a formato BD [0-6]
  const convertToDBFormat = (displayDays: number[]): number[] => {
    return displayDays.map(day => day === 7 ? 0 : day); // 7 (domingo) -> 0, resto igual
  };

  useEffect(() => {
    console.log('🔄 Modal useEffect:', { currentConfig, sectionId });
    
    if (currentConfig) {
      // Convertir workingDays de formato BD [0-6] a formato display [1-7] para el modal
      const displayWorkingDays = convertToDisplayFormat(currentConfig.workingDays);
      
      console.log('🔄 Configuración cargada:', {
        original: currentConfig.workingDays,
        converted: displayWorkingDays
      });
      
      setConfig({
        sectionId: currentConfig.sectionId,
        workingDays: displayWorkingDays,
        startTime: currentConfig.startTime,
        endTime: currentConfig.endTime,
        classDuration: currentConfig.classDuration,
        breakSlots: currentConfig.breakSlots || []
      });
    } else {
      // Crear configuración nueva con sectionId correcto
      console.log('🔄 Creando configuración nueva para sección:', sectionId);
      setConfig(prev => ({
        ...prev,
        sectionId: sectionId,
        workingDays: [1, 2, 3, 4, 5] // Lun-Vie por defecto en formato display
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
  console.log('📋 Cargando preset:', presetKey, 'para sección:', sectionId);
  
  setConfig(prev => ({
    ...prev,
    workingDays: [...preset.workingDays], // Spread para convertir readonly a mutable
    startTime: preset.startTime,
    endTime: preset.endTime,
    classDuration: preset.classDuration,
    breakSlots: preset.breakSlots.map(slot => ({ ...slot })), // Spread para breakSlots también
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
          return total; // Si hay error en algún break, ignorarlo
        }
      }, 0);
      
      const result = Math.floor((totalMinutes - breakMinutes) / config.classDuration);
      return isNaN(result) ? 0 : result;
    } catch {
      return 0;
    }
  };

  const handleSave = async () => {
    console.log('💾 === GUARDANDO DESDE MODAL ===');
    console.log('💾 Config interna (formato display):', config);
    console.log('💾 SectionId del prop:', sectionId);
    console.log('💾 SectionId del config:', config.sectionId);
    
    // Validaciones básicas
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

    // Convertir workingDays al formato de BD [0-6] antes de enviar
    const configForDB = {
      ...config,
      workingDays: convertToDBFormat(config.workingDays)
    } as ScheduleConfig;
    
    console.log('💾 Config convertida para BD:', configForDB);
    console.log('💾 WorkingDays: display =>', config.workingDays, '| BD =>', configForDB.workingDays);
    
    // Enviar al padre
    await onSave(configForDB);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Configurar Horarios</h2>
                <p className="text-blue-100">Sección: {sectionName}</p>
                <p className="text-blue-200 text-sm">ID: {sectionId}</p>
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
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Configuraciones Predefinidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(PRESET_CONFIGS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetLoad(key as keyof typeof PRESET_CONFIGS)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="font-medium text-gray-800 mb-2">
                    {key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
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
            <h3 className="text-lg font-semibold text-gray-800">Días de Trabajo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {ALL_DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  onClick={() => handleDayToggle(day.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    config.workingDays.includes(day.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{day.shortLabel}</div>
                  <div className="text-xs text-gray-500">{day.label}</div>
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Días seleccionados: {config.workingDays.map(d => 
                ALL_DAYS_OF_WEEK.find(day => day.value === d)?.shortLabel
              ).join(', ')}
            </div>
          </div>

          {/* Horarios y Duración */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Hora de Inicio</label>
              <input
                type="time"
                value={config.startTime}
                onChange={(e) => setConfig(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Hora de Fin</label>
              <input
                type="time"
                value={config.endTime}
                onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Duración por Clase (min)</label>
              <select
                value={config.classDuration}
                onChange={(e) => setConfig(prev => ({ ...prev, classDuration: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <h3 className="text-lg font-semibold text-gray-800">Recreos y Descansos</h3>
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
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Inicio</label>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateBreakSlot(index, 'start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Fin</label>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateBreakSlot(index, 'end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Etiqueta</label>
                    <input
                      type="text"
                      value={slot.label || ''}
                      onChange={(e) => updateBreakSlot(index, 'label', e.target.value)}
                      placeholder="RECREO, ALMUERZO, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => removeBreakSlot(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vista Previa */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Vista Previa</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Días:</span>
                <div className="text-gray-700">
                  {config.workingDays.map(d => 
                    ALL_DAYS_OF_WEEK.find(day => day.value === d)?.shortLabel
                  ).join(', ')}
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Horario:</span>
                <div className="text-gray-700">{config.startTime} - {config.endTime}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Duración:</span>
                <div className="text-gray-700">{config.classDuration} min</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Total Slots:</span>
                <div className="text-gray-700">~{calculateTotalSlots()} clases/día</div>
              </div>
            </div>
            
            {/* Debug Info (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="text-xs text-blue-600">
                  <div><strong>Debug:</strong> SectionId: {config.sectionId}</div>
                  <div><strong>WorkingDays (display):</strong> [{config.workingDays.join(', ')}]</div>
                  <div><strong>WorkingDays (BD):</strong> [{convertToDBFormat(config.workingDays).join(', ')}]</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
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