// src/components/erica-evaluations/selection-flow/section-selection.tsx
"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, CheckCircle, UserCheck } from 'lucide-react';

// Context hooks
import { useSectionContext } from '@/context/SectionsContext';

// Types
import { Grade } from '@/types/student';
import { Section } from '@/types/student';

// ==================== INTERFACES ====================
interface SectionSelectionProps {
  selectedGrade: Grade;
  selectedSection: Section | null;
  onSelect: (section: Section) => void;
  isCompleted: boolean;
  onEdit: () => void;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function SectionSelection({
  selectedGrade,
  selectedSection,
  onSelect,
  isCompleted,
  onEdit
}: SectionSelectionProps) {
  // ========== CONTEXTS ==========
  const { 
    state: { sections, loading: loadingSections, error: sectionError }
  } = useSectionContext();

  // ========== COMPUTED VALUES ==========
  const availableSections = useMemo(() => {
    return sections
      .filter((section: any) => section.gradeId === selectedGrade.id)
      .sort((a: any, b: any) => {
        // Ordenar alfabéticamente por nombre de sección (A, B, C...)
        return a.name.localeCompare(b.name);
      });
  }, [sections, selectedGrade.id]);

  // ========== VISTA COMPLETADA ==========
  if (isCompleted && selectedSection) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <div className="font-semibold text-green-800 dark:text-green-200">
              {selectedGrade.name} - Sección {selectedSection.name}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Capacidad: {selectedSection.capacity} estudiantes
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
            Sección seleccionada
          </Badge>
        </div>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
        >
          Cambiar
        </Button>
      </div>
    );
  }

  // ========== MANEJO DE ESTADOS ==========
  if (loadingSections) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          Cargando secciones del grado {selectedGrade.name}...
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sectionError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar las secciones: {sectionError}
        </AlertDescription>
      </Alert>
    );
  }

  if (availableSections.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No hay secciones disponibles para el grado "{selectedGrade.name}". 
          Configure las secciones para este grado antes de continuar.
        </AlertDescription>
      </Alert>
    );
  }

  // ========== VISTA DE SELECCIÓN ==========
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Seleccione la sección del grado "{selectedGrade.name}"
        </p>
        <Badge variant="outline" className="text-xs">
          {availableSections.length} sección{availableSections.length !== 1 ? 'es' : ''} disponible{availableSections.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableSections.map((section: any) => (
          <Card 
            key={section.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30"
          >
            <CardContent className="p-6">
              <button
                onClick={() => onSelect(section)}
                className="w-full text-center group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <Users className="h-10 w-10 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-xs px-1 py-0 min-w-0"
                    >
                      {section.name}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors">
                      Sección {section.name}
                    </h3>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        <span>{section.capacity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher indicator if available */}
                  {section.teacherId && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      Maestro guía asignado
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Click para seleccionar</span>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info adicional */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6 space-y-1">
        <div>Solo se muestran las secciones del grado seleccionado</div>
        <div className="flex items-center justify-center gap-1">
          <UserCheck className="h-3 w-3" />
          <span>Número indica capacidad máxima de estudiantes</span>
        </div>
      </div>
    </div>
  );
}