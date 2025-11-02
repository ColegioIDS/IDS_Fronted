// src/components/features/users/UsersGrid.tsx
'use client';

import { User, UserWithRelations } from '@/types/users.types';
import { UserCard } from './UserCard';
import { LoadingSpinner } from '@/components/shared/feedback/LoadingSpinner';

interface UsersGridProps {
  users: (User | UserWithRelations)[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewDetails?: (user: User) => void;
  isLoading?: boolean;
}

export function UsersGrid({
  users,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading,
}: UsersGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No hay usuarios para mostrar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
