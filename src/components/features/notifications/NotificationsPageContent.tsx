// src/components/features/notifications/NotificationsPageContent.tsx
'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/data/notifications';
import { useAuth } from '@/context/AuthContext';
import { NotificationForm } from './NotificationForm';
import { NotificationDetailDialog } from './NotificationDetailDialog';
import { DeleteNotificationDialog } from './DeleteNotificationDialog';
import { UserPreferencesPanel } from './UserPreferencesPanel';
import { PreferencesList } from './PreferencesList';
import { NotificationReadLog } from './NotificationReadLog';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { NOTIFICATIONS_PERMISSIONS } from '@/constants/modules-permissions/notifications/notifications.permissions';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { notificationsService } from '@/services/notifications.service';
import { toast } from 'sonner';
import { NotificationsSidebar } from './NotificationsSidebar';
import { NotificationsList } from './NotificationsList';
import { NotificationDetailPane } from './NotificationDetailPane';

export function NotificationsPageContent() {
  const [activeView, setActiveView] = useState<'inbox' | 'send' | 'preferences' | 'all-preferences' | 'read-log'>('inbox');
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('inbox');
  const [deleteNotificationId, setDeleteNotificationId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categorySummary, setCategorySummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [filterLoading, setFilterLoading] = useState(false);

  const { hasPermission, user } = useAuth();

  const {
    data,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
    toggleStar,
    archive,
    unarchive,
  } = useNotifications({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const canSendNotifications = hasPermission(NOTIFICATIONS_PERMISSIONS.SEND.module, NOTIFICATIONS_PERMISSIONS.SEND.action);
  const canReadPreferences = hasPermission(NOTIFICATIONS_PERMISSIONS.READ_PREFERENCES.module, NOTIFICATIONS_PERMISSIONS.READ_PREFERENCES.action);
  const canViewAllPreferences = hasPermission(NOTIFICATIONS_PERMISSIONS.READ_ALL_PREFERENCES.module, NOTIFICATIONS_PERMISSIONS.READ_ALL_PREFERENCES.action);
  const canReadLog = hasPermission(NOTIFICATIONS_PERMISSIONS.READ_LOG.module, NOTIFICATIONS_PERMISSIONS.READ_LOG.action);
  
  const canViewOne = hasPermission(NOTIFICATIONS_PERMISSIONS.READ_ONE.module, NOTIFICATIONS_PERMISSIONS.READ_ONE.action);
  const canUpdate = hasPermission(NOTIFICATIONS_PERMISSIONS.UPDATE.module, NOTIFICATIONS_PERMISSIONS.UPDATE.action);
  const canDelete = hasPermission(NOTIFICATIONS_PERMISSIONS.DELETE.module, NOTIFICATIONS_PERMISSIONS.DELETE.action);

  // Cargar resumen de categorías al montar o cuando se actualiza
  useEffect(() => {
    const loadCategoriesSummary = async () => {
      try {
        setSummaryLoading(true);
        const summary = await notificationsService.getCategoriesSummary();
        setCategorySummary(summary);
      } catch (error) {
        console.error('Error loading categories summary:', error);
      } finally {
        setSummaryLoading(false);
      }
    };

    loadCategoriesSummary();
  }, []);

  // Resetear selección cuando cambias de categoría
  useEffect(() => {
    setSelectedNotificationId(null);
  }, [selectedCategory]);

  // Cargar datos filtrados según la categoría
  useEffect(() => {
    const loadFilteredData = async () => {
      try {
        setFilterLoading(true);
        let result = null;

        // Si no hay datos, no hay nada que filtrar
        if (!data || !data.data) {
          setFilteredData(null);
          setFilterLoading(false);
          return;
        }

        switch (selectedCategory) {
          case 'starred':
            // Filtrar por isStarred (ahora viene del backend)
            result = {
              data: data.data.filter((n: any) => n.isStarred === true),
              meta: data.meta,
            };
            break;
          case 'archived':
            // Filtrar por status ARCHIVED o isArchived
            result = {
              data: data.data.filter((n: any) => n.status === 'ARCHIVED' || n.isArchived === true),
              meta: data.meta,
            };
            break;
          case 'trash':
            // Por ahora vacío (el backend necesita marcar eliminadas)
            // TODO: Implementar eliminación suave (soft delete) en el backend
            result = {
              data: [],
              meta: data.meta,
            };
            break;
          case 'sent':
            // Notificaciones donde el usuario actual es el creador
            // El usuario puede ejecutar acciones (archivar, marcar con estrella, etc.) sobre sus propias notificaciones
            const userId = typeof user?.id === 'string' ? parseInt(user.id, 10) : user?.id;
            result = {
              data: data.data.filter((n: any) => n.createdById === userId),
              meta: data.meta,
            };
            break;
          case 'important':
            // Notificaciones de alta prioridad
            result = {
              data: data.data.filter((n: any) => n.priority === 'HIGH' || n.priority === 'CRITICAL'),
              meta: data.meta,
            };
            break;
          default: // inbox
            // Mostrar todas excepto archivadas y excepto las que el usuario creó
            // (las creadas por el usuario aparecen en la sección "Enviadas")
            const inboxUserId = typeof user?.id === 'string' ? parseInt(user.id, 10) : user?.id;
            result = {
              data: data.data.filter((n: any) => 
                n.status !== 'ARCHIVED' && 
                n.isArchived !== true && 
                n.createdById !== inboxUserId
              ),
              meta: data.meta,
            };
            break;
        }

        setFilteredData(result);
        // No resetear selectedNotificationId aquí - permite que se mantenga la selección
      } catch (error) {
        console.error('Error loading filtered data:', error);
        setFilteredData(data);
      } finally {
        setFilterLoading(false);
      }
    };

    loadFilteredData();
  }, [selectedCategory, data, user?.id]);

  const handleMarkAsRead = async (notificationId: number, showToast = true) => {
    try {
      await notificationsService.markAsRead(notificationId);
      
      // Actualizar estado local en lugar de refrescar toda la lista
      if (data?.data) {
        const updatedData = data.data.map((n: any) =>
          n.id === notificationId ? { ...n, status: 'READ' } : n
        );
        // Necesitamos refrescar el hook para actualizar la UI
        // Pero solo refrescamos el resumen para conteos
      }
      
      // Recargar solo el resumen para actualizar los conteos
      const summary = await notificationsService.getCategoriesSummary();
      setCategorySummary(summary);
      if (showToast) {
        toast.success('Marcado como leído');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al marcar como leído');
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      
      // Actualizar estado local en lugar de refrescar toda la lista
      if (data?.data) {
        const updatedData = data.data.filter((n: any) => n.id !== notificationId);
      }
      
      // Recargar solo el resumen para actualizar los conteos
      const summary = await notificationsService.getCategoriesSummary();
      setCategorySummary(summary);
      setDeleteOpen(false);
      toast.success('Eliminado');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  const handleToggleStar = async (notificationId: number) => {
    try {
      await toggleStar(notificationId);
      toast.success('Favorito actualizado');
      // Recargar resumen para actualizar conteos
      const summary = await notificationsService.getCategoriesSummary();
      setCategorySummary(summary);
    } catch (error: any) {
      toast.error(error.message || 'Error al marcar como favorito');
    }
  };

  const handleArchive = async (notificationId: number) => {
    try {
      await archive(notificationId);
      toast.success('Notificación archivada');
      setSelectedNotificationId(null);
      // Recargar resumen para actualizar conteos
      const summary = await notificationsService.getCategoriesSummary();
      setCategorySummary(summary);
    } catch (error: any) {
      toast.error(error.message || 'Error al archivar');
    }
  };

  const handleUnarchive = async (notificationId: number) => {
    try {
      await unarchive(notificationId);
      toast.success('Notificación desarchivada');
      setSelectedNotificationId(null);
      // Recargar resumen para actualizar conteos
      const summary = await notificationsService.getCategoriesSummary();
      setCategorySummary(summary);
    } catch (error: any) {
      toast.error(error.message || 'Error al desarchivar');
    }
  };

  const selectedNotification = filteredData?.data?.find((n: any) => n.id === selectedNotificationId) || null;

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

  // Renderizar vista de categoría
  if (activeView === 'send' && canSendNotifications) {
    return (
      <ProtectedPage {...NOTIFICATIONS_PERMISSIONS.SEND}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Enviar Notificación</h2>
            <Button onClick={() => setActiveView('inbox')} variant="outline">
              Volver
            </Button>
          </div>
          <NotificationForm
            onSuccess={() => {
              refresh();
              setActiveView('inbox');
            }}
            onCancel={() => setActiveView('inbox')}
          />
        </div>
      </ProtectedPage>
    );
  }

  if (activeView === 'preferences' && canReadPreferences) {
    return (
      <ProtectedPage {...NOTIFICATIONS_PERMISSIONS.READ_PREFERENCES}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Mis Preferencias</h2>
            <Button onClick={() => setActiveView('inbox')} variant="outline">
              Volver
            </Button>
          </div>
          <UserPreferencesPanel />
        </div>
      </ProtectedPage>
    );
  }

  if (activeView === 'all-preferences' && canViewAllPreferences) {
    return (
      <ProtectedPage {...NOTIFICATIONS_PERMISSIONS.READ_ALL_PREFERENCES}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Todas las Preferencias</h2>
            <Button onClick={() => setActiveView('inbox')} variant="outline">
              Volver
            </Button>
          </div>
          <PreferencesList />
        </div>
      </ProtectedPage>
    );
  }

  if (activeView === 'read-log' && canViewOne) {
    return (
      <ProtectedPage {...NOTIFICATIONS_PERMISSIONS.READ_ONE}>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Log de Lectura de Notificaciones</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Aquí puedes ver el historial de lectura de cada notificación que hayas enviado.
              Selecciona una notificación de la lista para ver quién la leyó y cuándo.
            </p>
          </div>
          
          {selectedNotificationId ? (
            <NotificationReadLog
              notificationId={selectedNotificationId}
              onBack={() => setSelectedNotificationId(null)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-lg mb-4">Notificaciones Enviadas</h3>
                {data?.data && data.data.length > 0 ? (
                  <div className="space-y-2">
                    {data.data.map((notification: any) => (
                      <button
                        key={notification.id}
                        onClick={() => setSelectedNotificationId(notification.id)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                      >
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {notification.message}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No tienes notificaciones enviadas aún</p>
                )}
              </div>
            </div>
          )}
          
          <Button onClick={() => setActiveView('inbox')} variant="outline">
            Volver al Inbox
          </Button>
        </div>
      </ProtectedPage>
    );
  }

  // Vista principal: inbox con layout Gmail/Slack
  return (
    <ProtectedPage {...NOTIFICATIONS_PERMISSIONS.READ}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Centro de Notificaciones</h1>
            <div className="flex gap-2">
              <Button onClick={refresh} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
              {canSendNotifications && (
                <Button onClick={() => setActiveView('send')} size="sm" className="gap-2">
                  Nueva notificación
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Layout: Sidebar + List + Detail Pane */}
        <div className="flex flex-1 overflow-hidden gap-0">
          {/* Sidebar - Fixed width */}
          <div className="flex-shrink-0">
            <NotificationsSidebar
              currentCategory={selectedCategory}
              categorySummary={categorySummary}
              canReadPreferences={canReadPreferences}
              canReadLog={canReadLog}
              onFilterChange={(category) => {
                setSelectedCategory(category);
                if (category === 'send' && canSendNotifications) {
                  setActiveView('send');
                } else if (category === 'preferences' && canReadPreferences) {
                  setActiveView('preferences');
                } else if (category === 'all-preferences' && canViewAllPreferences) {
                  setActiveView('all-preferences');
                }
              }}
              onViewChange={(view) => {
                if (view === 'preferences') {
                  setActiveView('preferences');
                } else if (view === 'read-log') {
                  setActiveView('read-log');
                } else {
                  setActiveView('inbox');
                }
              }}
            />
          </div>

          {/* Notifications List - Flexible width */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <NotificationsList
              notifications={filteredData?.data || []}
              selectedId={selectedNotificationId ?? undefined}
              onSelect={(notification) => {
                setSelectedNotificationId(notification.id);
                // Auto-mark as read when notification is selected (without toast)
                // Solo si no está ya marcada como leída
                if (notification.status !== 'READ') {
                  handleMarkAsRead(notification.id, false);
                }
              }}
              onToggleStar={handleToggleStar}
              isLoading={filterLoading || isLoading}
            />
          </div>

          {/* Detail Pane - Solo mostrar si hay notificación seleccionada */}
          {selectedNotificationId && (
            <div className="flex-1 min-w-0 overflow-hidden border-l border-gray-200 dark:border-slate-800">
              <NotificationDetailPane
                notification={selectedNotification}
                canEdit={canUpdate}
                canDelete={canDelete}
                onMarkAsRead={handleMarkAsRead}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteNotificationDialog
        notificationId={deleteNotificationId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={refresh}
      />
    </ProtectedPage>
  );
}
