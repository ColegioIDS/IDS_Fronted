// src/components/features/schedules/modals/ConfigurationChangeModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Trash2, RotateCcw, ChevronDown, Clock, Calendar, Coffee } from 'lucide-react';
import type { ScheduleValidationResult } from '@/utils/scheduleValidator';
import { DAY_NAMES, DAY_SHORT_LABELS, type DayOfWeek } from '@/types/schedules.types';
import { useState } from 'react';

interface ConfigurationChangeModalProps {
  isOpen: boolean;
  validation: ScheduleValidationResult;
  onApplyAndDelete: () => Promise<void>;
  onApplyAndAdjust: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfigurationChangeModal({
  isOpen,
  validation,
  onApplyAndDelete,
  onApplyAndAdjust,
  onCancel,
  isLoading = false,
}: ConfigurationChangeModalProps) {
  const [expandedReasons, setExpandedReasons] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<'delete' | 'adjust' | null>(null);

  const toggleExpanded = (reason: string) => {
    setExpandedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const groupedSuggestions = validation.suggestions.reduce(
    (acc, sugg) => {
      if (!acc[sugg.reason]) acc[sugg.reason] = [];
      acc[sugg.reason].push(sugg);
      return acc;
    },
    {} as Record<string, typeof validation.suggestions>
  );

  const reasonLabels = {
    outside_working_days: 'Fuera de días laborales',
    outside_time_range: 'Fuera del rango de horario',
    invalid_duration: 'Duración incorrecta',
    overlaps_break: 'Solapea con descanso',
  };

  const reasonColors = {
    outside_working_days: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900',
    outside_time_range: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900',
    invalid_duration: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900',
    overlaps_break: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Cambios en Configuración Detectados
          </DialogTitle>
          <DialogDescription>
            Se detectaron {validation.affectedSchedules.length} horario(s) inválido(s) después de los cambios realizados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cambios realizados */}
          <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Cambios realizados:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {validation.changesSummary.durationChanged && (
                <div className="flex items-center justify-between">
                  <span>Duración de clase:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="line-through">
                      {validation.changesSummary.oldValues.classDuration}min
                    </Badge>
                    <span className="text-gray-500">→</span>
                    <Badge className="bg-blue-600">
                      {validation.changesSummary.newValues.classDuration}min
                    </Badge>
                  </div>
                </div>
              )}
              
              {validation.changesSummary.workingDaysChanged && (
                <div className="flex items-center justify-between">
                  <span>Días laborales:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="line-through text-xs">
                      {validation.changesSummary.oldValues.workingDays
                        ?.map((d) => DAY_SHORT_LABELS[d as DayOfWeek])
                        .join(',')}
                    </Badge>
                    <span className="text-gray-500">→</span>
                    <Badge className="bg-blue-600 text-xs">
                      {validation.changesSummary.newValues.workingDays
                        .map((d) => DAY_SHORT_LABELS[d])
                        .join(',')}
                    </Badge>
                  </div>
                </div>
              )}

              {validation.changesSummary.startTimeChanged && (
                <div className="flex items-center justify-between">
                  <span>Hora de inicio:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="line-through">
                      {validation.changesSummary.oldValues.startTime}
                    </Badge>
                    <span className="text-gray-500">→</span>
                    <Badge className="bg-blue-600">
                      {validation.changesSummary.newValues.startTime}
                    </Badge>
                  </div>
                </div>
              )}

              {validation.changesSummary.endTimeChanged && (
                <div className="flex items-center justify-between">
                  <span>Hora de fin:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="line-through">
                      {validation.changesSummary.oldValues.endTime}
                    </Badge>
                    <span className="text-gray-500">→</span>
                    <Badge className="bg-blue-600">
                      {validation.changesSummary.newValues.endTime}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Horarios afectados por categoría */}
          {validation.affectedSchedules.length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  {validation.affectedSchedules.length} horario(s) inválido(s)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(groupedSuggestions).map(([reason, suggestions]) => (
                    <div
                      key={reason}
                      className={`border rounded-lg overflow-hidden ${
                        reasonColors[reason as keyof typeof reasonColors]
                      }`}
                    >
                      <button
                        onClick={() => toggleExpanded(reason)}
                        className="w-full px-3 py-2 flex items-center justify-between hover:opacity-80 transition-opacity"
                      >
                        <span className="text-sm font-medium">
                          {reasonLabels[reason as keyof typeof reasonLabels]}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {suggestions.length}
                          </Badge>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedReasons.includes(reason) ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {expandedReasons.includes(reason) && (
                        <div className="border-t px-3 py-2 space-y-2 max-h-40 overflow-y-auto bg-white/50 dark:bg-black/20">
                          {suggestions.map((sugg) => (
                            <div
                              key={sugg.scheduleId}
                              className="text-xs p-2 bg-white dark:bg-gray-900 rounded border-l-2 border-gray-300"
                            >
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {DAY_NAMES[sugg.currentState.dayOfWeek]}
                                {' '}
                                <span className="font-mono">
                                  {sugg.currentState.startTime}-{sugg.currentState.endTime}
                                </span>
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {sugg.recommendation}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Opciones de acción */}
          <Card className="bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Elige una opción:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={async () => {
                  setSelectedAction('delete');
                  await onApplyAndDelete();
                }}
                disabled={isLoading || selectedAction !== null}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isLoading && selectedAction === 'delete'
                  ? 'Eliminando...'
                  : `Eliminar ${validation.affectedSchedules.length} horario(s) inválido(s)`}
              </Button>

              <Button
                onClick={async () => {
                  setSelectedAction('adjust');
                  await onApplyAndAdjust();
                }}
                disabled={isLoading || selectedAction !== null}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {isLoading && selectedAction === 'adjust'
                  ? 'Ajustando...'
                  : 'Intentar ajustar automáticamente'}
              </Button>

              <Button
                onClick={onCancel}
                disabled={isLoading}
                variant="ghost"
                className="w-full"
              >
                Cancelar cambios
              </Button>
            </CardContent>
          </Card>

          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/50 p-3 rounded border">
            <p>
              <strong>Nota:</strong> Los cambios en la configuración de horario no se aplicarán hasta que hagas clic
              en una de las opciones anteriores.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
