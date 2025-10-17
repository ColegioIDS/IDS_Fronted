// components/schedules/calendar/ScheduleHeader.tsx
"use client";

import { useState } from "react";
import { Calendar, Users, AlertCircle, Save, RotateCcw, Settings, Clock } from "lucide-react";
import { useTheme } from "next-themes"; // ✅ AGREGAR
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// ✅ CAMBIAR: Importar tipos simplificados
import type { Section, ScheduleConfig } from "@/types/schedules";

import { ScheduleConfigModal } from "./ScheduleConfigModal";

interface ScheduleHeaderProps {
  selectedSection: number;
  sections: Section[]; // ✅ Tipo simplificado
  totalSchedules: number;
  pendingChanges: number;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  currentConfig?: ScheduleConfig | null; // ✅ Tipo simplificado
  onSectionChange: (value: string) => void;
  onSaveAll: () => void;
  onDiscardChanges: () => void;
  onConfigSave?: (config: any) => Promise<void>; // ✅ any para evitar conflictos de tipos
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
  
  // ✅ NUEVO: Theme support
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const selectedSectionData = sections?.find(s => s.id === selectedSection);
  console.log("sections", sections)

  const handleSectionChange = (value: string) => {
    const newSectionId = parseInt(value);
    
    if (newSectionId > 0) {
      if (hasUnsavedChanges) {
        if (confirm('Tienes cambios sin guardar. ¿Deseas descartarlos y cambiar de sección?')) {
          onDiscardChanges();
          onSectionChange(value);
        }
      } else {
        onSectionChange(value);
      }
    } else {
      onSectionChange(value);
    }
  };

  const handleConfigSave = async (config: any) => {
    if (onConfigSave) {
      await onConfigSave(config);
    } else {
      toast.info('La configuración de horarios ahora se gestiona desde el panel de administración');
    }
    setShowConfigModal(false);
  };

  const hasConfig = currentConfig && selectedSection > 0;
  const configSummary = hasConfig ? {
    days: Array.isArray(currentConfig.workingDays) ? currentConfig.workingDays.length : 0,
    duration: currentConfig.classDuration,
    startTime: currentConfig.startTime,
    endTime: currentConfig.endTime
  } : null;

  return (
    <>
      <Card className={`backdrop-blur-sm border-0 shadow-xl ${
        isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95'
      }`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-blue-900/50' : 'bg-blue-100'
            }`}>
              <Calendar className={`h-6 w-6 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <span className={`bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
              isDark ? 'opacity-90' : ''
            }`}>
              Horario Académico
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="flex gap-2 items-center">
                <Select
                  value={selectedSection.toString()}
                  onValueChange={handleSectionChange}
                >
                  <SelectTrigger className={`w-full sm:w-64 shadow-sm ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200'
                  }`}>
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

                {selectedSection > 0 && onConfigSave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfigModal(true)}
                    className={`flex items-center gap-2 ${
                      isDark
                        ? 'border-blue-800 hover:bg-blue-900/50'
                        : 'border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <Settings className={`h-4 w-4 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <span className="hidden sm:inline">Configurar</span>
                  </Button>
                )}
              </div>
              
              {selectedSection > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-2 px-3 py-1 ${
                      isDark
                        ? 'bg-blue-900/30 border-blue-800'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className={`font-medium ${
                      isDark ? 'text-blue-300' : 'text-blue-700'
                    }`}>
                      {totalSchedules} horarios
                    </span>
                  </Badge>

                  {configSummary && configSummary.days > 0 && (
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-2 px-3 py-1 ${
                        isDark
                          ? 'bg-green-900/30 border-green-800'
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <Clock className={`h-3 w-3 ${
                        isDark ? 'text-green-400' : 'text-green-600'
                      }`} />
                      <span className={`font-medium text-xs ${
                        isDark ? 'text-green-300' : 'text-green-700'
                      }`}>
                        {configSummary.days}d • {configSummary.duration}min • {configSummary.startTime}-{configSummary.endTime}
                      </span>
                    </Badge>
                  )}

                  {!hasConfig && selectedSection > 0 && (
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-2 px-3 py-1 ${
                        isDark
                          ? 'bg-yellow-900/30 border-yellow-800'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <AlertCircle className={`h-3 w-3 ${
                        isDark ? 'text-yellow-400' : 'text-yellow-600'
                      }`} />
                      <span className={`font-medium text-xs ${
                        isDark ? 'text-yellow-300' : 'text-yellow-700'
                      }`}>
                        Sin configurar
                      </span>
                    </Badge>
                  )}
                  
                  {hasUnsavedChanges && (
                    <Badge 
                      variant="secondary" 
                      className={`flex items-center gap-2 px-3 py-1 ${
                        isDark
                          ? 'bg-orange-900/30 border-orange-800'
                          : 'bg-orange-100 border-orange-200'
                      }`}
                    >
                      <AlertCircle className={`h-3 w-3 ${
                        isDark ? 'text-orange-400' : 'text-orange-600'
                      }`} />
                      <span className={`font-medium ${
                        isDark ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        {pendingChanges} cambios pendientes
                      </span>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {hasUnsavedChanges && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDiscardChanges}
                  disabled={isSaving}
                  className={`flex-1 sm:flex-initial flex items-center gap-2 ${
                    isDark
                      ? 'border-gray-600 hover:bg-gray-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
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

      {onConfigSave && (
        <ScheduleConfigModal
          isOpen={showConfigModal}
          sectionId={selectedSection}
          sectionName={selectedSectionData?.name || ''}
          currentConfig={currentConfig as any} // ✅ Cast para evitar conflictos
          onSave={handleConfigSave}
          onClose={() => setShowConfigModal(true)}
        />
      )}
    </>
  );
}