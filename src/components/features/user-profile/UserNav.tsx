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
import { User, Settings, LogOut, FileText } from 'lucide-react';
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
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={`w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
    );
  }

  if (!profile) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
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
          className={`relative h-10 w-10 rounded-full ${className}`}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={profilePicture?.url} alt={profile.givenNames} />
            <AvatarFallback className="bg-blue-500 text-white font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Profile Header */}
        <div className="flex items-center gap-2 p-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profilePicture?.url} alt={profile.givenNames} />
            <AvatarFallback className="bg-blue-500 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {profile.givenNames} {profile.lastNames}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {profile.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuLabel className="text-xs">Opciones</DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <Link href="/user-profile" className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Mi Perfil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/user-profile?tab=settings" className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/documents" className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            Mis Documentos
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 dark:text-red-400 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
