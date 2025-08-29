// ==========================================
// src/components/grade-cycle/steps/configure-grades-step.tsx
// ==========================================

"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Plus, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useGradeContext, useGradeList } from '@/context/GradeContext';
import CreateGradeForm from '../forms/create-grade-form';

interface ConfigureGradesStepProps {
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ConfigureGradesStep({ onComplete, onNext, onBack }: ConfigureGradesStepProps) {
  const { state, fetchGrades } = useGradeContext();
  const { grades, loading } = useGradeList();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (grades.length === 0 && !loading) {
      fetchGrades();
    }
  }, [grades.length, loading, fetchGrades]);

  const activeGrades = grades.filter(grade => grade.isActive);
  const gradesByLevel = {
    'Kinder': activeGrades.filter(g => g.level === 'Kinder'),
    'Primaria': activeGrades.filter(g => g.level === 'Primaria'),
    'Secundaria': activeGrades.filter(g => g.level === 'Secundaria')
  };

  const handleGradeCreated = () => {
    setShowCreateForm(false);
    fetchGrades();
  };

  const handleContinue = () => {
    if (activeGrades.length > 0) {
      onComplete();
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
          <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Configurar Grados</h3>
          <p className="text-sm text-muted-foreground">
            Defina los grados académicos disponibles en su institución
          </p>
        </div>
      </div>

      {activeGrades.length === 0 && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            No hay grados configurados. Agregue al menos un grado para continuar.
          </AlertDescription>
        </Alert>
      )}

      {/* Resumen de Grados Existentes */}
      {activeGrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Grados Configurados ({activeGrades.length})</span>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                <CheckCircle className="h-3 w-3 mr-1" />
                Listo
              </Badge>
            </CardTitle>
            <CardDescription>
              Grados disponibles en su institución
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(gradesByLevel).map(([level, levelGrades]) => (
                <div key={level} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">{level}</h4>
                  <div className="space-y-1">
                    {levelGrades.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Sin grados</p>
                    ) : (
                      levelGrades.map(grade => (
                        <Badge key={grade.id} variant="secondary" className="block text-center">
                          {grade.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario para Crear Grado */}
      {showCreateForm && (
        <CreateGradeForm 
          onSuccess={handleGradeCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Acciones */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        <div className="flex gap-2">
          {!showCreateForm && (
            <Button 
              variant="outline" 
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Grado
            </Button>
          )}
          
          <Button 
            onClick={handleContinue}
            disabled={activeGrades.length === 0}
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}