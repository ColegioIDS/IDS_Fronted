'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileEditModal } from './ProfileEditModal';
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
  CalendarCheck,
  History,
  Sparkles,
} from 'lucide-react';

interface UserProfilePageProps {
  profile: any;
  isLoading?: boolean;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  profile,
  isLoading = false,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (givenNames: string, lastNames: string) => {
    return `${givenNames?.charAt(0) || ''}${lastNames?.charAt(0) || ''}`.toUpperCase();
  };

  const calculateYearsOfService = (hiredDate: string) => {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Header Section */}
      <div className="relative">
        {/* Solid Color Background */}
        <div className="absolute inset-0 h-80 bg-blue-500 dark:bg-blue-700" />

        {/* Decorative Wave */}
        <div className="absolute inset-0 h-80 overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L48 110C96 100 192 80 288 75C384 70 480 80 576 85C672 90 768 90 864 85C960 80 1056 70 1152 70C1248 70 1344 80 1392 85L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              fill="rgb(248 250 252)"
              fillOpacity="0.5"
            />
            <path
              d="M0 120L48 115C96 110 192 100 288 95C384 90 480 90 576 92C672 94 768 98 864 98C960 98 1056 94 1152 90C1248 86 1344 82 1392 80L1440 78V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              fill="rgb(248 250 252)"
            />
          </svg>
        </div>

        <div className="container relative mx-auto max-w-6xl px-4 pt-8">
          {/* Top Actions */}
          <div className="flex justify-end pb-6">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-lg rounded-lg font-semibold transition-all"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </div>

          {/* Profile Card */}
          <Card className="relative overflow-visible border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-2xl">
            <CardContent className="relative pt-0">
              {/* Avatar flotante que sobresale */}
              <div className="flex flex-col items-center -mt-20 gap-6 lg:flex-row lg:items-start lg:gap-8 lg:-mt-16 lg:pl-8">
                <div className="relative z-10 flex-shrink-0">
                  <div className="rounded-full p-1 bg-blue-500 dark:bg-blue-600 shadow-2xl">
                    <div className="rounded-full bg-white dark:bg-slate-900 p-1">
                      <Avatar className="h-40 w-40 border-4 border-white dark:border-slate-900 shadow-inner">
                        <AvatarImage
                          src={profile?.profilePicture?.url}
                          alt={`${profile?.givenNames} ${profile?.lastNames}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-blue-500 dark:bg-blue-600 text-white text-4xl font-bold">
                          {getInitials(profile?.givenNames, profile?.lastNames)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {profile?.accountVerified && (
                    <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 dark:bg-emerald-600 p-2.5 shadow-lg ring-4 ring-white dark:ring-slate-900">
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
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Contact Info Card */}
            <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-2xl">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-200 dark:border-blue-800 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500 dark:bg-blue-600 shadow-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Información de Contacto</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Datos para comunicación</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-0">
                <div className="grid sm:grid-cols-2">
                  <div className="p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                          Correo Electrónico
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{profile?.email}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> No editable
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30 flex-shrink-0">
                        <Phone className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                          Teléfono
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{profile?.phone}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Número principal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info Card */}
            <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-2xl">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-200 dark:border-blue-800 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500 shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Información Personal</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Datos personales del perfil</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 dark:bg-blue-600 shadow-lg mb-4">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Fecha de Nacimiento
                    </p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{formatDate(profile?.birthDate)}</p>
                  </div>

                  <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 transition-all hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500 dark:bg-teal-600 shadow-lg mb-4">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Género
                    </p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{profile?.gender}</p>
                  </div>

                  <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 dark:bg-amber-600 shadow-lg mb-4">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">DPI</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{profile?.dpi}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Info Card */}
            {profile?.teacherDetails && (
              <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-2xl">
                <div className="bg-amber-50 dark:bg-amber-900/20 border-b-2 border-amber-200 dark:border-amber-800 px-6 py-5">
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
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 dark:bg-blue-600 shadow-lg mb-4">
                        <CalendarCheck className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Fecha de Contratación
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{formatDate(profile?.teacherDetails?.hiredDate)}</p>
                    </div>

                    <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 transition-all hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500 dark:bg-teal-600 shadow-lg mb-4">
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

                    <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 dark:bg-amber-600 shadow-lg mb-4">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Título Académico
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {profile?.teacherDetails?.academicDegree}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parent Info Card */}
            {profile?.parentDetails && (
              <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-2xl">
                <div className="bg-purple-50 dark:bg-purple-900/20 border-b-2 border-purple-200 dark:border-purple-800 px-6 py-5">
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
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 transition-all hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500 dark:bg-teal-600 shadow-lg mb-4">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Ocupación
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{profile?.parentDetails?.occupation}</p>
                    </div>

                    <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 dark:bg-emerald-600 shadow-lg mb-4">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                        Lugar de Trabajo
                      </p>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{profile?.parentDetails?.workplace}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Address Card */}
            <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-2xl">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-200 dark:border-blue-800 px-6 py-5">
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
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                      <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Calle</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 break-words">
                        {profile?.address?.street || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Zona</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{profile?.address?.zone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                      <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Municipio</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {profile?.address?.municipality?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {profile?.address?.municipality?.department?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Card */}
            <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all rounded-2xl">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-200 dark:border-blue-800 px-6 py-5">
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
              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Estado de verificación */}
                  <div className="overflow-hidden rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 p-5">
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
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Cuenta creada
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(profile?.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                        <History className="h-5 w-5 text-teal-600 dark:text-teal-400" />
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
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
      />
    </div>
  );
};