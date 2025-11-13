'use client';

import { GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGradesAndSections } from '@/hooks/attendance-hooks';

interface GradeSelectorProps {
  selectedGradeId: number | null;
  onGradeChange: (gradeId: number | null) => void;
}

export default function GradeSelector({
  selectedGradeId,
  onGradeChange
}: GradeSelectorProps) {
  const { grades, loading, error } = useGradesAndSections();

  const handleGradeChange = (value: string) => {
    if (value === "none") {
      onGradeChange(null);
    } else {
      const gradeId = parseInt(value, 10);
      onGradeChange(gradeId);
    }
  };

  // Agrupar grados por nivel desde datos reales
  const gradesByLevel = (grades || []).reduce((acc, grade) => {
    const level = grade.level || 'Sin Clasificar';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(grade);
    return acc;
  }, {} as Record<string, typeof grades>);

  // Ordenar niveles
  const sortedLevels = Object.keys(gradesByLevel).sort((a, b) => {
    const order = ['PRIMARIA', 'SECUNDARIA', 'BÁSICO', 'DIVERSIFICADO', 'Sin Clasificar'];
    const indexA = order.indexOf(a.toUpperCase());
    const indexB = order.indexOf(b.toUpperCase());

    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Mostrar error si existe
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Select
      value={selectedGradeId ? selectedGradeId.toString() : "none"}
      onValueChange={handleGradeChange}
      disabled={loading}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center space-x-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          ) : (
            <GraduationCap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
          <SelectValue placeholder="Seleccione un grado" />
        </div>
      </SelectTrigger>

      <SelectContent>
        {/* Opción para deseleccionar */}
        <SelectItem value="none" className="text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4" /> {/* Espaciador */}
            <span>-- Seleccione un grado --</span>
          </div>
        </SelectItem>

        {/* Grados agrupados por nivel desde API */}
        {(!grades || grades.length === 0) && !loading ? (
          <div className="px-2 py-2 text-sm text-gray-500">
            No hay grados disponibles
          </div>
        ) : (
          sortedLevels.map((level) => (
            <div key={level}>
              {/* Header del grupo */}
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                {level}
              </div>

              {/* Grados del nivel */}
              {gradesByLevel[level]
                .sort((a, b) => (a.abbreviation || '').localeCompare(b.abbreviation || ''))
                .map((grade) => (
                  <SelectItem
                    key={grade.id}
                    value={grade.id.toString()}
                    className="pl-6"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{grade.name}</span>
                      {grade.abbreviation && (
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded ml-2">
                          {grade.abbreviation}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
            </div>
          ))
        )}

        {/* Footer con estadísticas */}
        <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          {loading ? (
            <span className="flex items-center space-x-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Cargando...</span>
            </span>
          ) : (
            <span>
              {(grades || []).length} grado{(grades || []).length !== 1 ? 's' : ''} disponible{(grades || []).length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}
