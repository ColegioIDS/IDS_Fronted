// src/app/(admin)/students/[id]/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  StudentDetailView,
} from '@/components/features/students';
import { studentsService } from '@/services/students.service';
import { studentReportService } from '@/services/student-report.service';
import { Student } from '@/types/students.types';
import {
  ArrowLeft,
  Edit2,
  Download,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      await studentReportService.downloadStudentExcel(studentId, {
        includeParents: true,
        includeMedical: true,
        includeAcademic: true,
      });
    } catch (err) {
      alert('Error al descargar el reporte en Excel');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await studentReportService.downloadStudentPdf(studentId, {
        includeParents: true,
        includeMedical: true,
        includeAcademic: true,
      });
    } catch (err) {
      alert('Error al descargar el reporte en PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Cargando información del estudiante...
          </p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
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
              {error || 'Estudiante no encontrado'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Detalle del Estudiante</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {student.givenNames} {student.lastNames}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
              className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 gap-2"
            >
              {downloadingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2"
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              PDF
            </Button>
            <Button
              onClick={() => router.push(`/students/${studentId}/edit`)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Student Detail View */}
        <StudentDetailView student={student} />
      </div>
    </div>
  );
}
