// src/app/(admin)/erica-topics/[id]/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ericaTopicsService } from '@/services/erica-topics.service';
import { EricaTopicWithRelations } from '@/types/erica-topics.types';
import {
  ArrowLeft,
  Edit2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EricaTopicDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EricaTopicDetailPage({ params }: EricaTopicDetailPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const topicId = parseInt(unwrappedParams.id);
  const [topic, setTopic] = useState<EricaTopicWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(topicId)) {
      setError('ID de tema inválido');
      setLoading(false);
      return;
    }

    const loadTopic = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ericaTopicsService.getEricaTopicById(topicId);
        setTopic(data);
      } catch (err: any) {
        setError('Error al cargar los datos del tema');
      } finally {
        setLoading(false);
      }
    };

    loadTopic();
  }, [topicId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Cargando tema ERICA...
          </p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6 border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error || 'Tema no encontrado'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tema ERICA</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {topic.title}
              </h1>
            </div>
          </div>

          <Button
            onClick={() => router.push(`/erica-topics/${topicId}/edit`)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full md:w-auto"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <Badge
                  className={
                    topic.isActive
                      ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }
                >
                  {topic.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
                <Badge
                  className={
                    topic.isCompleted
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }
                >
                  {topic.isCompleted ? 'Completado' : 'En Progreso'}
                </Badge>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Creado {new Date(topic.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
          </Card>

          {/* Theme */}
          <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Tema de la Semana
              </h3>
              <p className="text-lg text-slate-900 dark:text-white">{topic.weekTheme}</p>
            </div>
          </Card>

          {/* Description */}
          {topic.description && (
            <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Descripción
                </h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {topic.description}
                </p>
              </div>
            </Card>
          )}

          {/* Objectives */}
          {topic.objectives && (
            <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Objetivos de Aprendizaje
                </h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {topic.objectives}
                </p>
              </div>
            </Card>
          )}

          {/* Materials */}
          {topic.materials && (
            <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Materiales y Recursos
                </h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {topic.materials}
                </p>
              </div>
            </Card>
          )}

          {/* Related Data */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Información Relacionada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.course && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Curso</p>
                  <p className="text-slate-900 dark:text-white mt-1">
                    {topic.course.name} {topic.course.code && `(${topic.course.code})`}
                  </p>
                </div>
              )}
              {topic.teacher && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Docente</p>
                  <p className="text-slate-900 dark:text-white mt-1">
                    {topic.teacher.givenNames} {topic.teacher.lastNames}
                  </p>
                </div>
              )}
              {topic.section && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sección</p>
                  <p className="text-slate-900 dark:text-white mt-1">{topic.section.name}</p>
                </div>
              )}
              {topic.academicWeek && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Semana Académica
                  </p>
                  <p className="text-slate-900 dark:text-white mt-1">
                    Semana {topic.academicWeek.number} ({' '}
                    {new Date(topic.academicWeek.startDate).toLocaleDateString('es-ES')} -{' '}
                    {new Date(topic.academicWeek.endDate).toLocaleDateString('es-ES')})
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
