// src/components/attendance/components/attendance-grid/StudentAvatar.tsx
"use client";

import { useState, useEffect } from 'react';
import { User, Camera, ImageOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudentAvatarProps {
  student: {
    id: number;
    givenNames: string;
    lastNames: string;
    pictures?: Array<{
      id: number;
      url: string;
      kind: string;
      description?: string;
    }>;
    codeSIRE?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showCode?: boolean;
  showUploadButton?: boolean;
  onClick?: () => void;
  className?: string;
  fallbackGradient?: boolean;
}

// 🎨 Configuración de tamaños
const SIZE_CONFIG = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-xs',
    icon: 'h-3 w-3',
    badge: 'text-xs px-1.5 py-0.5'
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-sm',
    icon: 'h-4 w-4',
    badge: 'text-xs px-2 py-1'
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm',
    icon: 'h-4 w-4',
    badge: 'text-xs px-2 py-1'
  },
  lg: {
    container: 'w-16 h-16',
    text: 'text-lg',
    icon: 'h-6 w-6',
    badge: 'text-sm px-3 py-1'
  },
  xl: {
    container: 'w-20 h-20',
    text: 'text-xl',
    icon: 'h-8 w-8',
    badge: 'text-sm px-3 py-1'
  }
};

// 🌈 Gradientes para fallback
const GRADIENT_COLORS = [
  'from-blue-400 to-purple-500',
  'from-green-400 to-blue-500',
  'from-purple-400 to-pink-500',
  'from-yellow-400 to-orange-500',
  'from-red-400 to-pink-500',
  'from-indigo-400 to-purple-500',
  'from-teal-400 to-cyan-500',
  'from-orange-400 to-red-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-blue-500'
];

export default function StudentAvatar({
  student,
  size = 'md',
  showName = false,
  showCode = false,
  showUploadButton = false,
  onClick,
  className = '',
  fallbackGradient = true
}: StudentAvatarProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const sizeConfig = SIZE_CONFIG[size];

  // 🔍 Buscar foto de perfil del estudiante
  useEffect(() => {
    const profilePicture = student.pictures?.find(
      pic => pic.kind === 'profile'
    );

    if (profilePicture?.url) {
      setImageUrl(profilePicture.url);
      setImageLoading(true);
      setImageError(false);
    } else {
      setImageUrl(null);
      setImageLoading(false);
      setImageError(false);
    }
  }, [student.pictures]);

  // 🎨 Generar initiales
  const getInitials = () => {
    const firstInitial = student.givenNames.charAt(0).toUpperCase();
    const lastInitial = student.lastNames.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  // 🌈 Generar gradiente consistente basado en el ID del estudiante
  const getGradientColor = () => {
    if (!fallbackGradient) return 'from-gray-400 to-gray-500';
    
    const colorIndex = student.id % GRADIENT_COLORS.length;
    return GRADIENT_COLORS[colorIndex];
  };

  // 📸 Manejar carga de imagen
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    setImageUrl(null);
  };

  // 📤 Manejar subida de foto (placeholder)
  const handleUploadPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implementar lógica de subida de foto
    alert('Funcionalidad de subida de foto pendiente de implementar');
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* 📷 Avatar principal */}
      <div className="relative">
        <div
          className={cn(
            sizeConfig.container,
            "rounded-full flex items-center justify-center overflow-hidden transition-all duration-200",
            onClick && "cursor-pointer hover:scale-105 hover:shadow-md",
            imageUrl && !imageError ? "bg-gray-100 dark:bg-gray-800" : `bg-gradient-to-br ${getGradientColor()}`
          )}
          onClick={onClick}
        >
          {/* 🖼️ Imagen real del estudiante */}
          {imageUrl && !imageError ? (
            <div className="relative w-full h-full">
              <img
                src={imageUrl}
                alt={`${student.givenNames} ${student.lastNames}`}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
              
              {/* ⏳ Loader mientras carga la imagen */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Loader2 className={cn(sizeConfig.icon, "animate-spin text-gray-400")} />
                </div>
              )}
            </div>
          ) : (
            // 🎭 Fallback con iniciales o icono
            <>
              {student.givenNames && student.lastNames ? (
                <span className={cn(sizeConfig.text, "font-semibold text-white drop-shadow-sm")}>
                  {getInitials()}
                </span>
              ) : (
                <User className={cn(sizeConfig.icon, "text-white/80")} />
              )}
            </>
          )}
        </div>

        {/* 📤 Botón de subida de foto */}
        {showUploadButton && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute -bottom-1 -right-1 w-6 h-6 p-0 rounded-full shadow-md hover:shadow-lg transition-all"
            onClick={handleUploadPhoto}
            title="Subir foto"
          >
            <Camera className="h-3 w-3" />
          </Button>
        )}

        {/* ❌ Indicador de imagen faltante */}
        {!imageUrl && size !== 'xs' && size !== 'sm' && (
          <div className="absolute -top-1 -right-1">
            <Badge variant="secondary" className="w-4 h-4 p-0 flex items-center justify-center">
              <ImageOff className="h-2 w-2 text-gray-500" />
            </Badge>
          </div>
        )}
      </div>

      {/* 📝 Información del estudiante */}
      {(showName || showCode) && (
        <div className="flex-1 min-w-0">
          {showName && (
            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight truncate">
              {student.givenNames.split(' ')[0]} {student.lastNames.split(' ')[0]}
            </div>
          )}
          
          {showCode && student.codeSIRE && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Código: {student.codeSIRE}
            </div>
          )}
          
          {showName && !student.givenNames && (
            <div className="text-xs text-gray-400 dark:text-gray-600 italic">
              Sin nombre
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 🎯 Componentes predefinidos para casos comunes

// Avatar pequeño para listas
export const SmallStudentAvatar = (props: Omit<StudentAvatarProps, 'size'>) => (
  <StudentAvatar size="sm" {...props} />
);

// Avatar mediano para cards
export const MediumStudentAvatar = (props: Omit<StudentAvatarProps, 'size'>) => (
  <StudentAvatar size="md" showName {...props} />
);

// Avatar grande para perfiles
export const LargeStudentAvatar = (props: Omit<StudentAvatarProps, 'size'>) => (
  <StudentAvatar size="lg" showName showCode showUploadButton {...props} />
);

// Avatar para tabla de asistencia
export const AttendanceStudentAvatar = (props: Omit<StudentAvatarProps, 'size' | 'showName'>) => (
  <StudentAvatar size="md" {...props} />
);

// Avatar con información completa
export const DetailedStudentAvatar = (props: Omit<StudentAvatarProps, 'showName' | 'showCode'>) => (
  <StudentAvatar showName showCode {...props} />
);