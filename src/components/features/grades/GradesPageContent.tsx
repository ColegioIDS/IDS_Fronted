"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradeStats } from "./GradeStats";
import { GradeFilters } from "./GradeFilters";
import { GradesGrid } from "./GradesGrid";
import { GradeFormDialog } from "./GradeFormDialog";
import { GradeDetailDialog } from "./GradeDetailDialog";
import { DeleteGradeDialog } from "./DeleteGradeDialog";
import { GradeStatsDialog } from "./GradeStatsDialog";
import { useGrades } from "@/hooks/data/useGrades";
import { gradesService } from "@/services/grades.service";
import type {
  Grade,
  CreateGradeDto,
  UpdateGradeDto,
  GradeFilters as GradeFiltersType,
} from "@/types/grades.types";

export function GradesPageContent() {
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

  // Update query when filters change
  useEffect(() => {
    const queryFilters: any = {
      page: 1,
    };
    
    if (filters.search) queryFilters.search = filters.search;
    if (filters.level) queryFilters.level = filters.level;
    if (filters.isActive !== undefined && filters.isActive !== 'all') {
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

  // CRUD Handlers
  const handleFormSubmit = async (dto: CreateGradeDto) => {
    try {
      if (formDialog.mode === "create") {
        await gradesService.create(dto);
        toast.success("Grado creado exitosamente");
      } else if (formDialog.grade) {
        await gradesService.update(formDialog.grade.id, dto);
        toast.success("Grado actualizado exitosamente");
      }
      setFormDialog({ open: false, mode: "create" });
      refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (formDialog.mode === "create"
          ? "Error al crear el grado"
          : "Error al actualizar el grado");
      toast.error(message);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.grade) return;
    
    try {
      await gradesService.delete(deleteDialog.grade.id);
      toast.success("Grado eliminado exitosamente");
      setDeleteDialog({ open: false });
      refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al eliminar el grado";
      toast.error(message);
      throw error;
    }
  };

  const handleDeactivate = async () => {
    if (!deleteDialog.grade) return;
    
    try {
      await gradesService.deactivate(deleteDialog.grade.id);
      toast.success("Grado desactivado exitosamente");
      setDeleteDialog({ open: false });
      refresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al desactivar el grado";
      toast.error(message);
      throw error;
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
      {/* Header sin gradientes */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-950 border-2 border-primary-300 dark:border-primary-700">
              <GraduationCap className="w-7 h-7 text-primary-700 dark:text-primary-300" />
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
          <Button
            onClick={() => setFormDialog({ open: true, mode: "create" })}
            className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600 font-semibold shadow-sm hover:shadow"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Grado
          </Button>
        </div>
      </div>

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
      />

      {/* Enhanced Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info section */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-primary-50 dark:bg-primary-950/30 rounded-lg border border-primary-200 dark:border-primary-800">
                <span className="text-sm font-semibold text-primary-900 dark:text-primary-100">
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
                className="hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-primary-950/30"
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
                className="hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-primary-950/30"
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
                          ? 'bg-primary-600 dark:bg-primary-500 text-white font-bold shadow-lg border-2 border-primary-700 dark:border-primary-600'
                          : 'hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-primary-950/30'
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
                className="hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-primary-950/30"
              >
                Siguiente
              </Button>

              {/* Last page */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(meta.totalPages)}
                disabled={meta.page === meta.totalPages}
                className="hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-primary-950/30"
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
