// src/components/ui/card/base-card.tsx
/**
 * Card base component - Reutilizable para diferentes contextos
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseCardProps {
  children: ReactNode;
  variant?: 'default' | 'compact' | 'elevated';
  isHoverable?: boolean;
  isClickable?: boolean;
  className?: string;
}

export const BaseCard = ({
  children,
  variant = 'default',
  isHoverable = false,
  isClickable = false,
  className,
}: BaseCardProps) => {
  const variantStyles = {
    default: cn(
      'bg-white dark:bg-slate-900',
      'border border-slate-200 dark:border-slate-800',
      'rounded-xl',
      'p-5'
    ),
    compact: cn(
      'bg-white dark:bg-slate-900',
      'border border-slate-200 dark:border-slate-800',
      'rounded-xl',
      'p-3'
    ),
    elevated: cn(
      'bg-white dark:bg-slate-900',
      'border border-slate-200 dark:border-slate-800',
      'rounded-xl shadow-lg',
      'p-5'
    ),
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        isHoverable && cn(
          'transition-all duration-300',
          'hover:shadow-md dark:hover:shadow-lg',
          'hover:border-slate-300 dark:hover:border-slate-700'
        ),
        isClickable && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};