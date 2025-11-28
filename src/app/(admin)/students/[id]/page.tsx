// src/app/(admin)/students/[id]/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  StudentDetailDialog,
  StudentTransferDialog,
} from '@/components/features/students';
import { studentsService } from '@/services/students.service';
import { Student } from '@/types/students.types';
import {
  ArrowLeft,
  Edit2,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

interface StudentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const studentId = parseInt(unwrappedParams.id);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(true);

  useEffect(() => {
    if (isNaN(studentId)) {
      setError('ID de estudiante inválido');
      setLoading(false);
      return;
    }

    const loadStudent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await studentsService.getStudentById(studentId);
        setStudent(data);
      } catch (err: any) {
        setError('Error al cargar los datos del estudiante');
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando información del estudiante...
          </p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6 border-gray-300 dark:border-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error || 'Estudiante no encontrado'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-gray-300 dark:border-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {student.givenNames} {student.lastNames}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                SIRE: {student.codeSIRE || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsTransferDialogOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Transferir
            </Button>
            <Button
              onClick={() =>
                router.push(`/(admin)/students/${studentId}/edit`)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Detail Card */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6">
          <StudentDetailDialog
            student={student}
            isOpen={isDetailDialogOpen}
            onClose={() => {
              setIsDetailDialogOpen(false);
              router.back();
            }}
            isEditing={false}
          />
        </Card>

        {/* Transfer Dialog */}
        <StudentTransferDialog
          student={student}
          isOpen={isTransferDialogOpen}
          onClose={() => setIsTransferDialogOpen(false)}
          onSuccess={() => {
            setIsTransferDialogOpen(false);
            // Recargar datos
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
