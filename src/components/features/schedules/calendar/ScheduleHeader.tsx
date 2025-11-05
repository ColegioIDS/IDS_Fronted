// src/components/features/schedules/calendar/ScheduleHeader.tsx
"use client";

import { useState } from "react";
import { Calendar, Users, AlertCircle, Save, RotateCcw, Settings, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { ScheduleConfig } from "@/types/schedules.types";
import { ScheduleConfigModal } from "@/components/features/schedules/calendar/ScheduleConfigModal";

interface Section {
  id: number;
  name: string;
}

interface ScheduleHeaderProps {
  selectedSection: number;
  sections: Section[];
  totalSchedules: number;
  pendingChanges: number;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  currentConfig?: ScheduleConfig | null;
  onSectionChange: (value: string) => void;
  onSaveAll: () => void;
  onDiscardChanges: () => void;
  onConfigSave?: (config: ScheduleConfig) => Promise<void>;
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const selectedSectionData = sections?.find(s => s.id === selectedSection);

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

  const handleConfigSave = async (config: ScheduleConfig) => {
    if (onConfigSave) {
      await onConfigSave(config);
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
            <span>Horario Académico</span>
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
                  <Badge variant="outline">
                    {totalSchedules} horarios
                  </Badge>

                  {configSummary && configSummary.days > 0 && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {configSummary.days}d • {configSummary.duration}min
                    </Badge>
                  )}

                  {hasUnsavedChanges && (
                    <Badge>
                      {pendingChanges} cambios
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
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Descartar
                </Button>

                <Button
                  size="sm"
                  onClick={onSaveAll}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar
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
          currentConfig={currentConfig}
          onSave={handleConfigSave}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </>
  );
}
