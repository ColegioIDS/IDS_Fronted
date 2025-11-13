'use client';

import { useEffect, useMemo } from 'react';
import { BookOpen, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGradesAndSections } from '@/hooks/attendance-hooks';

interface SectionSelectorProps {
  selectedGradeId: number | null;
  selectedSectionId: number | null;
  onSectionChange: (sectionId: number | null) => void;
}

export default function SectionSelector({
  selectedGradeId,
  selectedSectionId,
  onSectionChange
}: SectionSelectorProps) {
  const { sections, loading, error, fetchSectionsByGrade } = useGradesAndSections();

  // Cargar secciones cuando cambia el grado
  useEffect(() => {
    if (selectedGradeId) {
      fetchSectionsByGrade(selectedGradeId);
    }
  }, [selectedGradeId, fetchSectionsByGrade]);

  // Filtrar secciones por grado seleccionado
  const filteredSections = useMemo(() => {
    if (!selectedGradeId) return [];
    return sections.filter(section => section.gradeId === selectedGradeId);
  }, [sections, selectedGradeId]);

  // Limpiar selección cuando cambia el grado
  useEffect(() => {
    if (selectedGradeId && selectedSectionId) {
      const isValidSelection = filteredSections.some(section => section.id === selectedSectionId);
      if (!isValidSelection) {
        onSectionChange(null);
      }
    }
  }, [selectedGradeId, selectedSectionId, onSectionChange, filteredSections]);

  const handleSectionChange = (value: string) => {
    if (value === "none") {
      onSectionChange(null);
    } else {
      const sectionId = parseInt(value, 10);
      onSectionChange(sectionId);
    }
  };

  // Mostrar error si existe
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Sin grado seleccionado
  if (!selectedGradeId) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Seleccione primero un grado</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  // Cargando secciones
  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
            <span className="text-gray-500">Cargando secciones...</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  // Sin secciones disponibles
  if (filteredSections.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">No hay secciones disponibles</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  // Ordenar secciones alfabéticamente
  const sortedSections = [...filteredSections].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Select
      value={selectedSectionId ? selectedSectionId.toString() : "none"}
      onValueChange={handleSectionChange}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <SelectValue placeholder="Seleccione una sección" />
        </div>
      </SelectTrigger>

      <SelectContent>
        {/* Opción para deseleccionar */}
        <SelectItem value="none" className="text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4" /> {/* Espaciador */}
            <span>-- Seleccione una sección --</span>
          </div>
        </SelectItem>

        {/* Lista de secciones desde API */}
        {sortedSections.map((section) => (
          <SelectItem key={section.id} value={section.id.toString()} className="pl-6">
            <div className="flex items-center justify-between space-x-4">
              <span className="font-medium">{section.name}</span>
              {section.capacity && (
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded ml-2">
                  <Users className="h-3 w-3 inline mr-1" />
                  {section.capacity}
                </span>
              )}
            </div>
          </SelectItem>
        ))}

        {/* Footer con estadísticas */}
        <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          {filteredSections.length} sección{filteredSections.length !== 1 ? 'es' : ''} disponible{filteredSections.length !== 1 ? 's' : ''}
        </div>
      </SelectContent>
    </Select>
  );
}
