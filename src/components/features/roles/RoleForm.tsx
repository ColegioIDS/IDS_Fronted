// src/components/features/roles/RoleForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Save,
  X,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { rolesService } from '@/services/roles.service';
import { permissionsService } from '@/services/permissions.service';
import { CreateRoleDto, UpdateRoleDto, RoleType } from '@/types/roles.types';
import { Permission } from '@/types/permissions.types';
import { getModuleTheme, getActionTheme } from '@/config/theme.config';
import { toast } from 'sonner';
import { handleApiError } from '@/utils/handleApiError';
import { ErrorAlert } from '@/components/shared/feedback/ErrorAlert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const roleSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  roleType: z.enum(['ADMIN', 'TEACHER', 'COORDINATOR', 'PARENT', 'STUDENT', 'STAFF', 'CUSTOM'] as const).optional(),
  isActive: z.boolean()
});

type RoleFormData = z.infer<typeof roleSchema>;

interface PermissionSelection {
  permissionId: number;
  scope: 'all' | 'own' | 'grade' | 'section';
  isSelected: boolean;
}

interface RoleFormProps {
  roleId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RoleForm({ roleId, onSuccess, onCancel }: RoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Map<number, PermissionSelection>>(new Map());
  const [globalError, setGlobalError] = useState<null | { title?: string; message: string; details?: string[] }>(null);
  const [missingDependencies, setMissingDependencies] = useState<Set<number>>(new Set());
  const [roleTypes, setRoleTypes] = useState<Array<{ value: RoleType; label: string; description: string }>>([]);

  const isEdit = !!roleId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      roleType: 'CUSTOM',
      isActive: true,
    },
  });

  const isActive = watch('isActive');
  const selectedRoleType = watch('roleType');

  useEffect(() => {
    loadAvailablePermissions();
    loadRoleTypes();
  }, []);

  useEffect(() => {
    if (isEdit && roleId) {
      loadRoleData();
    } else {
      reset({
        name: '',
        description: '',
        roleType: 'CUSTOM',
        isActive: true,
      });
      setSelectedPermissions(new Map());
    }
  }, [isEdit, roleId]);

  // ✨ NUEVO: Validar dependencias cuando cambian los permisos seleccionados
  useEffect(() => {
    validateDependencies();
  }, [selectedPermissions, availablePermissions]);

  const loadRoleTypes = async () => {
    try {
      const types = await rolesService.getRoleTypes();
      setRoleTypes(types);
    } catch (err: any) {
      handleApiError(err, 'Error al cargar tipos de rol');
      console.error(err);
    }
  };

  const loadAvailablePermissions = async () => {
    try {
      const response = await permissionsService.getPermissions({
        limit: 100,
        isActive: true
      });
      setAvailablePermissions(response.data);
    } catch (err: any) {
      handleApiError(err, 'Error al cargar permisos disponibles');
      console.error(err);
    }
  };

  const loadRoleData = async () => {
    try {
      setIsLoadingData(true);
      const role = await rolesService.getRoleById(roleId!);

      reset({
        name: role.name,
        description: role.description || '',
        isActive: role.isActive,
      });

      const existingPermissions = new Map<number, PermissionSelection>();
      role.permissions.forEach((rp) => {
        existingPermissions.set(rp.permissionId, {
          permissionId: rp.permissionId,
          scope: rp.scope as any,
          isSelected: true,
        });
      });
      setSelectedPermissions(existingPermissions);
    } catch (err: any) {
      handleApiError(err, 'Error al cargar el rol');
    } finally {
      setIsLoadingData(false);
    }
  };

  // ✨ NUEVO: Validar dependencias de permisos
  const validateDependencies = () => {
    const missing = new Set<number>();

    selectedPermissions.forEach((selection) => {
      const permission = availablePermissions.find(p => p.id === selection.permissionId);

      if (permission?.requiredPermissions && permission.requiredPermissions.length > 0) {
        permission.requiredPermissions.forEach((requiredId) => {
          if (!selectedPermissions.has(requiredId)) {
            missing.add(selection.permissionId);
          }
        });
      }
    });

    setMissingDependencies(missing);
  };

  // ✨ MEJORADO: Toggle con validación de dependencias
  const handlePermissionToggle = (permissionId: number) => {
    const permission = availablePermissions.find(p => p.id === permissionId);

    setSelectedPermissions((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(permissionId);

      if (existing) {
        // Al deseleccionar, verificar si otros permisos lo necesitan
        const dependents = availablePermissions.filter(p =>
          p.requiredPermissions?.includes(permissionId) && newMap.has(p.id)
        );

        if (dependents.length > 0) {
          toast.warning(
            `Este permiso es requerido por: ${dependents.map(d => d.action).join(', ')}`,
            { duration: 4000 }
          );
        }

        newMap.delete(permissionId);
      } else {
        // Al seleccionar, usar el primer scope permitido
        const defaultScope = permission?.allowedScopes?.[0] || 'all';

        newMap.set(permissionId, {
          permissionId,
          scope: defaultScope as any,
          isSelected: true,
        });

        // Auto-seleccionar dependencias requeridas
        if (permission?.requiredPermissions && permission.requiredPermissions.length > 0) {
          permission.requiredPermissions.forEach((requiredId) => {
            if (!newMap.has(requiredId)) {
              const requiredPerm = availablePermissions.find(p => p.id === requiredId);
              const requiredScope = requiredPerm?.allowedScopes?.[0] || 'all';

              newMap.set(requiredId, {
                permissionId: requiredId,
                scope: requiredScope as any,
                isSelected: true,
              });
            }
          });

          toast.info(
            `Se agregaron ${permission.requiredPermissions.length} permiso(s) requerido(s)`,
            { duration: 3000 }
          );
        }
      }

      return newMap;
    });
  };

  // ✨ MEJORADO: Cambio de scope con validación
  const handleScopeChange = (permissionId: number, scope: 'all' | 'own' | 'grade' | 'section') => {
    const permission = availablePermissions.find(p => p.id === permissionId);

    // Validar que el scope esté permitido
    if (permission?.allowedScopes && !permission.allowedScopes.includes(scope)) {
      toast.error(`El scope "${scope}" no está permitido para este permiso`);
      return;
    }

    setSelectedPermissions((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(permissionId);

      if (existing) {
        newMap.set(permissionId, {
          ...existing,
          scope,
        });
      }

      return newMap;
    });
  };

  const onSubmit = async (data: RoleFormData) => {
    setGlobalError(null);

    // Validar que no haya dependencias faltantes
    if (missingDependencies.size > 0) {
      setGlobalError({
        title: 'Error de validación',
        message: 'Algunos permisos seleccionados requieren otros permisos que no están seleccionados',
        details: Array.from(missingDependencies).map(id => {
          const perm = availablePermissions.find(p => p.id === id);
          return `${perm?.action}: requiere permisos adicionales`;
        }),
      });
      return;
    }

    try {
      setIsLoading(true);

      let roleId_: number;

      if (isEdit) {
        await rolesService.updateRole(roleId!, data as UpdateRoleDto);
        roleId_ = roleId!;
        toast.success('Rol actualizado exitosamente');
      } else {
        const newRole = await rolesService.createRole(data as CreateRoleDto);
        roleId_ = newRole.id;
        toast.success('Rol creado exitosamente');
      }

      if (selectedPermissions.size > 0) {
        const permissionsToAssign = Array.from(selectedPermissions.values()).map((p) => ({
          permissionId: p.permissionId,
          scope: p.scope,
        }));

        await rolesService.assignMultiplePermissions(roleId_, {
          permissions: permissionsToAssign,
        });

        toast.success(`${permissionsToAssign.length} permisos asignados`);
      }

      onSuccess?.();
    } catch (err: any) {
      const handled = handleApiError(err, `Error al ${isEdit ? 'actualizar' : 'crear'} el rol`);
      if (handled && typeof handled === 'object') {
        setGlobalError({
          title: `Error al ${isEdit ? 'actualizar' : 'crear'} el rol`,
          message: handled.message || 'Ocurrió un error inesperado',
          details: handled.details || [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const permissionsByModule = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);



  

  const selectedCount = selectedPermissions.size;
  const hasErrors = missingDependencies.size > 0;

  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400">Cargando datos del rol...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {globalError && (
        <ErrorAlert
          title={globalError.title}
          message={globalError.message}
          details={globalError.details}
        />
      )}

      {/* Alerta de dependencias faltantes */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">
              {missingDependencies.size} permiso(s) con dependencias faltantes
            </p>
            <p className="text-sm">
              Algunos permisos requieren otros permisos del mismo módulo que no están seleccionados.
              Por favor, revisa las advertencias en color ámbar.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Header del formulario */}
      <Card className="relative overflow-hidden border-2 border-purple-300 dark:border-purple-700
        bg-purple-50 dark:bg-purple-900/20 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center gap-5">
            <div className="relative p-5 rounded-2xl bg-purple-600 dark:bg-purple-700
              border-2 border-purple-500 dark:border-purple-600 shadow-lg
              hover:scale-105 transition-transform duration-200">
              <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10
                rounded-2xl transition-opacity duration-200" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isEdit ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </h2>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isEdit
                  ? 'Actualiza la información del rol y sus permisos asignados'
                  : 'Completa los campos y asigna los permisos correspondientes'
                }
              </p>
            </div>
          </div>
        </CardContent>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 dark:bg-purple-600
          opacity-10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300 dark:bg-purple-700
          opacity-10 rounded-full -ml-12 -mb-12" />
      </Card>

      {/* Sección 1: Información General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-600" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              Nombre del Rol *
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Coordinador Académico"
              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
              Descripción
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe las responsabilidades y funciones del rol..."
              rows={4}
              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 resize-none"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleType" className="text-gray-700 dark:text-gray-300">
              Tipo de Rol *
            </Label>
            <Select 
              value={selectedRoleType || 'CUSTOM'} 
              onValueChange={(value) => setValue('roleType', value as RoleType)}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Selecciona un tipo de rol" />
              </SelectTrigger>
              <SelectContent>
                {roleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-gray-500">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoleType && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {roleTypes.find(t => t.value === selectedRoleType)?.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Estado del Rol
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                {isActive ? 'El rol está activo y puede ser asignado a usuarios' : 'El rol está inactivo y no puede ser asignado'}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Permisos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Asignar Permisos
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
              </Badge>
              {hasErrors && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {missingDependencies.size} con errores
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Info sobre scopes */}
          <Alert className="mb-4">
            <Info className="w-4 h-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Scopes disponibles:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><Badge variant="outline">all</Badge> - Acceso a todos los registros</div>
                <div><Badge variant="outline">own</Badge> - Solo registros propios</div>
                <div><Badge variant="outline">grade</Badge> - Registros del mismo grado</div>
                <div><Badge variant="outline">section</Badge> - Registros de la misma sección</div>
              </div>
            </AlertDescription>
          </Alert>

          <Accordion type="multiple" className="space-y-2">
            {Object.entries(permissionsByModule)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([module, permissions]) => {
                const moduleTheme = getModuleTheme(module);
                const selectedInModule = permissions.filter((p) =>
                  selectedPermissions.has(p.id)
                ).length;

                return (
                  <AccordionItem
                    key={module}
                    value={module}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className={`px-4 hover:no-underline ${moduleTheme.bg} border-b ${moduleTheme.border}`}>
                      <div className="flex items-center justify-between w-full pr-4">
                        <h4 className={`font-semibold ${moduleTheme.text} capitalize flex items-center gap-2`}>
                          <Shield className="w-4 h-4" />
                          {module}
                        </h4>
                        <div className="flex items-center gap-2">
                          {selectedInModule > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {selectedInModule}/{permissions.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4 pt-3">
                      <div className="space-y-2">
                        {permissions.map((permission) => {


                          const isSelected = selectedPermissions.has(permission.id);
                          const hasMissingDeps = missingDependencies.has(permission.id);
                          const actionTheme = getActionTheme(permission.action);
                          const currentScope = selectedPermissions.get(permission.id)?.scope || 'all';

                          return (
                            <div
                              key={permission.id}
                              className={`flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border transition-all ${hasMissingDeps
                                  ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/20'
                                  : isSelected
                                    ? 'border-purple-300 dark:border-purple-700 shadow-sm'
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  id={`permission-${permission.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  disabled={isLoading}
                                />

                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`permission-${permission.id}`}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Badge className={actionTheme.badge}>
                                      {permission.action}
                                    </Badge>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {permission.description || permission.action}
                                    </span>
                                  </Label>

                                  {/* ✨ Mostrar dependencias requeridas */}
                                  {permission.requiredPermissions && permission.requiredPermissions.length > 0 && (
                                    <div className="ml-[72px] mt-1">
                                      <p className={`text-xs flex items-center gap-1 ${hasMissingDeps
                                          ? 'text-amber-600 dark:text-amber-400 font-medium'
                                          : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        <AlertCircle className="w-3 h-3" />
                                        Requiere {permission.requiredPermissions.length} permiso(s) adicional(es)
                                        {hasMissingDeps && ' (faltante)'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* ✨ Selector de scope filtrado */}
                              {isSelected && (
                                <select
                                  value={currentScope}
                                  onChange={(e) =>
                                    handleScopeChange(
                                      permission.id,
                                      e.target.value as any
                                    )
                                  }
                                  disabled={isLoading}
                                  className="ml-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                >
                                  {permission.allowedScopes && permission.allowedScopes.length > 0 ? (
                                    permission.allowedScopes.map((scope) => (
                                      <option key={scope} value={scope}>
                                        {scope === 'all' && 'Scope: Todos'}
                                        {scope === 'own' && 'Scope: Propios'}
                                        {scope === 'grade' && 'Scope: Grado'}
                                        {scope === 'section' && 'Scope: Sección'}
                                      </option>
                                    ))
                                  ) : (
                                    <>
                                      <option value="all">Scope: Todos</option>
                                      <option value="own">Scope: Propios</option>
                                      <option value="grade">Scope: Grado</option>
                                      <option value="section">Scope: Sección</option>
                                    </>
                                  )}
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      </AccordionContent>
                    </AccordionItem>
                    );
                })}
                  </Accordion>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || hasErrors}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEdit ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Actualizar Rol' : 'Crear Rol'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}