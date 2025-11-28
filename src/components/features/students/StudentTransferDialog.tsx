// src/components/features/students/StudentTransferDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { studentsService } from '@/services/students.service';
import { toast } from 'sonner';
import { Student, Enrollment } from '@/types/students.types';

interface StudentTransferDialogProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TransferData {
  cycles: any[];
  grades: any[];
  sections: any[];
}

export const StudentTransferDialog: React.FC<StudentTransferDialogProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  const currentEnrollment = student?.enrollments?.[0];

  useEffect(() => {
    if (isOpen && student) {
      loadTransferData();
    }
  }, [isOpen, student]);

  const loadTransferData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentsService.getEnrollmentFormData();
      setTransferData(data);

      // Pre-select current values
      if (currentEnrollment) {
        setSelectedCycleId(currentEnrollment.cycleId.toString());
        setSelectedGradeId(currentEnrollment.gradeId.toString());
        setSelectedSectionId(currentEnrollment.sectionId.toString());
      }
    } catch (err: any) {
      setError('Error al cargar datos de transferencia');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      if (
        !selectedCycleId ||
        !selectedGradeId ||
        !selectedSectionId ||
        !student?.id
      ) {
        setError('Por favor selecciona ciclo, grado y sección');
        return;
      }

      // Validar que sea diferente a la inscripción actual
      if (
        currentEnrollment &&
        parseInt(selectedCycleId) === currentEnrollment.cycleId &&
        parseInt(selectedGradeId) === currentEnrollment.gradeId &&
        parseInt(selectedSectionId) === currentEnrollment.sectionId
      ) {
        setError('Debes seleccionar una sección diferente a la actual');
        return;
      }

      setTransferring(true);
      await studentsService.transferStudent(student.id, {
        newSectionId: parseInt(selectedSectionId),
        newGradeId: parseInt(selectedGradeId),
        cycleId: parseInt(selectedCycleId),
      });

      toast.success('Estudiante transferido correctamente');

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || 'Error al transferir el estudiante';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setTransferring(false);
    }
  };

  if (!student) return null;

  const currentSection = transferData?.sections?.find(
    (s: any) => s.id === currentEnrollment?.sectionId
  );
  const newSection = transferData?.sections?.find(
    (s: any) => s.id === parseInt(selectedSectionId)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Transferir Estudiante
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {student.givenNames} {student.lastNames}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-600 dark:text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 py-4">
          {/* Current Enrollment */}
          {currentEnrollment && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Inscripción Actual
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Ciclo</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {currentEnrollment.cycle?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Grado</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {currentEnrollment.section?.grade?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Sección</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {currentEnrollment.section?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Transfer Form */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cycle Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ciclo Escolar
                </label>
                <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Selecciona un ciclo" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferData?.cycles?.map((cycle: any) => (
                      <SelectItem key={cycle.id} value={cycle.id.toString()}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grade Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grado
                </label>
                <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Selecciona un grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferData?.grades?.map((grade: any) => (
                      <SelectItem key={grade.id} value={grade.id.toString()}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sección
                </label>
                <Select
                  value={selectedSectionId}
                  onValueChange={setSelectedSectionId}
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Selecciona una sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferData?.sections?.map((section: any) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.name} (Grado: {section.grade?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Preview */}
          {newSection && newSection.id !== currentEnrollment?.sectionId && (
            <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Será transferido a:
                    </p>
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {newSection.name} - Grado:{' '}
                    {newSection.grade?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={transferring}
            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={
              transferring ||
              !selectedCycleId ||
              !selectedGradeId ||
              !selectedSectionId
            }
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {transferring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transfiriendo...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Confirmar Transferencia
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
