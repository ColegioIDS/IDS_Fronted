// components/ui/avatar/Avatar.tsx
'use client';

import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

export const Avatar = ({
  src,
  name = 'Usuario',
  size = 44,
  className = '',
}: AvatarProps) => {
  const [localAvatar, setLocalAvatar] = useState('');

  useEffect(() => {
    // Paleta de colores azules/amarillos/verdes
    const colorPalette = [
      '3B82F6', // blue-500
      '6366F1', // indigo-500
      '8B5CF6', // violet-500
      '10B981', // emerald-500
      '14B8A6', // teal-500
      'F59E0B', // amber-500
      'EF4444', // red-500
      'EC4899', // pink-500
      'A855F7', // purple-500
      '22C55E', // green-500
    ];
    // Color aleatorio diferente en cada renderización
    const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

    const avatar = createAvatar(initials, {
      size,
      fontSize: 35,
      seed: name.trim() || 'User',
      backgroundColor: [randomColor],
      backgroundType: ['solid'],
      fontFamily: ['Arial'],
      fontWeight: 600,
      chars: 2,
    });

    const svg = avatar.toString();
    setLocalAvatar(svg);
  }, [name, size]); // ¡Importante! No agregues dependencias innecesarias



  if (src) {
    return (
      <Image
        width={size}
        height={size}
        src={src}
        alt={name}
        className={`rounded-full object-cover ${className}`}
        onError={(e) => {
          e.currentTarget.src = `data:image/svg+xml;utf8,${encodeURIComponent(localAvatar)}`;
          e.currentTarget.classList.add('rounded-full');
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(localAvatar)}")`,
        backgroundSize: 'cover'
      }}
    />
  );
};