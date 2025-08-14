// components/course-grade/BatchActionsBar.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  BookOpenCheck, 
  Trash2, 
  X,
  Download
} from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
}

/**
 * Batch actions bar for selected course-grade relationships
 * Appears when items are selected, provides bulk operations
 */
export function BatchActionsBar({
  selectedCount,
  onAction,
  onClear,
}: BatchActionsBarProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  if (selectedCount === 0) return null;

  const handleAction = (action: string) => {
    if (action === 'delete') {
      setConfirmAction(action);
    } else {
      onAction(action);
    }
  };

  const confirmAndExecute = () => {
    if (confirmAction) {
      onAction(confirmAction);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Badge variant="secondary" className="flex items-center gap-1">
            {selectedCount} seleccionados
          </Badge>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('makeCore')}
            >
              <BookOpenCheck className="mr-2 h-4 w-4" />
              Hacer Principal
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('makeElective')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Hacer Electiva
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('export')}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction('delete')}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar acción?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'delete' && (
                <>
                  Estás a punto de eliminar {selectedCount} relaciones curso-grado.
                  Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAndExecute}
              className={confirmAction === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

