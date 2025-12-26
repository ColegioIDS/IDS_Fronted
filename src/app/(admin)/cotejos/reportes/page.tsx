'use client';

import { useState, useEffect } from 'react';
import { useCotejosStudentsFilters } from '@/hooks/data/useCotejosStudentsFilters';
import { useCycles, useGrades, useSectionsByGrade, useCourses } from '@/hooks/data';
import { CotejosStudentsFiltersQuery } from '@/types/cotejos.types';
import { CycleSummary } from '@/types/enrollments.types';
import { Grade } from '@/types/grades.types';
import { Section } from '@/types/sections.types';
import { Course } from '@/types/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ReportesPage() {
  // Estado para los filtros
  const [filters, setFilters] = useState<Partial<CotejosStudentsFiltersQuery>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks de datos
  const { cycles, loading: cyclesLoading } = useCycles();
  const { data: grades, isLoading: gradesLoading } = useGrades();
  const { data: sections, isLoading: sectionsLoading } = useSectionsByGrade(
    filters.gradeId ?? null
  );
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: studentsData, loading: studentsLoading, error: studentsError, fetch } =
    useCotejosStudentsFilters();

  // Filtrar cursos - extraer array del objeto paginado
  const filteredCourses = coursesData?.data || [];

  // Manejar el cambio de filtros
  const handleFilterChange = (key: keyof CotejosStudentsFiltersQuery, value: number) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };

      // Resetear valores dependientes
      if (key === 'cycleId') {
        delete updated.gradeId;
        delete updated.sectionId;
        delete updated.courseId;
      } else if (key === 'gradeId') {
        delete updated.sectionId;
        delete updated.courseId;
      } else if (key === 'sectionId') {
        delete updated.courseId;
      }

      return updated;
    });
  };

  // Obtener estudiantes
  const handleSearch = async () => {
    if (!filters.cycleId || !filters.gradeId || !filters.sectionId || !filters.courseId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(filters as CotejosStudentsFiltersQuery);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    filters.cycleId && filters.gradeId && filters.sectionId && filters.courseId;

  return (
    <div className="space-y-6 p-6">
      {/* Sección de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>Selecciona los parámetros para ver los estudiantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ciclo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ciclo</label>
              <Select
                value={filters.cycleId?.toString() || ''}
                onValueChange={(value) => handleFilterChange('cycleId', parseInt(value))}
                disabled={cyclesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ciclo..." />
                </SelectTrigger>
                <SelectContent>
                  {cycles?.map((cycle: CycleSummary) => (
                    <SelectItem key={cycle.id} value={cycle.id.toString()}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grado */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Grado</label>
              <Select
                value={filters.gradeId?.toString() || ''}
                onValueChange={(value) => handleFilterChange('gradeId', parseInt(value))}
                disabled={!filters.cycleId || gradesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grado..." />
                </SelectTrigger>
                <SelectContent>
                  {grades?.map((grade: Grade) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sección */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sección</label>
              <Select
                value={filters.sectionId?.toString() || ''}
                onValueChange={(value) => handleFilterChange('sectionId', parseInt(value))}
                disabled={!filters.gradeId || sectionsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sección..." />
                </SelectTrigger>
                <SelectContent>
                  {sections?.map((section: Section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Curso */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              <Select
                value={filters.courseId?.toString() || ''}
                onValueChange={(value) => handleFilterChange('courseId', parseInt(value))}
                disabled={!filters.gradeId || coursesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses?.map((course: Course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!isFormValid || studentsLoading || isSubmitting}
            className="mt-6"
          >
            {studentsLoading || isSubmitting ? 'Buscando...' : 'Buscar Estudiantes'}
          </Button>
        </CardContent>
      </Card>

      {/* Errores */}
      {studentsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{studentsError.message}</AlertDescription>
        </Alert>
      )}

      {/* Resultados */}
      {studentsData && (
        <Card>
          <CardHeader>
            <CardTitle>
              {studentsData.courseAssignment.course.name} - {studentsData.totalStudents} estudiantes
            </CardTitle>
            <CardDescription>
              Docente: {studentsData.courseAssignment.teacher.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">F. Nacimiento</th>
                    <th className="px-4 py-2 text-left">Género</th>
                    <th className="px-4 py-2 text-left">Ciclo</th>
                    <th className="px-4 py-2 text-left">Grado</th>
                    <th className="px-4 py-2 text-left">Sección</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Cotejo</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.students.map((enrollment) => (
                    <tr key={enrollment.enrollmentId} className="border-t">
                      <td className="px-4 py-2">
                        {enrollment.student.givenNames} {enrollment.student.lastNames}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(enrollment.student.birthDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{enrollment.student.gender}</td>
                      <td className="px-4 py-2">{enrollment.cycle.name}</td>
                      <td className="px-4 py-2">{enrollment.grade.name}</td>
                      <td className="px-4 py-2">{enrollment.section.name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            enrollment.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {enrollment.cotejo ? (
                          <span className="text-blue-600 font-medium">
                            {enrollment.cotejo.status}
                          </span>
                        ) : (
                          <span className="text-gray-400">Sin cotejo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
