// src/components/shared/ui/PermissionBadge.tsx
import { Badge } from '@/components/ui/badge';
import { APP_THEME } from '@/config/theme.config';
import { Eye, Edit, Trash, Plus } from 'lucide-react';

interface PermissionBadgeProps {
  action: 'create' | 'read' | 'update' | 'delete';
  size?: 'sm' | 'md';
}

const ACTION_ICONS = {
  create: Plus,
  read: Eye,
  update: Edit,
  delete: Trash,
};

const ACTION_LABELS = {
  create: 'Crear',
  read: 'Ver',
  update: 'Editar',
  delete: 'Eliminar',
};

export function PermissionBadge({ action, size = 'sm' }: PermissionBadgeProps) {
  const theme = APP_THEME.permissions[action];
  const Icon = ACTION_ICONS[action];

  return (
    <Badge
      className={`
        ${theme.bg} ${theme.text}
        ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}
        flex items-center gap-1 w-fit
      `}
      variant="secondary"
    >
      <Icon className="w-3 h-3" />
      {ACTION_LABELS[action]}
    </Badge>
  );
}