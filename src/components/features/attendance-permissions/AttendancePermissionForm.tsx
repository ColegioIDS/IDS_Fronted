// src/components/features/attendance-permissions/AttendancePermissionForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Check,
  Shield,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  AttendancePermissionWithRelations,
  CreateAttendancePermissionDto,
  UpdateAttendancePermissionDto,
} from '@/types/attendance-permissions.types';
import { useAttendancePermissions } from '@/hooks/data/useAttendancePermissions';

// Validation schema
const permissionSchema = z.object({
  roleId: z.coerce.number({ message: 'Rol es requerido' }),
  attendanceStatusId: z.coerce.number({ message: 'Estado es requerido' }),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canModify: z.boolean(),
  canDelete: z.boolean(),
  canApprove: z.boolean(),
  canAddJustification: z.boolean(),
  justificationRequired: z.boolean(),
  requiresNotes: z.boolean().optional(),
  minNotesLength: z.coerce.number().nullable().optional(),
  maxNotesLength: z.coerce.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

interface AttendancePermissionFormProps {
  permission?: AttendancePermissionWithRelations | null;
  roles: Array<{ id: number; name: string }>;
  statuses: Array<{ id: number; code: string; name: string }>;
  onSubmit: (data: any) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export const AttendancePermissionForm: React.FC<
  AttendancePermissionFormProps
> = ({
  permission,
  roles,
  statuses,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [showNoteValidation, setShowNoteValidation] = useState(false);

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: permission
      ? {
          roleId: permission.roleId,
          attendanceStatusId: permission.attendanceStatusId,
          canView: permission.canView,
          canCreate: permission.canCreate,
          canModify: permission.canModify,
          canDelete: permission.canDelete,
          canApprove: permission.canApprove,
          canAddJustification: permission.canAddJustification,
          justificationRequired: permission.justificationRequired,
          requiresNotes: permission.requiresNotes,
          minNotesLength: permission.minNotesLength,
          maxNotesLength: permission.maxNotesLength,
          notes: permission.notes,
        }
      : {
          roleId: undefined,
          attendanceStatusId: undefined,
          canView: true,
          canCreate: false,
          canModify: false,
          canDelete: false,
          canApprove: false,
          canAddJustification: false,
          justificationRequired: false,
          requiresNotes: false,
          minNotesLength: null,
          maxNotesLength: null,
          notes: null,
        },
  });

  const requiresNotes = form.watch('requiresNotes');

  const handleFormSubmit = (data: PermissionFormValues) => {
    onSubmit(data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Información Básica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Selecciona el rol y estado de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value))
                      }
                      value={field.value?.toString() || ''}
                      disabled={!!permission}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles && Array.isArray(roles) && roles.length > 0 ? (
                          roles
                            .filter((role) => role?.id !== undefined && role?.id !== null)
                            .map((role, index) => (
                              <SelectItem key={`role-${role.id}`} value={role.id.toString()}>
                                {role?.name || 'Sin nombre'}
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="no-roles" disabled>
                            No hay roles disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendanceStatusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Asistencia</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value))
                      }
                      value={field.value?.toString() || ''}
                      disabled={!!permission}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses && Array.isArray(statuses) && statuses.length > 0 ? (
                          statuses
                            .filter((status) => status?.id !== undefined && status?.id !== null)
                            .map((status, index) => (
                              <SelectItem
                                key={`status-${status.id}`}
                                value={status.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{status?.code || 'N/A'}</Badge>
                                  {status?.name || 'Sin nombre'}
                                </div>
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="no-statuses" disabled>
                            No hay estados disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Permisos de Acción */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                Permisos de Acción
              </CardTitle>
              <CardDescription>
                Define qué acciones puede realizar este rol
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="canView"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 p-3">
                    <div>
                      <FormLabel className="font-medium">Ver</FormLabel>
                      <FormDescription className="text-xs">
                        Ver registros de asistencia
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canCreate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20 p-3">
                    <div>
                      <FormLabel className="font-medium">Crear</FormLabel>
                      <FormDescription className="text-xs">
                        Crear nuevos registros de asistencia
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canModify"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/20 p-3">
                    <div>
                      <FormLabel className="font-medium">Modificar</FormLabel>
                      <FormDescription className="text-xs">
                        Editar registros de asistencia
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canDelete"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20 p-3">
                    <div>
                      <FormLabel className="font-medium">Eliminar</FormLabel>
                      <FormDescription className="text-xs">
                        Eliminar registros de asistencia
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canApprove"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-900/20 p-3">
                    <div>
                      <FormLabel className="font-medium">Aprobar</FormLabel>
                      <FormDescription className="text-xs">
                        Aprobar cambios en asistencia
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canAddJustification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-cyan-200 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-900/20 p-3">
                    <div>
                      <FormLabel className="font-medium">Agregar Justificación</FormLabel>
                      <FormDescription className="text-xs">
                        Agregar justificaciones a registros
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="justificationRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-900/20 p-3">
                    <div>
                      <FormLabel className="font-medium">Justificación Obligatoria</FormLabel>
                      <FormDescription className="text-xs">
                        Se requiere justificación para esta asistencia
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Validación de Notas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Configuración de Notas
              </CardTitle>
              <CardDescription>
                Requerimientos y límites de notas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="requiresNotes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20 p-3">
                    <div>
                      <FormLabel className="font-medium">
                        Requiere Notas
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Se deben incluir notas en este registro
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {requiresNotes && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20">
                  <FormField
                    control={form.control}
                    name="minNotesLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Mínimo de caracteres
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Ej: 10"
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxNotesLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Máximo de caracteres
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Ej: 500"
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Internas</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Comentarios sobre este permiso..."
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {permission ? 'Actualizar' : 'Crear'} Permiso
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
