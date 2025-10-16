// components/course-grade/CourseGradeManager.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileSpreadsheet, Filter, BarChart3, Pencil } from 'lucide-react';
import { CourseGradeTable } from './CourseGradeTable';
import { CourseGradeFilters } from './CourseGradeFilters';
import { CourseGradeForm } from './CourseGradeForm';
import { BatchActionsBar } from './BatchActionsBar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCourseGrade } from '@/hooks/useCourseGrade';
import { CourseGradeFilters as FilterType } from '@/types/course-grade.types';
import { CourseGradeFormData } from '@/schemas/courseGradeSchema';
import { toast } from 'sonner';
import ProtectedContent from '@/components/common/ProtectedContent';
import { useAuth } from '@/context/AuthContext'; // ✅ Importar useAuth (NO ProtectedContent)


/**
 * Enhanced main container component for managing course-grade relationships
 * Features: advanced filtering, pagination, statistics, improved UI, permissions
 */
export default function CourseGradeManager() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    level: '',
    type: 'all',
    gradeId: undefined
  });

    const { hasPermission } = useAuth(); // ✅ Usar hook de auth
    const canCreate = hasPermission('course-grade', 'create');
  const canUpdate = hasPermission('course-grade', 'update');
  const canDelete = hasPermission('course-grade', 'delete');

  // ✅ Hook actualizado
  const {
    courseGrades,
    isLoading,
    fetchCourseGrades,
    createCourseGradeItem,
    updateCourseGradeItem,
    deleteCourseGradeItem
  } = useCourseGrade(true); // autoFetch = true

  // Filter and paginate course grades
  const { filteredData, totalPages, statistics } = useMemo(() => {
    const filtered = courseGrades.filter((item) => {
      const matchesSearch = !filters.search || 
        item.course.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.course.code && item.course.code.toLowerCase().includes(filters.search.toLowerCase())) ||
        item.grade.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesLevel = !filters.level || item.grade.level === filters.level;
      const matchesGrade = !filters.gradeId || item.gradeId === filters.gradeId;

      const matchesType = filters.type === 'all' || 
        (filters.type === 'core' && item.isCore) ||
        (filters.type === 'elective' && !item.isCore);

      return matchesSearch && matchesLevel && matchesGrade && matchesType;
    });

    // Calculate statistics
    const stats = {
      total: courseGrades.length,
      totalFiltered: filtered.length,
      core: filtered.filter(item => item.isCore).length,
      elective: filtered.filter(item => !item.isCore).length,
      byLevel: filtered.reduce((acc, item) => {
        acc[item.grade.level] = (acc[item.grade.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // Pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);
    const totalPagesCount = Math.ceil(filtered.length / pageSize);

    return {
      filteredData: paginatedData,
      totalPages: totalPagesCount,
      statistics: stats,
      totalFiltered: filtered.length
    };
  }, [courseGrades, filters, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ✅ Handlers actualizados
  const handleEdit = (id: number) => {
    setEditingId(id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta relación?')) {
      return;
    }

    const success = await deleteCourseGradeItem(id);
    if (success) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleFormSubmit = async (data: CourseGradeFormData) => {
    let result;
    
    if (editingId) {
      result = await updateCourseGradeItem(editingId, data);
    } else {
      result = await createCourseGradeItem(data);
    }

    if (result) {
      setIsFormOpen(false);
      setEditingId(null);
    }
  };

  const handleExportExcel = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Exportando a Excel...',
        success: 'Archivo exportado correctamente',
        error: 'Error al exportar el archivo'
      }
    );
  };

  const handleBatchAction = async (action: string, ids: number[]) => {
    try {
      switch (action) {
        case 'makeCore':
          // TODO: Implement batch update
          toast.success(`${ids.length} relaciones convertidas a principales`);
          break;
        case 'makeElective':
          // TODO: Implement batch update
          toast.success(`${ids.length} relaciones convertidas a electivas`);
          break;
        case 'delete':
          // TODO: Implement batch delete
          toast.success(`${ids.length} relaciones eliminadas`);
          break;
        case 'export':
          handleExportExcel();
          return;
      }
      setSelectedIds([]);
      await fetchCourseGrades();
    } catch (error) {
      toast.error('Error en la operación masiva');
    }
  };

  const hasActiveFilters = filters.search || filters.level || filters.type !== 'all' || filters.gradeId;

  return (
    <ProtectedContent 
      requiredPermission={{ module: 'course-grade', action: 'read' }}
    >
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Gestión Curso-Grados
            </h1>
            <p className="text-muted-foreground">
              Administra las relaciones entre cursos y grados académicos
            </p>
            
            {/* Quick Statistics */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <BarChart3 className="h-3 w-3 mr-1" />
                {statistics.total} total
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {statistics.core} principales
              </Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {statistics.elective} electivas
              </Badge>
              {hasActiveFilters && (
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                  <Filter className="h-3 w-3 mr-1" />
                  Filtrado
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
           
              <Button variant="outline" onClick={handleExportExcel} className="shadow-sm">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar
              </Button>

           
            {canCreate &&
              <Button 
                onClick={() => {
                  setEditingId(null);
                  setIsFormOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Relación
              </Button>
            }

          </div>
        </div>

        {/* Statistics Cards */}
        {Object.keys(statistics.byLevel).length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(statistics.byLevel).map(([level, count]) => (
              <Card key={level} className="shadow-sm border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{level}</p>
                      <p className="text-2xl font-bold text-indigo-600">{count}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content */}
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  Relaciones Activas
                </CardTitle>
                <CardDescription>
                  {statistics.totalFiltered} de {courseGrades.length} relaciones 
                  {hasActiveFilters && ' (filtradas)'}
                </CardDescription>
              </div>
              
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 p-6">
            {/* Enhanced Filters */}
            <CourseGradeFilters
              filters={filters}
              onFiltersChange={setFilters}
            />

            {/* Table with Pagination */}
            <CourseGradeTable
              data={filteredData}
              loading={isLoading}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={statistics.totalFiltered}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>

        {/* Form Modal */}
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingId(null);
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingId ? (
                  <>
                    <Pencil className="h-5 w-5 text-indigo-600" />
                    Editar Relación
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 text-indigo-600" />
                    Nueva Relación
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <CourseGradeForm
              editingId={editingId}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Batch Actions */}
        <BatchActionsBar
          selectedCount={selectedIds.length}
          onAction={(action) => handleBatchAction(action, selectedIds)}
          onClear={() => setSelectedIds([])}
        />
      </div>
    </ProtectedContent>
  );
}