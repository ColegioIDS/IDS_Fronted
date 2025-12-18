'use client';

import { useState, useEffect } from 'react';
import { useParentStudentLinks } from '@/hooks/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Link as LinkIcon,
  AlertCircle,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

interface ParentStudentLinksDialogProps {
  parentId: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ParentStudentLinksDialog({
  parentId,
  onSuccess,
  trigger,
}: ParentStudentLinksDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    links: children,
    isLoading,
    error,
    fetchParentChildren,
  } = useParentStudentLinks(parentId);

  useEffect(() => {
    if (isOpen && parentId) {
      fetchParentChildren(parentId);
    }
  }, [isOpen, parentId, fetchParentChildren]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-blue-200/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <LinkIcon className="w-4 h-4" />
            Ver Estudiantes
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-blue-500" />
            Estudiantes del Padre
          </DialogTitle>
          <DialogDescription>
            Estudiantes asociados a este padre
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <Alert className="border border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/30">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                Cargando estudiantes...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border border-red-200/50 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/30">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700 dark:text-red-400">
                Error al cargar los estudiantes: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {!error && !isLoading && children.length === 0 && (
            <Alert className="border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
              <AlertCircle className="h-4 w-4 text-slate-400" />
              <AlertDescription className="dark:text-slate-400">
                No hay estudiantes asociados a este padre.
              </AlertDescription>
            </Alert>
          )}

          {!error && children.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Estudiantes ({children.length})
              </h3>

              <div className="grid gap-3">
                {children.map((student) => (
                  <Card key={student.id} className="border border-slate-200/50 dark:border-slate-700/50">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {/* Información del estudiante */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {student.givenNames} {student.lastNames}
                              </h4>
                              <Badge variant="outline" className="bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50">
                                SIRE: {student.codeSIRE}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <div>
                                <span className="font-medium">Género:</span> {student.gender === 'M' || student.gender === 'Masculino' ? 'Masculino' : 'Femenino'}
                              </div>
                              {student.birthDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(student.birthDate).toLocaleDateString('es-ES')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Información del vínculo */}
                        {student.relationshipType && (
                          <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-3">
                            <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              Información del Vínculo:
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              <Badge variant="secondary" className="justify-center">
                                {student.relationshipType}
                              </Badge>
                              {student.isPrimaryContact && (
                                <Badge className="justify-center bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300">
                                  Contacto Principal
                                </Badge>
                              )}
                              {student.hasLegalCustody && (
                                <Badge variant="secondary" className="justify-center">
                                  Custodia Legal
                                </Badge>
                              )}
                              {student.canAccessInfo && (
                                <Badge variant="secondary" className="justify-center">
                                  Acceso a Info
                                </Badge>
                              )}
                              {student.livesWithStudent && (
                                <Badge variant="secondary" className="justify-center">
                                  Convive
                                </Badge>
                              )}
                              {student.financialResponsible && (
                                <Badge variant="secondary" className="justify-center">
                                  Responsable Fin.
                                </Badge>
                              )}
                              {student.receivesSchoolNotices && (
                                <Badge variant="secondary" className="justify-center">
                                  Recibe Avisos
                                </Badge>
                              )}
                            </div>
                            {student.emergencyContactPriority && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                                Prioridad de emergencia: <span className="font-semibold">{student.emergencyContactPriority}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Matrículas */}
                        {student.enrollments && student.enrollments.length > 0 && (
                          <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-3">
                            <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              Matrículas:
                            </h5>
                            <div className="space-y-2">
                              {student.enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="flex items-center gap-2 text-sm p-2 bg-slate-50/50 dark:bg-slate-800/30 rounded">
                                  <Badge 
                                    variant="secondary" 
                                    className={`
                                      ${enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}
                                    `}
                                  >
                                    {enrollment.status}
                                  </Badge>
                                  <span className="text-slate-700 dark:text-slate-300">
                                    {enrollment.grade?.name} - Sección {enrollment.section?.name}
                                  </span>
                                  <span className="ml-auto text-slate-500 dark:text-slate-400">
                                    Ciclo: {typeof enrollment.cycle === 'number' ? enrollment.cycle : enrollment.cycle.academicYear}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
