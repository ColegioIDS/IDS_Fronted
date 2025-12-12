'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, FileText, CheckCircle2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/user-profile';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface UserNavProps {
  className?: string;
}

export function UserNav({ className }: UserNavProps) {
  const router = useRouter();
  const { profile, isLoading } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
      router.push('/login');
    } catch (error) {
    }
  };

  if (isLoading) {
    return (
      <div className={`w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse ${className}`} />
    );
  }

  if (!profile) {
    return (
      <Link href="/login">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-2 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <User className="w-4 h-4 mr-2" />
          Iniciar Sesión
        </Button>
      </Link>
    );
  }

  const initials = `${profile.givenNames?.[0] || ''}${profile.lastNames?.[0] || ''}`.toUpperCase();
  const profilePicture = profile.pictures?.find(
    (pic) => pic.kind === 'profile_picture'
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-110 group ${className}`}
        >
          <Avatar className="h-10 w-10 ring-2 ring-blue-200 dark:ring-blue-800 group-hover:ring-blue-400 dark:group-hover:ring-blue-600 transition-all duration-300 group-hover:shadow-lg">
            <AvatarImage src={profilePicture?.url} alt={profile.givenNames} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl animate-in fade-in slide-in-from-top-5 duration-300 p-2">
        {/* Profile Header */}
        <div className="flex items-center gap-4 p-4 mb-3 bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-50 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-indigo-950/30 rounded-xl border-2 border-blue-200 dark:border-blue-800/50 shadow-sm">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-2 ring-blue-300 dark:ring-blue-700 shadow-lg">
              <AvatarImage src={profilePicture?.url} alt={profile.givenNames} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-base font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {profile.accountVerified && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 dark:bg-emerald-600 p-1 ring-2 ring-white dark:ring-slate-900">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {profile.givenNames} {profile.lastNames}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate mb-1">
              {profile.email}
            </p>
            {profile.role?.name && (
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                {profile.role.name}
              </span>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700 my-2" />

        {/* Menu Items */}
        <DropdownMenuLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-3 py-2">
          Menú
        </DropdownMenuLabel>

        <div className="space-y-1 px-1">
          <DropdownMenuItem asChild>
            <Link href="/user-profile" className="cursor-pointer group">
              <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Mi Perfil</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Ver y editar información</p>
                </div>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/user-profile?tab=settings" className="cursor-pointer group">
              <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all duration-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/40 dark:to-teal-800/40 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Configuración</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Preferencias y privacidad</p>
                </div>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/documents" className="cursor-pointer group">
              <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all duration-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Mis Documentos</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Acceso a tus archivos</p>
                </div>
              </div>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700 my-2" />

        {/* Logout */}
        <div className="px-1 pb-1">
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/20 group"
          >
            <div className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Cerrar Sesión</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Salir de tu cuenta</p>
              </div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}