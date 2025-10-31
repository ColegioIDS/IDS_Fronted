// src/components/features/sections/AssignTeacherDialog.tsx

'use client';

import React, { useState } from 'react';
import { User, UserX, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Section } from '@/types/sections.types';

interface Teacher {
  id: number;
  givenNames: string;
  lastNames: string;
  email?: string;
}

interface AssignTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section | null;
  teachers: Teacher[];
  onAssign: (teacherId: number) => void;
  onRemove: () => void;
  isLoading?: boolean;
}

/**
 * 👨‍🏫 Diálogo para asignar/remover profesor de sección
 */
export function AssignTeacherDialog({
  open,
  onOpenChange,
  section,
  teachers,
  onAssign,
  onRemove,
  isLoading = false,
}: AssignTeacherDialogProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  // Reset selection when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedTeacherId(section?.teacherId?.toString() || '');
    }
  }, [open, section?.teacherId]);

  if (!section) return null;

  const currentTeacher = section.teacher;
  const hasTeacher = !!section.teacherId;
  const selectedTeacherIdNum = selectedTeacherId ? parseInt(selectedTeacherId) : null;

  const handleAssign = () => {
    if (selectedTeacherIdNum) {
      onAssign(selectedTeacherIdNum);
    }
  };

  const handleRemove = () => {
    setSelectedTeacherId('');
    onRemove();
  };

  const isChanged = selectedTeacherIdNum !== section.teacherId;
  const canRemove = hasTeacher;
  const canAssign = selectedTeacherIdNum && isChanged;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Asignar Profesor
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Sección: <span className="font-bold">{section.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profesor actual */}
          {hasTeacher && currentTeacher && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Profesor Actual
              </p>
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-emerald-300 dark:border-emerald-700">
                      <User className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {currentTeacher.givenNames} {currentTeacher.lastNames}
                      </p>
                      {currentTeacher.email && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {currentTeacher.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
                    Asignado
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Sin profesor asignado */}
          {!hasTeacher && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  No hay profesor asignado a esta sección
                </p>
              </div>
            </div>
          )}

          {/* Selector de profesor */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 dark:text-white">
              {hasTeacher ? 'Cambiar Profesor' : 'Seleccionar Profesor'}
            </label>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un profesor..." />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span>
                        {teacher.givenNames} {teacher.lastNames}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Indicador de cambio */}
          {isChanged && selectedTeacherIdNum && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {hasTeacher ? 'Se cambiará el profesor asignado' : 'Se asignará un nuevo profesor'}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {/* Botón remover (solo si hay profesor) */}
          {canRemove && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemove}
              disabled={isLoading}
              className="mr-auto"
            >
              <UserX className="h-4 w-4 mr-2" />
              Remover Profesor
            </Button>
          )}

          {/* Botón cancelar */}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>

          {/* Botón asignar */}
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!canAssign || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
          >
            <User className="h-4 w-4 mr-2" />
            {isLoading ? 'Asignando...' : hasTeacher ? 'Cambiar Profesor' : 'Asignar Profesor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
