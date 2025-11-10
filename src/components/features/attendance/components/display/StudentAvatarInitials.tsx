'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StudentAvatarInitialsProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CONFIG = {
  xs: { container: 'w-6 h-6 text-xs' },
  sm: { container: 'w-8 h-8 text-sm' },
  md: { container: 'w-10 h-10 text-base' },
  lg: { container: 'w-12 h-12 text-lg' },
  xl: { container: 'w-16 h-16 text-2xl' },
};

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

export default function StudentAvatarInitials({
  name,
  size = 'md',
  className,
}: StudentAvatarInitialsProps) {
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getColorByName = (fullName: string): string => {
    const hash = fullName
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  };

  const initials = getInitials(name);
  const color = getColorByName(name);
  const sizeClass = SIZE_CONFIG[size]?.container || SIZE_CONFIG['md'].container;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white',
        color,
        sizeClass,
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
