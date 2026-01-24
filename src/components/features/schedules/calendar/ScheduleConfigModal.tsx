// src/components/features/schedules/calendar/ScheduleConfigModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Clock, Calendar, BookOpen, Coffee, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScheduleConfig, ScheduleSlot, DayOfWeek, SlotType } from "@/types/schedules.types";
import { ALL_DAYS_OF_WEEK } from "@/types/schedules.types";
import { toast } from "sonner";
import { 
  convertOldConfigToNew, 
  initializeBreakSlotsForDays,
  getSlotsForDay,
  updateSlotsForDay,
  applySlotsToDays
} from "@/utils/scheduleConfigConverter";

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
  const [formData, setFormData] = useState({
    workingDays: [1, 2, 3, 4, 5] as DayOfWeek[],
    startTime: '07:00',
    endTime: '17:00',
    classDuration: 45,
    breakSlots: {} as Record<string, ScheduleSlot[]>,
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showDayConfig, setShowDayConfig] = useState(false);

  // Initialize form with current config
  useEffect(() => {
    if (currentConfig) {
      let processedConfig = currentConfig;
      
      // Convert old format to new if necessary
      if (Array.isArray(currentConfig.breakSlots)) {
        processedConfig = convertOldConfigToNew(currentConfig);
      }

      // Ensure breakSlots is initialized for all working days
      const workingDays = processedConfig.workingDays || [1, 2, 3, 4, 5];
      const initializedBreakSlots = initializeBreakSlotsForDays(workingDays as DayOfWeek[], []);
      
      // Merge with existing breakSlots data from config
      const breakSlotsFromConfig = (processedConfig.breakSlots as Record<string, ScheduleSlot[]>) || {};
      const mergedBreakSlots = {
        ...initializedBreakSlots,
        ...breakSlotsFromConfig
      };

      setFormData({
        workingDays: workingDays as DayOfWeek[],
        startTime: processedConfig.startTime || '07:00',
        endTime: processedConfig.endTime || '17:00',
        classDuration: processedConfig.classDuration || 45,
        breakSlots: mergedBreakSlots,
      });
      setSelectedDay(workingDays[0] || 1);
    }
  }, [currentConfig]);

  if (!isOpen) return null;

  const handleDayToggle = (day: DayOfWeek) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort((a, b) => a - b)
    }));
  };

  const handlePresetLoad = (presetKey: keyof typeof PRESET_CONFIGS) => {
    const preset = PRESET_CONFIGS[presetKey];
    const defaultSlots: ScheduleSlot[] = preset.breakSlots.map(slot => ({
      start: slot.start,
      end: slot.end,
      label: slot.label || 'BREAK',
      type: (slot.label?.includes('ALMUERZO') ? 'lunch' : 'break') as SlotType,
      isClass: false,
    }));

    const breakSlots = initializeBreakSlotsForDays(preset.workingDays as DayOfWeek[], defaultSlots);

    setFormData({
      workingDays: [...preset.workingDays] as DayOfWeek[],
      startTime: preset.startTime,
      endTime: preset.endTime,
      classDuration: preset.classDuration,
      breakSlots,
    });
    setSelectedDay(preset.workingDays[0] as DayOfWeek);
  };

  // Funciones para manjar slots por día
  const currentDaySlots = getSlotsForDay(formData.breakSlots, selectedDay);

  const handleAddSlotToDay = () => {
    const newSlot: ScheduleSlot = {
      start: '12:00',
      end: '12:30',
      label: 'NUEVO SLOT',
      type: 'break',
      isClass: false,
    };
    setFormData(prev => ({
      ...prev,
      breakSlots: updateSlotsForDay(prev.breakSlots, selectedDay, [...currentDaySlots, newSlot])
    }));
  };

  const handleRemoveSlotFromDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      breakSlots: updateSlotsForDay(
        prev.breakSlots,
        selectedDay,
        currentDaySlots.filter((_, i) => i !== index)
      )
    }));
  };

  const handleUpdateSlot = (index: number, field: keyof ScheduleSlot, value: any) => {
    const updated = currentDaySlots.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    );
    setFormData(prev => ({
      ...prev,
      breakSlots: updateSlotsForDay(prev.breakSlots, selectedDay, updated)
    }));
  };

  const handleCopySlotsToAllDays = () => {
    setFormData(prev => ({
      ...prev,
      breakSlots: applySlotsToDays(
        prev.breakSlots,
        prev.workingDays,
        currentDaySlots
      )
    }));
    toast.success(`Slots del ${DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label} copiados a todos los días`);
  };

  const handleCopySlotsToOtherDays = (targetDays: DayOfWeek[]) => {
    setFormData(prev => ({
      ...prev,
      breakSlots: applySlotsToDays(
        prev.breakSlots,
        targetDays,
        currentDaySlots
      )
    }));
  };

  const calculateTotalSlotsForDay = (day: DayOfWeek) => {
    try {
      const startTime = new Date(`2000-01-01T${formData.startTime}:00`);
      const endTime = new Date(`2000-01-01T${formData.endTime}:00`);
      const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      
      const daySlots = getSlotsForDay(formData.breakSlots, day);
      const breakMinutes = daySlots.reduce((total, slot) => {
        try {
          const slotStart = new Date(`2000-01-01T${slot.start}:00`);
          const slotEnd = new Date(`2000-01-01T${slot.end}:00`);
          const slotDuration = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60);
          // Only count if not marked as class
          return total + (slot.isClass ? 0 : slotDuration);
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

  // Calculate average slots across all working days
  const calculateTotalSlots = () => {
    if (formData.workingDays.length === 0) return 0;
    const total = formData.workingDays.reduce((sum, day) => sum + calculateTotalSlotsForDay(day), 0);
    return Math.round(total / formData.workingDays.length);
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

    // Validate slots for all working days
    for (const day of formData.workingDays) {
      const daySlots = getSlotsForDay(formData.breakSlots, day);
      
      if (daySlots.length > 1) {
        const sortedSlots = [...daySlots].sort((a, b) => a.start.localeCompare(b.start));
        
        for (let i = 0; i < sortedSlots.length - 1; i++) {
          const current = sortedSlots[i];
          const next = sortedSlots[i + 1];
          
          if (current.end > next.start) {
            const dayName = DAYS_OF_WEEK.find(d => d.value === day)?.label || `Día ${day}`;
            toast.error(`Los slots en ${dayName} se solapan: "${current.label}" (${current.start}-${current.end}) con "${next.label}" (${next.start}-${next.end})`);
            return;
          }
        }
      }

      // Validate slots are within working hours
      for (const slot of daySlots) {
        if (slot.start < formData.startTime || slot.end > formData.endTime) {
          const dayName = DAYS_OF_WEEK.find(d => d.value === day)?.label || `Día ${day}`;
          toast.error(`El slot "${slot.label}" en ${dayName} (${slot.start}-${slot.end}) está fuera del horario laboral (${formData.startTime}-${formData.endTime})`);
          return;
        }
        
        if (slot.start >= slot.end) {
          const dayName = DAYS_OF_WEEK.find(d => d.value === day)?.label || `Día ${day}`;
          toast.error(`El slot "${slot.label}" en ${dayName} tiene una hora de fin inválida`);
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const configToSave: ScheduleConfig = {
        id: currentConfig?.id || 0,
        sectionId: sectionId,
        workingDays: formData.workingDays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        classDuration: formData.classDuration,
        breakSlots: formData.breakSlots,
        createdAt: currentConfig?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(configToSave);
      toast.success('Configuración guardada exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al guardar la configuración');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="p-6 border-b rounded-t-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 border-gray-200 dark:border-gray-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Configurar Horarios</h2>
                <p className="text-blue-100 dark:text-blue-200">
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
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Configuraciones Predefinidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(PRESET_CONFIGS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetLoad(key as keyof typeof PRESET_CONFIGS)}
                  className="p-4 border rounded-lg transition-colors text-left border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  <div className="font-medium mb-2 text-gray-800 dark:text-gray-100">
                    {preset.label}
                  </div>
                  <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{preset.workingDays.length} días</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{preset.startTime} - {preset.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{preset.classDuration} min/clase</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Días de Trabajo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Días de Trabajo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.workingDays.includes(day.value as DayOfWeek)
                      ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleDayToggle(day.value as DayOfWeek)}
                >
                  <div className="font-medium">{day.shortLabel}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {day.label}
                  </div>
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Días seleccionados: {formData.workingDays.map(d => 
                DAYS_OF_WEEK.find(day => day.value === d)?.shortLabel
              ).join(', ')}
            </div>
          </div>

          {/* Horarios y Duración */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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

          {/* Configuración de Slots por Día */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Configurar Slots por Día
            </h3>

            {/* Tabs de Días */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
              {ALL_DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  onClick={() => setSelectedDay(day.value as DayOfWeek)}
                  disabled={!formData.workingDays.includes(day.value as DayOfWeek)}
                  className={`px-4 py-2 font-medium whitespace-nowrap transition-colors rounded-t-lg ${
                    selectedDay === day.value
                      ? 'bg-blue-600 text-white'
                      : formData.workingDays.includes(day.value as DayOfWeek)
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {day.shortLabel}
                </button>
              ))}
            </div>

            {/* Slots del Día Seleccionado */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">
                    {ALL_DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {calculateTotalSlotsForDay(selectedDay)} clases disponibles
                  </p>
                </div>
                <Button
                  onClick={handleAddSlotToDay}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Slot
                </Button>
              </div>

              {/* Lista de Slots */}
              <div className="space-y-3">
                {currentDaySlots.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No hay slots configurados para este día
                  </p>
                ) : (
                  currentDaySlots.map((slot, index) => (
                    <div key={index} className="space-y-3 p-3 rounded-lg bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Inicio
                          </label>
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleUpdateSlot(index, 'start', e.target.value)}
                            className={inputClasses}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Fin
                          </label>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleUpdateSlot(index, 'end', e.target.value)}
                            className={inputClasses}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Etiqueta
                          </label>
                          <input
                            type="text"
                            value={slot.label}
                            onChange={(e) => handleUpdateSlot(index, 'label', e.target.value)}
                            placeholder="RECREO, ALMUERZO, etc."
                            className={inputClasses}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Tipo
                          </label>
                          <select
                            value={slot.type}
                            onChange={(e) => handleUpdateSlot(index, 'type', e.target.value)}
                            className={inputClasses}
                          >
                            <option value="activity">Actividad</option>
                            <option value="break">Descanso</option>
                            <option value="lunch">Almuerzo</option>
                            <option value="free">Libre</option>
                            <option value="class">Clase</option>
                            <option value="custom">Personalizado</option>
                          </select>
                        </div>
                        <div className="flex items-end gap-2">
                          <Button
                            onClick={() => handleRemoveSlotFromDay(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 border-gray-300 dark:border-gray-600 flex-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={slot.isClass || false}
                            onChange={(e) => handleUpdateSlot(index, 'isClass', e.target.checked)}
                            className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Es Clase
                          </span>
                        </label>
                        {slot.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                            <span className="font-medium">Descripción:</span> {slot.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Opciones de Copia */}
              {currentDaySlots.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600 flex gap-2">
                  <Button
                    onClick={handleCopySlotsToAllDays}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    Copiar a Todos los Días
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Vista Previa */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-300">
              Vista Previa
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Días:
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  {formData.workingDays.map(d => 
                    DAYS_OF_WEEK.find(day => day.value === d)?.shortLabel
                  ).join(', ')}
                </div>
              </div>
              <div>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Horario:
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  {formData.startTime} - {formData.endTime}
                </div>
              </div>
              <div>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Duración:
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  {formData.classDuration} min
                </div>
              </div>
              <div>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Total Slots:
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  ~{calculateTotalSlots()} clases/día
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t rounded-b-xl bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700">
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSaving}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
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