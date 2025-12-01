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
import { Loader2, Save, AlertCircle, CheckCircle, Mail, Phone, Calendar, User, Trash2, ImagePlus, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { updateUserProfileSchema } from '@/schemas/user-profile.schema';
import Image from 'next/image';
import Webcam from 'react-webcam';

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
  accountVerified: boolean;
  createdAt: string;
  updatedAt: string;
  pictures?: Array<{
    id: number;
    url: string;
    kind: string;
    description?: string;
  }>;
  profilePicture?: {
    id: number;
    url: string;
    publicId: string;
    description?: string;
  };
  address?: {
    street?: string;
    zone?: string;
    municipality?: {
      id: number;
      name: string;
      department?: {
        id: number;
        name: string;
      };
    };
    department?: {
      id: number;
      name: string;
    };
  };
  role?: {
    id: number;
    name: string;
    roleType: string;
  };
  teacherDetails?: {
    id: number;
    userId: number;
    hiredDate?: string;
    isHomeroomTeacher?: boolean;
    academicDegree?: string;
  };
  parentDetails?: {
    id: number;
    userId: number;
    occupation?: string;
    workplace?: string;
    workPhone?: string;
    isSponsor?: boolean;
    sponsorInfo?: string;
  };
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = React.useRef<Webcam>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      givenNames: profile.givenNames || '',
      lastNames: profile.lastNames || '',
      email: profile.email || '',
      phone: profile.phone || '',
      birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
      gender: profile.gender || '',
      profilePicture: undefined,
      address: {
        street: profile.address?.street || '',
        zone: profile.address?.zone || '',
      },
      teacherDetails: profile.teacherDetails ? {
        hiredDate: profile.teacherDetails.hiredDate ? profile.teacherDetails.hiredDate.split('T')[0] : '',
        isHomeroomTeacher: profile.teacherDetails.isHomeroomTeacher || false,
        academicDegree: profile.teacherDetails.academicDegree || '',
      } : undefined,
      parentDetails: profile.parentDetails ? {
        occupation: profile.parentDetails.occupation || '',
        workplace: profile.parentDetails.workplace || '',
        workPhone: profile.parentDetails.workPhone || '',
        isSponsor: profile.parentDetails.isSponsor || false,
        sponsorInfo: profile.parentDetails.sponsorInfo || '',
      } : undefined,
    },
  });

  // Inicializar preview con foto existente
  useEffect(() => {
    const existingImage = profile.profilePicture?.url || profile.pictures?.[0]?.url;
    if (existingImage) {
      setPreviewUrl(existingImage);
    } else {
      setPreviewUrl(null);
    }
  }, [profile.profilePicture, profile.pictures]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue('profilePicture', file);
    }
  };

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          form.setValue('profilePicture', file);
          setShowCamera(false);
        });
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    form.setValue('profilePicture', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (data: z.infer<typeof updateUserProfileSchema>) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      // ✅ Limpiar el campo profilePicture después de guardar
      form.setValue('profilePicture', undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

      {/* Profile Picture Card */}
      <Card className="border-2 dark:border-gray-800 overflow-hidden">
        <CardHeader className="border-b dark:border-gray-800 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>Sube o captura una nueva foto</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <div className="space-y-6">
            {/* Camera View */}
            {showCamera && !previewUrl && (
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={capture}
                    type="button"
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Capturar Foto
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCamera(false)}
                    type="button"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Preview Image */}
            {previewUrl && !showCamera && (
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  </div>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="gap-2"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Cambiar Foto
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCamera(true)}
                    type="button"
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Tomar Nueva
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRemoveImage}
                    type="button"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Options */}
            {!previewUrl && !showCamera && (
              <div className="space-y-4">
                <div className="flex gap-3 justify-center flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="gap-2"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Subir desde Galería
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCamera(true)}
                    type="button"
                    className="gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Tomar con Cámara
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Formatos soportados: JPG, PNG. Tamaño máximo: 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Form Card */}
      <Card className="border-2 dark:border-gray-800">
        <CardHeader className="border-b dark:border-gray-800 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
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

              {/* Address Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Dirección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Calle</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Av. Principal"
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
                    name="address.zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Zona</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Zona 10"
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
              </div>

              {/* Teacher Details Section - Conditional */}
              {profile.teacherDetails && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Información del Docente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="teacherDetails.hiredDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Fecha de Contratación</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="teacherDetails.academicDegree"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Grado Académico</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Licenciatura en Educación"
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
                </div>
              )}

              {/* Parent Details Section - Conditional */}
              {profile.parentDetails && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Información del Padre/Apoderado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="parentDetails.occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Ocupación</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ingeniero"
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
                      name="parentDetails.workplace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Lugar de Trabajo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Empresa XYZ"
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
                      name="parentDetails.workPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Teléfono del Trabajo</FormLabel>
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
                  </div>
                </div>
              )}

              {/* Read-only Section */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4">
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
                      Rol
                    </Label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {profile.role?.name} ({profile.role?.roleType})
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 dark:text-gray-400">
                      Estado de Verificación
                    </Label>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        profile.accountVerified
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {profile.accountVerified ? 'Verificado' : 'Pendiente de Verificación'}
                      </span>
                    </div>
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
