// ==========================================
// src/components/grade-cycle/components/grade-selection-card.tsx
// ==========================================

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { Grade } from '@/types/grades';

interface GradeSelectionCardProps {
  grades: Grade[];
  selectedGrades: number[];
  onGradeToggle: (gradeId: number, checked: boolean) => void;
  existingGradeCycles?: number[];
  title?: string;
  description?: string;
}

export default function GradeSelectionCard({
  grades,
  selectedGrades,
  onGradeToggle,
  existingGradeCycles = [],
  title = "Seleccionar Grados",
  description = "Elija los grados que estarán disponibles"
}: GradeSelectionCardProps) {
  
  const gradesByLevel = {
    'Kinder': grades.filter(g => g.level === 'Kinder'),
    'Primaria': grades.filter(g => g.level === 'Primaria'),
    'Secundaria': grades.filter(g => g.level === 'Secundaria')
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
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
                      onCheckedChange={(checked) => onGradeToggle(grade.id, !!checked)}
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
          <div className="pt-4 border-t">
            <p className="text-sm font-medium">
              Grados seleccionados: {selectedGrades.length}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedGrades.map(gradeId => {
                const grade = grades.find(g => g.id === gradeId);
                return grade ? (
                  <Badge key={gradeId} variant="default" className="text-xs">
                    {grade.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}