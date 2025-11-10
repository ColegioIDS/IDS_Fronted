// src/components/attendance/components/attendance-controls/SaveStatus.tsx
"use client";

import { useEffect, useState } from 'react';
import { 
  Check, 
  Loader2, 
  AlertCircle, 
  Clock, 
  Wifi, 
  WifiOff,
  Save,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// 🎨 Tipos de estado de guardado
export type SaveStatusType = 
  | 'idle'          // Sin cambios pendientes
  | 'saving'        // Guardando actualmente
  | 'saved'         // Guardado exitoso
  | 'error'         // Error al guardar
  | 'offline'       // Sin conexión
  | 'pending'       // Cambios pendientes
  | 'syncing'       // Sincronizando con servidor
  | 'conflict';     // Conflicto de datos

interface SaveStatusProps {
  status: SaveStatusType;
  lastSaved?: Date;
  pendingChanges?: number;
  error?: string;
  onRetry?: () => void;
  onForceSync?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

// 🎨 Configuración de estados
const STATUS_CONFIG = {
  idle: {
    icon: Check,
    label: 'Todo guardado',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    borderColor: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
  },
  saving: {
    icon: Loader2,
    label: 'Guardando...',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    borderColor: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
  },
  saved: {
    icon: Check,
    label: 'Guardado',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    borderColor: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
  },
  error: {
    icon: AlertCircle,
    label: 'Error al guardar',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    borderColor: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
  },
  offline: {
    icon: WifiOff,
    label: 'Sin conexión',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/10',
    borderColor: 'border-gray-200 dark:border-gray-700',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  },
  pending: {
    icon: Clock,
    label: 'Cambios pendientes',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
  },
  syncing: {
    icon: RefreshCw,
    label: 'Sincronizando...',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    borderColor: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
  },
  conflict: {
    icon: AlertCircle,
    label: 'Conflicto de datos',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/10',
    borderColor: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
  }
};

export default function SaveStatus({
  status,
  lastSaved,
  pendingChanges = 0,
  error,
  onRetry,
  onForceSync,
  showDetails = false,
  compact = false,
  className = ''
}: SaveStatusProps) {
  const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;

  // 🌐 Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ✅ Mostrar confirmación temporal cuando se guarda
  useEffect(() => {
    if (status === 'saved') {
      setShowSavedConfirmation(true);
      const timer = setTimeout(() => {
        setShowSavedConfirmation(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  // 📅 Formatear tiempo de último guardado
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    return date.toLocaleDateString('es-GT', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🎯 Vista compacta (para uso en headers o toolbars)
  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Badge 
          variant="outline" 
          className={cn(config.badge, "flex items-center space-x-1")}
        >
          <IconComponent 
            className={cn(
              "h-3 w-3",
              (status === 'saving' || status === 'syncing') && "animate-spin"
            )} 
          />
          <span className="text-xs">{config.label}</span>
          {pendingChanges > 0 && (
            <span className="ml-1 text-xs font-semibold">({pendingChanges})</span>
          )}
        </Badge>

        {/* 🔄 Botón de retry compacto */}
        {(status === 'error' || status === 'offline') && onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-6 w-6 p-0"
            title="Reintentar"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // 🎯 Vista completa (para paneles de estado)
  return (
    <Card className={cn(config.bgColor, config.borderColor, "border", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* 📊 Estado principal */}
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-full",
              config.bgColor.replace('/10', '/20'),
              config.borderColor,
              "border"
            )}>
              <IconComponent 
                className={cn(
                  "h-4 w-4",
                  config.color,
                  (status === 'saving' || status === 'syncing') && "animate-spin"
                )} 
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className={cn("text-sm font-medium", config.color)}>
                  {config.label}
                </h4>
                
                {pendingChanges > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {pendingChanges} cambio{pendingChanges !== 1 ? 's' : ''}
                  </Badge>
                )}

                {/* 🌐 Indicador de conexión */}
                {!isOnline && (
                  <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>

              {/* 📝 Detalles adicionales */}
              {showDetails && (
                <div className="mt-1 space-y-1">
                  {lastSaved && status !== 'saving' && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Último guardado: {formatLastSaved(lastSaved)}
                    </p>
                  )}

                  {error && status === 'error' && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}

                  {status === 'offline' && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Los cambios se guardarán cuando se restaure la conexión
                    </p>
                  )}

                  {status === 'conflict' && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Hay conflictos que requieren resolución manual
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 🎯 Acciones */}
          <div className="flex items-center space-x-2">
            {/* 🔄 Reintentar */}
            {(status === 'error' || status === 'offline') && onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reintentar</span>
              </Button>
            )}

            {/* 🔄 Forzar sincronización */}
            {(status === 'conflict' || status === 'pending') && onForceSync && (
              <Button
                size="sm"
                variant="default"
                onClick={onForceSync}
                className="flex items-center space-x-1"
              >
                <Save className="h-3 w-3" />
                <span>Sincronizar</span>
              </Button>
            )}
          </div>
        </div>

        {/* ✅ Animación de guardado exitoso */}
        {showSavedConfirmation && status === 'saved' && (
          <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">
                ¡Cambios guardados exitosamente!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 🎯 Componentes predefinidos para casos comunes

// Indicador compacto para headers
export const CompactSaveStatus = (props: Omit<SaveStatusProps, 'compact'>) => (
  <SaveStatus compact {...props} />
);

// Panel completo de estado
export const DetailedSaveStatus = (props: Omit<SaveStatusProps, 'showDetails'>) => (
  <SaveStatus showDetails {...props} />
);

// Indicador para barras de estado
export const StatusBarSaveIndicator = (props: Omit<SaveStatusProps, 'compact' | 'showDetails'>) => (
  <SaveStatus compact showDetails={false} {...props} />
);

// Hook para manejar el estado de guardado automáticamente
export const useSaveStatus = () => {
  const [status, setStatus] = useState<SaveStatusType>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [pendingChanges, setPendingChanges] = useState(0);
  const [error, setError] = useState<string | undefined>();

  const markAsSaving = () => {
    setStatus('saving');
    setError(undefined);
  };

  const markAsSaved = () => {
    setStatus('saved');
    setLastSaved(new Date());
    setPendingChanges(0);
    setError(undefined);
    
    // Cambiar a idle después de unos segundos
    setTimeout(() => {
      setStatus('idle');
    }, 3000);
  };

  const markAsError = (errorMessage: string) => {
    setStatus('error');
    setError(errorMessage);
  };

  const addPendingChange = () => {
    setPendingChanges(prev => prev + 1);
    if (status === 'idle') {
      setStatus('pending');
    }
  };

  const clearPendingChanges = () => {
    setPendingChanges(0);
  };

  return {
    status,
    lastSaved,
    pendingChanges,
    error,
    markAsSaving,
    markAsSaved,
    markAsError,
    addPendingChange,
    clearPendingChanges,
    setStatus
  };
};