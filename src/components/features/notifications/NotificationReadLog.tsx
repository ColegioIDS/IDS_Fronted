// src/components/features/notifications/NotificationReadLog.tsx
'use client';

import { useState, useEffect } from 'react';
import { notificationsService } from '@/services/notifications.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ReadLogEntry {
  id: number;
  notificationId: number;
  user: {
    id: number;
    username: string;
    givenNames: string;
    lastNames: string;
    email: string;
  };
  channel: string;
  status: string;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  readAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ReadLogData {
  logs: ReadLogEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface NotificationReadLogProps {
  notificationId: number;
  onBack?: () => void;
}

export function NotificationReadLog({ notificationId, onBack }: NotificationReadLogProps) {
  const [readLogData, setReadLogData] = useState<ReadLogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadReadLog();
  }, [notificationId, currentPage]);

  const loadReadLog = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationsService.getReadLog(notificationId, currentPage, 10);
      setReadLogData(data);
    } catch (err: any) {
      const message = err.message || 'Error al cargar el log de lectura';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (log: any) => {
    if (log.readAt) {
      return 'text-green-600 dark:text-green-400';
    } else if (log.deliveredAt && !log.failedAt) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else if (log.failedAt) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStatusIcon = (log: any) => {
    if (log.readAt) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    } else if (log.deliveredAt && !log.failedAt) {
      return <Mail className="w-5 h-5 text-yellow-600" />;
    } else if (log.failedAt) {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return null;
  };

  const getStatusLabel = (log: any) => {
    if (log.readAt) return 'Leído';
    if (log.deliveredAt && !log.failedAt) return 'Entregado';
    if (log.failedAt) return 'Fallido';
    return 'Pendiente';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log de Lectura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log de Lectura</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!readLogData || readLogData.logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log de Lectura</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No hay registros de lectura para esta notificación</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Log de Lectura</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total de registros: {readLogData.pagination.total}
            </p>
          </div>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Volver
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {readLogData.logs.map((log) => (
            <div
              key={log.id}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(log)}
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {log.user.givenNames} {log.user.lastNames}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {log.user.email}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-500">
                    <span className={`font-semibold ${getStatusColor(log)}`}>
                      {getStatusLabel(log)}
                    </span>
                    <span>Canal: {log.channel}</span>
                    {log.readAt && (
                      <span>Leído: {formatDate(log.readAt)}</span>
                    )}
                    {!log.readAt && log.deliveredAt && (
                      <span>Entregado: {formatDate(log.deliveredAt)}</span>
                    )}
                    {log.errorMessage && (
                      <span className="text-red-600 dark:text-red-400">
                        Error: {log.errorMessage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {readLogData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página {readLogData.pagination.page} de {readLogData.pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!readLogData.pagination.hasMore}
                variant="outline"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
