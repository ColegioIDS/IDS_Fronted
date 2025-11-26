import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

// ✅ El icon debe ser un nodo React (JSX) renderizado
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  className?: string;
  iconClassName?: string;
  variant?: 'default' | 'search' | 'error' | 'info';
  children?: ReactNode;
}

const VARIANT_STYLES = {
  default: {
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-400 dark:text-gray-500',
    titleColor: 'text-gray-900 dark:text-gray-100',
    descColor: 'text-gray-600 dark:text-gray-400',
  },
  search: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-gray-900 dark:text-gray-100',
    descColor: 'text-gray-600 dark:text-gray-400',
  },
  error: {
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-gray-900 dark:text-gray-100',
    descColor: 'text-gray-600 dark:text-gray-400',
  },
  info: {
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    titleColor: 'text-gray-900 dark:text-gray-100',
    descColor: 'text-gray-600 dark:text-gray-400',
  },
};

const DEFAULT_ICON_SVG = (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  iconClassName = '',
  variant = 'default',
  children,
}: EmptyStateProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Card className={`border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          {/* Icon */}
          <div
            className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto ${iconClassName}`}
          >
            {Icon || <div className={styles.iconColor}>{DEFAULT_ICON_SVG}</div>}
          </div>

          {/* Title */}
          <h3 className={`text-lg font-semibold ${styles.titleColor}`}>{title}</h3>

          {/* Description */}
          {description && (
            <p className={`text-sm ${styles.descColor} max-w-sm mx-auto`}>
              {description}
            </p>
          )}

          {/* Custom children */}
          {children && <div className="mt-4">{children}</div>}

          {/* Action button */}
          {action && (
            <div className="mt-6">
              <Button onClick={action.onClick} variant={action.variant || 'default'}>
                {action.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

//
// 🎯 Variantes preconfiguradas
//

export function EmptySearchResults({
  onClearFilters,
}: {
  onClearFilters?: () => void;
}) {
  return (
    <EmptyState
      variant="search"
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No se encontraron resultados"
      description="Intenta ajustar los filtros de búsqueda o utiliza términos diferentes."
      action={
        onClearFilters
          ? {
              label: 'Limpiar filtros',
              onClick: onClearFilters,
              variant: 'outline',
            }
          : undefined
      }
    />
  );
}

export function EmptyDataState({
  title = 'No hay datos disponibles',
  description = 'Aún no se han creado registros en esta sección.',
  onCreate,
  createLabel = 'Crear nuevo',
}: {
  title?: string;
  description?: string;
  onCreate?: () => void;
  createLabel?: string;
}) {
  return (
    <EmptyState
      variant="default"
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
      title={title}
      description={description}
      action={
        onCreate
          ? {
              label: createLabel,
              onClick: onCreate,
            }
          : undefined
      }
    />
  );
}

export function EmptyPermissionsState() {
  return (
    <EmptyState
      variant="info"
      icon={
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      }
      title="No se encontraron permisos"
      description="Los permisos se crean automáticamente por el sistema. Si esperabas ver permisos aquí, contacta al administrador."
    />
  );
}
