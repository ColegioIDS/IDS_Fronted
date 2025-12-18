'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Layers } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Section {
  id: number;
  name: string;
  capacity: number;
}

interface Grade {
  id: number;
  name: string;
  sections: Section[];
}

interface SectionsSelectorProps {
  grades: Grade[];
  selectedGradeId?: number;
  selectedSectionId?: number;
  onSectionSelect: (sectionId: number | undefined) => void;
}

export function SectionsSelector({
  grades,
  selectedGradeId,
  selectedSectionId,
  onSectionSelect,
}: SectionsSelectorProps) {
  const selectedGrade = grades.find((g) => g.id === selectedGradeId);
  const sections = selectedGrade?.sections || [];
  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-lg">
            <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Seleccionar Sección</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {selectedSection ? `Sección ${selectedSection.name}` : 'Elige una sección'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!selectedGradeId ? (
          <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Primero debes seleccionar un grado para ver sus secciones
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Select
              value={selectedSectionId?.toString() || ''}
              onValueChange={(value) => {
                onSectionSelect(value ? parseInt(value) : undefined);
              }}
              disabled={sections.length === 0}
            >
              <SelectTrigger className="w-full border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Selecciona una sección..." />
              </SelectTrigger>
              <SelectContent className="border-gray-300 dark:border-gray-600">
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>Sección {section.name}</span>
                      <span className="text-xs text-gray-500">({section.capacity} estudiantes max.)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSection && (
              <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-950 rounded-lg border border-teal-200 dark:border-teal-800">
                <p className="text-sm font-medium text-teal-900 dark:text-teal-100">
                  ✓ Sección seleccionada: <strong>{selectedSection.name}</strong>
                </p>
                <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">
                  Capacidad: {selectedSection.capacity} estudiantes
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
