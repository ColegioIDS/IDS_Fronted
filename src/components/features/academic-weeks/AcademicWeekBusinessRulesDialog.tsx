// src/components/features/academic-weeks/AcademicWeekBusinessRulesDialog.tsx

'use client';

import React from 'react';
import { HelpCircle, AlertTriangle, AlertCircle, Info, Calendar, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BusinessRule {
  id: number;
  title: string;
  description: string;
  example: string;
  severity: 'critical' | 'warning' | 'info';
  icon: React.ElementType;
  color: string;
  borderColor: string;
}

const rules: BusinessRule[] = [
  {
    id: 1,
    title: 'Rangos de Fechas dentro del Bimestre',
    description:
      'Las fechas de inicio y fin de cada semana académica deben estar COMPLETAMENTE dentro del rango de fechas del bimestre al que pertenecen.',
    example: 'Si el Bimestre 1 va del 20 de agosto al 20 de octubre, ninguna semana puede empezar antes del 20 de agosto ni terminar después del 20 de octubre.',
    severity: 'critical',
    icon: AlertTriangle,
    color: 'text-red-700 dark:text-red-300',
    borderColor: 'border-l-red-500 dark:border-l-red-400',
  },
  {
    id: 2,
    title: 'Sin Solapamiento de Semanas',
    description:
      'No pueden existir dos semanas académicas del mismo bimestre con fechas que se solapen. Cada día debe pertenecer a una sola semana.',
    example: 'Si la Semana 1 termina el 26 de agosto, la Semana 2 debe empezar el 27 de agosto o después.',
    severity: 'critical',
    icon: AlertCircle,
    color: 'text-red-700 dark:text-red-300',
    borderColor: 'border-l-red-500 dark:border-l-red-400',
  },
  {
    id: 3,
    title: 'Números de Semana Únicos',
    description:
      'Dentro de un mismo bimestre, no pueden existir dos semanas con el mismo número (weekNumber).',
    example: 'No puede haber dos "Semana #1" en el Bimestre 2. Los números deben ser únicos y secuenciales.',
    severity: 'critical',
    icon: AlertTriangle,
    color: 'text-red-700 dark:text-red-300',
    borderColor: 'border-l-red-500 dark:border-l-red-400',
  },
  {
    id: 4,
    title: 'Semana de Evaluación Obligatoria',
    description:
      'Cada bimestre debe tener al menos UNA semana de tipo EVALUATION. Esta semana es crítica para el proceso de evaluación.',
    example: 'El Bimestre 1 debe incluir obligatoriamente una semana marcada como "Semana de Evaluación" (weekType = EVALUATION).',
    severity: 'warning',
    icon: Calendar,
    color: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-l-yellow-500 dark:border-l-yellow-400',
  },
  {
    id: 5,
    title: 'Recomendación: Semana de Revisión',
    description:
      'Es altamente recomendable incluir una semana de tipo REVIEW antes de la evaluación para permitir que los estudiantes repasen.',
    example: 'Se recomienda tener una "Semana de Revisión" (weekType = REVIEW) una o dos semanas antes de la evaluación.',
    severity: 'info',
    icon: Info,
    color: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-l-blue-500 dark:border-l-blue-400',
  },
  {
    id: 6,
    title: 'Estado Activo para Visibilidad',
    description:
      'Solo las semanas con isActive=true serán visibles para estudiantes y profesores. Las inactivas son solo para planificación administrativa.',
    example: 'Una semana futura puede estar creada pero inactiva hasta que llegue su fecha de inicio.',
    severity: 'info',
    icon: CheckCircle2,
    color: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-l-blue-500 dark:border-l-blue-400',
  },
];

/**
 * ❓ Diálogo de Reglas de Negocio para Academic Weeks
 * 
 * Documenta las reglas críticas que el usuario debe conocer
 */
export function AcademicWeekBusinessRulesDialog() {
  const criticalRules = rules.filter((r) => r.severity === 'critical').length;
  const warningRules = rules.filter((r) => r.severity === 'warning').length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Reglas de Negocio</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              <HelpCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                Reglas de Negocio - Semanas Académicas
              </DialogTitle>
              <DialogDescription className="mt-1">
                Reglas críticas que debes conocer antes de crear o modificar semanas académicas
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {rules.map((rule) => {
            const Icon = rule.icon;
            return (
              <Card
                key={rule.id}
                className={`border-l-4 ${rule.borderColor} bg-white dark:bg-gray-900`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        rule.severity === 'critical'
                          ? 'bg-red-100 dark:bg-red-900'
                          : rule.severity === 'warning'
                          ? 'bg-yellow-100 dark:bg-yellow-900'
                          : 'bg-blue-100 dark:bg-blue-900'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${rule.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      {/* Title & Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {rule.title}
                        </h3>
                        <Badge
                          variant={
                            rule.severity === 'critical'
                              ? 'destructive'
                              : rule.severity === 'warning'
                              ? 'default'
                              : 'secondary'
                          }
                          className="shrink-0"
                        >
                          {rule.severity === 'critical'
                            ? 'Crítico'
                            : rule.severity === 'warning'
                            ? 'Importante'
                            : 'Info'}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {rule.description}
                      </p>

                      {/* Example */}
                      <div
                        className={`p-3 rounded-lg ${
                          rule.severity === 'critical'
                            ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
                            : rule.severity === 'warning'
                            ? 'bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          💡 Ejemplo:
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                          {rule.example}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer con estadísticas */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">
                  {criticalRules} Regla{criticalRules !== 1 ? 's' : ''} Crítica
                  {criticalRules !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">
                  {warningRules} Importante{warningRules !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Total: {rules.length} reglas
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AcademicWeekBusinessRulesDialog;
