// src/components/enrollments/EnrollmentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { X, Save, Loader2, User, GraduationCap, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { EnrollmentFormDataResponse, EnrollmentDetailResponse } from '@/types/enrollment.types';

// ==================== INTERFACES ====================

interface EnrollmentModalProps {
  isOpen: boolean;
  enrollment?: EnrollmentDetailResponse | null;
  formData: EnrollmentFormDataResponse;
  isSubmitting?: boolean;
  onClose: () => void;
  onSave: (data: EnrollmentFormData) => void;
}

interface EnrollmentFormData {
  studentId: number;
  cycleId: number;
  gradeId: number;
  sectionId: number;
  status: string;
}

// ==================== COMPONENT ====================

export function EnrollmentModal({
  isOpen,
  enrollment,
  formData,
  isSubmitting = false,
  onClose,
  onSave
}: EnrollmentModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Form state
  const [formValues, setFormValues] = useState<EnrollmentFormData>({
    studentId: 0,
    cycleId: formData.activeCycle.id,
    gradeId: 0,
    sectionId: 0,
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedGrade, setSelectedGrade] = useState<number>(0);

  // ==================== EFFECTS ====================

  // Inicializar formulario
  useEffect(() => {
    if (enrollment) {
      // Modo edición
      setFormValues({
        studentId: enrollment.studentId,
        cycleId: enrollment.cycleId,
        gradeId: enrollment.gradeId,
        sectionId: enrollment.sectionId,
        status: enrollment.status
      });
      setSelectedGrade(enrollment.gradeId);
    } else {
      // Modo creación
      setFormValues({
        studentId: 0,
        cycleId: formData.activeCycle.id,
        gradeId: 0,
        sectionId: 0,
        status: 'active'
      });
      setSelectedGrade(0);
    }
    setErrors({});
  }, [enrollment, formData.activeCycle.id, isOpen]);

  // ==================== COMPUTED VALUES ====================

  // Obtener estudiantes disponibles (no matriculados)
  const availableStudents = enrollment 
    ? formData.students // En edición, mostrar todos
    : formData.students.filter(s => !s.isEnrolled);

  // Obtener secciones del grado seleccionado
  const availableSections = selectedGrade > 0
    ? formData.grades
        .find(g => g.id === selectedGrade)
        ?.sections.filter(s => s.availableSpots > 0 || enrollment?.sectionId === s.id) || []
    : [];

  // Obtener datos del estudiante seleccionado
  const selectedStudent = formData.students.find(s => s.id === formValues.studentId);

  // ==================== HANDLERS ====================

  const handleGradeChange = (gradeId: string) => {
    const newGradeId = parseInt(gradeId);
    setSelectedGrade(newGradeId);
    setFormValues(prev => ({
      ...prev,
      gradeId: newGradeId,
      sectionId: 0 // Reset sección
    }));
    setErrors(prev => ({ ...prev, gradeId: '', sectionId: '' }));
  };

  const handleSectionChange = (sectionId: string) => {
    setFormValues(prev => ({
      ...prev,
      sectionId: parseInt(sectionId)
    }));
    setErrors(prev => ({ ...prev, sectionId: '' }));
  };

  const handleStudentChange = (studentId: string) => {
    setFormValues(prev => ({
      ...prev,
      studentId: parseInt(studentId)
    }));
    setErrors(prev => ({ ...prev, studentId: '' }));
  };

  const handleStatusChange = (status: string) => {
    setFormValues(prev => ({
      ...prev,
      status
    }));
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formValues.studentId) {
      newErrors.studentId = 'Debe seleccionar un estudiante';
    }

    if (!formValues.gradeId) {
      newErrors.gradeId = 'Debe seleccionar un grado';
    }

    if (!formValues.sectionId) {
      newErrors.sectionId = 'Debe seleccionar una sección';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar guardado
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formValues);
  };

  // Obtener initials para avatar
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // ==================== RENDER ====================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
      }`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-xl ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <User className="h-5 w-5 text-blue-600" />
            {enrollment ? 'Editar Matrícula' : 'Nueva Matrícula'}
          </DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {enrollment 
              ? 'Actualiza la información de la matrícula del estudiante'
              : 'Registra un nuevo estudiante en el ciclo escolar actual'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Ciclo Escolar (Read-only) */}
          <div className="space-y-2">
            <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <Calendar className="h-4 w-4 inline mr-2" />
              Ciclo Escolar
            </Label>
            <div className={`p-3 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-200 text-gray-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{formData.activeCycle.name}</span>
                <Badge variant="outline" className={
                  isDark 
                    ? 'bg-green-900/30 text-green-400 border-green-800'
                    : 'bg-green-50 text-green-700 border-green-200'
                }>
                  Activo
                </Badge>
              </div>
            </div>
          </div>

          {/* Selección de Estudiante */}
          <div className="space-y-2">
            <Label htmlFor="student" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <User className="h-4 w-4 inline mr-2" />
              Estudiante *
            </Label>
            <Select
              value={formValues.studentId.toString()}
              onValueChange={handleStudentChange}
              disabled={!!enrollment} // No cambiar estudiante en edición
            >
              <SelectTrigger 
                id="student"
                className={`${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } ${errors.studentId ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder="Seleccione un estudiante" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                {availableStudents.map(student => (
                  <SelectItem 
                    key={student.id} 
                    value={student.id.toString()}
                    className={isDark ? 'focus:bg-gray-700' : ''}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={student.profilePicture || ''} />
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {getInitials(student.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{student.fullName}</span>
                      {student.codeSIRE && (
                        <span className="text-xs text-gray-500">
                          ({student.codeSIRE})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studentId && (
              <p className="text-sm text-red-600">{errors.studentId}</p>
            )}
            {selectedStudent && (
              <div className={`p-3 rounded-lg border flex items-center gap-3 ${
                isDark 
                  ? 'bg-blue-900/20 border-blue-800' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedStudent.profilePicture || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {getInitials(selectedStudent.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedStudent.fullName}
                  </p>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {selectedStudent.codeSIRE || 'Sin código SIRE'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Selección de Grado */}
          <div className="space-y-2">
            <Label htmlFor="grade" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <GraduationCap className="h-4 w-4 inline mr-2" />
              Grado *
            </Label>
            <Select
              value={selectedGrade.toString()}
              onValueChange={handleGradeChange}
            >
              <SelectTrigger 
                id="grade"
                className={`${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } ${errors.gradeId ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder="Seleccione un grado" />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                {formData.grades.map(grade => (
                  <SelectItem 
                    key={grade.id} 
                    value={grade.id.toString()}
                    className={isDark ? 'focus:bg-gray-700' : ''}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{grade.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {grade.level}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gradeId && (
              <p className="text-sm text-red-600">{errors.gradeId}</p>
            )}
          </div>

          {/* Selección de Sección */}
          <div className="space-y-2">
            <Label htmlFor="section" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              <Users className="h-4 w-4 inline mr-2" />
              Sección *
            </Label>
            <Select
              value={formValues.sectionId.toString()}
              onValueChange={handleSectionChange}
              disabled={!selectedGrade}
            >
              <SelectTrigger 
                id="section"
                className={`${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } ${errors.sectionId ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder={
                  selectedGrade 
                    ? "Seleccione una sección" 
                    : "Primero seleccione un grado"
                } />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                {availableSections.map(section => (
                  <SelectItem 
                    key={section.id} 
                    value={section.id.toString()}
                    disabled={section.availableSpots === 0 && enrollment?.sectionId !== section.id}
                    className={isDark ? 'focus:bg-gray-700' : ''}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>Sección {section.name}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge 
                          variant="outline" 
                          className={
                            section.availableSpots > 5
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : section.availableSpots > 0
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }
                        >
                          {section.availableSpots}/{section.capacity} disponibles
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sectionId && (
              <p className="text-sm text-red-600">{errors.sectionId}</p>
            )}
            {availableSections.length === 0 && selectedGrade > 0 && (
              <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                No hay secciones disponibles para este grado
              </p>
            )}
          </div>

          {/* Estado (solo en edición) */}
          {enrollment && (
            <div className="space-y-2">
              <Label htmlFor="status" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Estado
              </Label>
              <Select
                value={formValues.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger 
                  id="status"
                  className={isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  }
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
                  <SelectItem value="active" className={isDark ? 'focus:bg-gray-700' : ''}>
                    Activo
                  </SelectItem>
                  <SelectItem value="graduated" className={isDark ? 'focus:bg-gray-700' : ''}>
                    Graduado
                  </SelectItem>
                  <SelectItem value="transferred" className={isDark ? 'focus:bg-gray-700' : ''}>
                    Transferido
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className={isDark ? 'border-gray-600 hover:bg-gray-700' : ''}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {enrollment ? 'Actualizar' : 'Crear Matrícula'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}