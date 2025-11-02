// src/components/features/users/UserForm.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, updateUserSchema, CreateUserFormData, UpdateUserFormData } from '@/schemas/users.schema';
import { User, UserWithRelations } from '@/types/users.types';
import { useRoles } from '@/hooks/data/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Upload,
  X,
  User as UserIcon,
  FileText,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserFormProps {
  user?: User | UserWithRelations;
  isLoading?: boolean;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData, file?: File) => Promise<void>;
  onCancel?: () => void;
}

export function UserForm({
  user,
  isLoading,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const isEditMode = !!user;
  const { data: rolesData } = useRoles({ limit: 100 });
  const roles = rolesData?.data || [];

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const schema = isEditMode ? updateUserSchema : createUserSchema;
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode
      ? {
          givenNames: user?.givenNames || '',
          lastNames: user?.lastNames || '',
          phone: user?.phone || '',
          gender: user?.gender || 'M',
          roleId: user && 'role' in user ? user.role?.id.toString() : user?.roleId?.toString() || '',
          isActive: user?.isActive ?? true,
          canAccessPlatform: user?.canAccessPlatform ?? false,
        }
      : {
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          givenNames: '',
          lastNames: '',
          dpi: '',
          phone: '',
          gender: 'M',
          roleId: '',
          isActive: true,
          canAccessPlatform: false,
        },
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('La imagen no debe exceder 5MB');
      return;
    }

    setUploadedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleFormSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data, uploadedFile || undefined);
    } catch (error) {
      // Error is already handled in toast
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = () => {
    const given = form.watch('givenNames')?.split(' ')[0]?.[0] || '';
    const last = form.watch('lastNames')?.split(' ')[0]?.[0] || '';
    return `${given}${last}`.toUpperCase();
  };

  const getExistingProfilePicture = () => {
    if (user && 'pictures' in user) {
      return user.pictures?.find((p) => p.kind === 'profile')?.url;
    }
    return undefined;
  };

  const currentPictureUrl = preview || getExistingProfilePicture();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 dark:bg-slate-800 dark:border-slate-700">
          <TabsTrigger value="info" className="dark:data-[state=active]:bg-slate-700">
            <UserIcon className="w-4 h-4 mr-2" />
            Información
          </TabsTrigger>
          <TabsTrigger value="photo" className="dark:data-[state=active]:bg-slate-700">
            <Upload className="w-4 h-4 mr-2" />
            Foto
          </TabsTrigger>
        </TabsList>

        {/* Información Tab */}
        <TabsContent value="info" className="space-y-6">
          {/* Email y Username (Solo crear) */}
          {!isEditMode && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-slate-300">Email *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="usuario@colegioids.com"
                          type="email"
                          {...field}
                          disabled={isLoading || isSubmitting}
                          className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
                        />
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
                      <FormLabel className="dark:text-slate-300">Usuario *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="usuario_prueba"
                          {...field}
                          disabled={isLoading || isSubmitting}
                          className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* DPI */}
              <FormField
                control={form.control}
                name="dpi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-slate-300">DPI *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234567890123"
                        maxLength={13}
                        {...field}
                        disabled={isLoading || isSubmitting}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
                      />
                    </FormControl>
                    <FormDescription className="dark:text-slate-400">
                      13 dígitos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contraseña */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-slate-300">Contraseña *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                            disabled={isLoading || isSubmitting}
                            className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription className="dark:text-slate-400">
                        Mín. 8 caracteres, mayúscula, número, especial
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-slate-300">Confirmar *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          {...field}
                          disabled={isLoading || isSubmitting}
                          className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="givenNames"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300">Nombres *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan Carlos"
                      {...field}
                      disabled={isLoading || isSubmitting}
                      className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
                    />
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
                  <FormLabel className="dark:text-slate-300">Apellidos *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pérez García"
                      {...field}
                      disabled={isLoading || isSubmitting}
                      className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Teléfono, Género, Rol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300">Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+50212345678"
                      {...field}
                      disabled={isLoading || isSubmitting}
                      className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300">Género *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-slate-300">Rol *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString() || ''}
                    disabled={isLoading || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                        <SelectValue placeholder="Seleccionar rol..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Estado y Acceso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="space-y-0.5">
                    <FormLabel className="dark:text-slate-300">Estado</FormLabel>
                    <FormDescription className="dark:text-slate-400">
                      {field.value ? 'Activo' : 'Inactivo'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading || isSubmitting}
                      className="w-5 h-5 rounded dark:bg-slate-700 dark:border-slate-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="canAccessPlatform"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="space-y-0.5">
                    <FormLabel className="dark:text-slate-300">Acceso Plataforma</FormLabel>
                    <FormDescription className="dark:text-slate-400">
                      {field.value ? 'Con acceso' : 'Sin acceso'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading || isSubmitting}
                      className="w-5 h-5 rounded dark:bg-slate-700 dark:border-slate-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </TabsContent>

        {/* Foto Tab */}
        <TabsContent value="photo" className="space-y-6">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Foto de Perfil</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Carga una imagen para el perfil del usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview */}
              {currentPictureUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border-2 border-slate-200 dark:border-slate-600">
                    <AvatarImage src={currentPictureUrl} />
                    <AvatarFallback className="dark:bg-slate-700 dark:text-white text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
                    >
                      Cambiar foto
                    </Button>
                    {preview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        disabled={isSubmitting}
                        className="dark:border-red-600/50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar cambio
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Haz clic para cargar una foto
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    JPG, PNG, GIF o WebP - Máx. 5MB
                  </p>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Información */}
              <Alert className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="dark:text-slate-300">
                  La foto se cargará automáticamente cuando se guarde el usuario. Si la carga falla,
                  se eliminará al crear/actualizar el usuario.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="flex-1 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditMode ? 'Actualizar' : 'Crear'} Usuario
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
            className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </Button>
        )}
      </div>
      </form>
    </Form>
  );
}
