'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'lucide-react';
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
    <Card className="border-2 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800 h-24" />

      <CardContent className="relative pt-0 pb-6">
        {/* Avatar */}
        <div className="flex items-end gap-4 mb-4 -mt-16 relative z-10">
          <Avatar className="w-20 h-20 border-4 border-white dark:border-gray-900">
            <AvatarImage src={profilePicture?.url} alt={profile.givenNames} />
            <AvatarFallback className="bg-blue-500 text-white text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pb-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {profile.givenNames} {profile.lastNames}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3 mb-4">
          {profile.email && (
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white font-medium">{profile.email}</p>
            </div>
          )}

          {profile.phone && (
            <div className="text-sm">
              <p className="text-gray-500 dark:text-gray-400">Teléfono</p>
              <p className="text-gray-900 dark:text-white font-medium">{profile.phone}</p>
            </div>
          )}

          <div className="text-sm">
            <p className="text-gray-500 dark:text-gray-400">DPI</p>
            <p className="text-gray-900 dark:text-white font-medium">{profile.dpi}</p>
          </div>
        </div>

        {/* Action Button */}
        {onEditClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="w-full gap-2"
          >
            <Link className="w-4 h-4" />
            Ver Perfil Completo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
