// ==========================================
// src/components/grade-cycle/grade-cycle-dashboard.tsx
// ==========================================

"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Settings,
  Plus,
  Eye
} from 'lucide-react';
import { useSchoolCycleContext } from '@/context/SchoolCycleContext';
import { useGradeContext } from '@/context/GradeContext';
import { useGradeCycleContext, useGradeCycleStats } from '@/context/GradeCycleContext';
import {CheckCircle} from 'lucide-react';

export default function GradeCycleDashboard() {
  const { activeCycle, getActiveCycleInfo, stats: cycleStats } = useSchoolCycleContext();
  const { state: gradeState, fetchGrades } = useGradeContext();
  const { fetchCycleStats, fetchCycleSummary } = useGradeCycleContext();
  const { cycleStats: gradeStats, cycleSummary, fetchStats, fetchSummary } = useGradeCycleStats();

  const activeCycleInfo = getActiveCycleInfo();

  useEffect(() => {
    fetchGrades();
    if (activeCycle) {
      fetchStats(activeCycle.id);
      fetchSummary(activeCycle.id);
    }
  }, [activeCycle, fetchGrades, fetchStats, fetchSummary]);

  const activeGrades = gradeState.grades.filter(grade => grade.isActive);

  if (!activeCycle) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay ciclo escolar activo</h3>
          <p className="text-muted-foreground text-center mb-4">
            Para comenzar, necesita crear y configurar un ciclo escolar
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Ciclo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard - Ciclos Escolares</h2>
          <p className="text-muted-foreground">
            Resumen y configuración del año académico {activeCycleInfo.academicYear}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalles
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ciclo Actual</p>
                <p className="text-2xl font-bold">{activeCycle.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <GraduationCap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Grados Activos</p>
                <p className="text-2xl font-bold">{activeGrades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudiantes</p>
                <p className="text-2xl font-bold">{cycleSummary?.totalEnrollments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progreso</p>
                <p className="text-2xl font-bold">{Math.round(activeCycleInfo.progress)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso del Año */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del Año Académico</CardTitle>
          <CardDescription>
            {activeCycleInfo.daysRemaining} días restantes del ciclo {activeCycle.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso anual</span>
              <span>{Math.round(activeCycleInfo.progress)}%</span>
            </div>
            <Progress value={activeCycleInfo.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{new Date(activeCycle.startDate).toLocaleDateString()}</span>
              <span>{new Date(activeCycle.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas por Grado */}
      {gradeStats && gradeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas por Grado</CardTitle>
            <CardDescription>
              Capacidad y matrícula actual por nivel académico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeStats.map(stat => (
                <div key={stat.gradeId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{stat.level}</Badge>
                    <div>
                      <p className="font-medium">{stat.gradeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.sectionsCount} secciones disponibles
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">
                      {stat.enrolledCount} / {stat.totalCapacity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(stat.occupancyRate)}% ocupado
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de la Configuración</CardTitle>
          <CardDescription>
            Verifique que todos los elementos estén configurados correctamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Ciclo Escolar</span>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completado
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Grados Configurados</span>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {activeGrades.length} grados
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Vinculaciones</span>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {cycleSummary?.gradesConfigured || 0} vinculados
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Matrículas Activas</span>
                <Badge variant={cycleSummary?.hasEnrollments ? "default" : "secondary"}>
                  {cycleSummary?.totalEnrollments || 0} estudiantes
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado del Sistema</span>
                <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operativo
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}