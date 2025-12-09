// src/app/(admin)/erica-topics/create/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EricaTopicForm } from '@/components/features/erica-topics';
import { ericaTopicsService } from '@/services/erica-topics.service';
import { CreateEricaTopicDto } from '@/types/erica-topics.types';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateEricaTopicPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      setError(null);

      const createData: CreateEricaTopicDto = {
        courseId: values.courseId,
        academicWeekId: values.academicWeekId,
        sectionId: values.sectionId,
        teacherId: values.teacherId,
        title: values.title,
        weekTheme: values.weekTheme,
        description: values.description,
        objectives: values.objectives,
        materials: values.materials,
        isActive: values.isActive,
      };

      const newTopic = await ericaTopicsService.createEricaTopic(createData);
      toast.success('Tema ERICA creado exitosamente', {
        description: `"${createData.title}" ha sido creado correctamente.`,
      });
      router.push('/erica-topics');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear tema';
      setError(errorMsg);
      toast.error('Error al crear tema', {
        description: errorMsg,
      });
      console.error('Error creating topic:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4 md:p-8">
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Crear Nuevo Tema</h1>
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
        <EricaTopicForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
