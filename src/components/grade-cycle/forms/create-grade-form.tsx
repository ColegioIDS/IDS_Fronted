// ==========================================
// src/components/grade-cycle/forms/create-grade-form.tsx
// ==========================================

"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gradeSchema, type GradeFormValues, defaultValues } from '@/schemas/grade';
import { useGradeForm } from '@/context/GradeContext';
import { X, Save } from 'lucide-react';

interface CreateGradeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateGradeForm({ onSuccess, onCancel }: CreateGradeFormProps) {
  const { handleSubmit: handleGradeSubmit, submitting } = useGradeForm();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues
  });

  const onSubmit = async (data: GradeFormValues) => {
    try {
      const result = await handleGradeSubmit(data);
      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating grade:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Crear Nuevo Grado</span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Agregue un nuevo grado académico a su institución
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Grado</Label>
              <Input
                id="name"
                placeholder="ej: Primero Básico"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nivel Educativo</Label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kinder">Kinder</SelectItem>
                      <SelectItem value="Primaria">Primaria</SelectItem>
                      <SelectItem value="Secundaria">Secundaria</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                min="1"
                placeholder="1"
                {...register('order', { valueAsNumber: true })}
              />
              {errors.order && (
                <p className="text-sm text-red-500">{errors.order.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <Label htmlFor="isActive">Grado Activo</Label>
                <p className="text-xs text-muted-foreground">
                  El grado estará disponible para uso
                </p>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="min-w-[120px]"
            >
              {submitting ? "Creando..." : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Grado
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}