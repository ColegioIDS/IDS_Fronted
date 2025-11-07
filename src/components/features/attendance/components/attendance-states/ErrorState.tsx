// src/components/attendance/components/attendance-states/ErrorState.tsx
"use client";

import { ReactNode } from 'react';
import { 
  AlertTriangle, 
  XCircle,
  Wifi,
  RefreshCw,
  AlertCircle,
  Bug,
  Zap,
  Clock,
  ShieldAlert,
  Home,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 🎨 Tipos de errores
export type ErrorStateType = 
  | 'network'         // Error de conectividad
  | 'server'          // Error del servidor
  | 'permission'      // Error de permisos
  | 'not-found'       // Recurso no encontrado
  | 'validation'      // Error de validación
  | 'timeout'         // Tiempo de espera agotado
  | 'save-failed'     // Error al guardar
  | 'load-failed'     // Error al cargar
  | 'sync-failed'     // Error de sincronización
  | 'unknown'         // Error desconocido
  | 'custom';         // Error personalizado

interface ErrorStateProps {
  type: ErrorStateType;
  title?: string;
  description?: string;
  error?: Error | string;
  showError?: boolean;
  onRetry?: () => void;
  onReset?: () => void;
  onHome?: () => void;
  onContact?: () => void;
  retryLabel?: string;
  resetLabel?: string;
  className?: string;
  icon?: ReactNode;
}

// 🎨 Configuración de errores predefinidos
const ERROR_STATE_CONFIG = {
  'network': {
    icon: Wifi,
    title: 'Sin conexión a internet',
    description: 'Revisa tu conexión a internet e inténtalo de nuevo.',
    color: 'red',
    retryLabel: 'Reintentar conexión',
    resetLabel: 'Recargar página'
  },
  'server': {
    icon: AlertTriangle,
    title: 'Error del servidor',
    description: 'Hay un problema temporal con nuestros servidores. Inténtalo en unos minutos.',
    color: 'orange',
    retryLabel: 'Reintentar',
    resetLabel: 'Refrescar'
  },
  'permission': {
    icon: ShieldAlert,
    title: 'Sin permisos',
    description: 'No tienes permisos para realizar esta acción. Contacta al administrador.',
    color: 'purple',
    retryLabel: 'Verificar permisos',
    resetLabel: 'Ir al inicio'
  },
  'not-found': {
    icon: AlertCircle,
    title: 'Información no encontrada',
    description: 'Los datos que buscas no existen o han sido eliminados.',
    color: 'blue',
    retryLabel: 'Buscar de nuevo',
    resetLabel: 'Volver atrás'
  },
  'validation': {
    icon: XCircle,
    title: 'Datos incorrectos',
    description: 'Hay errores en la información proporcionada. Revisa e inténtalo de nuevo.',
    color: 'yellow',
    retryLabel: 'Corregir datos',
    resetLabel: 'Limpiar formulario'
  },
  'timeout': {
    icon: Clock,
    title: 'Tiempo de espera agotado',
    description: 'La operación está tomando más tiempo del esperado. Inténtalo de nuevo.',
    color: 'indigo',
    retryLabel: 'Reintentar',
    resetLabel: 'Cancelar'
  },
  'save-failed': {
    icon: Zap,
    title: 'Error al guardar',
    description: 'No se pudieron guardar los cambios. Verifica tu conexión e inténtalo de nuevo.',
    color: 'red',
    retryLabel: 'Guardar de nuevo',
    resetLabel: 'Descartar cambios'
  },
  'load-failed': {
    icon: AlertTriangle,
    title: 'Error al cargar datos',
    description: 'No se pudieron cargar los datos necesarios. Inténtalo de nuevo.',
    color: 'orange',
    retryLabel: 'Recargar datos',
    resetLabel: 'Ir al inicio'
  },
  'sync-failed': {
    icon: RefreshCw,
    title: 'Error de sincronización',
    description: 'Los datos no están sincronizados. Algunos cambios podrían perderse.',
    color: 'amber',
    retryLabel: 'Sincronizar',
    resetLabel: 'Recargar todo'
  },
  'unknown': {
    icon: Bug,
    title: 'Error inesperado',
    description: 'Ha ocurrido un error inesperado. Por favor inténtalo de nuevo.',
    color: 'gray',
    retryLabel: 'Reintentar',
    resetLabel: 'Recargar página'
  },
  'custom': {
    icon: AlertTriangle,
    title: 'Error',
    description: 'Ha ocurrido un error. Inténtalo de nuevo.',
    color: 'red',
    retryLabel: 'Reintentar',
    resetLabel: 'Cancelar'
  }
};

// 🎨 Configuración de colores
const COLOR_CONFIG = {
  red: {
    bg: 'bg-red-50 dark:bg-red-900/10',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/10',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
    title: 'text-orange-900 dark:text-orange-100',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-900 dark:text-yellow-100',
    text: 'text-yellow-700 dark:text-yellow-300',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    title: 'text-purple-900 dark:text-purple-100',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/10',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-600 dark:text-indigo-400',
    title: 'text-indigo-900 dark:text-indigo-100',
    text: 'text-indigo-700 dark:text-indigo-300',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    title: 'text-amber-900 dark:text-amber-100',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-900/10',
    border: 'border-gray-200 dark:border-gray-700',
    icon: 'text-gray-600 dark:text-gray-400',
    title: 'text-gray-900 dark:text-gray-100',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
};

export default function ErrorState({
  type,
  title,
  description,
  error,
  showError = false,
  onRetry,
  onReset,
  onHome,
  onContact,
  retryLabel,
  resetLabel,
  className = '',
  icon
}: ErrorStateProps) {
  
  // 🎨 Obtener configuración del tipo
  const config = ERROR_STATE_CONFIG[type];
  const colors = COLOR_CONFIG[config.color as keyof typeof COLOR_CONFIG];
  
  // 📝 Usar valores personalizados o por defecto
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalRetryLabel = retryLabel || config.retryLabel;
  const finalResetLabel = resetLabel || config.resetLabel;
  const IconComponent = icon ? () => icon : config.icon;

  // 🔧 Formatear error para mostrar
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Card className={`
      ${colors.bg} 
      ${colors.border} 
      border-2 transition-all duration-300
      ${className}
    `}>
      <CardContent className="pt-12 pb-12">
        <div className="text-center max-w-md mx-auto">
          {/* 🎯 Icono principal */}
          <div className="flex justify-center mb-6">
            <div className={`
              p-4 rounded-full 
              ${colors.bg.replace('/10', '/20')}
              ${colors.border} border-2
            `}>
              <IconComponent className={`h-12 w-12 ${colors.icon}`} />
            </div>
          </div>

          {/* 📝 Título */}
          <h3 className={`text-xl font-semibold ${colors.title} mb-3`}>
            {finalTitle}
          </h3>

          {/* 📄 Descripción */}
          <p className={`${colors.text} mb-6 leading-relaxed`}>
            {finalDescription}
          </p>

          {/* ⚠️ Mensaje de error técnico */}
          {showError && errorMessage && (
            <Alert className={`mb-6 ${colors.bg} ${colors.border}`}>
              <AlertTriangle className={`h-4 w-4 ${colors.icon}`} />
              <AlertDescription className={`${colors.text} text-left`}>
                <strong>Detalles técnicos:</strong>
                <br />
                <code className="text-xs bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded mt-1 inline-block">
                  {errorMessage}
                </code>
              </AlertDescription>
            </Alert>
          )}

          {/* 🎯 Acciones principales */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            {/* 🔄 Botón reintentar */}
            {onRetry && (
              <Button
                variant="default"
                onClick={onRetry}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>{finalRetryLabel}</span>
              </Button>
            )}

            {/* 🔄 Botón reset/limpiar */}
            {onReset && (
              <Button
                variant="outline"
                onClick={onReset}
                className="flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>{finalResetLabel}</span>
              </Button>
            )}
          </div>

          {/* 🎯 Acciones secundarias */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {/* 🏠 Ir al inicio */}
            {onHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onHome}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
              >
                <Home className="h-4 w-4" />
                <span>Ir al inicio</span>
              </Button>
            )}

            {/* 📞 Contactar soporte */}
            {onContact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onContact}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
              >
                <Phone className="h-4 w-4" />
                <span>Contactar soporte</span>
              </Button>
            )}
          </div>

          {/* 💡 Consejos según el tipo de error */}
          {(type === 'network' || type === 'server' || type === 'sync-failed') && (
            <div className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💡 Soluciones posibles:
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 text-left">
                {type === 'network' && (
                  <>
                    <li>• Verifica tu conexión a internet</li>
                    <li>• Intenta recargar la página</li>
                    <li>• Revisa si otros sitios web funcionan</li>
                  </>
                )}
                {type === 'server' && (
                  <>
                    <li>• Espera unos minutos e inténtalo de nuevo</li>
                    <li>• Verifica tu conexión a internet</li>
                    <li>• Contacta al administrador si persiste</li>
                  </>
                )}
                {type === 'sync-failed' && (
                  <>
                    <li>• Guarda tu trabajo localmente</li>
                    <li>• Recarga la página para sincronizar</li>
                    <li>• Verifica tu conexión a internet</li>
                  </>
                )}
              </ul>
            </div>
          )}

          {type === 'permission' && (
            <div className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔐 Permisos requeridos:
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 text-left">
                <li>• Acceso a control de asistencia</li>
                <li>• Permisos de escritura en registros</li>
                <li>• Acceso a datos de estudiantes</li>
              </ul>
            </div>
          )}

          {(type === 'save-failed' || type === 'load-failed') && (
            <div className="mt-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ⚠️ Importante:
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {type === 'save-failed' 
                  ? 'Algunos cambios podrían no haberse guardado. Verifica los datos antes de continuar.'
                  : 'Los datos podrían estar desactualizados. Recarga la página para obtener la información más reciente.'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 🎯 Componentes predefinidos para casos comunes
export const NetworkError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="network" {...props} />
);

export const ServerError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="server" {...props} />
);

export const PermissionError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="permission" {...props} />
);

export const NotFoundError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="not-found" {...props} />
);

export const ValidationError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="validation" {...props} />
);

export const TimeoutError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="timeout" {...props} />
);

export const SaveFailedError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="save-failed" {...props} />
);

export const LoadFailedError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="load-failed" {...props} />
);

export const SyncFailedError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="sync-failed" {...props} />
);

export const UnknownError = (props: Omit<ErrorStateProps, 'type'>) => (
  <ErrorState type="unknown" {...props} />
);