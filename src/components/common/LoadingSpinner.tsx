// src/components/common/LoadingSpinner.tsx

'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  message?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

function LoadingSpinnerComponent({
  size = 'md',
  className,
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer rotating ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-700"
      />

      {/* Inner rotating ring with gradient */}
      <div
        className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent',
          'border-t-blue-500 dark:border-t-blue-400 border-r-blue-500 dark:border-r-blue-400',
          'animate-spin'
        )}
      />

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-1 w-1 rounded-full bg-blue-500 dark:bg-blue-400" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          {message && (
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {spinner}
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      )}
    </div>
  );
}

// ============================================
// VARIANTES REUTILIZABLES
// ============================================

export function LoadingPage({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinnerComponent size="lg" fullScreen message={message} />
    </div>
  );
}

export function LoadingInline({ message = 'Cargando...' }: { message?: string }) {
  return <LoadingSpinnerComponent size="md" message={message} />;
}

export function LoadingButton() {
  return <LoadingSpinnerComponent size="sm" className="inline-block" />;
}

export function LoadingCard() {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinnerComponent size="lg" />
    </div>
  );
}

// ============================================
// SKELETON LOADER (Alternativa)
// ============================================

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function SkeletonLine({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse',
            className,
            i > 0 && 'mt-2'
          )}
        />
      ))}
    </>
  );
}

export function SkeletonBox({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-slate-200 dark:bg-slate-700 rounded animate-pulse',
        className
      )}
    />
  );
}

// Default export
export default LoadingSpinnerComponent;

// Named export
export const LoadingSpinner = LoadingSpinnerComponent;