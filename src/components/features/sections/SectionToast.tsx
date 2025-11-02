// src/components/features/sections/SectionToast.tsx

'use client';

import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface SectionToastProps {
  type: ToastType;
  title: string;
  message: string;
  onClose?: () => void;
}

/**
 * Toast de notificaciones para acciones de secciones
 */
export function SectionToast({ type, title, message, onClose }: SectionToastProps) {
  const configs = {
    success: {
      icon: CheckCircle2,
      className: 'border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30',
      iconClassName: 'text-emerald-700 dark:text-emerald-300',
      titleClassName: 'text-emerald-900 dark:text-emerald-100',
      messageClassName: 'text-emerald-800 dark:text-emerald-200',
    },
    error: {
      icon: XCircle,
      className: 'border-2 border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30',
      iconClassName: 'text-red-700 dark:text-red-300',
      titleClassName: 'text-red-900 dark:text-red-100',
      messageClassName: 'text-red-800 dark:text-red-200',
    },
    warning: {
      icon: AlertCircle,
      className: 'border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30',
      iconClassName: 'text-amber-700 dark:text-amber-300',
      titleClassName: 'text-amber-900 dark:text-amber-100',
      messageClassName: 'text-amber-800 dark:text-amber-200',
    },
    info: {
      icon: Info,
      className: 'border-2 border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30',
      iconClassName: 'text-blue-700 dark:text-blue-300',
      titleClassName: 'text-blue-900 dark:text-blue-100',
      messageClassName: 'text-blue-800 dark:text-blue-200',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Alert className={`${config.className} animate-in slide-in-from-top-4 duration-300`}>
      <Icon className={`h-5 w-5 ${config.iconClassName}`} />
      <AlertTitle className={`font-bold ${config.titleClassName}`}>{title}</AlertTitle>
      <AlertDescription className={config.messageClassName}>{message}</AlertDescription>
    </Alert>
  );
}
