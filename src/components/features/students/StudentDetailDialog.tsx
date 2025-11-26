import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Student } from '@/types/students.types';
import {
  User,
  Heart,
  Users,
  BookOpen,
  Image,
  BarChart3,
  X,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StudentDetailDialogProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  onSave?: (student: Student) => Promise<void>;
}

export const StudentDetailDialog: React.FC<StudentDetailDialogProps> = ({
  student,
  isOpen,
  onClose,
  isEditing = false,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (onSave && student) {
      setIsSaving(true);
      try {
        await onSave(student);
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!student) return null;

  const fullName = `${student.givenNames} ${student.lastNames}`;
  const codeSIRE = student.codeSIRE || 'N/A';
  const enrollment = student.enrollments?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {fullName}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            SIRE: {codeSIRE}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800 p-1">
            <TabsTrigger
              value="info"
              className="flex items-center gap-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="medical"
              className="flex items-center gap-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Médica</span>
            </TabsTrigger>
            <TabsTrigger
              value="parents"
              className="flex items-center gap-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Padres</span>
            </TabsTrigger>
            <TabsTrigger
              value="enrollment"
              className="flex items-center gap-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Inscripción</span>
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex items-center gap-2 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Nombre Completo
                  </label>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {fullName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Código SIRE
                  </label>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {codeSIRE}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Fecha de Nacimiento
                  </label>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                    {student.birthDate
                      ? new Date(student.birthDate).toLocaleDateString('es-MX')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Género
                  </label>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                    {student.gender || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Lugar de Nacimiento
                  </label>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                    {student.birthPlace || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Nacionalidad
                  </label>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                    {student.nationality || 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Medical Tab */}
          <TabsContent value="medical" className="space-y-4 mt-4">
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {student.medicalInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ¿Tiene Enfermedad?
                    </label>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                      {student.medicalInfo.hasDisease ? 'Sí' : 'No'}
                    </p>
                  </div>
                  {student.medicalInfo.hasDisease && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Detalles de Enfermedad
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {student.medicalInfo.diseaseDetails || 'N/A'}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ¿Toma Medicamento?
                    </label>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                      {student.medicalInfo.takesMedication ? 'Sí' : 'No'}
                    </p>
                  </div>
                  {student.medicalInfo.takesMedication && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Detalles de Medicamento
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {student.medicalInfo.medicationDetails || 'N/A'}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ¿Tiene Alergias?
                    </label>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                      {student.medicalInfo.hasAllergies ? 'Sí' : 'No'}
                    </p>
                  </div>
                  {student.medicalInfo.hasAllergies && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Detalles de Alergias
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {student.medicalInfo.allergiesDetails || 'N/A'}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ¿Tiene Discapacidad de Aprendizaje?
                    </label>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                      {student.medicalInfo.hasLearningDisability ? 'Sí' : 'No'}
                    </p>
                  </div>
                  {student.medicalInfo.hasLearningDisability && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Detalles de Discapacidad
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {student.medicalInfo.disabilityDetails || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                  No hay información médica registrada
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Parents Tab */}
          <TabsContent value="parents" className="space-y-4 mt-4">
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {student.parents && student.parents.length > 0 ? (
                <div className="space-y-4">
                  {student.parents.map((parentLink, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      {parentLink.parent && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Relación
                            </label>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                              {parentLink.relationshipType}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Nombre
                            </label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                              {parentLink.parent.givenNames} {parentLink.parent.lastNames}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Teléfono
                            </label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                              {parentLink.parent.phone || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Email
                            </label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                              {parentLink.parent.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                  No hay datos de padres registrados
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Enrollment Tab */}
          <TabsContent value="enrollment" className="space-y-4 mt-4">
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {enrollment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ciclo
                    </label>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                      {enrollment.cycle?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Grado
                    </label>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                      {enrollment.section?.grade?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Sección
                    </label>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                      {enrollment.section?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Estado
                    </label>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                      {enrollment.status || 'Activo'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                  No hay inscripción registrada
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4 mt-4">
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Fecha de Registro
                  </label>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                    {student.createdAt
                      ? new Date(student.createdAt).toLocaleDateString('es-MX')
                      : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Última Actualización
                  </label>
                  <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                    {student.updatedAt
                      ? new Date(student.updatedAt).toLocaleDateString('es-MX')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
          {isEditing && onSave && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
