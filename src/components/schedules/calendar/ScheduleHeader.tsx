// components/schedules/calendar/ScheduleHeader.tsx
"use client";

import { useState } from "react";
import { Calendar, Users, AlertCircle, Save, RotateCcw, Settings, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Section } from "@/types/sections";
import type { ScheduleConfig } from "@/types/schedule-config";

import { ScheduleConfigModal } from "./ScheduleConfigModal";

interface ScheduleHeaderProps {
  selectedSection: number;
  sections: Section[];
  totalSchedules: number;
  pendingChanges: number;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  currentConfig?: ScheduleConfig | null; // NUEVO: configuración actual
  onSectionChange: (value: string) => void;
  onSaveAll: () => void;
  onDiscardChanges: () => void;
  onConfigSave?: (config: ScheduleConfig) => Promise<void>; // NUEVO: guardar configuración
}

export function ScheduleHeader({
  selectedSection,
  sections,
  totalSchedules,
  pendingChanges,
  isSaving,
  hasUnsavedChanges,
  currentConfig,
  onSectionChange,
  onSaveAll,
  onDiscardChanges,
  onConfigSave
}: ScheduleHeaderProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [shouldShowConfigOnSelect, setShouldShowConfigOnSelect] = useState(false);

  const selectedSectionData = sections?.find(s => s.id === selectedSection);


  
  // Manejar cambio de sección
  const handleSectionChange = (value: string) => {
    const newSectionId = parseInt(value);
    
    if (newSectionId > 0) {
      // Si hay cambios sin guardar, preguntar primero
      if (hasUnsavedChanges) {
        if (confirm('Tienes cambios sin guardar. ¿Deseas descartarlos y cambiar de sección?')) {
          onDiscardChanges();
          onSectionChange(value);
          // Mostrar modal de configuración para la nueva sección SOLO si no tiene configuración
          setTimeout(() => {
            const hasExistingConfig = currentConfig && selectedSection === newSectionId;
            if (!hasExistingConfig) {
              setShowConfigModal(true);
            }
          }, 100);
        }
      } else {
        onSectionChange(value);
        // Mostrar modal de configuración para la nueva sección SOLO si no tiene configuración
        setTimeout(() => {
          // Note: necesitamos verificar si la NUEVA sección tiene configuración, no la actual
          setShowConfigModal(true);
        }, 100);
      }
    } else {
      onSectionChange(value);
    }
  };

  // Manejar guardado de configuración
  const handleConfigSave = async (config: ScheduleConfig) => {
    if (onConfigSave) {
      await onConfigSave(config);
    }
    setShowConfigModal(false);
  };

  // Verificar si la sección tiene configuración
  const hasConfig = currentConfig && selectedSection > 0;
  const configSummary = hasConfig ? {
    days: currentConfig.workingDays.length,
    duration: currentConfig.classDuration,
    startTime: currentConfig.startTime,
    endTime: currentConfig.endTime
  } : null;

  return (
    <>
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Horario Académico
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Selector de sección y estadísticas */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="flex gap-2 items-center">
                <Select
                  value={selectedSection.toString()}
                  onValueChange={handleSectionChange}
                >
                  <SelectTrigger className="w-full sm:w-64 bg-white border-gray-200 shadow-sm">
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" disabled>
                      <div className="text-gray-500">Seleccione una sección</div>
                    </SelectItem>
                    {sections?.map((section) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{section.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Botón de configuración */}
                {selectedSection > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfigModal(true)}
                    className="flex items-center gap-2 border-blue-200 hover:bg-blue-50"
                  >
                    <Settings className="h-4 w-4 text-blue-600" />
                    <span className="hidden sm:inline">Configurar</span>
                  </Button>
                )}
              </div>
              
              {/* Estadísticas */}
              {selectedSection > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-2 px-3 py-1 bg-blue-50 border-blue-200"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-blue-700 font-medium">
                      {totalSchedules} horarios
                    </span>
                  </Badge>

                  {/* Badge de configuración */}
                  {configSummary && (
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-2 px-3 py-1 bg-green-50 border-green-200"
                    >
                      <Clock className="h-3 w-3 text-green-600" />
                      <span className="text-green-700 font-medium text-xs">
                        {configSummary.days}d • {configSummary.duration}min • {configSummary.startTime}-{configSummary.endTime}
                      </span>
                    </Badge>
                  )}

                  {!hasConfig && selectedSection > 0 && (
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border-yellow-200"
                    >
                      <AlertCircle className="h-3 w-3 text-yellow-600" />
                      <span className="text-yellow-700 font-medium text-xs">
                        Sin configurar
                      </span>
                    </Badge>
                  )}
                  
                  {hasUnsavedChanges && (
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-2 px-3 py-1 bg-orange-100 border-orange-200"
                    >
                      <AlertCircle className="h-3 w-3 text-orange-600" />
                      <span className="text-orange-700 font-medium">
                        {pendingChanges} cambios pendientes
                      </span>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Controles de guardado */}
            {hasUnsavedChanges && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDiscardChanges}
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Descartar</span>
                </Button>
                
                <Button
                  size="sm"
                  onClick={onSaveAll}
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Guardar Todo</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Configuración */}
      <ScheduleConfigModal
        isOpen={showConfigModal}
        sectionId={selectedSection}
        sectionName={selectedSectionData?.name || ''}
        currentConfig={currentConfig}
        onSave={handleConfigSave}
        onClose={() => setShowConfigModal(false)}
      />
    </>
  );
}