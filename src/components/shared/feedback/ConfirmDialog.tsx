'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ConfirmDialogType = 'info' | 'warning' | 'danger' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

const typeConfig = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    confirmBg: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    confirmBg: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  danger: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
    confirmBg: 'bg-red-600 hover:bg-red-700 text-white',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    confirmBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={`max-w-md flex flex-col gap-0 p-0 bg-white dark:bg-gray-950 border-2 ${config.borderColor} shadow-xl rounded-2xl overflow-hidden`}
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Icon and Content */}
        <div className="text-center px-6 pt-8 pb-6">
          {/* Icon circle */}
          <div className={`flex justify-center mb-6`}>
            <div className={`p-4 rounded-full ${config.iconBg}`}>
              <Icon className={`w-8 h-8 ${config.iconColor}`} strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Buttons */}
        <DialogFooter className="gap-3 px-6 py-4 flex-row justify-center border-t border-gray-200 dark:border-gray-800">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={isLoading}
            className="transition-all duration-200 min-w-[120px]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${config.confirmBg} transition-all duration-300 min-w-[120px] ${
              isLoading && 'opacity-60 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


