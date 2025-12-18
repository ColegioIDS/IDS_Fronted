"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, GraduationCap, Info, CheckCircle2, XCircle, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GradeStats } from "./GradeStats";
import { GradeFilters } from "./GradeFilters";
import { GradesGrid } from "./GradesGrid";
import { GradeFormDialog } from "./GradeFormDialog";
import { GradeDetailDialog } from "./GradeDetailDialog";
import { DeleteGradeDialog } from "./DeleteGradeDialog";
import { GradeStatsDialog } from "./GradeStatsDialog";
import { useGrades } from "@/hooks/data/useGrades";
import { gradesService } from "@/services/grades.service";
import { handleApiError, handleApiSuccess } from "@/utils/handleApiError";
import { parseApiError } from "@/utils/handleApiError";
import type {
  Grade,
  CreateGradeDto,
  UpdateGradeDto,
  GradeFilters as GradeFiltersType,
} from "@/types/grades.types";

interface GradesPageContentProps {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function GradesPageContent({
  canView = false,
  canCreate = false,
  canEdit = false,
  canDelete = false,
}: GradesPageContentProps) {
  // State for filters
  const [filters, setFilters] = useState<GradeFiltersType>({
    search: undefined,
    level: undefined,
    isActive: undefined,
  });

  // Fetch grades data with hook
  const { data, meta, isLoading, error, query, updateQuery, setPage, refresh } = useGrades({
    page: 1,
    limit: 12,
    sortBy: "order",
    sortOrder: "asc",
  });

  // Update query when filters change - FIX: Clear filters properly
  useEffect(() => {
    const queryFilters: any = {
      page: 1,
      search: undefined,
      level: undefined,
      isActive: undefined,
    };

    if (filters.search) queryFilters.search = filters.search;
    if (filters.level) queryFilters.level = filters.level;
    if (filters.isActive !== undefined) {
      queryFilters.isActive = filters.isActive;
    }

    updateQuery(queryFilters);
  }, [filters, updateQuery]);

  // Dialog states
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    grade?: Grade;
  }>({
    open: false,
    mode: "create",
  });

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    grade?: Grade;
  }>({
    open: false,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    grade?: Grade;
  }>({
    open: false,
  });

  const [statsDialog, setStatsDialog] = useState<{
    open: boolean;
    grade?: Grade;
  }>({
    open: false,
  });

  // Calculate suggested order for new grades
  const getSuggestedOrder = (): number => {
    if (!data || data.length === 0) return 1;
    const maxOrder = Math.max(...data.map((g: Grade) => g.order));
    return maxOrder + 1;
  };

  // CRUD Handlers with enhanced toast messages
  const handleFormSubmit = async (dto: CreateGradeDto) => {
    try {
      if (formDialog.mode === "create") {
        await gradesService.create(dto);
        handleApiSuccess("Grado creado exitosamente", [`${dto.name} ha sido agregado al sistema`]);
      } else if (formDialog.grade) {
        await gradesService.update(formDialog.grade.id, dto);
        handleApiSuccess("Grado actualizado exitosamente", [`Los cambios en ${dto.name} se guardaron correctamente`]);
      }
      setFormDialog({ open: false, mode: "create" });
      refresh();
    } catch (error: any) {
      handleApiError(
        error,
        formDialog.mode === "create"
          ? "Error al crear el grado"
          : "Error al actualizar el grado"
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.grade) return;

    try {
      await gradesService.delete(deleteDialog.grade.id);
      handleApiSuccess("Grado eliminado exitosamente", [`${deleteDialog.grade.name} fue eliminado del sistema`]);
      setDeleteDialog({ open: false });
      refresh();
    } catch (error: any) {
      handleApiError(error, "Error al eliminar el grado");
    }
  };

  const handleDeactivate = async () => {
    if (!deleteDialog.grade) return;

    try {
      await gradesService.deactivate(deleteDialog.grade.id);
      handleApiSuccess("Grado desactivado exitosamente", [`${deleteDialog.grade.name} ya no estará disponible`]);
      setDeleteDialog({ open: false });
      refresh();
    } catch (error: any) {
      handleApiError(error, "Error al desactivar el grado");
    }
  };

  // Action handlers from cards
  const handleView = (grade: Grade) => {
    setDetailDialog({ open: true, grade });
  };

  const handleEdit = (grade: Grade) => {
    setFormDialog({ open: true, mode: "edit", grade });
  };

  const handleDeleteClick = (grade: Grade) => {
    setDeleteDialog({ open: true, grade });
  };

  const handleStatsClick = (grade: Grade) => {
    setStatsDialog({ open: true, grade });
  };

  // Filter handlers
  const handleFiltersChange = (newFilters: GradeFiltersType) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({
      search: undefined,
      level: undefined,
      isActive: undefined,
    });
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (meta && query.page && query.page > 1) {
      setPage(query.page - 1);
    }
  };

  const handleNextPage = () => {
    if (meta && query.page && query.page < meta.totalPages) {
      setPage(query.page + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!meta) return [];
    const { page, totalPages } = meta;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      // Show pages around current page
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-8">
      {/* Header - FIXED: Botón visible en light mode */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-950 border-2 border-indigo-300 dark:border-indigo-700">
              <GraduationCap className="w-7 h-7 text-indigo-700 dark:text-indigo-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Grados Académicos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                Gestiona los niveles educativos del sistema
              </p>
            </div>
          </div>
          {canCreate && (
            <Button
              onClick={() => setFormDialog({ open: true, mode: "create" })}
              className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 font-semibold shadow-md hover:shadow-lg border-2 border-indigo-700 dark:border-indigo-600"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Grado
            </Button>
          )}
        </div>
      </div>

      {/* Instructions Accordion */}
      <Accordion type="single" collapsible className="bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
        <AccordionItem value="instructions" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  Guía de Uso - Grados Académicos
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                  Instrucciones y mejores prácticas
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Crear Grado */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mt-0.5">
                    <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                      Crear un Nuevo Grado
                    </h4>
                    <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                      <li>• Haz clic en "Nuevo Grado"</li>
                      <li>• Selecciona el nivel educativo</li>
                      <li>• Asigna un nombre descriptivo</li>
                      <li>• Define el orden de visualización</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Editar Grado */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mt-0.5">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                      Editar Grado Existente
                    </h4>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                      <li>• Usa el botón "Editar" en la tarjeta</li>
                      <li>• Modifica solo los campos necesarios</li>
                      <li>• El orden afecta cómo se muestra</li>
                      <li>• Puedes activar/desactivar grados</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                      Usar Filtros
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Busca por nombre del grado</li>
                      <li>• Filtra por nivel educativo</li>
                      <li>• Filtra por estado (activo/inactivo)</li>
                      <li>• Usa "Limpiar Filtros" para resetear</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Eliminar */}
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mt-0.5">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900 dark:text-red-100 mb-1">
                      Eliminar o Desactivar
                    </h4>
                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                      <li>• Verifica dependencias antes de eliminar</li>
                      <li>• Usa "Stats" para ver relaciones</li>
                      <li>• Considera desactivar en vez de eliminar</li>
                      <li>• Eliminación es permanente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Statistics */}
      <GradeStats grades={data || []} />

      {/* Filters */}
      <GradeFilters
        filters={filters}
        onFilterChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {/* Grades Grid */}
      <GradesGrid
        grades={data || []}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onViewStats={handleStatsClick}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {/* Enhanced Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info section */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                  Página {meta.page} de {meta.totalPages}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-gray-100">{meta.total}</span> grados en total
              </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              {/* First page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={meta.page === 1}
                className="hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/30"
              >
                <span className="sr-only">Primera página</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </Button>

              {/* Previous page */}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={meta.page === 1}
                className="hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/30"
              >
                Anterior
              </Button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-3 py-1 text-gray-500">
                      ⋯
                    </span>
                  ) : (
                    <Button
                      key={pageNum}
                      variant={pageNum === meta.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum as number)}
                      className={`min-w-[40px] ${
                        pageNum === meta.page
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-bold shadow-lg border-2 border-indigo-700 dark:border-indigo-600'
                          : 'hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/30'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )
                ))}
              </div>

              {/* Next page */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={meta.page >= meta.totalPages}
                className="hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/30"
              >
                Siguiente
              </Button>

              {/* Last page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(meta.totalPages)}
                disabled={meta.page === meta.totalPages}
                className="hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/30"
              >
                <span className="sr-only">Última página</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <GradeFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        grade={formDialog.grade || null}
        suggestedOrder={getSuggestedOrder()}
        onOpenChange={(open) => {
          if (!open) setFormDialog({ open: false, mode: "create" });
        }}
        onSubmit={handleFormSubmit}
      />

      <GradeDetailDialog
        open={detailDialog.open}
        grade={detailDialog.grade || null}
        onOpenChange={(open) => {
          if (!open) setDetailDialog({ open: false });
        }}
      />

      <DeleteGradeDialog
        open={deleteDialog.open}
        grade={deleteDialog.grade || null}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog({ open: false });
        }}
        onConfirm={handleDelete}
        onDeactivate={handleDeactivate}
      />

      <GradeStatsDialog
        open={statsDialog.open}
        grade={statsDialog.grade || null}
        onOpenChange={(open) => {
          if (!open) setStatsDialog({ open: false });
        }}
      />
    </div>
  );
}
