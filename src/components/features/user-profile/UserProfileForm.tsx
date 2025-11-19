'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle, CheckCircle, Mail, Phone, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { updateUserProfileSchema } from '@/schemas/user-profile.schema';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  givenNames: string;
  lastNames: string;
  phone?: string;
  dpi: string;
  birthDate?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
  pictures?: Array<{
    id: number;
    url: string;
    kind: string;
    description?: string;
  }>;
}

interface UserProfileFormProps {
  profile: UserProfile;
  onSubmit: (data: z.infer<typeof updateUserProfileSchema>) => Promise<void>;
  isLoading?: boolean;
}

export function UserProfileForm({
  profile,
  onSubmit,
  isLoading = false,
}: UserProfileFormProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      givenNames: profile.givenNames || '',
      lastNames: profile.lastNames || '',
      email: profile.email || '',
      phone: profile.phone || '',
      birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
      gender: profile.gender || '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof updateUserProfileSchema>) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      setIsSaved(true);
      toast.success('Perfil actualizado exitosamente');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Administra tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Success Alert */}
      {isSaved && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Tu perfil ha sido actualizado correctamente
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form Card */}
      <Card className="border-2 dark:border-gray-800">
        <CardHeader className="border-b dark:border-gray-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tus datos personales y de contacto
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Names Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="givenNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Nombres</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan"
                          disabled={isSubmitting || isLoading}
                          className="border-gray-300 dark:border-gray-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Apellidos</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pérez García"
                          disabled={isSubmitting || isLoading}
                          className="border-gray-300 dark:border-gray-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email Section */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Correo Electrónico
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        disabled={isSubmitting || isLoading}
                        className="border-gray-300 dark:border-gray-700"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Este debe ser único en el sistema
                    </p>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Contact Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Teléfono
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+502 1234 5678"
                          disabled={isSubmitting || isLoading}
                          className="border-gray-300 dark:border-gray-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Género</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masculino/Femenino/Otro"
                          disabled={isSubmitting || isLoading}
                          className="border-gray-300 dark:border-gray-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Birth Date Section */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Fecha de Nacimiento
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isSubmitting || isLoading}
                        className="border-gray-300 dark:border-gray-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Read-only Section */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                  Información No Editable
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      Usuario (Username)
                    </Label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {profile.username}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      DPI / ID
                    </Label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {profile.dpi}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      Creado el
                    </Label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {new Date(profile.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      Última actualización
                    </Label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {new Date(profile.updatedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading || !form.formState.isDirty}
                  className="gap-2"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isSubmitting || isLoading || !form.formState.isDirty}
                >
                  Descartar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
