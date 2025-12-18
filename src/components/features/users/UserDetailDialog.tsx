// src/components/features/users/UserDetailDialog.tsx
'use client';

import { useState } from 'react';
import { User, UserWithRelations, ParentDetails, TeacherDetails } from '@/types/users.types';
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
import { ParentStudentLinksDialog } from './';
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
  Clock,
  Zap,
  Check,
  Circle,
  Check as CheckIcon,
  X,
  Briefcase,
  Building2,
  MapPin,
  GraduationCap,
  Users,
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

  // Get parent and teacher details from the user object (already included in GET /api/users/:id)
  const parentDetails = user && isUserWithRelations(user) ? user.parentDetails : null;
  const teacherDetails = user && isUserWithRelations(user) ? user.teacherDetails : null;

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
        className: 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50',
      };
    }
    return {
      text: 'Activo',
      className: 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50',
    };
  };

  const status = getStatusBadge();
  const profilePicture = pictures?.find((p) => p.kind === 'profile');

  if (!user || isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="dark:bg-slate-900/95 dark:border-slate-700/50 max-w-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-blue-400 dark:text-blue-500 mb-3" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Cargando información...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="
        dark:bg-gradient-to-b dark:from-slate-900/95 dark:to-slate-900/90
        dark:border-slate-700/50
        max-w-2xl max-h-[90vh] overflow-y-auto
        shadow-2xl
        backdrop-blur-sm
      ">
        {/* Header */}
        <div className="
          absolute top-0 left-0 right-0 h-20
          bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent
          dark:from-blue-500/15 dark:via-purple-500/15
          pointer-events-none
        " />

        <DialogHeader className="relative z-10">
          <DialogTitle className="
            text-2xl font-bold
            bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400
            bg-clip-text text-transparent
          ">
            Detalles del Usuario
          </DialogTitle>
          <DialogDescription className="dark:text-slate-400 text-slate-600">
            Información completa y segura del perfil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4 relative z-10">
          {/* Profile Header */}
          <div className="
            group relative overflow-hidden rounded-xl
            bg-gradient-to-br from-white to-slate-50/50
            dark:from-slate-800/60 dark:to-slate-900/40
            border border-slate-200/50 dark:border-slate-700/50
            p-6
          ">
            {/* Background accent */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />
            </div>

            <div className="relative flex gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Avatar className="
                  h-20 w-20 border-3 border-slate-200/60 dark:border-slate-700/60
                  ring-4 ring-white/30 dark:ring-slate-900/30
                  group-hover:border-blue-300/80 dark:group-hover:border-blue-600/60
                  transition-all duration-300
                  relative
                ">
                  <AvatarImage src={profilePicture?.url} />
                  <AvatarFallback className="
                    bg-gradient-to-br from-blue-100 to-purple-100
                    dark:from-blue-900/50 dark:to-purple-900/50
                    text-slate-700 dark:text-slate-100 text-xl font-bold
                  ">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {user.givenNames} {user.lastNames}
                  </h2>
                  <Badge className={`${status.className} font-semibold`}>
                    {status.text}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  @{user.username}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {roleName}
                    </span>
                  </div>
                  {user.accountVerified && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        Verificado
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="
              grid w-full grid-cols-3 md:grid-cols-4 gap-2
              bg-slate-100/50 dark:bg-slate-800/50
              border border-slate-200/30 dark:border-slate-700/30
              rounded-lg p-1
              mb-4
            ">
              <TabsTrigger
                value="info"
                className="
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20
                  data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
                  data-[state=active]:border data-[state=active]:border-blue-200/50 dark:data-[state=active]:border-blue-700/50
                  transition-all duration-300
                  rounded-md text-xs md:text-sm
                "
              >
                <UserIcon className="w-4 h-4 mr-1" />
                Info
              </TabsTrigger>
              <TabsTrigger
                value="pictures"
                className="
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20
                  data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
                  data-[state=active]:border data-[state=active]:border-blue-200/50 dark:data-[state=active]:border-blue-700/50
                  transition-all duration-300
                  rounded-md text-xs md:text-sm
                "
              >
                <FileText className="w-4 h-4 mr-1" />
                Fotos
              </TabsTrigger>
              
              {/* Demo: Show parent/teacher tabs conditionally or always for demo */}
              {(parentDetails || roleName?.toLowerCase().includes('padre') || roleName?.toLowerCase().includes('parent')) && (
                <TabsTrigger
                  value="parent"
                  className="
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20
                    data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400
                    data-[state=active]:border data-[state=active]:border-emerald-200/50 dark:data-[state=active]:border-emerald-700/50
                    transition-all duration-300
                    rounded-md text-xs md:text-sm
                  "
                >
                  <Users className="w-4 h-4 mr-1" />
                  Padre
                </TabsTrigger>
              )}
              {(teacherDetails || roleName?.toLowerCase().includes('maestro') || roleName?.toLowerCase().includes('docente') || roleName?.toLowerCase().includes('teacher')) && (
                <TabsTrigger
                  value="teacher"
                  className="
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20
                    data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400
                    data-[state=active]:border data-[state=active]:border-purple-200/50 dark:data-[state=active]:border-purple-700/50
                    transition-all duration-300
                    rounded-md text-xs md:text-sm
                  "
                >
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Docente
                </TabsTrigger>
              )}
            </TabsList>

            {/* Información Tab */}
            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Información Personal */}
              <Card className="
                border border-slate-200/50 dark:border-slate-700/50
                bg-gradient-to-br from-white/50 to-slate-50/50
                dark:from-slate-800/40 dark:to-slate-900/30
                hover:shadow-md transition-all duration-300
              ">
                <CardHeader>
                  <CardTitle className="
                    text-sm font-bold
                    bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400
                    bg-clip-text text-transparent
                    flex items-center gap-2
                  ">
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-blue-50/30 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide">Nombres</p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-1">{user.givenNames}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-800/30">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide">Apellidos</p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-1">{user.lastNames}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200/30 dark:border-amber-800/30">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide">DPI</p>
                      <p className="font-mono font-semibold text-slate-900 dark:text-white mt-1">{user.dpi}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-50/30 dark:bg-rose-950/20 border border-rose-200/30 dark:border-rose-800/30">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wide">Género</p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-1">
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
              <Card className="
                border border-slate-200/50 dark:border-slate-700/50
                bg-gradient-to-br from-white/50 to-slate-50/50
                dark:from-slate-800/40 dark:to-slate-900/30
                hover:shadow-md transition-all duration-300
              ">
                <CardHeader>
                  <CardTitle className="
                    text-sm font-bold
                    bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400
                    bg-clip-text text-transparent
                    flex items-center gap-2
                  ">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/30">
                    <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Email</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{user.email}</p>
                    </div>
                    {user.accountVerified && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50/30 dark:bg-teal-950/20 border border-teal-200/30 dark:border-teal-800/30">
                      <Phone className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Teléfono</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rol y Permisos */}
              <Card className="
                border border-slate-200/50 dark:border-slate-700/50
                bg-gradient-to-br from-white/50 to-slate-50/50
                dark:from-slate-800/40 dark:to-slate-900/30
                hover:shadow-md transition-all duration-300
              ">
                <CardHeader>
                  <CardTitle className="
                    text-sm font-bold
                    bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400
                    bg-clip-text text-transparent
                    flex items-center gap-2
                  ">
                    <Shield className="w-4 h-4 text-purple-500" />
                    Rol y Permisos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-800/30">
                    <Badge className="
                      bg-purple-100/80 dark:bg-purple-900/40
                      text-purple-700 dark:text-purple-300
                      border border-purple-200/50 dark:border-purple-700/50
                      font-bold text-sm
                    ">
                      <Shield className="w-3 h-3 mr-2" />
                      {roleName}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Estado y Acceso */}
              <Card className="
                border border-slate-200/50 dark:border-slate-700/50
                bg-gradient-to-br from-white/50 to-slate-50/50
                dark:from-slate-800/40 dark:to-slate-900/30
                hover:shadow-md transition-all duration-300
              ">
                <CardHeader>
                  <CardTitle className="
                    text-sm font-bold
                    bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400
                    bg-clip-text text-transparent
                    flex items-center gap-2
                  ">
                    <Zap className="w-4 h-4 text-cyan-500" />
                    Estado y Acceso
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50/30 to-green-50/20 dark:from-emerald-950/20 dark:to-green-950/10 border border-emerald-200/30 dark:border-emerald-800/30">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-2">
                      Estado
                    </p>
                    <Badge className={`
                      ${user.isActive
                        ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                      }
                      border ${user.isActive
                        ? 'border-emerald-200/50 dark:border-emerald-700/50'
                        : 'border-slate-200/50 dark:border-slate-700/50'
                      }
                      font-bold
                    `}>
                      {user.isActive ? (
                        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Activo</span>
                      ) : (
                        <span className="flex items-center gap-1"><Circle className="w-3 h-3" /> Inactivo</span>
                      )}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50/30 to-cyan-50/20 dark:from-blue-950/20 dark:to-cyan-950/10 border border-blue-200/30 dark:border-blue-800/30">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-2">
                      Acceso Plataforma
                    </p>
                    <div className="flex items-center gap-2">
                      {user.canAccessPlatform ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            Permitido
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                            Bloqueado
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fechas - Auditoría */}
              <Card className="
                border border-slate-200/50 dark:border-slate-700/50
                bg-gradient-to-br from-white/50 to-slate-50/50
                dark:from-slate-800/40 dark:to-slate-900/30
                hover:shadow-md transition-all duration-300
              ">
                <CardHeader>
                  <CardTitle className="
                    text-sm font-bold
                    bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400
                    bg-clip-text text-transparent
                    flex items-center gap-2
                  ">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Auditoría
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-200/30 dark:border-indigo-800/30">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Creado:</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50/30 dark:bg-violet-950/20 border border-violet-200/30 dark:border-violet-800/30">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Actualizado:</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fotos Tab */}
            <TabsContent value="pictures" className="space-y-4 mt-4">
              {pictures && pictures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pictures.map((picture) => (
                    <Card
                      key={picture.id}
                      className="
                        border border-slate-200/50 dark:border-slate-700/50
                        bg-gradient-to-br from-white/50 to-slate-50/50
                        dark:from-slate-800/40 dark:to-slate-900/30
                        overflow-hidden
                        group hover:shadow-lg transition-all duration-300
                      "
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <Badge className="
                            bg-blue-100/80 dark:bg-blue-900/40
                            text-blue-700 dark:text-blue-300
                            border border-blue-200/50 dark:border-blue-700/50
                            font-semibold text-xs
                          ">
                            {picture.kind === 'profile'
                              ? '👤 Perfil'
                              : picture.kind === 'document'
                                ? '📄 Documento'
                                : picture.kind === 'evidence'
                                  ? '📸 Evidencia'
                                  : picture.kind}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 aspect-square group-hover:shadow-md transition-all duration-300">
                          <img
                            src={picture.url}
                            alt={`Foto ${picture.kind}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/images/user/user-01.jpg';
                            }}
                          />
                        </div>
                        {picture.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {picture.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(picture.uploadedAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="
                  text-center py-16
                  bg-gradient-to-br from-slate-50 to-slate-100/50
                  dark:from-slate-800/40 dark:to-slate-900/30
                  rounded-xl border border-slate-200/50 dark:border-slate-700/50
                ">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No hay fotos disponibles</p>
                </div>
              )}
            </TabsContent>

            {/* ParentDetails Tab */}
            {(parentDetails || roleName?.toLowerCase().includes('padre') || roleName?.toLowerCase().includes('parent')) && (
              <TabsContent value="parent" className="space-y-4 mt-4">
                
                {/* Display existing parent details */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Contact Section */}
                  <Card className="border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/30">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-500" />
                        Información de Contacto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/30">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Email Alternativo</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{parentDetails?.email || 'No disponible'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-teal-50/30 dark:bg-teal-950/20 border border-teal-200/30 dark:border-teal-800/30">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Teléfono de Trabajo</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{parentDetails?.workPhone || 'No disponible'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Section */}
                  <Card className="border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/30">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-purple-500" />
                        Información Profesional
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-800/30">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Ocupación</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{parentDetails?.occupation || 'No disponible'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-violet-50/30 dark:bg-violet-950/20 border border-violet-200/30 dark:border-violet-800/30">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Lugar de Trabajo</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{parentDetails?.workplace || 'No disponible'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sponsor Section */}
                  <Card className="border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/30">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-500" />
                        Estado de Encargado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge className={`
                        ${parentDetails?.isSponsor
                          ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                        }
                        border ${parentDetails?.isSponsor
                          ? 'border-emerald-200/50 dark:border-emerald-700/50'
                          : 'border-slate-200/50 dark:border-slate-700/50'
                        }
                        font-bold
                      `}>
                        {parentDetails?.isSponsor ? 'Sí, es encargado' : 'No es encargado'}
                      </Badge>
                      {parentDetails?.sponsorInfo && (
                        <div className="p-3 rounded-lg bg-orange-50/30 dark:bg-orange-950/20 border border-orange-200/30 dark:border-orange-800/30">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Información Adicional</p>
                          <p className="text-sm text-slate-900 dark:text-white">{parentDetails?.sponsorInfo}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Parent-Student Links Section */}
                  <Card className="border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/30">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Users className="w-4 h-4 text-sky-500" />
                        Estudiantes a Cargo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ParentStudentLinksDialog parentId={user.id} onSuccess={() => {}} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {/* TeacherDetails Tab */}
            {(teacherDetails || roleName?.toLowerCase().includes('maestro') || roleName?.toLowerCase().includes('docente') || roleName?.toLowerCase().includes('teacher')) && (
              <TabsContent value="teacher" className="space-y-4 mt-4">
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Employment Section */}
                  <Card className="border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/30">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Información de Empleo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-50/30 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Fecha de Contratación</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {teacherDetails?.hiredDate
                            ? new Date(teacherDetails.hiredDate).toLocaleDateString('es-ES')
                            : 'No disponible'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Academic Section */}
                  <Card className="border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/30">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-500" />
                        Información Académica
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-800/30">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">Grado Académico</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{teacherDetails?.academicDegree || 'No disponible'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Classroom Role Section */}
                  <Card className="border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-900/30">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        Rol en el Aula
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={`
                        ${teacherDetails?.isHomeroomTeacher
                          ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                        }
                        border ${teacherDetails?.isHomeroomTeacher
                          ? 'border-emerald-200/50 dark:border-emerald-700/50'
                          : 'border-slate-200/50 dark:border-slate-700/50'
                        }
                        font-bold
                      `}>
                        {teacherDetails?.isHomeroomTeacher ? 'Maestro Guía' : 'No es Maestro Guía'}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}