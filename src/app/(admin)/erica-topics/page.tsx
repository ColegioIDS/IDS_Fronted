// src/app/(admin)/erica-topics/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EricaTopicsListEnhanced } from '@/components/features/erica-topics';
import { useEricaTopics } from '@/hooks/useEricaTopics';
import { CreateEricaTopicDto, UpdateEricaTopicDto, EricaTopic, EricaTopicStats } from '@/types/erica-topics.types';
import { 
  Plus, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Calendar, 
  Copy, 
  Filter, 
  X, 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  User, 
  GraduationCap, 
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BookOpenCheck,
  TrendingUp,
  Target
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/shared/feedback/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEricaCascadeData } from '@/hooks/useEricaCascadeData';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { ProtectedContent } from '@/components/shared/permissions/ProtectedContent';
import { ERICA_TOPICS_PERMISSIONS } from '@/constants/erica-topics.permissions';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function EricaTopicsPage() {
  const router = useRouter();
  const {
    topics,
    loading,
    error,
    pagination,
    stats,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    duplicateTopic,
    completeTopic,
    fetchTopicsByTeacher,
    fetchTopicsBySection,
    fetchTopicsByWeek,
    fetchTeacherStats,
  } = useEricaTopics();

  const { data: cascadeData, loading: loadingCascade } = useEricaCascadeData();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);
  
  // Filtros avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [filterWeekId, setFilterWeekId] = useState<string>('');
  const [filterGradeId, setFilterGradeId] = useState<string>('');
  const [filterSectionId, setFilterSectionId] = useState<string>('');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('');
  const [loadingStats, setLoadingStats] = useState(false);

  // Estados para diálogos
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateTopicId, setDuplicateTopicId] = useState<number | null>(null);
  const [duplicateTopicTitle, setDuplicateTopicTitle] = useState('');
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [duplicating, setDuplicating] = useState(false);

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeTopicId, setCompleteTopicId] = useState<number | null>(null);
  const [completeTopicTitle, setCompleteTopicTitle] = useState('');
  const [completeNewState, setCompleteNewState] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Extraer listas únicas de secciones y docentes desde cascadeData
  const { sections, teachers } = useMemo(() => {
    if (!cascadeData) return { sections: [], teachers: [] };
    
    const sectionsMap = new Map<number, { id: number; name: string; gradeId: number; gradeName: string }>();
    const teachersMap = new Map<number, { id: number; name: string }>();
    
    Object.entries(cascadeData.gradesSections).forEach(([gradeId, sectionsList]) => {
      const grade = cascadeData.grades.find(g => g.id === parseInt(gradeId));
      if (Array.isArray(sectionsList)) {
        sectionsList.forEach((section: any) => {
          sectionsMap.set(section.id, {
            id: section.id,
            name: section.name,
            gradeId: parseInt(gradeId),
            gradeName: grade?.name || '',
          });
          
          if (section.courseAssignments && Array.isArray(section.courseAssignments)) {
            section.courseAssignments.forEach((ca: any) => {
              if (ca.teacher) {
                teachersMap.set(ca.teacher.id, {
                  id: ca.teacher.id,
                  name: `${ca.teacher.givenNames} ${ca.teacher.lastNames}`,
                });
              }
            });
          }
        });
      }
    });
    
    return {
      sections: Array.from(sectionsMap.values()),
      teachers: Array.from(teachersMap.values()),
    };
  }, [cascadeData]);

  // Filtrar secciones por grado seleccionado
  const filteredSections = useMemo(() => {
    if (!filterGradeId) return sections;
    return sections.filter(s => s.gradeId === parseInt(filterGradeId));
  }, [sections, filterGradeId]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterWeekId) count++;
    if (filterGradeId) count++;
    if (filterSectionId) count++;
    if (filterTeacherId) count++;
    return count;
  }, [filterWeekId, filterGradeId, filterSectionId, filterTeacherId]);

  // Cargar estadísticas cuando se selecciona un docente
  useEffect(() => {
    if (filterTeacherId) {
      setLoadingStats(true);
      fetchTeacherStats(parseInt(filterTeacherId))
        .catch(() => {})
        .finally(() => setLoadingStats(false));
    }
  }, [filterTeacherId, fetchTeacherStats]);

  // Efecto principal para cargar temas con filtros
  useEffect(() => {
    // Usar siempre el endpoint general con todos los filtros
    fetchTopics({
      page,
      limit: 10,
      search: search || undefined,
      sectionId: filterSectionId ? parseInt(filterSectionId) : undefined,
      academicWeekId: filterWeekId ? parseInt(filterWeekId) : undefined,
      teacherId: filterTeacherId ? parseInt(filterTeacherId) : undefined,
    });
  }, [page, search, filterWeekId, filterSectionId, filterTeacherId, fetchTopics]);

  // Limpiar filtros
  const clearFilters = () => {
    setFilterWeekId('');
    setFilterGradeId('');
    setFilterSectionId('');
    setFilterTeacherId('');
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await deleteTopic(id);
      toast.success('Tema eliminado', {
        description: 'El tema ERICA ha sido eliminado correctamente.',
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'No se pudo eliminar el tema ERICA.';
      toast.error('Error al eliminar', {
        description: errorMsg,
      });
    } finally {
      setDeleting(null);
    }
  };

  // Abrir diálogo de duplicar
  const handleDuplicateClick = (id: number) => {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;
    setDuplicateTopicId(id);
    setDuplicateTopicTitle(topic.title);
    setSelectedWeekId('');
    setDuplicateDialogOpen(true);
  };

  // Confirmar duplicar
  const handleDuplicateConfirm = async () => {
    if (!duplicateTopicId || !selectedWeekId) return;
    try {
      setDuplicating(true);
      await duplicateTopic(duplicateTopicId, parseInt(selectedWeekId));
      toast.success('Tema duplicado', {
        description: `"${duplicateTopicTitle}" ha sido duplicado para la nueva semana.`,
      });
      setDuplicateDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo duplicar el tema ERICA.';
      toast.error('Error al duplicar', {
        description: errorMessage,
      });
    } finally {
      setDuplicating(false);
    }
  };

  // Abrir diálogo de completar
  const handleCompleteClick = (id: number, currentlyCompleted: boolean) => {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;
    setCompleteTopicId(id);
    setCompleteTopicTitle(topic.title);
    setCompleteNewState(!currentlyCompleted);
    setCompleteDialogOpen(true);
  };

  // Confirmar completar
  const handleCompleteConfirm = async () => {
    if (!completeTopicId) return;
    try {
      setCompleting(true);
      await completeTopic(completeTopicId, completeNewState);
      toast.success(completeNewState ? 'Tema completado' : 'Tema en progreso', {
        description: completeNewState 
          ? 'El tema ha sido marcado como completado.' 
          : 'El tema ha sido marcado como en progreso.',
      });
      setCompleteDialogOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'No se pudo actualizar el estado del tema.';
      toast.error('Error al actualizar estado', {
        description: errorMsg,
      });
    } finally {
      setCompleting(false);
    }
  };

  return (
    <ProtectedPage {...ERICA_TOPICS_PERMISSIONS.READ}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 dark:from-teal-800 dark:via-emerald-800 dark:to-cyan-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0tNC00aC0ydi0yaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <BookOpenCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-teal-100 text-sm font-medium">Administración</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Temas ERICA
                  </h1>
                  <p className="text-teal-100 mt-1 text-sm md:text-base">
                    Gestión de contenidos académicos semanales
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <ProtectedContent {...ERICA_TOPICS_PERMISSIONS.CREATE} hideOnNoPermission>
                  <Button
                    onClick={() => router.push('/erica-topics/create')}
                    className="bg-white text-teal-700 hover:bg-teal-50 shadow-lg shadow-teal-900/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Tema
                  </Button>
                </ProtectedContent>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 -mt-6">
          {/* Search and Filters Card */}
          <Card className="mb-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 border-0 bg-white dark:bg-slate-900">
            <CardContent className="p-4 md:p-6">
              {/* Search Row */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por título, tema de semana, descripción..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "gap-2 h-11 px-5 transition-all",
                    showFilters 
                      ? "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25" 
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <Badge 
                      className={cn(
                        "ml-1 h-5 min-w-[20px] flex items-center justify-center text-xs",
                        showFilters 
                          ? "bg-white text-teal-600" 
                          : "bg-teal-600 text-white"
                      )}
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filtro por Semana */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        Semana
                      </label>
                      <Select value={filterWeekId || 'all'} onValueChange={(v) => { setFilterWeekId(v === 'all' ? '' : v); setPage(1); }}>
                        <SelectTrigger className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Todas las semanas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las semanas</SelectItem>
                          {cascadeData?.weeks.map((week) => (
                            <SelectItem key={week.id} value={week.id.toString()}>
                              Semana {week.number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por Grado */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-teal-600" />
                        Grado
                      </label>
                      <Select value={filterGradeId || 'all'} onValueChange={(v) => { setFilterGradeId(v === 'all' ? '' : v); setFilterSectionId(''); setPage(1); }}>
                        <SelectTrigger className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Todos los grados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los grados</SelectItem>
                          {cascadeData?.grades.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id.toString()}>
                              {grade.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por Sección */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-600" />
                        Sección
                      </label>
                      <Select 
                        value={filterSectionId || 'all'} 
                        onValueChange={(v) => { setFilterSectionId(v === 'all' ? '' : v); setPage(1); }}
                        disabled={filteredSections.length === 0}
                      >
                        <SelectTrigger className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Todas las secciones" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las secciones</SelectItem>
                          {filteredSections.map((section) => (
                            <SelectItem key={section.id} value={section.id.toString()}>
                              {section.gradeName} - Sección {section.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por Docente */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-600" />
                        Docente
                      </label>
                      <Select value={filterTeacherId || 'all'} onValueChange={(v) => { setFilterTeacherId(v === 'all' ? '' : v); setPage(1); }}>
                        <SelectTrigger className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Todos los docentes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los docentes</SelectItem>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters} 
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpiar filtros
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teacher Statistics Card */}
          <ProtectedContent {...ERICA_TOPICS_PERMISSIONS.READ_STATS} hideOnNoPermission>
            {filterTeacherId && stats && (
              <Card className="mb-6 overflow-hidden border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
                  <CardContent className="bg-white dark:bg-slate-900 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Estadísticas del Docente
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Resumen de progreso académico
                        </p>
                      </div>
                      {loadingStats && <Loader2 className="w-4 h-4 animate-spin text-indigo-600 ml-auto" />}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="relative overflow-hidden p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-200/50 dark:bg-slate-700/30 rounded-full -translate-y-6 translate-x-6"></div>
                        <BookOpen className="w-6 h-6 text-slate-500 mb-2" />
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Temas</p>
                      </div>
                      <div className="relative overflow-hidden p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-200/50 dark:bg-green-800/30 rounded-full -translate-y-6 translate-x-6"></div>
                        <CheckCircle2 className="w-6 h-6 text-green-600 mb-2" />
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Completados</p>
                      </div>
                      <div className="relative overflow-hidden p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/50 dark:bg-amber-800/30 rounded-full -translate-y-6 translate-x-6"></div>
                        <Clock className="w-6 h-6 text-amber-600 mb-2" />
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">En Progreso</p>
                      </div>
                      <div className="relative overflow-hidden p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/50 dark:bg-blue-800/30 rounded-full -translate-y-6 translate-x-6"></div>
                        <Target className="w-6 h-6 text-blue-600 mb-2" />
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Math.round(stats.completionRate)}%</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Progreso</p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </ProtectedContent>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 shadow-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-600 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Results Summary */}
          {!loading && topics.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 px-3 py-1">
                  {pagination.total} tema{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
                </Badge>
                {search && (
                  <Badge variant="outline" className="border-slate-300 dark:border-slate-600">
                    Búsqueda: &quot;{search}&quot;
                  </Badge>
                )}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando {Math.min((page - 1) * 10 + 1, pagination.total)} - {Math.min(page * 10, pagination.total)} de {pagination.total}
              </div>
            </div>
          )}

          {/* Content */}
          {loading && topics.length === 0 ? (
            <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50">
              <CardContent className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">Cargando temas...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <EricaTopicsListEnhanced
                topics={topics}
                loading={loading}
                cascadeData={cascadeData}
                cascadeLoading={loadingCascade}
                onEdit={(topic) => router.push(`/erica-topics/${topic.id}/edit`)}
                onDelete={handleDelete}
                onDuplicate={handleDuplicateClick}
                onComplete={handleCompleteClick}
              />

              {/* Modern Pagination */}
              {pagination.totalPages > 1 && (
                <Card className="mt-6 border-0 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Page Info */}
                      <p className="text-sm text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                        Página <span className="font-semibold text-slate-700 dark:text-slate-300">{pagination.page}</span> de{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{pagination.totalPages}</span>
                      </p>

                      {/* Pagination Controls */}
                      <div className="flex items-center gap-1 order-1 sm:order-2">
                        {/* First Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(1)}
                          disabled={page === 1}
                          className="w-9 h-9 p-0 border-slate-200 dark:border-slate-700"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </Button>

                        {/* Previous Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="w-9 h-9 p-0 border-slate-200 dark:border-slate-700"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1 mx-1">
                          {(() => {
                            const pages = [];
                            const maxVisible = 5;
                            let start = Math.max(1, page - Math.floor(maxVisible / 2));
                            let end = Math.min(pagination.totalPages, start + maxVisible - 1);
                            if (end - start + 1 < maxVisible) {
                              start = Math.max(1, end - maxVisible + 1);
                            }

                            if (start > 1) {
                              pages.push(
                                <Button
                                  key={1}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPage(1)}
                                  className="w-9 h-9 p-0 border-slate-200 dark:border-slate-700"
                                >
                                  1
                                </Button>
                              );
                              if (start > 2) {
                                pages.push(
                                  <span key="dots-start" className="px-2 text-slate-400">
                                    ...
                                  </span>
                                );
                              }
                            }

                            for (let i = start; i <= end; i++) {
                              pages.push(
                                <Button
                                  key={i}
                                  variant={i === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPage(i)}
                                  className={cn(
                                    "w-9 h-9 p-0",
                                    i === page 
                                      ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600" 
                                      : "border-slate-200 dark:border-slate-700"
                                  )}
                                >
                                  {i}
                                </Button>
                              );
                            }

                            if (end < pagination.totalPages) {
                              if (end < pagination.totalPages - 1) {
                                pages.push(
                                  <span key="dots-end" className="px-2 text-slate-400">
                                    ...
                                  </span>
                                );
                              }
                              pages.push(
                                <Button
                                  key={pagination.totalPages}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPage(pagination.totalPages)}
                                  className="w-9 h-9 p-0 border-slate-200 dark:border-slate-700"
                                >
                                  {pagination.totalPages}
                                </Button>
                              );
                            }

                            return pages;
                          })()}
                        </div>

                        {/* Next Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                          disabled={page === pagination.totalPages}
                          className="w-9 h-9 p-0 border-slate-200 dark:border-slate-700"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>

                        {/* Last Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(pagination.totalPages)}
                          disabled={page === pagination.totalPages}
                          className="w-9 h-9 p-0 border-slate-200 dark:border-slate-700"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Items per page selector (future enhancement) */}
                      <div className="hidden sm:block order-3"></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

        {/* Duplicate Dialog */}
        <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-0 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
                  <Copy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-slate-900 dark:text-white">
                    Duplicar Tema
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 dark:text-slate-400">
                    Selecciona la semana académica destino
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tema a duplicar:</p>
                <p className="font-medium text-slate-900 dark:text-white">&quot;{duplicateTopicTitle}&quot;</p>
              </div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                Semana Académica Destino
              </label>
              <Select value={selectedWeekId} onValueChange={setSelectedWeekId}>
                <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Seleccionar semana..." />
                </SelectTrigger>
                <SelectContent>
                  {cascadeData?.weeks.map((week) => (
                    <SelectItem key={week.id} value={week.id.toString()}>
                      Semana {week.number} ({new Date(week.startDate).toLocaleDateString('es-ES')} - {new Date(week.endDate).toLocaleDateString('es-ES')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDuplicateDialogOpen(false)}
                disabled={duplicating}
                className="border-slate-200 dark:border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDuplicateConfirm}
                disabled={!selectedWeekId || duplicating}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-600/25"
              >
                {duplicating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Duplicando...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar Tema
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Complete Confirmation Dialog */}
        <ConfirmDialog
          open={completeDialogOpen}
          onOpenChange={setCompleteDialogOpen}
          title={completeNewState ? '¿Marcar como completado?' : '¿Marcar como en progreso?'}
          description={
            completeNewState
              ? `El tema "${completeTopicTitle}" será marcado como completado.`
              : `El tema "${completeTopicTitle}" será marcado como en progreso.`
          }
          confirmText={completeNewState ? 'Completar' : 'Marcar en progreso'}
          cancelText="Cancelar"
          type={completeNewState ? 'success' : 'info'}
          isLoading={completing}
          onConfirm={handleCompleteConfirm}
        />
        </div>
      </div>
    </ProtectedPage>
  );
}
