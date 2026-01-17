// src/components/features/notifications/PreferencesList.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationsService } from '@/services/notifications.service';
import { PreferencesQuery, PaginatedPreferences } from '@/types/notifications.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/shared/pagination/Pagination';
import { Loader2, Search } from 'lucide-react';
import { useState as useStateEffective } from 'react';
import { useEffect } from 'react';

export function PreferencesList() {
  const [data, setData] = useState<PaginatedPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<PreferencesQuery>({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await notificationsService.getAllPreferences(query);

        if (isMounted) {
          setData(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error al cargar preferencias');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [query.page, query.limit, query.unsubscribed]);

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay preferencias disponibles</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.meta.total / data.meta.limit);

  return (
    <div className="space-y-6">
      {/* Filtro por estado de suscripción */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={query.unsubscribed === undefined ? 'default' : 'outline'}
              onClick={() => setQuery((prev) => ({ ...prev, unsubscribed: undefined, page: 1 }))}
            >
              Todas
            </Button>
            <Button
              variant={query.unsubscribed === false ? 'default' : 'outline'}
              onClick={() => setQuery((prev) => ({ ...prev, unsubscribed: false, page: 1 }))}
            >
              Suscritas
            </Button>
            <Button
              variant={query.unsubscribed === true ? 'default' : 'outline'}
              onClick={() => setQuery((prev) => ({ ...prev, unsubscribed: true, page: 1 }))}
            >
              Desuscritas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de preferencias */}
      <div className="grid gap-4">
        {data.data.map((pref) => (
          <Card key={pref.id}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {pref.user?.fullName || `Usuario ${pref.userId}`}
                    </h3>
                    {pref.user?.email && (
                      <p className="text-sm text-gray-600">{pref.user.email}</p>
                    )}
                    {pref.user?.role && (
                      <Badge variant="outline" className="mt-1">
                        {pref.user.role.name}
                      </Badge>
                    )}
                  </div>
                  {pref.unsubscribedAt ? (
                    <Badge className="bg-gray-100 text-gray-800 border-0">Desuscrito</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-0">Activo</Badge>
                  )}
                </div>

                {pref.unsubscribedAt && (
                  <p className="text-xs text-gray-600">
                    Desuscrito desde: {new Date(pref.unsubscribedAt).toLocaleDateString()}
                  </p>
                )}

                {/* Canales habilitados */}
                <div className="flex gap-2 flex-wrap">
                  {pref.emailEnabled && <Badge variant="secondary">Email</Badge>}
                  {pref.pushEnabled && <Badge variant="secondary">Push</Badge>}
                  {pref.smsEnabled && <Badge variant="secondary">SMS</Badge>}
                  {pref.whatsappEnabled && <Badge variant="secondary">WhatsApp</Badge>}
                </div>

                {/* Quiet hours */}
                {pref.quietHoursEnabled && (
                  <p className="text-xs text-gray-600">
                    Horas de silencio: {pref.quietHoursStart} - {pref.quietHoursEnd}
                  </p>
                )}

                <div className="text-xs text-gray-500 pt-2 border-t">
                  {pref.createdAt && (
                    <p>Creada: {new Date(pref.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={data.meta.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={isLoading}
        />
      )}
    </div>
  );
}
