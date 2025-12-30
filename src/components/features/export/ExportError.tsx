import { AlertCircle, X } from 'lucide-react';

interface ExportErrorProps {
  error: Error | string;
  onDismiss?: () => void;
}

export function ExportError({ error, onDismiss }: ExportErrorProps) {
  const message = error instanceof Error ? error.message : error;
  
  return (
    <div className="w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
            Error al generar el reporte
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 inline-flex text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
