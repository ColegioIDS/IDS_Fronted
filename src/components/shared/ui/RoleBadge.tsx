// src/components/shared/ui/RoleBadge.tsx
import { Badge } from '@/components/ui/badge';
import { APP_THEME } from '@/config/theme.config';
import { Shield } from 'lucide-react';

interface RoleBadgeProps {
  roleName: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function RoleBadge({ roleName, size = 'md', showIcon = true }: RoleBadgeProps) {
  const roleKey = roleName.toLowerCase() as keyof typeof APP_THEME.roles;
  const roleTheme = APP_THEME.roles[roleKey] || APP_THEME.roles.admin;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <Badge
      className={`
        ${roleTheme.bg} ${roleTheme.text} ${roleTheme.border}
        border ${sizeClasses[size]}
        flex items-center gap-1.5 w-fit
      `}
      variant="outline"
    >
      {showIcon && <Shield className="w-3.5 h-3.5" />}
      {roleName}
    </Badge>
  );
}