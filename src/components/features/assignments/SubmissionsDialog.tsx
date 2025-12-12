/**
 * Componente SubmissionsDialog
 * Modal para ver todas las entregas de una tarea
 */

'use client';

import { FC, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SubmissionsTable } from './SubmissionsTable';
import { GradeStudentsDialog } from './GradeStudentsDialog';
import { FileText, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubmissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: number;
  assignmentTitle: string;
  dueDate: Date;
  maxScore: number;
  courseId: number;
  sectionId: number;
}

type TabType = 'submissions' | 'grade';

export const SubmissionsDialog: FC<SubmissionsDialogProps> = ({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle,
  dueDate,
  maxScore,
  courseId,
  sectionId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('submissions');
  const [isGradeStudentsOpen, setIsGradeStudentsOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="mb-8 flex h-[calc(100vh-2rem)] min-w-[calc(100vw-2rem)] flex-col justify-between gap-0 p-0 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
          {/* Título oculto para accesibilidad */}
          <DialogTitle className="sr-only">Entregas - {assignmentTitle}</DialogTitle>
          
          {/* HEADER */}
          <div className="border-b border-gray-200 dark:border-gray-800 px-6 pt-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Entregas - {assignmentTitle}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Gestiona y califica las entregas de esta tarea
            </p>
          </div>

          <ScrollArea className="flex flex-col overflow-hidden flex-1">
          {/* TABS */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
            <Button
              variant={activeTab === 'submissions' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => setActiveTab('submissions')}
            >
              <FileText className="h-4 w-4" />
              Entregas
            </Button>
            <Button
              variant={activeTab === 'grade' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => {
                setActiveTab('grade');
                setIsGradeStudentsOpen(true);
              }}
            >
              <PenSquare className="h-4 w-4" />
              Calificar
            </Button>
          </div>

          {/* CONTENIDO */}
          <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'submissions' && (
              <SubmissionsTable
                assignmentId={assignmentId}
                assignmentTitle={assignmentTitle}
                dueDate={dueDate}
                maxScore={maxScore}
              />
            )}
          </div>
        </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO PARA CALIFICAR ESTUDIANTES */}
      <GradeStudentsDialog
        open={isGradeStudentsOpen}
        onOpenChange={(newOpen) => {
          setIsGradeStudentsOpen(newOpen);
          if (!newOpen) setActiveTab('submissions');
        }}
        assignmentId={assignmentId}
        assignmentTitle={assignmentTitle}
        maxScore={maxScore}
        sectionId={sectionId}
      />
    </>
  );
};
