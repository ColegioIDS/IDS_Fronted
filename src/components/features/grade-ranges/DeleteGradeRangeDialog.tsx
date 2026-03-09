// src/components/features/grade-ranges/DeleteGradeRangeDialog.tsx

import { GradeRange } from "@/types/grade-ranges.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteGradeRangeDialogProps {
  open: boolean;
  gradeRange?: GradeRange;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteGradeRangeDialog({
  open,
  gradeRange,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteGradeRangeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar el rango "<strong>{gradeRange?.name}</strong>"?
            <br />
            <br />
            <strong className="text-red-600 dark:text-red-400">
              Esta acción es irreversible.
            </strong>
            {" "}Si este rango está siendo utilizado en calificaciones, puede haber un error.
            Se recomienda desactivarlo en lugar de eliminarlo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3">
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
