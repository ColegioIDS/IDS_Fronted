// src/components/ui/card/base-card.tsx
/**
 * Card base component - Reutilizable para diferentes contextos
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ATTENDANCE_THEME } from '@/constants/attendance-statuses-theme';

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
      ATTENDANCE_THEME.base.bg.primary,
      ATTENDANCE_THEME.base.border.light,
      'border',
      ATTENDANCE_THEME.radius.md,
      ATTENDANCE_THEME.spacing.card.padding
    ),
    compact: cn(
      ATTENDANCE_THEME.base.bg.primary,
      ATTENDANCE_THEME.base.border.light,
      'border',
      ATTENDANCE_THEME.radius.md,
      ATTENDANCE_THEME.spacing.card.compact
    ),
    elevated: cn(
      ATTENDANCE_THEME.base.bg.primary,
      ATTENDANCE_THEME.base.border.light,
      'border shadow-lg',
      ATTENDANCE_THEME.radius.md,
      ATTENDANCE_THEME.spacing.card.padding
    ),
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        isHoverable && cn(ATTENDANCE_THEME.base.bg.hover, ATTENDANCE_THEME.transition.fast),
        isClickable && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};