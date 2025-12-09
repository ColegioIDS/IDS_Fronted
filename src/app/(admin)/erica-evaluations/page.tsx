// src/app/(admin)/erica-evaluations/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Calendar, 
  GraduationCap, 
  Users, 
  BookOpen, 
  FileText,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Loader2,
  LayoutGrid,
  List,
} from 'lucide-react';

import { EvaluationGridV2 } from '@/components/features/erica-evaluations';
import { EmptyState } from '@/components/shared/EmptyState';
import { useEricaCascade } from '@/hooks/data/erica-evaluations';
import { useAuth } from '@/hooks/useAuth';
import { useStateSelectorMode } from '@/context/StateSelectorContext';
import { ericaTopicsService } from '@/services/erica-topics.service';
import { EricaTopic } from '@/types/erica-topics.types';

// Tipos para selección
interface SelectionState {
  bimesterId: number | null;
  weekId: number | null;
  gradeId: number | null;
  sectionId: number | null;
  courseId: number | null;
  topicId: number | null;
}

export default function EricaEvaluationsPage() {
  const { user } = useAuth();
  const { mode, setMode } = useStateSelectorMode();
  
  const {
    cascadeData,
    isLoading,
    error,
    selected,
    selectBimester,
    selectWeek,
    selectGrade,
    selectSection,
    selectCourse,
    getBimesters,
    getWeeks,
    getGrades,
    getSections,
    getCourses,
    isSelectionComplete,
    resetSelection,
    refreshCascade,
  } = useEricaCascade();

  // Estado para el topic seleccionado (se selecciona después del curso)
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<EricaTopic | null>(null);
  
  // Estado para cargar topics
  const [topics, setTopics] = useState<EricaTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  // Cargar topics cuando se selecciona un curso
  useEffect(() => {
    const loadTopics = async () => {
      if (!selected.course || !selected.section || !selected.week) {
        setTopics([]);
        return;
      }

      setTopicsLoading(true);
      setTopicsError(null);

      try {
        const result = await ericaTopicsService.getEricaTopics({
          courseId: selected.course.id,
          sectionId: selected.section.id,
          academicWeekId: selected.week.id,
          isActive: true,
        });
        setTopics(result.data || []);
      } catch (err) {
        console.error('Error cargando topics:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar temas';
        setTopicsError(errorMessage);
        setTopics([]);
      } finally {
        setTopicsLoading(false);
      }
    };

    loadTopics();
  }, [selected.course, selected.section, selected.week]);

  // Determinar paso actual
  const currentStep = useMemo(() => {
    if (!selected.bimester) return 1;
    if (!selected.week) return 2;
    if (!selected.grade) return 3;
    if (!selected.section) return 4;
    if (!selected.course) return 5;
    if (!selectedTopicId) return 6;
    return 7;
  }, [selected, selectedTopicId]);

  // Función para retroceder un paso
  const goBack = () => {
    if (selectedTopicId) {
      setSelectedTopicId(null);
      setSelectedTopic(null);
    } else if (selected.course) {
      selectCourse(null);
    } else if (selected.section) {
      selectSection(null);
    } else if (selected.grade) {
      selectGrade(null);
    } else if (selected.week) {
      selectWeek(null);
    } else if (selected.bimester) {
      selectBimester(null);
    }
  };

  // Renderizar loading
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  // Renderizar error con EmptyState apropiado
  if (error) {
    // Mapear errorCode a tipo de EmptyState
    const getEmptyStateType = (errorCode?: string): 'no-active-cycle' | 'no-active-bimester' | 'no-weeks' | 'no-grades' | 'no-courses' | 'error' => {
      switch (errorCode) {
        case 'NO_ACTIVE_CYCLE':
          return 'no-active-cycle';
        case 'NO_ACTIVE_BIMESTER':
          return 'no-active-bimester';
        case 'NO_WEEKS':
          return 'no-weeks';
        case 'NO_GRADES':
          return 'no-grades';
        case 'NO_COURSES':
          return 'no-courses';
        default:
          return 'error';
      }
    };

    const emptyStateType = getEmptyStateType(error.errorCode);

    return (
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Evaluaciones ERICA
          </h1>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <EmptyState
              type={emptyStateType}
              message={error.message}
              action={{
                label: 'Reintentar',
                onClick: refreshCascade,
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentStep > 1 && (
            <Button variant="outline" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Atrás
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Evaluaciones ERICA
            </h1>
            <p className="text-sm text-gray-500">
              {cascadeData?.cycle.name} - Ciclo Activo
            </p>
          </div>
        </div>
        
        <Button variant="outline" onClick={refreshCascade}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Breadcrumb de selección */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        {selected.bimester && (
          <>
            <Badge variant="outline" className="bg-blue-50">
              <Calendar className="h-3 w-3 mr-1" />
              {selected.bimester.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {selected.week && (
          <>
            <Badge variant="outline" className="bg-purple-50">
              Semana {selected.week.number}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {selected.grade && (
          <>
            <Badge variant="outline" className="bg-green-50">
              <GraduationCap className="h-3 w-3 mr-1" />
              {selected.grade.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {selected.section && (
          <>
            <Badge variant="outline" className="bg-yellow-50">
              <Users className="h-3 w-3 mr-1" />
              {selected.section.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {selected.course && (
          <>
            <Badge variant="outline" className="bg-orange-50">
              <BookOpen className="h-3 w-3 mr-1" />
              {selected.course.name}
            </Badge>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
        {selectedTopicId && selectedTopic && (
          <Badge variant="outline" className="bg-red-50">
            <FileText className="h-3 w-3 mr-1" />
            {selectedTopic.title}
          </Badge>
        )}
      </div>

      {/* Contenido según paso */}
      {currentStep === 1 && (
        <SelectionGrid
          title="Selecciona un Bimestre"
          icon={<Calendar className="h-5 w-5" />}
          items={getBimesters().map(b => ({
            id: b.id,
            name: b.name,
            subtitle: b.weeksCount ? `${b.weeksCount} semanas` : 'Bimestre activo',
            onClick: () => selectBimester(b),
          }))}
        />
      )}

      {currentStep === 2 && (
        <SelectionGrid
          title="Selecciona una Semana"
          icon={<Calendar className="h-5 w-5" />}
          items={getWeeks().map(w => ({
            id: w.id,
            name: `Semana ${w.number}`,
            subtitle: `${new Date(w.startDate).toLocaleDateString()} - ${new Date(w.endDate).toLocaleDateString()}`,
            onClick: () => selectWeek(w),
          }))}
        />
      )}

      {currentStep === 3 && (
        <SelectionGrid
          title="Selecciona un Grado"
          icon={<GraduationCap className="h-5 w-5" />}
          items={getGrades().map(g => ({
            id: g.id,
            name: g.name,
            subtitle: g.level || `Orden ${g.order}`,
            onClick: () => selectGrade(g),
          }))}
        />
      )}

      {currentStep === 4 && (
        getSections().length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                type="no-sections"
                message={`El grado "${selected.grade?.name}" no tiene secciones`}
                description="Este grado no tiene secciones asignadas. Contacta al administrador para agregar secciones."
                action={{
                  label: 'Seleccionar otro grado',
                  onClick: () => selectGrade(null),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <SelectionGrid
            title="Selecciona una Sección"
            icon={<Users className="h-5 w-5" />}
            items={getSections().map(s => ({
              id: s.id,
              name: s.name,
              subtitle: s.courseAssignments ? `${s.courseAssignments.length} cursos` : 'Sección',
              onClick: () => selectSection(s),
            }))}
          />
        )
      )}

      {currentStep === 5 && (
        getCourses().length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                type="no-courses"
                message={`La sección "${selected.section?.name}" no tiene cursos`}
                description="Esta sección no tiene cursos asignados. Contacta al administrador para agregar cursos."
                action={{
                  label: 'Seleccionar otra sección',
                  onClick: () => selectSection(null),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <SelectionGrid
            title="Selecciona un Curso"
            icon={<BookOpen className="h-5 w-5" />}
            items={getCourses().map(c => ({
              id: c.id,
              name: c.name,
              subtitle: c.code || '',
              onClick: () => selectCourse(c),
            }))}
          />
        )
      )}

      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Selecciona un Tema
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topicsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Cargando temas...</span>
              </div>
            ) : topicsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{topicsError}</AlertDescription>
              </Alert>
            ) : topics.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">No hay temas disponibles</p>
                <p className="text-sm text-gray-400">
                  No se encontraron temas para {selected.course?.name} en la Semana {selected.week?.number}.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Crea un tema desde el módulo ERICA Topics.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map((topic) => (
                  <Card 
                    key={topic.id}
                    className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setSelectedTopic(topic);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {topic.title}
                        </h4>
                        {topic.isCompleted && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Completado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{topic.weekTheme}</p>
                      {topic.description && (
                        <p className="text-xs text-gray-400 line-clamp-2">{topic.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 7 && selectedTopicId && selectedTopic && user && (
        <EvaluationGridV2
          topicId={selectedTopicId}
          teacherId={typeof user.id === 'string' ? parseInt(user.id, 10) : user.id}
          topicTitle={`${selectedTopic.title} - ${selected.course?.name}`}
          statsHeaderAction={
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={mode === 'popover' ? 'default' : 'ghost'}
                onClick={() => setMode('popover')}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Popover
              </Button>
              <Button
                size="sm"
                variant={mode === 'dropdown' ? 'default' : 'ghost'}
                onClick={() => setMode('dropdown')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                Dropdown
              </Button>
            </div>
          }
          onSaveSuccess={() => {
            // Toast o notificación de éxito
          }}
          onSaveError={(error) => {
            console.error('Error al guardar:', error);
          }}
        />
      )}
    </div>
  );
}

// Componente auxiliar para grids de selección
interface SelectionItem {
  id: number;
  name: string;
  subtitle?: string;
  onClick: () => void;
}

interface SelectionGridProps {
  title: string;
  icon: React.ReactNode;
  items: SelectionItem[];
}

function SelectionGrid({ title, icon, items }: SelectionGridProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            {icon}
            <p className="mt-2">No hay elementos disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Button
              key={item.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start text-left hover:bg-blue-50 hover:border-blue-300"
              onClick={item.onClick}
            >
              <span className="font-semibold text-gray-900">{item.name}</span>
              {item.subtitle && (
                <span className="text-xs text-gray-500 mt-1">{item.subtitle}</span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
