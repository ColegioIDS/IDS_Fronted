// src/components/features/sections/SectionPageContent.tsx
'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, List, Plus } from 'lucide-react';
import { useSections } from '@/hooks/data/useSections';
import { useSectionFormData } from '@/hooks/data/useSectionFormData';
import { usePermissions } from '@/hooks/usePermissions';
import { handleApiError } from '@/utils/handleApiError';
import { 
  Section, 
  SectionFilters as SectionFiltersType,
  CreateSectionDto,
  UpdateSectionDto,
} from '@/types/sections.types';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { ErrorAlert, ConfirmDialog } from '@/components/shared/feedback';
import { SectionStats } from './SectionStats';
import { SectionFilters } from './SectionFilters';
import { SectionsGrid } from './SectionsGrid';
import { SectionForm } from './SectionForm';
import { SectionsPagination } from './SectionsPagination';
import { SectionToast, ToastType } from './SectionToast';
import { SectionDetailView } from './SectionDetailView';
import { toast } from 'sonner';

interface ApiError {
  title: string;
  message: string;
  details?: string[];
}

interface ToastMessage {
  type: ToastType;
  title: string;
  message: string;
}

interface SectionPageContentProps {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function SectionPageContent({
  canView = false,
  canCreate = false,
  canEdit = false,
  canDelete = false,
}: SectionPageContentProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'detail'>('list');
  const [editingSection, setEditingSection] = useState<Section | undefined>(undefined);
  const [viewingSection, setViewingSection] = useState<Section | undefined>(undefined);
  const [globalError, setGlobalError] = useState<ApiError | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [filters, setFilters] = useState<SectionFiltersType>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data,
    meta,
    isLoading,
    error,
    query,
    updateQuery,
    setPage,
    refresh,
    createSection,
    updateSection,
    deleteSection,
  } = useSections({
    page: 1,
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc',
    ...filters,
  });

  // ✅ Cargar datos del formulario (grados y profesores) desde sections
  const {
    grades,
    teachers,
    isLoading: isLoadingFormData,
    error: formDataError,
  } = useSectionFormData();

  const handleFilterChange = useCallback((newFilters: SectionFiltersType) => {
    setFilters(newFilters);
    updateQuery({ ...newFilters, page: 1 });
  }, [updateQuery]);

