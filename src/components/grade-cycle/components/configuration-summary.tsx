// ==========================================
// src/components/grade-cycle/components/configuration-summary.tsx
// ==========================================

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ConfigurationSummaryProps {
  cycleInfo: {
    name: string;
    isActive: boolean;
    gradesCount: number;
    enrollmentsCount: number;
  };
  warnings?: string[];
  recommendations?: string[];
}

export default function ConfigurationSummary({ 
  cycleInfo, 
  warnings = [], 
  recommendations = [] 
}: ConfigurationSummaryProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Configuración Completada
          </CardTitle>
          <CardDescription>
            Resumen de la configuración del ciclo {cycleInfo.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{cycleInfo.name}</p>
              <p className="text-sm text-muted-foreground">Ciclo Escolar</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{cycleInfo.gradesCount}</p>
              <p className="text-sm text-muted-foreground">Grados</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{cycleInfo.enrollmentsCount}</p>
              <p className="text-sm text-muted-foreground">Estudiantes</p>
            </div>
            
            <div className="text-center">
              <Badge variant={cycleInfo.isActive ? "default" : "secondary"}>
                {cycleInfo.isActive ? "Activo" : "Inactivo"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">Estado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertencias */}
      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Advertencias:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Próximos pasos recomendados:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm">{recommendation}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}