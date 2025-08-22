// src/components/attendance/components/attendance-states/EmptyState.tsx
"use client";

import { ReactNode } from 'react';
import { 
  Users, 
  Search, 
  GraduationCap, 
  BookOpen, 
  UserPlus, 
  RefreshCw,
  AlertCircle,
  Calendar,
  FileX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 🎨 Tipos de estados vacíos
export type EmptyStateType = 
  | 'no-students'      // No hay estudiantes en la sección
  | 'no-search'        // Sin resultados de búsqueda
  | 'no-grade'         // No hay grado seleccionado
  | 'no-section'       // No hay sección seleccionada
  | 'no-data'          // Sin datos en general
  | 'no-attendance'    // Sin registros de asistencia
  | 'no-enrollments'   // Sin matrículas
  | 'custom';          // Estado personalizado

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  searchQuery?: string;
  onClearSearch?: () => void;
  className?: string;
}

// 🎨 Configuración de estados predefinidos
const EMPTY_STATE_CONFIG = {
  'no-students': {
    icon: Users,
    title: 'No hay estudiantes matriculados',
    description: 'Esta sección no tiene estudiantes registrados en el sistema.',
    iconColor: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  'no-search': {
    icon: Search,
    title: 'Sin resultados de búsqueda',
    description: 'No se encontraron estudiantes que coincidan con tu búsqueda.',
    iconColor: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/10',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  'no-grade': {
    icon: GraduationCap,
    title: 'Selecciona un grado',
    description: 'Para comenzar con el control de asistencia, selecciona un grado del menú superior.',
    iconColor: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  'no-section': {
    icon: BookOpen,
    title: 'Selecciona una sección',
    description: 'Elige una sección para ver los estudiantes matriculados y tomar asistencia.',
    iconColor: 'text-green-500 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  'no-data': {
    icon: FileX,
    title: 'Sin datos disponibles',
    description: 'No hay información disponible para mostrar en este momento.',
    iconColor: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/10',
    borderColor: 'border-gray-200 dark:border-gray-700'
  },
  'no-attendance': {
    icon: Calendar,
    title: 'Sin registros de asistencia',
    description: 'No hay registros de asistencia para la fecha seleccionada.',
    iconColor: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/10',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  'no-enrollments': {
    icon: UserPlus,
    title: 'Sin matrículas registradas',
    description: 'No hay estudiantes matriculados en esta sección para el ciclo actual.',
    iconColor: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  'custom': {
    icon: AlertCircle,
    title: 'Estado personalizado',
    description: 'Descripción personalizada del estado.',
    iconColor: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/10',
    borderColor: 'border-gray-200 dark:border-gray-700'
  }
};

export default function EmptyState({
  type,
  title,
  description,
  icon,
  action,
  secondaryAction,
  searchQuery,
  onClearSearch,
  className = ''
}: EmptyStateProps) {
  
  // 🎨 Obtener configuración del tipo
  const config = EMPTY_STATE_CONFIG[type];
  
  // 📝 Usar valores personalizados o por defecto
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const IconComponent = icon ? () => icon : config.icon;

  return (
    <Card className={`
      ${config.bgColor} 
      ${config.borderColor} 
      border-2 transition-all duration-300 hover:shadow-md
      ${className}
    `}>
      <CardContent className="pt-12 pb-12">
        <div className="text-center max-w-md mx-auto">
          {/* 🎯 Icono principal */}
          <div className="flex justify-center mb-6">
            <div className={`
              p-4 rounded-full 
              ${config.bgColor.replace('bg-', 'bg-').replace('/10', '/20')}
              ${config.borderColor} border
            `}>
              <IconComponent className={`h-12 w-12 ${config.iconColor}`} />
            </div>
          </div>

          {/* 📝 Título */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {finalTitle}
          </h3>

          {/* 📄 Descripción */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {finalDescription}
          </p>

          {/* 🔍 Información de búsqueda */}
          {type === 'no-search' && searchQuery && (
            <div className="mb-6">
              <Badge 
                variant="outline" 
                className={`
                  ${config.bgColor.replace('/10', '/20')} 
                  ${config.borderColor} 
                  text-gray-700 dark:text-gray-300
                `}
              >
                Búsqueda: "{searchQuery}"
              </Badge>
            </div>
          )}

          {/* 🎯 Acciones principales */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* 🔍 Botón para limpiar búsqueda */}
            {type === 'no-search' && onClearSearch && (
              <Button
                variant="default"
                onClick={onClearSearch}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Limpiar búsqueda</span>
              </Button>
            )}

            {/* 🎯 Acción principal */}
            {action && (
              <Button
                variant={action.variant || 'default'}
                onClick={action.onClick}
                className="flex items-center space-x-2"
              >
                <span>{action.label}</span>
              </Button>
            )}

            {/* 🎯 Acción secundaria */}
            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || 'outline'}
                onClick={secondaryAction.onClick}
                className="flex items-center space-x-2"
              >
                <span>{secondaryAction.label}</span>
              </Button>
            )}
          </div>

          {/* 💡 Consejos contextuale */}
          {type === 'no-students' && (
            <div className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💡 ¿Qué puedes hacer?
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Verificar que la sección tenga estudiantes matriculados</li>
                <li>• Contactar al administrador para agregar estudiantes</li>
                <li>• Revisar el ciclo escolar activo</li>
              </ul>
            </div>
          )}

          {type === 'no-enrollments' && (
            <div className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💡 Posibles causas:
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Los estudiantes no están matriculados en el ciclo actual</li>
                <li>• La sección no tiene capacidad asignada</li>
                <li>• Hay un problema con la sincronización de datos</li>
              </ul>
            </div>
          )}

          {(type === 'no-grade' || type === 'no-section') && (
            <div className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📋 Pasos siguientes:
              </h4>
              <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 text-left">
                {type === 'no-grade' && (
                  <>
                    <li>1. Selecciona un grado del menú superior</li>
                    <li>2. Elige una sección disponible</li>
                    <li>3. Verifica la fecha de asistencia</li>
                    <li>4. Comienza a tomar asistencia</li>
                  </>
                )}
                {type === 'no-section' && (
                  <>
                    <li>1. Elige una sección de la lista</li>
                    <li>2. Revisa los estudiantes matriculados</li>
                    <li>3. Comienza el control de asistencia</li>
                  </>
                )}
              </ol>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 🎯 Componentes predefinidos para casos comunes
export const NoStudentsState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="no-students" {...props} />
);

export const NoSearchResultsState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="no-search" {...props} />
);

export const NoGradeSelectedState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="no-grade" {...props} />
);

export const NoSectionSelectedState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="no-section" {...props} />
);

export const NoAttendanceState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="no-attendance" {...props} />
);

export const NoEnrollmentsState = (props: Omit<EmptyStateProps, 'type'>) => (
  <EmptyState type="no-enrollments" {...props} />
);