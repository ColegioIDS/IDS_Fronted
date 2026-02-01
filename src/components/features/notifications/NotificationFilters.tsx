// src/components/features/notifications/NotificationFilters.tsx
'use client';

import { NotificationsQuery, NotificationType, NotificationPriority } from '@/types/notifications.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

interface NotificationFiltersProps {
  query: NotificationsQuery;
  onQueryChange: (query: Partial<NotificationsQuery>) => void;
  onReset: () => void;
}

const notificationTypes: NotificationType[] = [
  'GRADE_PUBLISHED',
  'ATTENDANCE_ALERT',
  'ASSIGNMENT_DUE',
  'SYSTEM_ALERT',
  'CUSTOM',
];

const priorities: NotificationPriority[] = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];

export function NotificationFilters({ query, onQueryChange, onReset }: NotificationFiltersProps) {
  const activeFilters = [
    query.search && `Búsqueda: ${query.search}`,
    query.type && `Tipo: ${query.type}`,
    query.priority && `Prioridad: ${query.priority}`,
    query.isActive !== undefined && `Estado: ${query.isActive ? 'Activas' : 'Inactivas'}`,
  ].filter(Boolean).length;

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Búsqueda</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título o mensaje..."
                className="pl-8"
                value={query.search || ''}
                onChange={(e) => onQueryChange({ search: e.target.value || undefined, page: 1 })}
              />
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Tipo</label>
              <Select value={query.type || 'all'} onValueChange={(value) => onQueryChange({ type: value === 'all' ? undefined : (value as NotificationType), page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Prioridad</label>
              <Select value={query.priority || 'all'} onValueChange={(value) => onQueryChange({ priority: value === 'all' ? undefined : (value as NotificationPriority), page: 1 })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Estado</label>
              <Select
                value={query.isActive === undefined ? 'all' : query.isActive ? 'active' : 'inactive'}
                onValueChange={(value) =>
                  onQueryChange({
                    isActive: value === 'all' ? undefined : value === 'active',
                    page: 1,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters > 0 && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2 flex-wrap">
                {query.search && (
                  <Badge variant="secondary">
                    Búsqueda: {query.search}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-gray-700"
                      onClick={() => onQueryChange({ search: undefined, page: 1 })}
                    />
                  </Badge>
                )}
                {query.type && (
                  <Badge variant="secondary">
                    Tipo: {query.type}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-gray-700"
                      onClick={() => onQueryChange({ type: undefined, page: 1 })}
                    />
                  </Badge>
                )}
                {query.priority && (
                  <Badge variant="secondary">
                    Prioridad: {query.priority}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-gray-700"
                      onClick={() => onQueryChange({ priority: undefined, page: 1 })}
                    />
                  </Badge>
                )}
                {query.isActive !== undefined && (
                  <Badge variant="secondary">
                    Estado: {query.isActive ? 'Activas' : 'Inactivas'}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-gray-700"
                      onClick={() => onQueryChange({ isActive: undefined, page: 1 })}
                    />
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onReset}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
