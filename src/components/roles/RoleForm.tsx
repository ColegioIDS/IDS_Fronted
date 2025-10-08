'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRole, useCreateRole, useUpdateRole } from '@/hooks/useRoles';
import { usePermissionsForSelector } from '@/hooks/usePermissions';
import { createRoleSchema, defaultRoleValues } from '@/schemas/roles';
import { RoleFormValues, RolePermissionWithScope } from '@/types/roles';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Loader2, Save, X, Shield, Info, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface RoleFormProps {
  editingId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RoleForm({ editingId, onSuccess, onCancel }: RoleFormProps) {

  const [backendError, setBackendError] = useState<string | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: defaultRoleValues,
  });



  const { data: roleData, isLoading: loadingRole } = useRole(editingId, !!editingId);
  const { data: permissionsData, isLoading: loadingPermissions } = usePermissionsForSelector(true);

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const isEditMode = !!editingId;
  const isSubmitting = createRole.isPending || updateRole.isPending;

  // Cargar datos del rol
  useEffect(() => {
    if (roleData && isEditMode) {
      form.reset({
        name: roleData.name,
        description: roleData.description || null,
        // ✨ CAMBIO: Usar assignedScope del backend
        permissions: roleData.permissions.map((p) => ({
          permissionId: p.id,
          scope: p.assignedScope || 'all', // ✨ Usar assignedScope
        })),
        isActive: roleData.isActive,
      });
    } else if (!isEditMode) {
      form.reset(defaultRoleValues);
    }
  }, [roleData, isEditMode, form]);

  const onSubmit = async (data: RoleFormValues) => {
    try {
      setBackendError(null); // ✨ Limpiar error anterior

      if (isEditMode) {
        await updateRole.mutateAsync({ id: editingId, data });
      } else {
        await createRole.mutateAsync(data);
      }
      form.reset();
      onSuccess();
    } catch (error: any) {
      // ✨ Capturar y mostrar error del backend
      const errorMessage = error?.response?.data?.message || 'Error al guardar rol';
      setBackendError(errorMessage);
      console.error('Error de validación:', error);
    }
  };

  // Agrupar permisos por módulo
  const permissionsByModule = permissionsData?.data.reduce((acc, permission) => {
    const module = permission.module;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, typeof permissionsData.data>);

  // ✨ NUEVO: Helper para verificar si un permiso está seleccionado
  const isPermissionSelected = (permissionId: number): boolean => {
    const permissions = form.watch('permissions') || [];
    return permissions.some((p) => p.permissionId === permissionId);
  };

  // ✨ NUEVO: Helper para obtener el scope de un permiso
  const getPermissionScope = (permissionId: number): 'all' | 'own' | 'grade' => {
    const permissions = form.watch('permissions') || [];
    const permission = permissions.find((p) => p.permissionId === permissionId);
    return permission?.scope || 'all';
  };

  // ✨ NUEVO: Toggle permiso individual con scope
  const togglePermission = (permissionId: number, checked: boolean) => {
    const currentPermissions = form.getValues('permissions') || [];

    if (checked) {
      // Agregar con scope 'all' por defecto
      form.setValue('permissions', [
        ...currentPermissions,
        { permissionId, scope: 'all' as const },
      ]);
    } else {
      // Remover
      form.setValue(
        'permissions',
        currentPermissions.filter((p) => p.permissionId !== permissionId)
      );
    }
  };

  // ✨ NUEVO: Cambiar scope de un permiso
  const updatePermissionScope = (
    permissionId: number,
    scope: 'all' | 'own' | 'grade'
  ) => {
    const currentPermissions = form.getValues('permissions') || [];
    form.setValue(
      'permissions',
      currentPermissions.map((p) =>
        p.permissionId === permissionId ? { ...p, scope } : p
      )
    );
  };

  // Toggle módulo completo
  const toggleModulePermissions = (module: string, checked: boolean) => {
    const modulePermissions = permissionsByModule?.[module] || [];
    const currentPermissions = form.getValues('permissions') || [];

    if (checked) {
      // Agregar todos los permisos del módulo con scope 'all'
      const moduleIds = modulePermissions.map((p) => p.id);
      const existingIds = currentPermissions.map((p) => p.permissionId);
      const newPermissions = moduleIds
        .filter((id) => !existingIds.includes(id))
        .map((id) => ({ permissionId: id, scope: 'all' as const }));

      form.setValue('permissions', [...currentPermissions, ...newPermissions]);
    } else {
      // Remover todos los permisos del módulo
      const moduleIds = modulePermissions.map((p) => p.id);
      form.setValue(
        'permissions',
        currentPermissions.filter((p) => !moduleIds.includes(p.permissionId))
      );
    }
  };

  const isModuleFullySelected = (module: string): boolean => {
    const modulePermissions = permissionsByModule?.[module] || [];
    return (
      modulePermissions.length > 0 &&
      modulePermissions.every((p) => isPermissionSelected(p.id))
    );
  };

  // ✨ NUEVO: Información sobre scopes
  const ScopeInfo = () => (
    <Alert className="mb-4">
      <Info className="w-4 h-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">Tipos de Scope:</p>
          <ul className="text-sm space-y-1 ml-4">
            <li>
              <Badge variant="outline" className="mr-2">
                all
              </Badge>
              Acceso completo a todos los registros
            </li>
            <li>
              <Badge variant="outline" className="mr-2">
                own
              </Badge>
              Solo registros asignados al usuario (ej: estudiantes de su sección)
            </li>
            <li>
              <Badge variant="outline" className="mr-2">
                grade
              </Badge>
              Solo registros de su grado (ej: todos los estudiantes del grado)
            </li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );

  if (loadingRole) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isEditMode ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isEditMode
                  ? 'Modifica la información y permisos del rol'
                  : 'Define el nombre, descripción y permisos con scopes para el nuevo rol'}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>


      {backendError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{backendError}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Define el nombre y descripción del rol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Rol *</FormLabel>
                    <FormControl>
                      <Input placeholder="ej: Editor, Moderador, Supervisor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe las responsabilidades y alcance de este rol..."
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Ayuda a otros usuarios a entender para qué sirve este rol
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Estado del Rol</FormLabel>
                      <FormDescription>
                        Los roles inactivos no pueden ser asignados a usuarios
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Permisos */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Permisos del Rol</CardTitle>
              <CardDescription>
                Selecciona qué acciones puede realizar este rol y define el alcance (scope) de cada
                permiso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScopeInfo />

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    {loadingPermissions ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                      </div>
                    ) : permissionsByModule && Object.keys(permissionsByModule).length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          No hay permisos disponibles en el sistema
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        {permissionsByModule &&
                          Object.entries(permissionsByModule).map(([module, permissions]) => {
                            const allSelected = isModuleFullySelected(module);
                            const someSelected = permissions.some((p) =>
                              isPermissionSelected(p.id)
                            );
                            const selectedCount = permissions.filter((p) =>
                              isPermissionSelected(p.id)
                            ).length;

                            return (
                              <div
                                key={module}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-base font-semibold capitalize text-gray-900 dark:text-gray-100">
                                    {module}
                                  </h4>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {selectedCount} / {permissions.length} seleccionados
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={(checked) =>
                                          toggleModulePermissions(module, checked as boolean)
                                        }
                                        className={
                                          someSelected && !allSelected
                                            ? 'data-[state=checked]:bg-purple-600'
                                            : ''
                                        }
                                      />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Todos
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {permissions.map((permission) => {
                                    const isSelected = isPermissionSelected(permission.id);
                                    const currentScope = getPermissionScope(permission.id);

                                    return (
                                      <div
                                        key={permission.id}
                                        className="flex items-center justify-between p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) =>
                                              togglePermission(permission.id, checked as boolean)
                                            }
                                          />
                                          <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                              {permission.action}
                                            </p>
                                            {permission.description && (
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {permission.description}
                                              </p>
                                            )}

                                            {permission.requiredPermissions && permission.requiredPermissions.length > 0 && (
                                              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Requiere otros permisos del mismo módulo
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        {isSelected && (
                                          <Select
                                            value={currentScope}
                                            onValueChange={(value) =>
                                              updatePermissionScope(
                                                permission.id,
                                                value as 'all' | 'own' | 'grade'
                                              )
                                            }
                                          >
                                            <SelectTrigger className="w-[140px]">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {/* ✨ FILTRAR por allowedScopes */}
                                              {permission.allowedScopes?.map((scope) => (
                                                <SelectItem key={scope} value={scope}>
                                                  <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{scope}</Badge>
                                                    {scope === 'all' && 'Todos'}
                                                    {scope === 'own' && 'Propios'}
                                                    {scope === 'grade' && 'Grado'}
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loadingPermissions}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Actualizar' : 'Crear'} Rol
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}