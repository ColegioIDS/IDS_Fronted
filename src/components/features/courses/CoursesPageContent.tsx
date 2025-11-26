// src/components/features/courses/CoursesPageContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, List, Plus, CheckCircle2, XCircle, Loader2, Upload } from 'lucide-react';
import { CourseStats } from './CourseStats';
import { CourseFilters } from './CourseFilters';
import { CoursesGrid } from './CoursesGrid';
import { CourseForm } from './CourseForm';
import { ImportCoursesDialog } from './ImportCoursesDialog';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { CourseFilters as CourseFiltersType } from '@/types/courses';
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/hooks/data/useCourses';
import { toast } from 'sonner';

export function CoursesPageContent() {
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [editingCourseId, setEditingCourseId] = useState<number | undefined>(undefined);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const { hasPermission } = useAuth();
  const canCreate = hasPermission('course', 'create');

  // Usar hook para obtener cursos con filtros dinámicos
  const { data, isLoading, error, query, updateQuery, refresh } = useCourses({
    page: 1,
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const courses = data?.data || [];
  const totalCourses = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;
  const currentPage = data?.meta?.page || 1;

  // Show error toast when courses fail to load
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar cursos', {
        description: error,
        icon: <XCircle className="w-5 h-5" />,
        duration: 5000,
      });
    }
  }, [error]);

  // Manejar cambios de filtros
  const handleFiltersChange = (newFilters: CourseFiltersType) => {
    updateQuery({
      ...newFilters,
      page: 1, // Resetear a la primera página al cambiar filtros
    });
  };

  // Resetear filtros
  const handleReset = () => {
    updateQuery({
      searchQuery: undefined,
      area: undefined,
      isActive: undefined,
      gradeId: undefined,
      page: 1,
    });
    toast.success('Filtros eliminados', {
      description: 'Mostrando todos los cursos disponibles',
      icon: <CheckCircle2 className="w-5 h-5" />,
    });
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    const refreshToast = toast.loading('Actualizando cursos...', {
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });

    try {
      await refresh();
      toast.success('Cursos actualizados', {
        id: refreshToast,
        description: `Se encontraron ${totalCourses} cursos en total`,
        icon: <CheckCircle2 className="w-5 h-5" />,
      });
    } catch (err) {
      toast.error('Error al actualizar', {
        id: refreshToast,
        description: 'No se pudieron actualizar los cursos',
        icon: <XCircle className="w-5 h-5" />,
      });
    }
  };

  const handleCreateNew = () => {
    setEditingCourseId(undefined);
    setActiveTab('form');
    toast.info('Nuevo curso', {
      description: 'Completa el formulario para crear un nuevo curso',
      icon: <Plus className="w-5 h-5" />,
    });
  };

  const handleDownloadTemplate = () => {
    // Crear link de descarga para la plantilla
    const link = document.createElement('a');
    link.href = '/templates/Cursos_Plantilla.xlsx';
    link.download = 'Cursos_Plantilla.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Plantilla descargada', {
      description: 'El archivo se ha descargado exitosamente',
      duration: 3000,
    });
  };

  const handleEdit = (courseId: number) => {
    setEditingCourseId(courseId);
    setActiveTab('form');
    toast.info('Editar curso', {
      description: 'Modifica los datos del curso',
      icon: <RefreshCw className="w-5 h-5" />,
    });
  };

  const handleFormSuccess = () => {
    refresh();
    setActiveTab('list');
    setEditingCourseId(undefined);
    toast.success('Curso guardado exitosamente', {
      description: editingCourseId
        ? 'Los cambios se han guardado correctamente'
        : 'El nuevo curso se ha creado correctamente',
      icon: <CheckCircle2 className="w-5 h-5" />,
      duration: 4000,
    });
  };

  const handleFormCancel = () => {
    setActiveTab('list');
    setEditingCourseId(undefined);
    toast.info('Operación cancelada', {
      description: 'No se guardaron los cambios',
      icon: <XCircle className="w-5 h-5" />,
    });
  };

  // Construir objeto de filtros actuales para el componente CourseFilters
  const currentFilters: CourseFiltersType = {
    searchQuery: query.searchQuery,
    area: query.area,
    isActive: query.isActive,
    gradeId: query.gradeId,
  };

  const hasActiveFilters = !!(query.searchQuery || query.area || query.isActive !== undefined);

  const activeCourses = courses.filter((c) => c.isActive).length;
  const inactiveCourses = courses.filter((c) => !c.isActive).length;

  return (
    <ProtectedPage module="course" action="read">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Cursos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los cursos y su información
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
            {canCreate && (
              <>
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20"
                  title="Descargar plantilla Excel para importación"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar Plantilla
                </Button>
                <Button
                  onClick={() => setImportDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Importar Excel
                </Button>
                <Button
                  onClick={handleCreateNew}
                  size="sm"
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Curso
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <CourseStats courses={courses} isLoading={isLoading} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
              Cursos
            </TabsTrigger>
            {activeTab === 'form' && (
              <TabsTrigger value="form" className="gap-2">
                {editingCourseId ? 'Editar Curso' : 'Nuevo Curso'}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Lista de cursos */}
          <TabsContent value="list" className="space-y-6 mt-6">
            {/* Filtros */}
            <CourseFilters
              filters={currentFilters}
              onFiltersChange={handleFiltersChange}
              onReset={handleReset}
              totalResults={totalCourses}
            />

            {/* Grid */}
            <CoursesGrid
              courses={courses}
              isLoading={isLoading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalCourses}
              onPageChange={handlePageChange}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleReset}
              onUpdate={refresh}
              onEdit={handleEdit}
            />
          </TabsContent>

          {/* Formulario */}
          {activeTab === 'form' && (
            <TabsContent value="form" className="mt-6">
              <CourseForm
                courseId={editingCourseId}
                initialData={editingCourseId ? courses.find(c => c.id === editingCourseId) : undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Import Dialog */}
        <ImportCoursesDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onSuccess={(count) => {
            refresh();
            toast.success(`${count} cursos importados exitosamente`);
          }}
        />
      </div>
    </ProtectedPage>
  );
}
