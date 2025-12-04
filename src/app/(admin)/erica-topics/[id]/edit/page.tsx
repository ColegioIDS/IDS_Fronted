// src/app/(admin)/erica-topics/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EricaTopicForm } from '@/components/features/erica-topics';
import { ericaTopicsService } from '@/services/erica-topics.service';
import { EricaTopicWithRelations, UpdateEricaTopicDto } from '@/types/erica-topics.types';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditEricaTopicPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEricaTopicPage({ params }: EditEricaTopicPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const topicId = parseInt(unwrappedParams.id);
  const [topic, setTopic] = useState<EricaTopicWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      setError(null);

      const updateData: UpdateEricaTopicDto = {
        title: values.title,
        weekTheme: values.weekTheme,
        description: values.description,
        objectives: values.objectives,
        materials: values.materials,
        isActive: values.isActive,
        isCompleted: values.isCompleted,
      };

      await ericaTopicsService.updateEricaTopic(topicId, updateData);
      alert('Tema ERICA actualizado exitosamente');
      router.push(`/erica-topics/${topicId}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar tema';
      setError(errorMsg);
      console.error('Error updating topic:', err);
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            size="icon"
            className="border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Temas ERICA</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Editar: {topic.title}
            </h1>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <EricaTopicForm
          onSubmit={handleSubmit}
          loading={submitting}
          isEdit={true}
          defaultValues={{
            courseId: topic.courseId,
            academicWeekId: topic.academicWeekId,
            sectionId: topic.sectionId,
            teacherId: topic.teacherId,
            title: topic.title,
            weekTheme: topic.weekTheme,
            description: topic.description,
            objectives: topic.objectives,
            materials: topic.materials,
            isActive: topic.isActive,
            isCompleted: topic.isCompleted,
          }}
        />
      </div>
    </div>
  );
}
