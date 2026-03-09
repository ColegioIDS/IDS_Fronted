// src/components/features/grade-ranges/GradeRangeForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GradeRange, CreateGradeRangeDto } from "@/types/grade-ranges.types";
import { gradeRangeSchema, defaultValues } from "@/schemas/grade-range";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface GradeRangeFormProps {
  mode: "create" | "edit";
  gradeRange?: GradeRange;
  onSubmit: (data: CreateGradeRangeDto) => void;
  onCancel: () => void;
}

export function GradeRangeForm({
  mode,
  gradeRange,
  onSubmit,
  onCancel,
}: GradeRangeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(gradeRangeSchema),
    defaultValues: gradeRange
      ? {
          name: gradeRange.name,
          description: gradeRange.description,
          minScore: gradeRange.minScore,
          maxScore: gradeRange.maxScore,
          hexColor: gradeRange.hexColor,
          level: gradeRange.level,
          letterGrade: gradeRange.letterGrade,
          isActive: gradeRange.isActive,
        }
      : defaultValues,
  });

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLevel = form.watch("level");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Rango</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Excelente, Muy Bueno, Bueno..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe el desempeño en este rango..." rows={3} {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Score Range */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puntuación Mínima</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puntuación Máxima</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="100" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Color Picker */}
        <FormField
          control={form.control}
          name="hexColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color (Hexadecimal)</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input type="text" placeholder="#0d9488" {...field} />
                </FormControl>
                <div
                  className="w-12 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-700"
                  style={{ backgroundColor: field.value }}
                />
              </div>
              <FormDescription>Formato: #RRGGBB o #RGB</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Level */}
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel Educativo</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Primaria">Primaria</SelectItem>
                  <SelectItem value="Secundaria">Secundaria</SelectItem>
                  <SelectItem value="Preparatoria">Preparatoria</SelectItem>
                  <SelectItem value="all">Aplica a Todos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Letter Grade (only for Preparatoria) */}
        {selectedLevel === "Preparatoria" && (
          <FormField
            control={form.control}
            name="letterGrade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Letra de Calificación</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: MB, B, R, D..." maxLength={2} {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>Usada solo en Preparatoria</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Is Active */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-slate-50 dark:bg-slate-800/50">
              <div className="space-y-0.5">
                <FormLabel>Estado Activo</FormLabel>
                <FormDescription>
                  Los rangos inactivos no aparecen en nuevas configuraciones
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "create" ? "Crear Rango" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
