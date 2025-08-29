// src/components/grade-cycle/grade-cycle-content.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, GraduationCap, Settings, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { useSchoolCycleContext } from '@/context/SchoolCycleContext';
import { useGradeContext } from '@/context/GradeContext';
import { useGradeCycleContext } from '@/context/GradeCycleContext';

import CreateCycleStep from './steps/create-cycle-step';
import ConfigureGradesStep from './steps/configure-grades-step';
import LinkGradeCyclesStep from './steps/link-grade-cycles-step';
import WizardSummary from './wizard-summary';
import GradeCycleDashboard from './grade-cycle-dashboard';
import LoadingSkeleton from './components/loading-skeleton';

export default function GradeCycleContent() {
  const [activeTab, setActiveTab] = useState("cycle");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Contextos
  const { activeCycle, getActiveCycleInfo, isLoading: cycleLoading } = useSchoolCycleContext();
  const { state: gradeState, fetchGrades } = useGradeContext();
  const { state: gradeCycleState, fetchGradeCyclesByCycle } = useGradeCycleContext();

  const activeCycleInfo = getActiveCycleInfo();

  // Cargar datos iniciales
  useEffect(() => {
    fetchGrades();
    if (activeCycle) {
      fetchGradeCyclesByCycle(activeCycle.id);
    }
  }, [activeCycle, fetchGrades, fetchGradeCyclesByCycle]);

  // Determinar qué pasos están completos
  useEffect(() => {
    const completed: string[] = [];
    
    // Paso 1: ¿Hay ciclo activo?
    if (activeCycle) {
      completed.push("cycle");
    }
    
    // Paso 2: ¿Hay grados configurados?
    if (gradeState.grades.length > 0) {
      completed.push("grades");
    }
    
    // Paso 3: ¿Hay vinculaciones configuradas?
    if (gradeCycleState.gradeCycles.length > 0) {
      completed.push("link");
    }
    
    setCompletedSteps(completed);

    // Si todos los pasos están completos, mostrar dashboard
    if (completed.length === 3) {
      setShowDashboard(true);
    }
  }, [activeCycle, gradeState.grades.length, gradeCycleState.gradeCycles.length]);

  const getStepStatus = (step: string) => {
    return completedSteps.includes(step) ? "completed" : "pending";
  };

  const canAccessStep = (step: string) => {
    switch (step) {
      case "cycle":
        return true;
      case "grades":
        return completedSteps.includes("cycle");
      case "link":
        return completedSteps.includes("cycle") && completedSteps.includes("grades");
      case "dashboard":
        return completedSteps.length === 3;
      default:
        return false;
    }
  };

  const handleTabChange = (value: string) => {
    if (canAccessStep(value)) {
      setActiveTab(value);
    }
  };

  // Mostrar loading skeleton inicial
  if (cycleLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <LoadingSkeleton type="form" />
      </div>
    );
  }

  // Si está todo configurado, mostrar dashboard
  if (showDashboard && completedSteps.length === 3) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header con opción de volver al wizard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Ciclos Escolares</h1>
            <p className="text-muted-foreground">
              Dashboard y configuración del año académico
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDashboard(false)}>
              <Settings className="h-4 w-4 mr-2" />
              Reconfigurar
            </Button>
            <Button asChild>
              <a href="/admin/enrollments">
                Comenzar Matrículas
              </a>
            </Button>
          </div>
        </div>

        <GradeCycleDashboard />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Año Escolar</h1>
        <p className="text-muted-foreground">
          Configure el ciclo escolar, grados y sus vinculaciones paso a paso
        </p>
      </div>

      {/* Información del Ciclo Activo */}
      {activeCycleInfo.isActive && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Ciclo activo: <strong>{activeCycleInfo.academicYear}</strong> 
            ({activeCycleInfo.daysRemaining} días restantes, {Math.round(activeCycleInfo.progress)}% completado)
          </AlertDescription>
        </Alert>
      )}

      {/* Indicador de Progreso Global */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Progreso de Configuración
            </h3>
            <Badge variant="outline" className="bg-white dark:bg-gray-900">
              {completedSteps.length}/3 Completado
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSteps.length / 3) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {Math.round((completedSteps.length / 3) * 100)}%
            </span>
          </div>
          
          <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300 mt-2">
            <span>Inicio</span>
            <span>Configuración Completa</span>
          </div>
        </CardContent>
      </Card>

      {/* Wizard Principal */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Asistente de Configuración
          </CardTitle>
          <CardDescription>
            Complete los siguientes pasos para configurar el año escolar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="cycle" 
                disabled={!canAccessStep("cycle")}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">1. Ciclo Escolar</span>
                <span className="sm:hidden">Ciclo</span>
                {getStepStatus("cycle") === "completed" && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </TabsTrigger>
              
              <TabsTrigger 
                value="grades" 
                disabled={!canAccessStep("grades")}
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">2. Grados</span>
                <span className="sm:hidden">Grados</span>
                {getStepStatus("grades") === "completed" && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </TabsTrigger>
              
              <TabsTrigger 
                value="link" 
                disabled={!canAccessStep("link")}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">3. Vinculación</span>
                <span className="sm:hidden">Vincular</span>
                {getStepStatus("link") === "completed" && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </TabsTrigger>
            </TabsList>

            {/* Paso 1: Crear/Seleccionar Ciclo */}
            <TabsContent value="cycle" className="space-y-6 mt-6">
              <CreateCycleStep 
                onComplete={() => {
                  setCompletedSteps(prev => [...prev.filter(s => s !== "cycle"), "cycle"]);
                  setActiveTab("grades");
                }}
                onNext={() => setActiveTab("grades")}
              />
            </TabsContent>

            {/* Paso 2: Configurar Grados */}
            <TabsContent value="grades" className="space-y-6 mt-6">
              <ConfigureGradesStep 
                onComplete={() => {
                  setCompletedSteps(prev => [...prev.filter(s => s !== "grades"), "grades"]);
                  setActiveTab("link");
                }}
                onNext={() => setActiveTab("link")}
                onBack={() => setActiveTab("cycle")}
              />
            </TabsContent>

            {/* Paso 3: Vincular Grados con Ciclo */}
            <TabsContent value="link" className="space-y-6 mt-6">
              <LinkGradeCyclesStep 
                onComplete={() => {
                  setCompletedSteps(prev => [...prev.filter(s => s !== "link"), "link"]);
                  setShowDashboard(true);
                }}
                onBack={() => setActiveTab("grades")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resumen del Progreso */}
      {completedSteps.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Configuración en Progreso
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {completedSteps.length === 1 && "Ciclo configurado, continúe con los grados"}
                    {completedSteps.length === 2 && "Casi listo, configure las vinculaciones"}
                    {completedSteps.length === 3 && "¡Configuración completada!"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {completedSteps.map(step => (
                  <div key={step} className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {step === "cycle" && "Ciclo"}
                      {step === "grades" && "Grados"}
                      {step === "link" && "Vinculación"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen Final */}
      {completedSteps.length === 3 && !showDashboard && (
        <WizardSummary />
      )}

      {/* Quick Actions */}
      {completedSteps.length === 3 && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    ¡Sistema Listo para Usar!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Puede comenzar con las matrículas y configuración de horarios
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDashboard(true)}
                  className="border-green-200 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Dashboard
                </Button>
                <Button asChild>
                  <a href="/admin/sections">
                    Configurar Secciones
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}