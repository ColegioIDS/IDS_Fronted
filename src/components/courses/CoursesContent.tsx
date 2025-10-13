//src\components\courses\CoursesContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Plus, Search, Grid, List, Filter, RefreshCw } from 'lucide-react';
import { useCourseList, useCourseForm } from '@/context/CourseContext';
import { CoursesList } from '@/components/courses/CoursesList';
import { CourseForm } from '@/components/courses/CourseForm';
import {
  CourseFilters as FilterType,
  CourseArea
} from '@/types/courses';
import ProtectedContent from '@/components/common/ProtectedContent';
import { useAuth } from '@/context/AuthContext';



export default function CoursesContent() {
  // Hooks del Context
  const {
    courses,
    loading,
    error,
    filters,
    handleFilterChange,
    refetch
  } = useCourseList();

  const {
    startCreate,
    formMode,
    cancelForm
  } = useCourseForm();

  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState(filters.searchQuery || '');
  const [selectedArea, setSelectedArea] = useState<string>(filters.area || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);


  const { hasPermission } = useAuth();
  const canCreate = hasPermission('course', 'create');

  // Definir áreas disponibles
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

  // Función auxiliar para construir filtros
  const buildFilters = (
    search: string = searchTerm,
    area: string = selectedArea,
    status: string = selectedStatus
  ): FilterType => {
    const filters: FilterType = {};

    if (search && search.trim()) {
      filters.searchQuery = search.trim();
    }

    if (area !== 'all' && isValidCourseArea(area)) {
      filters.area = area;
    }

    if (status !== 'all') {
      filters.isActive = status === 'active';
    }

    return filters;
  };

  // Buscar cursos con término
  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    const newFilters = buildFilters(value, selectedArea, selectedStatus);
    await handleFilterChange(newFilters);
  };

  // Cambiar área y filtrar
  const handleAreaChange = async (value: string) => {
    setSelectedArea(value);
    const newFilters = buildFilters(searchTerm, value, selectedStatus);
    await handleFilterChange(newFilters);
  };

  // Cambiar estado y filtrar
  const handleStatusChange = async (value: string) => {
    setSelectedStatus(value);
    const newFilters = buildFilters(searchTerm, selectedArea, value);
    await handleFilterChange(newFilters);
  };

  // Refrescar datos
  const handleRefresh = async () => {
    await refetch();
  };

  // Inicializar filtros al cargar el componente
  useEffect(() => {
    // Solo aplicar filtros iniciales si no hay cursos cargados
    if (courses.length === 0 && !loading) {
      const initialFilters = buildFilters();
      handleFilterChange(initialFilters);
    }
  }, []);

  // Manejar apertura del formulario
  const handleCreateCourse = () => {
    startCreate();
  };

  // Manejar cierre del formulario
  const handleCloseForm = () => {
    cancelForm();
  };

  return (
    <ProtectedContent requiredPermission={{ module: 'course', action: 'read' }}>




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
                disabled={loading}
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


            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
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
            {canCreate && (
              <Button
                onClick={handleCreateCourse}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Curso
              </Button>
            )}
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Área</label>
                <Select
                  value={selectedArea}
                  onValueChange={handleAreaChange}
                  disabled={loading}
                >
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

              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select
                  value={selectedStatus}
                  onValueChange={handleStatusChange}
                  disabled={loading}
                >
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

              {/* Indicador de resultados */}
              <div className="sm:col-span-2 flex items-end">
                <div className="text-sm text-gray-600">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Cargando...
                    </span>
                  ) : (
                    <span>
                      {courses.length} curso{courses.length !== 1 ? 's' : ''} encontrado{courses.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar error si existe */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="text-red-800 text-sm font-medium">Error:</div>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Lista/Grid de cursos */}
        <CoursesList
          viewMode={viewMode}
          loading={loading}
          courses={courses}
          error={error}
        />

        {/* Modal/Dialog del formulario */}
        <CourseForm
          open={formMode === 'create' || formMode === 'edit'}
          onOpenChange={(open) => !open && handleCloseForm()}
          mode={formMode || 'create'}
        />
      </div>

    </ProtectedContent>
  );
}