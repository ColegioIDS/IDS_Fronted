'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Mail, Phone, FileText } from 'lucide-react';
import { UserProfile } from './UserProfileForm';

interface UserProfileCardProps {
  profile: UserProfile;
  onEditClick?: () => void;
}

export function UserProfileCard({
  profile,
  onEditClick,
}: UserProfileCardProps) {
  const initials = `${profile.givenNames?.[0] || ''}${profile.lastNames?.[0] || ''}`.toUpperCase();
  const profilePicture = profile.pictures?.find(
    (pic) => pic.kind === 'profile_picture'
  );

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] rounded-2xl group">
      {/* Header Background */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-600 dark:via-blue-700 dark:to-indigo-700 h-32 relative overflow-hidden">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
        {/* Decorative Circle */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/30 dark:bg-blue-500/30 rounded-full blur-3xl" />
      </div>

      <CardContent className="relative pt-0 pb-6">
        {/* Avatar + Info Section */}
        <div className="flex items-end gap-4 mb-6 -mt-16 relative z-10">
          <div className="ring-4 ring-white dark:ring-slate-900 rounded-full group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300">
            <Avatar className="w-24 h-24 border-2 border-blue-400 dark:border-blue-500 group-hover:scale-110 transition-transform duration-300 shadow-xl">
              <AvatarImage src={profilePicture?.url} alt={profile.givenNames} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 pb-2">
            <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {profile.givenNames} {profile.lastNames}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* Information Section */}
        <div className="space-y-3 mb-6">
          {profile.email && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 dark:bg-blue-600 shadow-md flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Correo</p>
                <p className="text-sm text-slate-900 dark:text-slate-100 font-medium truncate">{profile.email}</p>
              </div>
            </div>
          )}

          {profile.phone && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-teal-100/50 dark:from-teal-950/20 dark:to-teal-900/20 border-2 border-teal-200 dark:border-teal-900/30 hover:border-teal-300 dark:hover:border-teal-800 transition-all duration-300 hover:shadow-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 dark:bg-teal-600 shadow-md flex-shrink-0">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Teléfono</p>
                <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">{profile.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 border-2 border-amber-200 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 dark:bg-amber-600 shadow-md flex-shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">DPI</p>
              <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">{profile.dpi}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {onEditClick && (
          <Button
            onClick={onEditClick}
            className="w-full gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            Ver Perfil Completo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}