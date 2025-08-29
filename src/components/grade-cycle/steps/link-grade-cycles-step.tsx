// ==========================================
// src/components/grade-cycle/steps/link-grade-cycles-step.tsx
// ==========================================

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, CheckCircle, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { useSchoolCycleContext } from '@/context/SchoolCycleContext';
import { useGradeContext } from '@/context/GradeContext';
import { useGradeCycleContext, useGradeCycleBulkForm } from '@/context/GradeCycleContext';
import Label from '@/components/form/Label';

interface LinkGradeCyclesStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function LinkGradeCyclesStep({ onComplete, onBack }: LinkGradeCyclesStepProps) {
  const { activeCycle } = useSchoolCycleContext();
  const { state: gradeState } = useGradeContext();
  const { fetchGradeCyclesByCycle } = useGradeCycleContext();
  const { handleBulkSubmit, submitting } = useGradeCycleBulkForm();
  
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [existingGradeCycles, setExistingGradeCycles] = useState<number[]>([]);

  const activeGrades = gradeState.grades.filter(grade => grade.isActive);

  // Cargar configuración existente
  useEffect(() => {
    if (activeCycle) {
      fetchGradeCyclesByCycle(activeCycle.id).then(() => {
        // Aquí podrías setear los grados ya vinculados
        // setExistingGradeCycles(...)
      });
    }
  }, [activeCycle, fetchGradeCyclesByCycle]);

  const handleGradeToggle = (gradeId: number, checked: boolean) => {
    if (checked) {
      setSelectedGrades(prev => [...prev, gradeId]);
    } else {
      setSelectedGrades(prev => prev.filter(id => id !== gradeId));
    }
  };

  const handleSelectAll = () => {
    setSelectedGrades(activeGrades.map(grade => grade.id));
  };

  const handleDeselectAll = () => {
    setSelectedGrades([]);
  };

  const handleSave = async () => {
    if (!activeCycle || selectedGrades.length === 0) return;

    try {
      const result = await handleBulkSubmit({
        cycleId: activeCycle.id,
        gradeIds: selectedGrades
      });

      if (result.success) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving grade cycles:', error);
    }
  };

  const gradesByLevel = {
    'Kinder': activeGrades.filter(g => g.level === 'Kinder'),
    'Primaria': activeGrades.filter(g => g.level === 'Primaria'),
    'Secundaria': activeGrades.filter(g => g.level === 'Secundaria')
  };

  if (!activeCycle) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          No hay un ciclo escolar activo. Por favor, complete el paso anterior.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Vincular Grados al Ciclo</h3>
          <p className="text-sm text-muted-foreground">
            Seleccione qué grados se ofrecerán en el ciclo <strong>{activeCycle.name}</strong>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Seleccionar Grados para {activeCycle.name}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Seleccionar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deseleccionar
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Los grados seleccionados estarán disponibles para matrícula este año
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(gradesByLevel).map(([level, levelGrades]) => (
            <div key={level} className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground border-b pb-1">
                {level} ({levelGrades.length} grados)
              </h4>
              
              {levelGrades.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No hay grados configurados para este nivel
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {levelGrades.map(grade => (
                    <div 
                      key={grade.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`grade-${grade.id}`}
                        checked={selectedGrades.includes(grade.id)}
                        onCheckedChange={(checked) => handleGradeToggle(grade.id, !!checked)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`grade-${grade.id}`} className="font-medium cursor-pointer">
                          {grade.name}
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Orden: {grade.order}
                          </Badge>
                          {existingGradeCycles.includes(grade.id) && (
                            <Badge variant="secondary" className="text-xs">
                              Ya vinculado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {selectedGrades.length > 0 && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {selectedGrades.length} grados seleccionados para el ciclo {activeCycle.name}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={selectedGrades.length === 0 || submitting}
          className="min-w-[120px]"
        >
          {submitting ? (
            "Guardando..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
