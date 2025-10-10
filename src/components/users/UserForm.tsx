'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { zodResolver } from '@hookform/resolvers/zod';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaUserEdit } from "react-icons/fa";

// Componentes UI
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import ImageUpload from '@/components/form/UploadImage/image-upload';
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from 'lucide-react';

// Hooks y Schemas
import { useRoles } from '@/hooks/useRoles';
import { useUserContext } from '@/context/UserContext';
import { UserFormSchema } from '@/schemas/user-form.schema';
import { RoleWithRelations } from '@/types/roles';
import ProtectedContent from '@/components/common/ProtectedContent';

type UserFormProps = {
  isEditMode?: boolean;
  userId?: number;
};

export function UserForm({ isEditMode = false, userId }: UserFormProps) {
  const { data: rolesData, isLoading } = useRoles({ isActive: true, limit: 100 });
  const activeRoles = rolesData?.data || [];
  
  const {
    form,
    onSubmit,
    onUpdate,
    errorMessage,
    errorDetails,
    userLoaded
  } = useUserContext();

  const roleId = form.watch("roleId");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isEditMode && userId) {
      await onUpdate(userId, values);
    } else {
      await onSubmit(values);
    }
  });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  if (isEditMode && !userLoaded) {
    return <div>Cargando datos del usuario...</div>;
  }

  return (
    <ProtectedContent 
      requiredPermission={{ 
        module: 'user', 
        action: isEditMode ? 'update' : 'create' 
      }}
    >
      <Card className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <FaUserEdit />
            {isEditMode ? 'Editar Usuario' : 'Registro de Usuario'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form} key={isEditMode ? `edit-${userId}` : 'create'}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contenedor Flex para la imagen y los Select */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Imagen de Perfil */}
                <FormField
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Foto de Perfil</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value ?? null}
                          onChange={(file) => field.onChange(file)}
                          onRemove={() => field.onChange(null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sección de Información Básica con 2 Select a la par */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Seleccione el Rol</FormLabel>
                        <Select
                          value={field.value != null ? String(field.value) : undefined}
                          onValueChange={(value) => {
                            if (value === undefined || value === null || value === '') {
                              field.onChange(undefined);
                            } else {
                              field.onChange(Number(value));
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un tipo de cuenta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoading ? null : (
                              activeRoles.map((role: RoleWithRelations) => (
                                <SelectItem key={role.id} value={String(role.id)}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span>{role.name}</span>
                                    <Badge variant={role.isSystem ? "default" : "secondary"}>
                                      {role.isSystem ? "System" : "Custom"}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canAccessPlatform"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Acceso a Plataforma</FormLabel>
                          <FormDescription>
                            Habilitar acceso al sistema con este usuario
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Datos Personales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="givenNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Carlos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Apellidos<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez López" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dpi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DPI (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIT (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Nacimiento <span className="text-red-500">*</span></FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un género" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Femenino">Femenino</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono </FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="usuario@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Usuario <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="juan.perez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    const [showPassword, setShowPassword] = useState(false);
                    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

                    return (
                      <FormItem>
                        <FormLabel>
                          {isEditMode ? 'Nueva Contraseña' : 'Contraseña'}
                          {!isEditMode && <span className="text-red-500">*</span>}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder={isEditMode ? 'Dejar vacío para no cambiar' : '••••••••'}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                              }}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                              {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                            </button>
                          </div>
                        </FormControl>
                        {isEditMode ? (
                          <FormDescription>Dejar vacío para mantener la contraseña actual</FormDescription>
                        ) : (
                          <FormDescription>Mínimo 8 caracteres</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* Sección de Dirección */}
              <Separator className="my-6 dark:bg-gray-700" />
              <h3 className="text-lg font-medium">Información de Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle y Número</FormLabel>
                      <FormControl>
                        <Input
                          className="dark:bg-gray-900/50 dark:border-gray-700"
                          placeholder="Av. Siempre Viva 123"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona</FormLabel>
                      <FormControl>
                        <Input
                          className="dark:bg-gray-900/50 dark:border-gray-700"
                          placeholder="Zona 15"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.municipality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Municipio</FormLabel>
                      <FormControl>
                        <Input
                          className="dark:bg-gray-900/50 dark:border-gray-700"
                          placeholder="Villa Nueva"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-900/50 dark:border-gray-700">
                            <SelectValue placeholder="Selecciona un departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="Guatemala">Guatemala</SelectItem>
                          <SelectItem value="Chimaltenango">Chimaltenango</SelectItem>
                          {/* Agrega más departamentos según necesites */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sección específica para Padres */}
              {roleId === 3 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información de Padre/Madre</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="parentDetails.occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ocupación</FormLabel>
                            <FormControl>
                              <Input placeholder="Profesión u oficio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentDetails.workplace"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lugar de Trabajo</FormLabel>
                            <FormControl>
                              <Input placeholder="Empresa o institución" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Sección específica para Profesores */}
              {roleId === 2 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información de Profesor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="teacherDetails.hiredDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Contratación</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className="pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Selecciona una fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teacherDetails.isHomeroomTeacher"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Profesor Guía</FormLabel>
                              <FormDescription>
                                ¿Es profesor guía de un grado?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teacherDetails.academicDegree"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título Académico</FormLabel>
                            <FormControl>
                              <Input placeholder="Licenciatura, Maestría, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Mostrar mensaje general de error */}
              {errorMessage && (
                <div className="mt-4 p-4 border border-red-600 bg-red-100 rounded text-red-700">
                  <strong>{errorMessage}</strong>

                  {/* Lista con errores detallados si existen */}
                  {errorDetails.length > 0 && (
                    <ul className="list-disc list-inside mt-2">
                      {errorDetails.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              
              <div className="flex justify-end">
                <Button type="submit">
                  {isEditMode ? 'Actualizar Usuario' : 'Registrar Usuario'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </ProtectedContent>
  );
}