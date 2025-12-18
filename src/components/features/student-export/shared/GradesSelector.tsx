'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface Grade {
  id: number;
  name: string;
  level: string;
  sections: Array<{
    id: number;
    name: string;
  }>;
}

interface GradesSelectorProps {
  grades: Grade[];
  selectedGradeId?: number;
  onGradeSelect: (gradeId: number | undefined) => void;
}

export function GradesSelector({
  grades,
  selectedGradeId,
  onGradeSelect,
}: GradesSelectorProps) {
  const selectedGrade = grades.find((g) => g.id === selectedGradeId);

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Seleccionar Grado</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {selectedGrade ? `${selectedGrade.name}` : 'Elige un grado para ver sus secciones'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Select
          value={selectedGradeId?.toString() || ''}
          onValueChange={(value) => {
            onGradeSelect(value ? parseInt(value) : undefined);
          }}
        >
          <SelectTrigger className="w-full border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Selecciona un grado..." />
          </SelectTrigger>
          <SelectContent className="border-gray-300 dark:border-gray-600">
            {grades.map((grade) => (
              <SelectItem key={grade.id} value={grade.id.toString()}>
                <div className="flex items-center gap-2">
                  <span>{grade.name}</span>
                  <span className="text-xs text-gray-500">({grade.sections.length} secciones)</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedGrade && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              ✓ Grado seleccionado: <strong>{selectedGrade.name}</strong>
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              {selectedGrade.sections.length} secciones disponibles
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
