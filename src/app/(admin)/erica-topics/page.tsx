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
  Target,
  ArrowUpDown,
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
  const [filterCourseId, setFilterCourseId] = useState<string>('');
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

  // Ordenamiento y filtros rápidos
  const [sortBy, setSortBy] = useState<'week' | 'status' | 'recent' | 'title'>('week');
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'completed' | 'thisWeek'>('all');

  // Obtener fecha de hoy para comparar semanas
  const today = new Date();
  const currentWeekId = useMemo(() => {
    if (!cascadeData) return null;
    return cascadeData.weeks.find(w => {
      const startDate = new Date(w.startDate);
      const endDate = new Date(w.endDate);
      return today >= startDate && today <= endDate;
    })?.id;
  }, [cascadeData, today]);

  // Aplicar filtro rápido y ordenamiento
  const filteredAndSortedTopics = useMemo(() => {
    let filtered = [...topics];

    // Aplicar filtro rápido
    if (quickFilter === 'pending') {
      filtered = filtered.filter(t => !t.isCompleted);
    } else if (quickFilter === 'completed') {
      filtered = filtered.filter(t => t.isCompleted);
    } else if (quickFilter === 'thisWeek') {
      filtered = filtered.filter(t => t.academicWeekId === currentWeekId);
    }

    // Aplicar ordenamiento
    if (sortBy === 'status') {
      // Pendientes primero, después completados
      filtered.sort((a, b) => {
        if (a.isCompleted === b.isCompleted) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.isCompleted ? 1 : -1;
      });
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'es'));
    }

    return filtered;
  }, [topics, quickFilter, sortBy, currentWeekId]);

  // Agrupar temas por semana
  const topicsByWeek = useMemo(() => {
    const grouped = new Map<number, typeof topics>();
    
    filteredAndSortedTopics.forEach(topic => {
      if (!grouped.has(topic.academicWeekId)) {
        grouped.set(topic.academicWeekId, []);
      }
      grouped.get(topic.academicWeekId)!.push(topic);
    });

    // Ordenar semanas
    const weeks = cascadeData?.weeks || [];
    const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
      const weekA = weeks.find(w => w.id === a[0]);
      const weekB = weeks.find(w => w.id === b[0]);
      if (!weekA || !weekB) return 0;
      return weekA.number - weekB.number;
    });

    return sortedEntries;
  }, [filteredAndSortedTopics, cascadeData?.weeks]);
  const { sections, courses } = useMemo(() => {
    if (!cascadeData) return { sections: [], courses: [] };
    
    const sectionsMap = new Map<number, { id: number; name: string; gradeId: number; gradeName: string }>();
    const coursesMap = new Map<number, { id: number; name: string; code: string }>();
    
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
              if (ca.course) {
                coursesMap.set(ca.course.id, {
                  id: ca.course.id,
                  name: ca.course.name,
                  code: ca.course.code || '',
                });
              }
            });
          }
        });
      }
    });
    
    return {
      sections: Array.from(sectionsMap.values()),
      courses: Array.from(coursesMap.values()),
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
    if (filterCourseId) count++;
    return count;
  }, [filterWeekId, filterGradeId, filterSectionId, filterCourseId]);

  // Efecto principal para cargar temas con filtros
  useEffect(() => {
    // Usar siempre el endpoint general con todos los filtros
    fetchTopics({
      page,
      limit: 10,
      search: search || undefined,
      sectionId: filterSectionId ? parseInt(filterSectionId) : undefined,
      academicWeekId: filterWeekId ? parseInt(filterWeekId) : undefined,
      courseId: filterCourseId ? parseInt(filterCourseId) : undefined,
    });
  }, [page, search, filterWeekId, filterSectionId, filterCourseId, fetchTopics]);

  // Limpiar filtros
  const clearFilters = () => {
    setFilterWeekId('');
    setFilterGradeId('');
    setFilterSectionId('');
    setFilterCourseId('');
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
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-teal-600 dark:bg-teal-900">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-700 dark:bg-teal-800 rounded-lg">
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
                  className="bg-teal-700 hover:bg-teal-800 border-teal-500 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <ProtectedContent {...ERICA_TOPICS_PERMISSIONS.CREATE} hideOnNoPermission>
                  <Button
                    onClick={() => router.push('/erica-topics/create')}
                    className="bg-white text-teal-700 hover:bg-slate-100 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Tema
                  </Button>
                </ProtectedContent>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Search and Filters Card */}
          <Card className="mb-6 shadow border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
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

                {/* Dropdown Ordenamiento */}
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-full md:w-48 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Por Semana</SelectItem>
                    <SelectItem value="status">Pendientes Primero</SelectItem>
                    <SelectItem value="recent">Más Recientes</SelectItem>
                    <SelectItem value="title">Alfabético (A-Z)</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "gap-2 h-11 px-5 transition-all",
                    showFilters 
                      ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600" 
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

              {/* Quick Filter Chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  variant={quickFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuickFilter('all')}
                  className={cn(
                    "h-8 px-3 text-xs font-medium transition-all",
                    quickFilter === 'all'
                      ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  Todos los temas
                </Button>
                <Button
                  variant={quickFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuickFilter('pending')}
                  className={cn(
                    "h-8 px-3 text-xs font-medium transition-all flex items-center gap-1",
                    quickFilter === 'pending'
                      ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Pendientes
                </Button>
                <Button
                  variant={quickFilter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuickFilter('completed')}
                  className={cn(
                    "h-8 px-3 text-xs font-medium transition-all flex items-center gap-1",
                    quickFilter === 'completed'
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completados
                </Button>
                <Button
                  variant={quickFilter === 'thisWeek' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuickFilter('thisWeek')}
                  className={cn(
                    "h-8 px-3 text-xs font-medium transition-all flex items-center gap-1",
                    quickFilter === 'thisWeek'
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Esta semana
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

                    {/* Filtro por Curso */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        Curso
                      </label>
                      <Select value={filterCourseId || 'all'} onValueChange={(v) => { setFilterCourseId(v === 'all' ? '' : v); setPage(1); }}>
                        <SelectTrigger className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Todos los cursos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los cursos</SelectItem>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.name}
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

          {/* Course Statistics Card */}
          <ProtectedContent {...ERICA_TOPICS_PERMISSIONS.READ_STATS} hideOnNoPermission>
            {filterCourseId && stats && (
              <Card className="mb-6 border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-teal-600 dark:bg-teal-700 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Estadísticas del Curso
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Resumen de progreso académico
                      </p>
                    </div>
                    {loadingStats && <Loader2 className="w-4 h-4 animate-spin text-teal-600 ml-auto" />}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400 mb-2" />
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Temas</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completados</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mb-2" />
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">En Progreso</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round(stats.completionRate)}%</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Progreso</p>
                    </div>
                  </div>
                </CardContent>
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
            <Card className="border shadow bg-white dark:bg-slate-900">
              <CardContent className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">Cargando temas...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredAndSortedTopics.length === 0 && !loading ? (
            <Card className="border shadow bg-white dark:bg-slate-900">
              <CardContent className="flex items-center justify-center py-20">
                <div className="text-center">
                  <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">No hay temas que mostrar</p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                    {quickFilter !== 'all' ? 'Intenta cambiar el filtro rápido' : 'Crea uno nuevo para comenzar'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Vista Agrupada por Semana */}
              <div className="space-y-6">
                {topicsByWeek.map(([weekId, weekTopics]) => {
                  const week = cascadeData?.weeks.find(w => w.id === weekId);
                  if (!week) return null;

                  const isCurrentWeek = weekId === currentWeekId;
                  const completedCount = weekTopics.filter(t => t.isCompleted).length;
                  const completionPercent = Math.round((completedCount / weekTopics.length) * 100);

                  return (
                    <div
                      key={weekId}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                    >
                      {/* Week Header */}
                      <div
                        className={cn(
                          "px-6 py-4 border-b border-slate-200 dark:border-slate-700",
                          isCurrentWeek
                            ? "bg-blue-50 dark:bg-blue-950/20"
                            : "bg-slate-50 dark:bg-slate-800/50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                                isCurrentWeek
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                              )}
                            >
                              {week.number}
                            </div>
                            <div>
                              <h3
                                className={cn(
                                  "font-semibold",
                                  isCurrentWeek
                                    ? "text-blue-900 dark:text-blue-100"
                                    : "text-slate-900 dark:text-slate-100"
                                )}
                              >
                                Semana {week.number}
                                {isCurrentWeek && (
                                  <span className="ml-2 text-xs font-medium px-2 py-1 rounded bg-blue-600 text-white">
                                    ACTUAL
                                  </span>
                                )}
                              </h3>
                              <p
                                className={cn(
                                  "text-sm",
                                  isCurrentWeek
                                    ? "text-blue-700 dark:text-blue-200"
                                    : "text-slate-500 dark:text-slate-400"
                                )}
                              >
                                {new Date(week.startDate).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                })}
                                {" - "}
                                {new Date(week.endDate).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                              {completedCount}/{weekTopics.length}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {completionPercent}% completado
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              completedCount === weekTopics.length
                                ? "bg-emerald-600"
                                : "bg-teal-600"
                            )}
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Week Topics */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {weekTopics.map((topic) => (
                          <EricaTopicsListEnhanced
                            key={topic.id}
                            topics={[topic]}
                            loading={loading}
                            cascadeData={cascadeData}
                            cascadeLoading={loadingCascade}
                            onEdit={(t) => router.push(`/erica-topics/${t.id}/edit`)}
                            onDelete={handleDelete}
                            onDuplicate={handleDuplicateClick}
                            onComplete={handleCompleteClick}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modern Pagination */}
              {pagination.totalPages > 1 && (
                <Card className="mt-6 shadow border bg-white dark:bg-slate-900">
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
