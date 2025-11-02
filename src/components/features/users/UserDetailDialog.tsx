// src/components/features/users/UserDetailDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { User, UserWithRelations } from '@/types/users.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle2,
  Lock,
  Eye,
  User as UserIcon,
  FileText,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserDetailDialogProps {
  user: User | UserWithRelations | null;
  isOpen: boolean;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDialog({
  user,
  isOpen,
  isLoading,
  onOpenChange,
}: UserDetailDialogProps) {
  const isUserWithRelations = (u: any): u is UserWithRelations => 'role' in u;
  const roleName = user && isUserWithRelations(user) ? user.role.name : 'N/A';
  const pictures = user && isUserWithRelations(user) ? user.pictures || [] : [];

  const getInitials = () => {
    if (!user) return '';
    const given = user.givenNames?.split(' ')[0]?.[0] || '';
    const last = user.lastNames?.split(' ')[0]?.[0] || '';
    return `${given}${last}`.toUpperCase();
  };

  const getStatusBadge = () => {
    if (!user?.isActive) {
      return {
        text: 'Inactivo',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400',
      };
    }
    return {
      text: 'Activo',
      className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    };
  };

  const status = getStatusBadge();
  const profilePicture = pictures?.find((p) => p.kind === 'profile');

  if (!user || isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-800 max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-slate-900 dark:border-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Detalles del Usuario</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Información completa del usuario
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 dark:bg-slate-800 dark:border-slate-700">
            <TabsTrigger value="info" className="dark:data-[state=active]:bg-slate-700">
              <UserIcon className="w-4 h-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger value="pictures" className="dark:data-[state=active]:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              Fotos
            </TabsTrigger>
          </TabsList>

          {/* Información Tab */}
          <TabsContent value="info" className="space-y-6">
            {/* Header */}
            <div className="flex gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <Avatar className="h-16 w-16 border-2 border-slate-200 dark:border-slate-700">
                <AvatarImage src={profilePicture?.url} />
                <AvatarFallback className="dark:bg-slate-700 dark:text-white text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {user.givenNames} {user.lastNames}
                  </h2>
                  <Badge className={status.className} variant="secondary">
                    {status.text}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">@{user.username}</p>
              </div>
            </div>

            {/* Información Personal */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm dark:text-white">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Nombres</p>
                    <p className="font-medium text-slate-900 dark:text-white">{user.givenNames}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Apellidos</p>
                    <p className="font-medium text-slate-900 dark:text-white">{user.lastNames}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">DPI</p>
                    <p className="font-medium text-slate-900 dark:text-white">{user.dpi}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Género</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {user.gender === 'M'
                        ? 'Masculino'
                        : user.gender === 'F'
                          ? 'Femenino'
                          : 'Otro'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm dark:text-white">Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Email</p>
                    <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
                  </div>
                  {user.accountVerified && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Teléfono</p>
                      <p className="font-medium text-slate-900 dark:text-white">{user.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rol y Permisos */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm dark:text-white">Rol y Permisos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Rol</p>
                    <p className="font-medium text-slate-900 dark:text-white">{roleName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado y Acceso */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm dark:text-white">Estado y Acceso</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Estado
                  </p>
                  <Badge
                    variant={user.isActive ? 'default' : 'secondary'}
                    className={
                      user.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }
                  >
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Acceso Plataforma
                  </p>
                  <div className="flex items-center gap-2">
                    {user.canAccessPlatform ? (
                      <>
                        <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Activo
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Inactivo
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fechas */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm dark:text-white">Auditoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Creado:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: es })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Actualizado:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fotos Tab */}
          <TabsContent value="pictures" className="space-y-4">
            {pictures && pictures.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pictures.map((picture) => (
                  <Card key={picture.id} className="dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge
                          variant="outline"
                          className="dark:border-slate-600 dark:text-slate-300"
                        >
                          {picture.kind === 'profile'
                            ? 'Perfil'
                            : picture.kind === 'document'
                              ? 'Documento'
                              : picture.kind === 'evidence'
                                ? 'Evidencia'
                                : picture.kind}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="relative w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                        <img
                          src={picture.url}
                          alt={`Foto ${picture.kind}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/user/user-01.jpg';
                          }}
                        />
                      </div>
                      {picture.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {picture.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Subida: {formatDistanceToNow(new Date(picture.uploadedAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                <p className="text-slate-500 dark:text-slate-400">No hay fotos disponibles</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
