'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Plus, Search, Grid, List, Filter } from 'lucide-react';
import { useCourseContext } from '@/context/CourseContext';
import { CoursesList } from '@/components/courses/CoursesList';
import { CourseForm } from '@/components/courses/CourseForm';
import {
  CourseFilters as FilterType,
  CourseArea
} from '@/types/courses';

export default function CoursesContent() {
  const { fetchCourses, isLoadingCourses } = useCourseContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Definir áreas disponibles (puedes mover esto a una constante global o hook)
  const courseAreas: CourseArea[] = [
    'Científica',
    'Humanística',
    'Sociales',
    'Tecnológica',
    'Artística',
    'Idiomas',
    'Educación Física'
  ];

  // Función para validar si un string es un CourseArea
  const isValidCourseArea = (value: string): value is CourseArea => {
    return courseAreas.includes(value as CourseArea);
  };

  // Buscar cursos con término y área actual
  const handleSearch = (value: string) => {
    setSearchTerm(value);

    const filters: FilterType = {
      searchQuery: value || undefined,
      area: isValidCourseArea(selectedArea) ? selectedArea : undefined,
      isActive: true
    };

    fetchCourses(filters);
  };

  // Cambiar área y filtrar
  const handleAreaChange = (value: string) => {
    setSelectedArea(value);

    const filters: FilterType = {
      searchQuery: searchTerm || undefined,
      area: isValidCourseArea(value) ? value : undefined,
      isActive: true
    };

    fetchCourses(filters);
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones principales */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle de vista */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Curso
          </Button>
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Área</label>
              <Select value={selectedArea} onValueChange={handleAreaChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                {courseAreas.map((area) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Puedes agregar más filtros aquí */}
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select defaultValue="active">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Lista/Grid de cursos */}
      <CoursesList 
        viewMode={viewMode}
        searchTerm={searchTerm}
        selectedArea={selectedArea}
      />

      {/* Modal/Dialog del formulario */}
      <CourseForm 
        open={showForm}
        onOpenChange={setShowForm}
      
      />
    </div>
  );
}