  const handleReset = useCallback(() => {
    setFilters({});
    updateQuery({
      page: 1,
      limit: 12,
      search: undefined,
      gradeId: undefined,
      teacherId: undefined,
      hasTeacher: undefined,
      minCapacity: undefined,
      maxCapacity: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }, [updateQuery]);

  const handlePageChange = useCallback((page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setPage]);

  const handleCreateNew = useCallback(() => {
    setEditingSection(undefined);
    setActiveTab('form');
    setGlobalError(null);
  }, []);

  const handleEdit = useCallback((section: Section) => {
    setEditingSection(section);
    setActiveTab('form');
    setGlobalError(null);
  }, []);

  const handleView = useCallback((section: Section) => {
    setViewingSection(section);
    setActiveTab('detail');
    setGlobalError(null);
    setToastMessage(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    refresh();
    setActiveTab('list');
    setEditingSection(undefined);
    setGlobalError(null);
  }, [refresh]);

  const handleFormCancel = useCallback(() => {
    setActiveTab('list');
    setEditingSection(undefined);
    setGlobalError(null);
  }, []);

  const handleFormSubmit = useCallback(async (data: CreateSectionDto | UpdateSectionDto) => {
    try {
      setIsSaving(true);
      setGlobalError(null);
      setToastMessage(null);
      
      if (editingSection) {
        // Actualizar
        await updateSection(editingSection.id, data as UpdateSectionDto);
        toast.success(`La sección "${data.name}" ha sido actualizada correctamente`);
      } else {
        // Crear
        await createSection(data as CreateSectionDto);
        toast.success(`La sección "${data.name}" ha sido creada exitosamente`);
      }
      
      handleFormSuccess();
    } catch (err: any) {
      const handled = handleApiError(err, editingSection ? 'Error al actualizar sección' : 'Error al crear sección');
      if (handled && typeof handled === 'object') {
        setGlobalError({
          title: editingSection ? 'Error al actualizar sección' : 'Error al crear sección',
          message: handled.message || 'Ha ocurrido un error inesperado',
          details: handled.details || [],
        });
      }
      throw err; // Re-throw para que el formulario lo maneje
    } finally {
      setIsSaving(false);
    }
  }, [editingSection, createSection, updateSection, handleFormSuccess]);

  const handleOpenDelete = useCallback((section: Section) => {
    if (!canDelete) return;
    setSectionToDelete(section);
    setDeleteDialogOpen(true);
  }, [canDelete]);

  const handleDelete = useCallback(async () => {
    if (!canDelete || !sectionToDelete) return;

    try {
      setIsDeleting(true);
      setGlobalError(null);
      setToastMessage(null);
      await deleteSection(sectionToDelete.id);
      toast.success(`La sección "${sectionToDelete.name}" ha sido eliminada correctamente`);
      setDeleteDialogOpen(false);
      setSectionToDelete(null);
      refresh();
    } catch (err: any) {
      const handled = handleApiError(err, 'Error al eliminar sección');
      if (handled && typeof handled === 'object') {
        toast.error(handled.message || 'No se pudo eliminar la sección');
      }
    } finally {
      setIsDeleting(false);
    }
  }, [canDelete, sectionToDelete, deleteSection, refresh]);

  // Calcular stats
  const sections = data || [];

  // Si hay error de carga, mostrarlo
  if (error && !isLoading) {
    return (
      <ProtectedPage module="section" action="read">
        <div className="space-y-6 p-6">
          <ErrorAlert
            title="Error al cargar secciones"
            message={error}
          />
          <Button onClick={refresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage module="section" action="read">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Secciones
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra las secciones y aulas del sistema
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            {canCreate && activeTab === 'list' && (
              <Button
                onClick={handleCreateNew}
                className="gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white dark:bg-fuchsia-500 dark:hover:bg-fuchsia-600 font-semibold shadow-md hover:shadow-lg border-2 border-fuchsia-700 dark:border-fuchsia-600"
              >
                <Plus className="w-4 h-4" />
                Nueva Sección
              </Button>
            )}
          </div>
        </div>

        {/* Global Error */}
        {globalError && (
          <ErrorAlert
            title={globalError.title}
            message={globalError.message}
            details={globalError.details}
          />
        )}

        {/* Toast de éxito */}
        {toastMessage && (
          <SectionToast
            type={toastMessage.type}
            title={toastMessage.title}
            message={toastMessage.message}
          />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'form' | 'detail')}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="list"
              className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <List className="w-4 h-4" />
              Listado
            </TabsTrigger>
            <TabsTrigger 
              value="form"
              className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              disabled={!canCreate && !editingSection}
            >
              <Plus className="w-4 h-4" />
              {editingSection ? 'Editar' : 'Crear'}
            </TabsTrigger>
            <TabsTrigger 
              value="detail"
              className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              disabled={!viewingSection}
            >
              <List className="w-4 h-4" />
              Detalles
            </TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-6 mt-6">
            {/* Stats */}
            <SectionStats sections={sections} />

            {/* Filters */}
            <SectionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              grades={grades || []}
              teachers={teachers || []}
            />

            {/* Grid */}
            <SectionsGrid
              sections={sections}
              isLoading={isLoading}
              onView={canView ? handleView : undefined}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canDelete ? handleOpenDelete : undefined}
              canView={canView}
              canEdit={canEdit}
              canDelete={canDelete}
            />

            {/* Paginación */}
            {!isLoading && sections.length > 0 && (
              <SectionsPagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
          </TabsContent>

          {/* Form Tab */}
          <TabsContent value="form" className="mt-6">
            <div className="max-w-4xl mx-auto">
              <SectionForm
                defaultValues={editingSection}
                mode={editingSection ? 'edit' : 'create'}
                grades={grades || []}
                teachers={teachers || []}
                currentEnrollments={editingSection?._count?.enrollments || 0}
                isLoading={isSaving}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </TabsContent>

          {/* Detail Tab */}
          <TabsContent value="detail" className="mt-6">
            {viewingSection && (
              <SectionDetailView
                section={viewingSection}
                onEdit={() => {
                  setEditingSection(viewingSection);
                  setActiveTab('form');
                }}
                onClose={() => {
                  setViewingSection(undefined);
                  setActiveTab('list');
                }}
                canEdit={canEdit}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar sección"
          description={sectionToDelete ? `¿Estás seguro de que deseas eliminar la sección "${sectionToDelete.name}"? Esta acción no se puede deshacer.` : undefined}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          isLoading={isDeleting}
          onConfirm={handleDelete}
        />
      </div>
    </ProtectedPage>
  );
}
