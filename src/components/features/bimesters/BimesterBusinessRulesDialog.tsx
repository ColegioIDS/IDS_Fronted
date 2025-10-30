// src/components/features/bimesters/BimesterBusinessRulesDialog.tsx

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, AlertCircle, CheckCircle2, Calendar, Clock, Archive, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * 📋 Dialog de Reglas de Negocio para Bimestres
 * 
 * Muestra las reglas críticas que el usuario debe conocer
 * al crear o editar bimestres.
 */
export function BimesterBusinessRulesDialog() {
  const rules = [
    {
      id: 1,
      icon: Calendar,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      title: 'Rango de Fechas del Ciclo',
      description: 'Los bimestres DEBEN estar dentro del rango de fechas del ciclo escolar seleccionado.',
      example: 'Si el ciclo es del 1 de enero al 30 de junio, todos los bimestres deben estar en ese período.',
      severity: 'critical',
    },
    {
      id: 2,
      icon: Clock,
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
      title: 'Sin Sobreposición de Fechas',
      description: 'Los bimestres NO pueden sobreponerse entre sí.',
      example: 'Si el Bimestre 1 termina el 15 de febrero, el Bimestre 2 debe iniciar el 16 de febrero o después.',
      severity: 'critical',
    },
    {
      id: 3,
      icon: CheckCircle2,
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
      title: 'Un Solo Bimestre Activo',
      description: 'Solo puede haber UN bimestre activo por ciclo a la vez.',
      example: 'Si activas un bimestre, los demás del mismo ciclo se desactivarán automáticamente.',
      severity: 'warning',
    },
    {
      id: 4,
      icon: Hash,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
      title: 'Número Único por Ciclo',
      description: 'El número de bimestre debe ser único dentro del ciclo.',
      example: 'No puede haber dos "Bimestre 1" en el mismo ciclo escolar.',
      severity: 'critical',
    },
    {
      id: 5,
      icon: Archive,
      iconColor: 'text-gray-600 dark:text-gray-400',
      iconBg: 'bg-gray-100 dark:bg-gray-900/50',
      title: 'Ciclos Archivados Bloqueados',
      description: 'No se puede modificar un bimestre si el ciclo está archivado.',
      example: 'Los ciclos archivados son de solo lectura para mantener el historial académico.',
      severity: 'info',
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
        >
          <HelpCircle className="h-4 w-4" />
          Reglas de Negocio
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            Reglas de Negocio - Gestión de Bimestres
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Estas son las reglas críticas que debes conocer al crear o modificar bimestres.
            Seguir estas reglas garantiza la integridad de los datos académicos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {rules.map((rule, index) => {
            const Icon = rule.icon;
            
            return (
              <Card 
                key={rule.id}
                className={`border-l-4 ${
                  rule.severity === 'critical' 
                    ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' 
                    : rule.severity === 'warning'
                    ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'
                    : 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Icono */}
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full ${rule.iconBg} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${rule.iconColor}`} />
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {index + 1}. {rule.title}
                        </h3>
                        {rule.severity === 'critical' && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full whitespace-nowrap">
                            Crítico
                          </span>
                        )}
                        {rule.severity === 'warning' && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full whitespace-nowrap">
                            Importante
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {rule.description}
                      </p>

                      <div className="mt-3 p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Ejemplo:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                          {rule.example}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer con nota importante */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                ⚠️ Importante
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                El sistema validará automáticamente estas reglas al crear o editar bimestres.
                Si alguna regla no se cumple, recibirás un mensaje de error específico.
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {rules.filter(r => r.severity === 'critical').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Reglas Críticas
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {rules.filter(r => r.severity === 'warning').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Importantes
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {rules.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Total de Reglas
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BimesterBusinessRulesDialog;
