// src/components/shared/permissions/NoPermissionCard.tsx
import { ShieldX, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { APP_THEME } from '@/config/theme.config';

interface NoPermissionCardProps {
  module?: string;
  action?: string;
  title?: string;
  description?: string;
  variant?: 'card' | 'inline' | 'page';
}

export function NoPermissionCard({
  module,
  action,
  title = 'Acceso Restringido',
  description,
  variant = 'card',
}: NoPermissionCardProps) {
  const defaultDescription = module && action
    ? `No tienes permisos para realizar la acción "${action}" en el módulo "${module}".`
    : 'No tienes permisos para acceder a este contenido.';

  // 📄 Vista de página completa
  if (variant === 'page') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <ShieldX className="w-24 h-24 text-red-400" strokeWidth={1.5} />
              <Lock className="w-8 h-8 text-red-600 absolute bottom-2 right-2" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {description || defaultDescription}
          </p>
          <p className="text-sm text-gray-500">
            Si crees que esto es un error, contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  // 📦 Vista card
  if (variant === 'card') {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <ShieldX className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                {title}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {description || defaultDescription}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ➡️ Vista inline (pequeña)
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
      <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />
      <span className="text-sm text-red-700 dark:text-red-300">
        Sin permisos
      </span>
    </div>
  );
}