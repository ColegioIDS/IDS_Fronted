// src/components/erica-evaluations/selection-flow/topic-selection.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  User2, 
  BookOpen, 
  Calendar, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Plus,
  Edit3,
  Save,
  X
} from 'lucide-react';

// Contexts
import { useEricaTopicsContext } from '@/context/EricaTopicsContext';
import { useAcademicWeekContext } from '@/context/AcademicWeeksContext';

// Types
import { User } from '@/types/user';
import { Section } from '@/types/student';
import { Course } from '@/types/courses';
import { EricaTopic } from '@/types/erica-topics';
import { AcademicWeek } from '@/types/academic-week.types';

// ==================== INTERFACES ====================
interface TopicSelectionProps {
  selectedTeacher: User;
  selectedSection: Section;
  selectedCourse: Course;
  selectedTopic: EricaTopic | null;
  onSelect: (topic: EricaTopic) => void;
  isCompleted: boolean;
  onEdit: () => void;
}

interface CreateTopicFormData {
  title: string;
  description: string;
  objectives: string;
  materials: string;
}

// ==================== COMPONENTE ====================
export default function TopicSelection({
  selectedTeacher,
  selectedSection,
  selectedCourse,
  selectedTopic,
  onSelect,
  isCompleted,
  onEdit
}: TopicSelectionProps) {
    const { fetchTopics } = useEricaTopicsContext();
    
  
  // ========== CONTEXTS ==========
const { 
  state: { topics, loading: loadingTopics },
  createTopic,
  updateTopic
} = useEricaTopicsContext();
  
  const { 
    currentWeek 
  } = useAcademicWeekContext();

  // ========== ESTADO LOCAL ==========
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateTopicFormData>({
    title: '',
    description: '',
    objectives: '',
    materials: ''
  });

  // ========== COMPUTED VALUES ==========
  
  // Buscar tema existente para la semana actual
  const existingTopic = useMemo(() => {
    if (!topics || !currentWeek || !selectedCourse || !selectedSection || !selectedTeacher) return null;
    
    return topics.find(topic => 
      topic.courseId === selectedCourse.id &&
      topic.sectionId === selectedSection.id &&
      topic.teacherId === selectedTeacher.id &&
      topic.academicWeekId === currentWeek.id &&
      topic.isActive
    ) || null;
  }, [topics, currentWeek, selectedCourse, selectedSection, selectedTeacher]);

  // Verificar si hay datos suficientes
  const canProceed = useMemo(() => {
    return !!(currentWeek && selectedCourse && selectedSection && selectedTeacher);
  }, [currentWeek, selectedCourse, selectedSection, selectedTeacher]);

  // ========== FUNCIONES ==========
const handleCreateTopic = async () => {
  if (!currentWeek || !selectedCourse || !selectedSection || !selectedTeacher) return;
  
  setIsCreating(true);
  try {
    const result = await createTopic({
      courseId: selectedCourse.id,
      academicWeekId: currentWeek.id!,
      sectionId: selectedSection.id,
      teacherId: selectedTeacher.id,
      title: createFormData.title,
      description: createFormData.description,
      objectives: createFormData.objectives,
      materials: createFormData.materials,
      isActive: true
    });
    
    if (result.success) {
      // Refrescar la lista de temas para obtener el recién creado
      await fetchTopics({
        courseId: selectedCourse.id,
        academicWeekId: currentWeek.id,
        sectionId: selectedSection.id,
        teacherId: selectedTeacher.id
      });
      
      // Buscar el tema recién creado en el estado actualizado
      const newTopic = topics.find(topic => 
        topic.courseId === selectedCourse.id &&
        topic.sectionId === selectedSection.id &&
        topic.teacherId === selectedTeacher.id &&
        topic.academicWeekId === currentWeek.id &&
        topic.title === createFormData.title &&
        topic.isActive
      );
      
      if (newTopic) {
        onSelect(newTopic);
        setShowCreateForm(false);
        setCreateFormData({ title: '', description: '', objectives: '', materials: '' });
      }
    } else {
      console.error('Error creating topic:', result.message);
    }
  } catch (error) {
    console.error('Error creating topic:', error);
  } finally {
    setIsCreating(false);
  }
};

  const handleSelectExistingTopic = () => {
    if (existingTopic) {
      onSelect(existingTopic);
    }
  };

  const handleFormChange = (field: keyof CreateTopicFormData, value: string) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }));
  };

  const cancelCreate = () => {
    setShowCreateForm(false);
    setCreateFormData({ title: '', description: '', objectives: '', materials: '' });
  };

  // ========== VISTA COMPLETADA ==========
  if (isCompleted && selectedTopic) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="font-semibold text-green-800 dark:text-green-200">
              {selectedTopic.title}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <span>Semana {currentWeek?.number}</span>
              {selectedTopic.isCompleted && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    Completado
                  </Badge>
                </>
              )}
            </div>
            {selectedTopic.description && (
              <div className="text-xs text-green-500 dark:text-green-400 mt-1 max-w-md truncate">
                {selectedTopic.description}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
          >
            Cambiar
          </Button>
        </div>
      </div>
    );
  }

  // ========== ESTADOS DE CARGA Y ERROR ==========
  if (loadingTopics) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <FileText className="h-4 w-4" />
          <span>Buscando tema para la semana {currentWeek?.number}...</span>
        </div>
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canProceed) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Faltan datos del contexto académico. Verifique que esté seleccionada la semana académica actual.
        </AlertDescription>
      </Alert>
    );
  }

  // ========== FORMULARIO DE CREACIÓN ==========
  if (showCreateForm) {
    return (
      <div className="space-y-6">
        {/* Header del formulario */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Crear Nuevo Tema
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Semana {currentWeek?.number} • {selectedCourse.name} • Sección {selectedSection.name}
            </p>
          </div>
          <Button 
            onClick={cancelCreate} 
            variant="ghost" 
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Tema *</Label>
            <Input
              id="title"
              value={createFormData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="Ej: Sumas básicas, Coordinación motriz, etc."
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={createFormData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Descripción detallada del tema a desarrollar"
              className="w-full min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Objetivos</Label>
            <Textarea
              id="objectives"
              value={createFormData.objectives}
              onChange={(e) => handleFormChange('objectives', e.target.value)}
              placeholder="Objetivos específicos que se buscan alcanzar"
              className="w-full min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Materiales</Label>
            <Textarea
              id="materials"
              value={createFormData.materials}
              onChange={(e) => handleFormChange('materials', e.target.value)}
              placeholder="Materiales y recursos necesarios"
              className="w-full min-h-[60px]"
            />
          </div>
        </div>

        {/* Botones del formulario */}
        <div className="flex gap-3">
          <Button 
            onClick={handleCreateTopic}
            disabled={!createFormData.title.trim() || isCreating}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isCreating ? 'Creando...' : 'Crear Tema'}
          </Button>
          <Button 
            onClick={cancelCreate}
            variant="outline"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // ========== VISTA PRINCIPAL ==========
  return (
    <div className="space-y-6">
      {/* Info del contexto */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Calendar className="h-4 w-4" />
        <span>
          Semana {currentWeek?.number} • <span className="font-medium">{selectedCourse.name}</span> • 
          Sección <span className="font-medium">{selectedSection.name}</span> • 
          Prof. <span className="font-medium">{selectedTeacher.givenNames} {selectedTeacher.lastNames}</span>
        </span>
      </div>

      {/* Tema existente */}
      {existingTopic ? (
        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] border-2 hover:border-blue-300 dark:hover:border-blue-600"
          onClick={handleSelectExistingTopic}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header del tema */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    {existingTopic.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Semana {currentWeek?.number}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{selectedCourse.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Sección {selectedSection.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {existingTopic.isCompleted && (
                    <Badge variant="secondary" className="text-xs">
                      Completado
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
                    Activo
                  </Badge>
                </div>
              </div>

              {/* Descripción */}
              {existingTopic.description && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción:
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {existingTopic.description}
                  </div>
                </div>
              )}

              {/* Objetivos y materiales en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {existingTopic.objectives && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Objetivos:
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      {existingTopic.objectives}
                    </div>
                  </div>
                )}
                
                {existingTopic.materials && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                      Materiales:
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      {existingTopic.materials}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer con call to action */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Click para seleccionar este tema
                </span>
                <div className="text-blue-600 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // ========== NO HAY TEMA - CREAR NUEVO ==========
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay tema para esta semana
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            No se ha encontrado un tema configurado para la semana {currentWeek?.number} en el curso {selectedCourse.name} de la sección {selectedSection.name}.
          </p>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Nuevo Tema
          </Button>
          
          {/* Info adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-lg mx-auto mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">Sobre los temas semanales:</div>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Cada semana debe tener un tema específico por curso</li>
                  <li>• Los temas permiten organizar las evaluaciones ERICA</li>
                  <li>• Se pueden reutilizar temas en otras secciones</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}