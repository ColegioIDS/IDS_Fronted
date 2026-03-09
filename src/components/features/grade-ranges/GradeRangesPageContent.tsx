"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, BarChart3, Info, CheckCircle2, XCircle, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GradeRangesGrid } from "./GradeRangesGrid";
import { GradeRangeFilters } from "./GradeRangeFilters";
import { GradeRangeFormDialog } from "./GradeRangeFormDialog";
import { GradeRangeDetailDialog } from "./GradeRangeDetailDialog";
import { DeleteGradeRangeDialog } from "./DeleteGradeRangeDialog";
import { useGradeRanges } from "@/hooks/data/useGradeRanges";
import { gradeRangesService } from "@/services/grade-ranges.service";
import { handleApiError, handleApiSuccess } from "@/utils/handleApiError";
import type {
  GradeRange,
  CreateGradeRangeDto,
  UpdateGradeRangeDto,
  GradeRangeFilters as GradeRangeFiltersType,
} from "@/types/grade-ranges.types";

interface GradeRangesPageContentProps {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function GradeRangesPageContent({
  canView = false,
  canCreate = false,
  canEdit = false,
  canDelete = false,
}: GradeRangesPageContentProps) {
  // State for filters
  const [filters, setFilters] = useState<GradeRangeFiltersType>({
    search: undefined,
    level: undefined,
    isActive: undefined,
  });

  // Fetch grade ranges data with hook
  const { data, meta, isLoading, error, query, updateQuery, setPage, refresh } = useGradeRanges({
    page: 1,
    limit: 12,
    sortBy: "minScore",
    sortOrder: "asc",
  });

  // Update query when filters change
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
    gradeRange?: GradeRange;
  }>({
    open: false,
    mode: "create",
  });

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    gradeRange?: GradeRange;
  }>({
    open: false,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    gradeRange?: GradeRange;
  }>({
    open: false,
  });

  // CRUD Handlers
  const handleFormSubmit = async (dto: CreateGradeRangeDto) => {
    try {
      if (formDialog.mode === "create") {
        await gradeRangesService.create(dto);
        handleApiSuccess("Rango creado exitosamente", [`${dto.name} ha sido agregado al sistema`]);
      } else if (formDialog.gradeRange) {
        await gradeRangesService.update(formDialog.gradeRange.id, dto);
        handleApiSuccess("Rango actualizado exitosamente", [`Los cambios en ${dto.name} se guardaron correctamente`]);
      }
      setFormDialog({ open: false, mode: "create" });
      refresh();
    } catch (error: any) {
      handleApiError(
        error,
        formDialog.mode === "create"
          ? "Error al crear el rango"
          : "Error al actualizar el rango"
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.gradeRange) return;

    try {
      await gradeRangesService.delete(deleteDialog.gradeRange.id);
      handleApiSuccess("Rango eliminado exitosamente", [`${deleteDialog.gradeRange.name} fue eliminado del sistema`]);
      setDeleteDialog({ open: false });
      refresh();
    } catch (error: any) {
      handleApiError(error, "Error al eliminar el rango");
    }
  };

  // Action handlers from cards
  const handleView = (gradeRange: GradeRange) => {
    setDetailDialog({ open: true, gradeRange });
  };

  const handleEdit = (gradeRange: GradeRange) => {
    setFormDialog({ open: true, mode: "edit", gradeRange });
  };

  const handleDeleteClick = (gradeRange: GradeRange) => {
    setDeleteDialog({ open: true, gradeRange });
  };

  // Filter handlers
  const handleFiltersChange = (newFilters: GradeRangeFiltersType) => {
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

  const getPageNumbers = () => {
    if (!meta) return [];
    const { page, totalPages } = meta;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-teal-100 dark:bg-teal-950 border-2 border-teal-300 dark:border-teal-700">
              <BarChart3 className="w-7 h-7 text-teal-700 dark:text-teal-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Rangos de Calificaciones
              </h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">
                Configura los rangos de puntuaciones para cada nivel educativo
              </p>
            </div>
          </div>
          {canCreate && (
            <Button
              onClick={() => setFormDialog({ open: true, mode: "create" })}
              className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700 font-semibold shadow-md hover:shadow-lg border-2 border-teal-700 dark:border-teal-600"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Rango
            </Button>
          )}
        </div>
      </div>

      {/* Instructions Accordion */}
      <Accordion type="single" collapsible className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
        <AccordionItem value="instructions" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  Guía de Uso - Rangos de Calificaciones
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                  Instrucciones y mejores prácticas
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Crear Rango */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mt-0.5">
                    <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                      Crear un Nuevo Rango
                    </h4>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">
                      Haz clic en "Nuevo Rango" para definir un nuevo rango de calificaciones. Especifica el nombre, rango de puntuaciones (minScore y maxScore) y el color para visualizar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Editar Rango */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                      Editar Rango Existente
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Selecciona un rango de la lista y haz clic en "Editar" para modificar sus parámetros. Puedes cambiar el nombre, puntuaciones y color.
                    </p>
                  </div>
                </div>
              </div>

              {/* Niveles */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-0.5">
                    <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-1">
                      Niveles Educativos
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Los rangos pueden ser específicos por nivel (Primaria, Secundaria, Preparatoria) o aplicables a todos (all). Solo Preparatoria usa letras de calificación.
                    </p>
                  </div>
                </div>
              </div>

              {/* Validaciones */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mt-0.5">
                    <XCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-1">
                      Validaciones Importantes
                    </h4>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      minScore debe ser ≤ maxScore. Los nombres deben ser únicos. letterGrade solo se usa en Preparatoria.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Filters Section */}
      <GradeRangeFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onFiltersReset={handleFiltersReset}
      />

      {/* Grid/List of Grade Ranges */}
      <GradeRangesGrid
        data={data}
        isLoading={isLoading}
        error={error}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Pagination */}
      {!isLoading && meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Mostrando página <span className="font-bold">{query.page}</span> de{" "}
            <span className="font-bold">{meta.totalPages}</span> ({meta.total} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!meta || query.page === 1}
            >
              Anterior
            </Button>
            {getPageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === query.page ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (typeof page === "number") setPage(page);
                }}
                disabled={page === "..."}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!meta || query.page === meta.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <GradeRangeFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        gradeRange={formDialog.gradeRange}
        onOpenChange={(open: boolean) => {
          if (!open) setFormDialog({ open: false, mode: "create" });
        }}
        onSubmit={handleFormSubmit}
      />

      <GradeRangeDetailDialog
        open={detailDialog.open}
        gradeRange={detailDialog.gradeRange}
        canEdit={canEdit}
        canDelete={canDelete}
        onOpenChange={(open: boolean) => {
          if (!open) setDetailDialog({ open: false });
        }}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <DeleteGradeRangeDialog
        open={deleteDialog.open}
        gradeRange={deleteDialog.gradeRange}
        isDeleting={false}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteDialog({ open: false });
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
