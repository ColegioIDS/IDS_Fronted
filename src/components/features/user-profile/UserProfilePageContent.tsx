'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileEditModal } from './ProfileEditModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  CheckCircle,
  Pencil,
  Building2,
  Users,
  Shield,
  Briefcase,
  Award,
  TrendingUp,
  CreditCard,
  Home,
  Navigation,
  CalendarCheck,
  History,
  Sparkles,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/data/user-profile';
import { useAuth } from '@/context/AuthContext';
import { USER_PROFILE_PERMISSIONS } from '@/constants/modules-permissions/user-profile/user-profile.permissions';
import { TIMEZONE } from '@/config/timezone';

export function UserProfilePageContent() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { profile, isLoading, error, refetch } = useUserProfile();
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission(USER_PROFILE_PERMISSIONS.UPDATE.module, USER_PROFILE_PERMISSIONS.UPDATE.action);

  /** Formatea fechas en Horario de Guatemala (TIMEZONE desde .env) */
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: TIMEZONE,
    });
  };

  const getInitials = (givenNames: string | undefined, lastNames: string | undefined) => {
    return `${givenNames?.charAt(0) || ''}${lastNames?.charAt(0) || ''}`.toUpperCase();
  };

  const calculateYearsOfService = (hiredDate: string | undefined) => {
    if (!hiredDate) return 0;
    const hired = new Date(hiredDate);
    const now = new Date();
    return Math.floor((now.getTime() - hired.getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 m-4">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-600 dark:text-red-400 font-medium">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert className="border-2 m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="font-medium">No se encontró información del perfil</AlertDescription>
      </Alert>
    );
  }

  const emptyLabel = (value: string | undefined | null) => (value?.trim() ? value : '—');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
      {/* Page title - visible above hero */}
      <div className="px-6 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Mi Perfil
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
          Consulta y actualiza tu información personal
        </p>
      </div>

      {/* Hero Header Section */}
      <div className="relative">
        {/* Gradient Background with Animation */}
        <div className="absolute inset-0 h-72 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400/25 dark:bg-blue-600/25 rounded-full blur-3xl" />
          <div className="absolute top-16 -left-16 w-80 h-80 bg-indigo-400/15 dark:bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        {/* Wave */}
        <div className="absolute inset-0 h-72 overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full drop-shadow-lg"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0 120L48 110C96 100 192 80 288 75C384 70 480 80 576 85C672 90 768 90 864 85C960 80 1056 70 1152 70C1248 70 1344 80 1392 85L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              className="fill-slate-50 dark:fill-slate-950"
              fillOpacity="0.9"
            />
            <path
              d="M0 120L48 115C96 110 192 100 288 95C384 90 480 90 576 92C672 94 768 98 864 98C960 98 1056 94 1152 90C1248 86 1344 82 1392 80L1440 78V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              className="fill-slate-50 dark:fill-slate-950"
            />
          </svg>
        </div>

        <div className="relative pt-6 px-6 z-20">
          {/* Top Actions */}
          <div className="flex justify-end pb-6 relative z-30">
            {canUpdate && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 shadow-lg hover:shadow-xl rounded-xl font-semibold transition-all duration-300 group cursor-pointer relative z-40"
              >
                <Pencil className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                Editar Perfil
              </Button>
            )}
          </div>

          {/* Profile Card */}
          <Card className="relative overflow-visible border-0 shadow-2xl hover:shadow-3xl bg-white dark:bg-slate-900 rounded-3xl transition-all duration-500 backdrop-blur-sm">
            <CardContent className="relative pt-0">
              {/* Avatar flotante */}
              <div className="flex flex-col items-center -mt-16 gap-6 lg:flex-row lg:items-start lg:gap-8 lg:-mt-14 lg:pl-8">
                <div className="relative z-10 flex-shrink-0 group">
                  <div className="rounded-full p-1 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-600 dark:via-blue-700 dark:to-indigo-700 shadow-2xl group-hover:shadow-blue-500/50 dark:group-hover:shadow-blue-700/50 transition-all duration-300 group-hover:scale-105">
                    <div className="rounded-full bg-white dark:bg-slate-900 p-1">
                      <Avatar className="h-40 w-40 border-4 border-white dark:border-slate-900 shadow-inner transition-transform duration-300 group-hover:scale-105">
                        <AvatarImage
                          src={profile?.profilePicture?.url}
                          alt={`${profile?.givenNames} ${profile?.lastNames}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white text-4xl font-bold">
                          {getInitials(profile?.givenNames, profile?.lastNames)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {profile?.accountVerified && (
                    <div className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-2.5 shadow-lg ring-4 ring-white dark:ring-slate-900 animate-pulse">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Name & Info */}
                <div className="flex-1 pt-6 pb-8 text-center lg:pt-12 lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {profile?.accountVerified ? 'Perfil Verificado' : 'Perfil Pendiente'}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 lg:text-4xl">
                    {profile?.givenNames} {profile?.lastNames}
                  </h1>
                  <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 font-medium">@{profile?.username}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 px-4 py-2 text-sm font-semibold">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      {profile?.role?.name}
                    </Badge>
                    {profile?.teacherDetails?.isHomeroomTeacher && (
                      <Badge className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 px-4 py-2 text-sm font-semibold">
                        <Users className="mr-2 h-4 w-4" />
                        Maestro Guía
                      </Badge>
                    )}
                    {profile?.parentDetails?.isSponsor && (
                      <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-4 py-2 text-sm font-semibold">
                        <Award className="mr-2 h-4 w-4" />
                        Patrocinador
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats Cards */}
                {profile?.teacherDetails && (
                  <div className="flex gap-3 pb-8 lg:pt-10 lg:pr-6">
                    <div className="flex flex-col items-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 px-5 py-4 transition-all hover:shadow-lg hover:scale-105">
                      <div className="rounded-full bg-blue-500 dark:bg-blue-600 p-2 shadow-lg mb-3">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {calculateYearsOfService(profile?.teacherDetails?.hiredDate)}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Años</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full mx-auto px-0 py-10">
        <div className="grid gap-8 lg:grid-cols-3 px-6">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Contact Info Card */}
            <Card className="overflow-hidden border-2 border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 rounded-2xl group hover:scale-[1.01] relative">
              {/* Liquid gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-cyan-400/10 dark:from-blue-600/20 dark:via-blue-500/10 dark:to-cyan-600/20"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/15 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/10 dark:bg-cyan-500/15 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b-2 border-blue-200/30 dark:border-blue-800/30 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Información de Contacto</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Datos para comunicación</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-0 relative z-10">
                <div className="grid sm:grid-cols-2">
                  <div className="p-8 border-b sm:border-b-0 sm:border-r border-slate-200/30 dark:border-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100/50 dark:bg-blue-900/30 backdrop-blur-sm flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                          Correo Electrónico
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{emptyLabel(profile?.email)}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> No editable
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 hover:bg-white/20 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100/50 dark:bg-teal-900/30 backdrop-blur-sm flex-shrink-0">
                        <Phone className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                          Teléfono
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{emptyLabel(profile?.phone)}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Número principal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info Card */}
            <Card className="overflow-hidden border-2 border-teal-200/50 dark:border-teal-800/50 shadow-lg hover:shadow-2xl hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 rounded-2xl group hover:scale-[1.01] relative">
              {/* Liquid gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-green-400/10 dark:from-teal-600/20 dark:via-teal-500/10 dark:to-green-600/20"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-teal-400/10 dark:bg-teal-500/15 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-400/10 dark:bg-green-500/15 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b-2 border-teal-200/30 dark:border-teal-800/30 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Información Personal</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Datos personales del perfil</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="overflow-hidden rounded-xl border-2 border-teal-200/30 dark:border-teal-800/30 bg-white/30 dark:bg-slate-800/20 backdrop-blur-sm p-5 transition-all hover:shadow-md hover:border-blue-300/50 dark:hover:border-blue-700/50 hover:bg-white/50 dark:hover:bg-slate-800/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg mb-4">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Fecha de Nacimiento
                    </p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{formatDate(profile?.birthDate)}</p>
                  </div>

                  <div className="overflow-hidden rounded-xl border-2 border-teal-200/30 dark:border-teal-800/30 bg-white/30 dark:bg-slate-800/20 backdrop-blur-sm p-5 transition-all hover:shadow-md hover:border-teal-300/50 dark:hover:border-teal-700/50 hover:bg-white/50 dark:hover:bg-slate-800/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 shadow-lg mb-4">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Género
                    </p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{emptyLabel(profile?.gender)}</p>
                  </div>

                  <div className="overflow-hidden rounded-xl border-2 border-teal-200/30 dark:border-teal-800/30 bg-white/30 dark:bg-slate-800/20 backdrop-blur-sm p-5 transition-all hover:shadow-md hover:border-amber-300/50 dark:hover:border-amber-700/50 hover:bg-white/50 dark:hover:bg-slate-800/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 shadow-lg mb-4">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">DPI</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{emptyLabel(profile?.dpi)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Info Card */}
            {profile?.teacherDetails && (
              <Card className="overflow-hidden border-2 border-amber-200/50 dark:border-amber-800/50 shadow-lg hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700 transition-all rounded-2xl relative">
                {/* Liquid gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-400/10 dark:from-amber-600/20 dark:via-amber-500/10 dark:to-orange-600/20"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 dark:bg-amber-500/15 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-400/10 dark:bg-orange-500/15 rounded-full blur-3xl -ml-32 -mb-32"></div>
                
                <div className="relative z-10 bg-amber-50/40 dark:bg-amber-900/20 backdrop-blur-md border-b-2 border-amber-200/30 dark:border-amber-800/30 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-600 dark:bg-amber-500 shadow-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Información Profesional</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Datos laborales y académicos</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="overflow-hidden rounded-xl border-2 border-amber-200/30 dark:border-amber-800/30 bg-white/30 dark:bg-slate-800/20 backdrop-blur-sm p-5 transition-all hover:shadow-md hover:border-blue-300/50 dark:hover:border-blue-700/50 hover:bg-white/50 dark:hover:bg-slate-800/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-lg mb-4">
                        <CalendarCheck className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Fecha de Contratación
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{formatDate(profile?.teacherDetails?.hiredDate)}</p>
                    </div>

                    <div className="overflow-hidden rounded-xl border-2 border-amber-200/30 dark:border-amber-800/30 bg-white/30 dark:bg-slate-800/20 backdrop-blur-sm p-5 transition-all hover:shadow-md hover:border-teal-300/50 dark:hover:border-teal-700/50 hover:bg-white/50 dark:hover:bg-slate-800/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 shadow-lg mb-4">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Maestro Guía
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex h-3 w-3 rounded-full ${
                            profile?.teacherDetails?.isHomeroomTeacher ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {profile?.teacherDetails?.isHomeroomTeacher ? 'Sí' : 'No'}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border-2 border-amber-200/30 dark:border-amber-800/30 bg-white/30 dark:bg-slate-800/20 backdrop-blur-sm p-5 transition-all hover:shadow-md hover:border-amber-300/50 dark:hover:border-amber-700/50 hover:bg-white/50 dark:hover:bg-slate-800/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 shadow-lg mb-4">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Título Académico
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {emptyLabel(profile?.teacherDetails?.academicDegree)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parent Info Card */}
            {profile?.parentDetails && (
              <Card className="overflow-hidden border-2 border-purple-200/50 dark:border-purple-800/50 shadow-lg hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all rounded-2xl relative">
                {/* Liquid gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-pink-400/10 dark:from-purple-600/20 dark:via-purple-500/10 dark:to-pink-600/20"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400/10 dark:bg-purple-500/15 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-400/10 dark:bg-pink-500/15 rounded-full blur-3xl -ml-32 -mb-32"></div>
                
                <div className="relative z-10 bg-purple-50/40 dark:bg-purple-900/20 backdrop-blur-md border-b-2 border-purple-200/30 dark:border-purple-800/30 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-600 dark:bg-purple-500 shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Información Familiar</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Datos laborales y personales</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border-2 border-purple-200/30 dark:border-purple-800/30 bg-white/30 dark:bg-slate-800/20 backdrop-blur-sm p-5 transition-all hover:shadow-md hover:border-teal-300/50 dark:hover:border-teal-700/50 hover:bg-white/50 dark:hover:bg-slate-800/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 shadow-lg mb-4">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Ocupación
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{profile?.parentDetails?.occupation}</p>
                    </div>

                    <div className="overflow-hidden rounded-xl border-2 border-purple-200/30 dark:border-purple-800/30 bg-white/30 dark:bg-slate-800/20 backdrop-blur-sm p-5 transition-all hover:shadow-md hover:border-emerald-300/50 dark:hover:border-emerald-700/50 hover:bg-white/50 dark:hover:bg-slate-800/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 shadow-lg mb-4">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Lugar de Trabajo
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{emptyLabel(profile?.parentDetails?.workplace)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Address Card */}
            <Card className="overflow-hidden border-2 border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all rounded-2xl relative">
              {/* Liquid gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-cyan-400/10 dark:from-blue-600/20 dark:via-blue-500/10 dark:to-cyan-600/20"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/15 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/10 dark:bg-cyan-500/15 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b-2 border-blue-200/30 dark:border-blue-800/30 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500 dark:bg-blue-600 shadow-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Dirección</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Ubicación de residencia</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100/50 dark:bg-blue-900/30 flex-shrink-0">
                      <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Calle</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 break-words">
                        {emptyLabel(profile?.address?.street)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm border border-teal-200/30 dark:border-teal-800/30 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100/50 dark:bg-teal-900/30 flex-shrink-0">
                      <Navigation className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Zona</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{emptyLabel(profile?.address?.zone)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-800/30 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 flex-shrink-0">
                      <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Municipio</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {emptyLabel(profile?.address?.municipality?.name)}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {emptyLabel(profile?.address?.municipality?.department?.name)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Card */}
            <Card className="overflow-hidden border-2 border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all rounded-2xl relative">
              {/* Liquid gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-cyan-400/10 dark:from-blue-600/20 dark:via-blue-500/10 dark:to-cyan-600/20"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/15 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/10 dark:bg-cyan-500/15 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b-2 border-blue-200/30 dark:border-blue-800/30 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500 shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cuenta</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Estado y actividad</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="space-y-5">
                  {/* Estado de verificación destacado */}
                  <div className="overflow-hidden rounded-xl bg-emerald-50/40 dark:bg-emerald-900/20 backdrop-blur-sm border-2 border-emerald-200/50 dark:border-emerald-800/50 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 dark:bg-emerald-600 shadow-lg">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">Estado</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {profile?.accountVerified ? 'Verificado' : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`px-3 py-1.5 font-semibold shadow-lg text-white ${
                          profile?.accountVerified
                            ? 'bg-emerald-500 dark:bg-emerald-600'
                            : 'bg-yellow-500 dark:bg-yellow-600'
                        }`}
                      >
                        {profile?.accountVerified ? 'Verificada' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>

                  {/* Fechas de cuenta */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100/50 dark:bg-blue-900/30">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Cuenta creada
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(profile?.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm border border-teal-200/30 dark:border-teal-800/30 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100/50 dark:bg-teal-900/30">
                        <History className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Última actualización
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(profile?.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          refetch();
        }}
        profile={profile}
      />
    </div>
  );
}