// src/components/common/LoadingSpinner.tsx
import { Loader2, BookOpen } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  type?: 'default' | 'grades';
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Cargando...', 
  type = 'default' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        {type === 'grades' ? (
          <div className="relative">
            <BookOpen className={`${sizeClasses[size]} text-blue-600 animate-pulse`} />
            <Loader2 className={`${sizeClasses[size]} text-blue-400 animate-spin absolute top-0 left-0`} />
          </div>
        ) : (
          <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        )}
      </div>
      
      <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
        {text}
      </p>
    </div>
  );
}