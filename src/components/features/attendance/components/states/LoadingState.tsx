// src/components/attendance/components/attendance-states/LoadingState.tsx
"use client";

import { ReactNode } from 'react';
import { Loader2, Users, GraduationCap, Calendar, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 🎨 Tipos de estados de carga
export type LoadingStateType = 
  | 'students'      // Cargando lista de estudiantes
  | 'grades'        // Cargando grados
  | 'sections'      // Cargando secciones
  | 'attendance'    // Cargando registros de asistencia
  | 'stats'         // Cargando estadísticas
  | 'saving'        // Guardando datos
  | 'page'          // Carga general de página
  | 'table'         // Carga específica de tabla
  | 'cards'         // Carga específica de cards
  | 'custom';       // Estado personalizado

interface LoadingStateProps {
  type: LoadingStateType;
  title?: string;
  description?: string;
  showSkeleton?: boolean;
  skeletonItems?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
}

// 🎨 Configuración de estados predefinidos
const LOADING_STATE_CONFIG = {
  'students': {
    icon: Users,
    title: 'Cargando estudiantes...',
    description: 'Obteniendo la lista de estudiantes matriculados',
    skeletonItems: 6
  },
  'grades': {
    icon: GraduationCap,
    title: 'Cargando grados...',
    description: 'Obteniendo los grados disponibles',
    skeletonItems: 4
  },
  'sections': {
    icon: Calendar,
    title: 'Cargando secciones...',
    description: 'Obteniendo las secciones del grado seleccionado',
    skeletonItems: 3
  },
  'attendance': {
    icon: BarChart3,
    title: 'Cargando asistencia...',
    description: 'Obteniendo los registros de asistencia del día',
    skeletonItems: 8
  },
  'stats': {
    icon: BarChart3,
    title: 'Cargando estadísticas...',
    description: 'Calculando métricas de asistencia',
    skeletonItems: 4
  },
  'saving': {
    icon: Clock,
    title: 'Guardando...',
    description: 'Guardando los cambios de asistencia',
    skeletonItems: 0
  },
  'page': {
    icon: Loader2,
    title: 'Cargando página...',
    description: 'Inicializando el sistema de asistencia',
    skeletonItems: 10
  },
  'table': {
    icon: Users,
    title: 'Cargando tabla...',
    description: 'Preparando la vista de tabla de asistencia',
    skeletonItems: 8
  },
  'cards': {
    icon: Users,
    title: 'Cargando vista...',
    description: 'Preparando la vista de cards de asistencia',
    skeletonItems: 6
  },
  'custom': {
    icon: Loader2,
    title: 'Cargando...',
    description: 'Procesando información',
    skeletonItems: 3
  }
};

// 🎨 Componente Skeleton para tabla
const TableSkeleton = ({ items = 6 }: { items: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        
        {/* Info skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex space-x-2">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// 🎨 Componente Skeleton para cards
const CardsSkeleton = ({ items = 6 }: { items: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: items }).map((_, i) => (
      <Card key={i} className="animate-pulse border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3 mb-3">
            {/* Checkbox skeleton */}
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
            
            {/* Avatar skeleton */}
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            
            {/* Info skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Buttons skeleton */}
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// 🎨 Componente Skeleton para estadísticas
const StatsSkeleton = ({ items = 4 }: { items: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: items }).map((_, i) => (
      <Card key={i} className="animate-pulse border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// 🎨 Componente Skeleton para lista simple
const ListSkeleton = ({ items = 3 }: { items: number }) => (
  <div className="space-y-2">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    ))}
  </div>
);

export default function LoadingState({
  type,
  title,
  description,
  showSkeleton = true,
  skeletonItems,
  size = 'md',
  className = '',
  icon
}: LoadingStateProps) {
  
  // 🎨 Obtener configuración del tipo
  const config = LOADING_STATE_CONFIG[type];
  
  // 📝 Usar valores personalizados o por defecto
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalSkeletonItems = skeletonItems || config.skeletonItems;
  const IconComponent = icon ? () => icon : config.icon;

  // 🎨 Tamaños
  const sizeClasses = {
    sm: 'py-6',
    md: 'py-8',
    lg: 'py-12'
  };

  // 🎯 Si solo queremos el indicador de carga sin skeleton
  if (!showSkeleton || type === 'saving') {
    return (
      <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
        <CardContent className={`${sizeClasses[size]} text-center`}>
          <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto">
            {/* 🔄 Icono animado */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* 📝 Texto */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {finalTitle}
              </h3>
              {finalDescription && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {finalDescription}
                </p>
              )}
            </div>

            {/* 🔴 Indicador de guardado */}
            {type === 'saving' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                Guardando cambios...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 🎯 Con skeleton loading
  return (
    <div className={`space-y-6 ${className}`}>
      {/* 📋 Header de carga */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                {finalTitle}
              </h3>
              {finalDescription && (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {finalDescription}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 🎨 Skeleton content */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          {type === 'table' && (
            <TableSkeleton items={finalSkeletonItems} />
          )}
          
          {type === 'cards' && (
            <CardsSkeleton items={finalSkeletonItems} />
          )}
          
          {type === 'stats' && (
            <StatsSkeleton items={finalSkeletonItems} />
          )}
          
          {(type === 'grades' || type === 'sections') && (
            <ListSkeleton items={finalSkeletonItems} />
          )}
          
          {(type === 'students' || type === 'attendance' || type === 'page' || type === 'custom') && (
            <TableSkeleton items={finalSkeletonItems} />
          )}
        </CardContent>
      </Card>

      {/* 💡 Tip opcional */}
      {(type === 'students' || type === 'attendance') && (
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>
                {type === 'students' 
                  ? 'Conectando con la base de datos de estudiantes...'
                  : 'Sincronizando registros de asistencia...'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 🎯 Componentes predefinidos para casos comunes
export const LoadingStudents = (props: Omit<LoadingStateProps, 'type'>) => (
  <LoadingState type="students" {...props} />
);

export const LoadingGrades = (props: Omit<LoadingStateProps, 'type'>) => (
  <LoadingState type="grades" {...props} />
);

export const LoadingSections = (props: Omit<LoadingStateProps, 'type'>) => (
  <LoadingState type="sections" {...props} />
);

export const LoadingAttendance = (props: Omit<LoadingStateProps, 'type'>) => (
  <LoadingState type="attendance" {...props} />
);

export const LoadingStats = (props: Omit<LoadingStateProps, 'type'>) => (
  <LoadingState type="stats" {...props} />
);

export const SavingState = (props: Omit<LoadingStateProps, 'type'>) => (
  <LoadingState type="saving" showSkeleton={false} {...props} />
);

export const LoadingTable = (props: Omit<LoadingStateProps, 'type'>) => (
  <LoadingState type="table" {...props} />
);

export const LoadingCards = (props: Omit<LoadingStateProps, 'type'>) => (
  <LoadingState type="cards" {...props} />
);