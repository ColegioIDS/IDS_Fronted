// src/components/features/notifications/NotificationsPageContent.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/data/notifications';
import { useAuth } from '@/context/AuthContext';
import { NotificationFilters } from './NotificationFilters';
import { NotificationsGrid } from './NotificationsGrid';
import { NotificationForm } from './NotificationForm';
import { NotificationDetailDialog } from './NotificationDetailDialog';
import { DeleteNotificationDialog } from './DeleteNotificationDialog';
import { UserPreferencesPanel } from './UserPreferencesPanel';
import { PreferencesList } from './PreferencesList';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { Button } from '@/components/ui/button';
import { RefreshCw, Send, Settings } from 'lucide-react';
import { notificationsService } from '@/services/notifications.service';
import { toast } from 'sonner';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export function NotificationsPageContent() {
  const [activeTab, setActiveTab] = useState<'list' | 'send' | 'preferences' | 'settings'>('list');
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
  const [deleteNotificationId, setDeleteNotificationId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { hasPermission, user } = useAuth();

  const {
    data,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
  } = useNotifications({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const canSendNotifications = hasPermission('notification', 'send');
  const canViewAllPreferences = hasPermission('notification-preference', 'read');

  const handleReset = () => {
    updateQuery({
      page: 1,
      limit: 12,
      search: undefined,
      type: undefined,
      priority: undefined,
      isActive: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handlePageChange = (page: number) => {
    updateQuery({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (id: number) => {
    setSelectedNotificationId(id);
    setDetailOpen(true);
  };

  const handleDelete = (id: number) => {
    const notification = data?.data.find((n) => n.id === id);
    setDeleteNotificationId(id);
    setDeleteOpen(true);
  };

  const handleActivate = async (id: number) => {
    try {
      await notificationsService.activateNotification(id);
      toast.success('Notificación activada');
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Error al activar');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await notificationsService.deactivateNotification(id);
      toast.success('Notificación desactivada');
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Error al desactivar');
    }
  };

  return (
    <ProtectedPage module="notification" action="read">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notificaciones</h1>
            <p className="text-gray-600">Gestiona notificaciones y preferencias</p>
          </div>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="list" className="flex items-center gap-2">
              Lista
            </TabsTrigger>
            {canSendNotifications && (
              <TabsTrigger value="send" className="flex items-center gap-2">
                <Send className="w-4 h-4" /> Enviar
              </TabsTrigger>
            )}
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Mis Preferencias
            </TabsTrigger>
            {canViewAllPreferences && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Todas las Preferencias
              </TabsTrigger>
            )}
          </TabsList>

          {/* Lista de notificaciones */}
          <TabsContent value="list" className="space-y-6 mt-6">
            <NotificationFilters
              query={query}
              onQueryChange={updateQuery}
              onReset={handleReset}
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <NotificationsGrid
              notifications={data?.data || []}
              isLoading={isLoading}
              total={data?.meta.total || 0}
              page={data?.meta.page || 1}
              limit={data?.meta.limit || 12}
              onPageChange={handlePageChange}
              onView={handleView}
              onDelete={handleDelete}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
          </TabsContent>

          {/* Enviar notificación */}
          {canSendNotifications && (
            <TabsContent value="send" className="mt-6">
              <NotificationForm
                onSuccess={() => {
                  refresh();
                  setActiveTab('list');
                }}
                onCancel={() => setActiveTab('list')}
              />
            </TabsContent>
          )}

          {/* Mis preferencias */}
          <TabsContent value="preferences" className="mt-6">
            <UserPreferencesPanel />
          </TabsContent>

          {/* Todas las preferencias (admin) */}
          {canViewAllPreferences && (
            <TabsContent value="settings" className="mt-6">
              <PreferencesList />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Dialogs */}
      <NotificationDetailDialog
        notificationId={selectedNotificationId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <DeleteNotificationDialog
        notificationId={deleteNotificationId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={refresh}
      />
    </ProtectedPage>
  );
}
