// src/components/attendance/components/attendance-header/GradeSelector.tsx
"use client";

import { useEffect } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGradeContext } from '@/context/GradeContext';

interface GradeSelectorProps {
  selectedGradeId: number | null;
  onGradeChange: (gradeId: number | null) => void;
}

export default function GradeSelector({ 
  selectedGradeId, 
  onGradeChange 
}: GradeSelectorProps) {
  const {
    state: { grades, loading, error },
    fetchActiveGrades
  } = useGradeContext();

  // 🔄 Cargar grados activos al montar
  useEffect(() => {
    if (grades.length === 0 && !loading) {
      fetchActiveGrades();
    }
  }, [grades.length, loading, fetchActiveGrades]);

  // 🎯 Manejar cambio de selección
  const handleGradeChange = (value: string) => {
    if (value === "none") {
      onGradeChange(null);
    } else {
      const gradeId = parseInt(value, 10);
      onGradeChange(gradeId);
    }
  };

  // ⏳ Estado de carga
  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-gray-400">Cargando grados...</span>
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
            <GraduationCap className="h-4 w-4 text-red-500" />
            <span className="text-red-600 dark:text-red-400">Error al cargar grados</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  // 📭 Sin grados disponibles
  if (grades.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">No hay grados disponibles</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  // 🎯 Agrupar grados por nivel
  const gradesByLevel = grades.reduce((acc, grade) => {
    const level = grade.level || 'Sin Clasificar';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(grade);
    return acc;
  }, {} as Record<string, typeof grades>);

  // 📚 Ordenar niveles (Primaria antes que Secundaria)
  const sortedLevels = Object.keys(gradesByLevel).sort((a, b) => {
    const order = ['Primaria', 'Secundaria', 'Básico', 'Diversificado', 'Sin Clasificar'];
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Select
      value={selectedGradeId ? selectedGradeId.toString() : "none"}
      onValueChange={handleGradeChange}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <SelectValue placeholder="Seleccione un grado" />
        </div>
      </SelectTrigger>
      
      <SelectContent>
        {/* 🚫 Opción para deseleccionar */}
        <SelectItem value="none" className="text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4" /> {/* Espaciador */}
            <span>-- Seleccione un grado --</span>
          </div>
        </SelectItem>

        {/* 📚 Grados agrupados por nivel */}
        {sortedLevels.map((level) => (
          <div key={level}>
            {/* 🏷️ Header del grupo */}
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
              {level}
            </div>
            
            {/* 🎓 Grados del nivel */}
            {gradesByLevel[level]
              .sort((a, b) => a.order - b.order) // Ordenar por campo 'order'
              .map((grade) => (
                <SelectItem 
                  key={grade.id} 
                  value={grade.id.toString()}
                  className="pl-6"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{grade.name}</span>
                    {/* 📊 Indicador de orden */}
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      #{grade.order}
                    </span>
                  </div>
                </SelectItem>
              ))}
          </div>
        ))}

        {/* 📊 Footer con estadísticas */}
        <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          {grades.length} grado{grades.length !== 1 ? 's' : ''} disponible{grades.length !== 1 ? 's' : ''}
        </div>
      </SelectContent>
    </Select>
  );
}