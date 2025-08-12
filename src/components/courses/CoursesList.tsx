'use client';

import { useCourseContext } from '@/context/CourseContext';
import { CourseCard } from './CourseCard';
import { CourseTableRow } from './CourseTableRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface CoursesListProps {
  viewMode: 'grid' | 'list';
  searchTerm: string;
  selectedArea: string;
}

export function CoursesList({ viewMode, searchTerm, selectedArea }: CoursesListProps) {
  const { courses, isLoadingCourses, coursesError } = useCourseContext();

  // Filtrado local (complementario al del servidor)
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = selectedArea === 'all' || course.area === selectedArea;
    
    return matchesSearch && matchesArea;
  });

  if (isLoadingCourses) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Cargando cursos...</span>
      </div>
    );
  }

  if (coursesError) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-2">Error al cargar los cursos</div>
        <div className="text-gray-500 text-sm">{coursesError}</div>
      </Card>
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 mb-2">No se encontraron cursos</div>
        <div className="text-gray-400 text-sm">
          {searchTerm || selectedArea !== 'all' 
            ? 'Intenta ajustar los filtros de búsqueda'
            : 'Crea tu primer curso para comenzar'
          }
        </div>
      </Card>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Curso</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Grados</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.map((course) => (
            <CourseTableRow key={course.id} course={course} />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}