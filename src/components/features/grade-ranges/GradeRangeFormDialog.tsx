// src/components/features/grade-ranges/GradeRangeFormDialog.tsx

import { GradeRange, CreateGradeRangeDto } from "@/types/grade-ranges.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradeRangeForm } from "./GradeRangeForm";

interface GradeRangeFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  gradeRange?: GradeRange;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateGradeRangeDto) => void;
}

export function GradeRangeFormDialog({
  open,
  mode,
  gradeRange,
  onOpenChange,
  onSubmit,
}: GradeRangeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear Nuevo Rango" : "Editar Rango"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define un nuevo rango de calificaciones para tu institución"
              : "Actualiza la información del rango seleccionado"}
          </DialogDescription>
        </DialogHeader>
        <GradeRangeForm
          mode={mode}
          gradeRange={gradeRange}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
