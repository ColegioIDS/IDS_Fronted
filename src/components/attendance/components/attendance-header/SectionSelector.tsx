// src/components/attendance/components/attendance-header/SectionSelector.tsx
"use client";

import { useEffect } from 'react';
import { BookOpen, Loader2, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSectionContext } from '@/context/SectionsContext';

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
  const {
    state: { sections, loading, error },
    fetchSectionsByGrade
  } = useSectionContext();

  // 🔄 Cargar secciones cuando cambia el grado
  useEffect(() => {
    if (selectedGradeId) {
      fetchSectionsByGrade(selectedGradeId);
    }
  }, [selectedGradeId, fetchSectionsByGrade]);

  // 🔄 Limpiar selección cuando cambia el grado
  useEffect(() => {
    if (selectedSectionId && selectedGradeId) {
      // Verificar si la sección seleccionada pertenece al grado actual
      const isValidSelection = sections.some(section => 
        section.id === selectedSectionId && section.gradeId === selectedGradeId
      );
      
      if (!isValidSelection) {
        onSectionChange(null);
      }
    }
  }, [selectedGradeId, sections, selectedSectionId, onSectionChange]);

  // 🎯 Manejar cambio de selección
  const handleSectionChange = (value: string) => {
    if (value === "none") {
      onSectionChange(null);
    } else {
      const sectionId = parseInt(value, 10);
      onSectionChange(sectionId);
    }
  };

  // 📝 Sin grado seleccionado
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

  // ⏳ Estado de carga
  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-gray-400">Cargando secciones...</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  // ❌ Estado de error
  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-red-500" />
            <span className="text-red-600 dark:text-red-400">Error al cargar secciones</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  // 🔍 Filtrar secciones del grado seleccionado
  const filteredSections = sections.filter(section => section.gradeId === selectedGradeId);

  // 📭 Sin secciones disponibles
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

  // 📚 Ordenar secciones alfabéticamente
  const sortedSections = filteredSections.sort((a, b) => a.name.localeCompare(b.name));

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
        {/* 🚫 Opción para deseleccionar */}
        <SelectItem value="none" className="text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4" /> {/* Espaciador */}
            <span>-- Seleccione una sección --</span>
          </div>
        </SelectItem>

        {/* 📝 Lista de secciones */}
        {sortedSections.map((section) => (
          <SelectItem 
            key={section.id} 
            value={section.id.toString()}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                {/* 📝 Nombre de la sección */}
                <span className="font-medium">
                  Sección {section.name}
                </span>
                
                {/* 👨‍🏫 Profesor a cargo (si existe) */}
                {section.teacher && (
                  <Badge variant="secondary" className="text-xs">
                    {section.teacher.givenNames.split(' ')[0]} {section.teacher.lastNames.split(' ')[0]}
                  </Badge>
                )}
              </div>

              {/* 📊 Información adicional */}
              <div className="flex items-center space-x-2">
                {/* 👥 Capacidad */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{section.capacity}</span>
                </div>

                {/* 🏠 Indicador de profesor titular */}
                {section.teacher?.teacherDetails?.isHomeroomTeacher && (
                  <Badge variant="outline" className="text-xs">
                    Titular
                  </Badge>
                )}
              </div>
            </div>
          </SelectItem>
        ))}

        {/* 📊 Footer con estadísticas */}
        <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span>
              {sortedSections.length} sección{sortedSections.length !== 1 ? 'es' : ''} disponible{sortedSections.length !== 1 ? 's' : ''}
            </span>
            <span>
              Capacidad total: {sortedSections.reduce((total, section) => total + section.capacity, 0)} estudiantes
            </span>
          </div>
        </div>
      </SelectContent>
    </Select>
  );
}