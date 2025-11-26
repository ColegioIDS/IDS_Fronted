// src/components/features/schedules/calendar/ScheduleHeader.tsx
"use client";

import { useState } from "react";
import { Calendar, AlertCircle, Save, RotateCcw, Settings, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const selectedSectionData = sections?.find(s => s.id === selectedSection);

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
      <Card className="backdrop-blur-sm border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl text-gray-900 dark:text-white">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Horario Académico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              {selectedSection > 0 && onConfigSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfigModal(true)}
                  className="flex items-center gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                >
                  <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="hidden sm:inline">Configurar</span>
                </Button>
              )}

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
