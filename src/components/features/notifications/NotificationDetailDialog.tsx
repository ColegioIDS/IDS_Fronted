// src/components/features/notifications/NotificationDetailDialog.tsx
'use client';

import { useState } from 'react';
import { useNotificationDetail } from '@/hooks/data/notifications';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { notificationsService } from '@/services/notifications.service';

interface NotificationDetailDialogProps {
  notificationId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  READ: 'bg-green-200 text-green-900',
  ARCHIVED: 'bg-gray-100 text-gray-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const channelColors = {
  IN_APP: 'bg-blue-100 text-blue-800',
  EMAIL: 'bg-indigo-100 text-indigo-800',
  SMS: 'bg-green-100 text-green-800',
  PUSH: 'bg-purple-100 text-purple-800',
  WHATSAPP: 'bg-emerald-100 text-emerald-800',
};

export function NotificationDetailDialog({
  notificationId,
  open,
  onOpenChange,
}: NotificationDetailDialogProps) {
  const { data, isLoading, error, refresh } = useNotificationDetail(open ? notificationId : null);
  const [isSending, setIsSending] = useState(false);

  const handleSendExisting = async () => {
    if (!data) return;

    try {
      setIsSending(true);
      // Enviar a todos si no hay recipients
      await notificationsService.sendExistingNotification(
        data.id,
        {
          sendToAll: true,
        },
        ['IN_APP'],
      );
      toast.success('Notificación enviada correctamente');
      refresh();
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar la notificación');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalles de la Notificación</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {data && (
          <ScrollArea className="h-[calc(90vh-120px)]">
            <div className="space-y-4 pr-4">
              {/* Encabezado */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-3">{data.title || 'Sin título'}</h2>
                  <div className="flex gap-2 flex-wrap mb-4">
                    <Badge className="bg-blue-100 text-blue-800 border-0">{data.priority}</Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-0">{data.type}</Badge>
                    {data.isActive ? (
                      <Badge className="bg-green-100 text-green-800 border-0">Activa</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 border-0">Inactiva</Badge>
                    )}
                  </div>
                  {data.createdBy && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">Enviada por:</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {data.createdBy.givenNames} {data.createdBy.lastNames}
                        </span>
                        {data.createdBy.role && (
                          <Badge className="bg-indigo-100 text-indigo-800 border-0">
                            {data.createdBy.role.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{data.createdBy.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contenido */}
              {data.message && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Mensaje</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700 whitespace-pre-wrap">{data.message}</CardContent>
                </Card>
              )}

              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Creada</p>
                      <p className="font-medium">
                        {format(new Date(data.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Actualizada</p>
                      <p className="font-medium">
                        {format(new Date(data.updatedAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    {data.scheduleFor && (
                      <div>
                        <p className="text-gray-500">Programada para</p>
                        <p className="font-medium">
                          {format(new Date(data.scheduleFor), 'dd MMM yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    )}
                    {data.expiresAt && (
                      <div>
                        <p className="text-gray-500">Expira</p>
                        <p className="font-medium">
                          {format(new Date(data.expiresAt), 'dd MMM yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Destinatarios: {data.sendToAll ? 'Todos' : 'Seleccionados'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Destinatarios */}
              {(!data.recipients || data.recipients.length === 0) ? (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-sm text-yellow-900">Enviar Notificación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-yellow-800">
                      Esta notificación aún no ha sido enviada. Haz clic en el botón para enviarla a todos los usuarios.
                    </p>
                    <Button
                      onClick={handleSendExisting}
                      disabled={isSending}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar a Todos
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Destinatarios ({data.recipients.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {data.recipients.map((recipient) => (
                        <div key={recipient.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>
                            {recipient.user?.givenNames} {recipient.user?.lastNames}
                          </span>
                          <Badge className={(statusColors[recipient.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800') + ' border-0'}>
                            {recipient.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Logs de Entrega */}
              {data.deliveryLogs && data.deliveryLogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Logs de Entrega ({data.deliveryLogs.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {data.deliveryLogs.map((log) => (
                        <div key={log.id} className="text-sm p-2 bg-gray-50 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {log.channel}
                            </span>
                            <Badge className={(statusColors[log.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800') + ' border-0'}>
                              {log.status}
                            </Badge>
                          </div>
                          {log.sentAt && (
                            <p className="text-xs text-gray-500">
                              Enviado: {format(new Date(log.sentAt), 'dd MMM HH:mm', { locale: es })}
                            </p>
                          )}
                          {log.deliveredAt && (
                            <p className="text-xs text-gray-500">
                              Entregado: {format(new Date(log.deliveredAt), 'dd MMM HH:mm', { locale: es })}
                            </p>
                          )}
                          {log.errorMessage && (
                            <p className="text-xs text-red-600 mt-1">{log.errorMessage}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
