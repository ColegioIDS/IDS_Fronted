// ==========================================
// src/components/grade-cycle/wizard-summary.tsx
// ==========================================

"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Calendar, GraduationCap, Users, BarChart3, ExternalLink } from 'lucide-react';
import { useSchoolCycleContext } from '@/context/SchoolCycleContext';
import { useGradeContext } from '@/context/GradeContext';
import { useGradeCycleContext, useGradeCycleStats } from '@/context/GradeCycleContext';

export default function WizardSummary() {
  const { activeCycle, getActiveCycleInfo } = useSchoolCycleContext();
  const { state: gradeState } = useGradeContext();
  const { fetchCycleSummary } = useGradeCycleContext();
  const { cycleSummary, fetchSummary } = useGradeCycleStats();

  const activeCycleInfo = getActiveCycleInfo();

  useEffect(() => {
    if (activeCycle) {
      fetchSummary(activeCycle.id);
    }
  }, [activeCycle, fetchSummary]);

  const activeGrades = gradeState.grades.filter(grade => grade.isActive);

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <CheckCircle className="h-6 w-6" />
          ¡Configuración Completada!
        </CardTitle>
        <CardDescription className="text-green-700 dark:text-green-300">
          Su año escolar está listo para comenzar las matrículas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen del Ciclo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium">{activeCycle?.name}</p>
              <p className="text-sm text-muted-foreground">Ciclo Escolar</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <GraduationCap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="font-medium">{activeGrades.length} Grados</p>
              <p className="text-sm text-muted-foreground">Configurados</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium">{cycleSummary?.totalEnrollments || 0}</p>
              <p className="text-sm text-muted-foreground">Estudiantes</p>
            </div>
          </div>
        </div>

        {/* Detalles de Configuración */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen de Configuración
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Período Académico:</p>
              <p className="text-sm text-muted-foreground">
                {activeCycle && new Date(activeCycle.startDate).toLocaleDateString()} - {' '}
                {activeCycle && new Date(activeCycle.endDate).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Progreso del Año:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${activeCycleInfo.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(activeCycleInfo.progress)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Grados Configurados:</p>
            <div className="flex flex-wrap gap-2">
              {activeGrades.map(grade => (
                <Badge key={grade.id} variant="secondary">
                  {grade.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Próximos Pasos */}
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>Próximos pasos recomendados:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Crear secciones para cada grado</li>
              <li>Asignar profesores a los cursos</li>
              <li>Configurar horarios de clases</li>
              <li>Comenzar el proceso de matrículas</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Acciones Finales */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reiniciar Configuración
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/admin/sections">
                Configurar Secciones
              </a>
            </Button>
            <Button asChild>
              <a href="/admin/enrollments">
                Comenzar Matrículas
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}