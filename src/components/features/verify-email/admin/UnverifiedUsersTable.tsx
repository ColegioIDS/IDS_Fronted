// src/components/features/verify-email/admin/UnverifiedUsersTable.tsx
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UnverifiedUser } from '@/types/verify-email.types';
import { Mail, MoreVertical, Clock, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface UnverifiedUsersTableProps {
  users: UnverifiedUser[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Tabla de usuarios sin verificar (Admin)
 */
export function UnverifiedUsersTable({
  users,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: UnverifiedUsersTableProps) {
  const calculateDaysPending = (createdAt: string) => {
    return differenceInDays(new Date(), parseISO(createdAt));
  };

  const formatDate = (date: string) => {
    return format(parseISO(date), 'dd MMM yyyy HH:mm', { locale: es });
  };

  // Filtrar solo usuarios sin verificar
  const unverifiedUsers = users.filter((user) => !user.accountVerified);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              Cargando usuarios...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (unverifiedUsers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Mail className="h-12 w-12 mx-auto text-green-500 mb-3 opacity-50" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              ✅ Todos los usuarios han verificado sus emails
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              No hay usuarios pendientes de verificación
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleReminder = () => {
    toast.info('Próximamente: Enviar recordatorio de verificación por email');
  };

  const handleDetails = () => {
    toast.info('Próximamente: Ver detalles completos del usuario');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios Pendientes de Verificación</CardTitle>
        <CardDescription>
          {unverifiedUsers.length} usuario{unverifiedUsers.length !== 1 ? 's' : ''} sin verificar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombres</TableHead>
                <TableHead>Apellidos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Días Pendientes</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unverifiedUsers.map((user) => {
                const daysPending = calculateDaysPending(user.createdAt);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>{user.givenNames}</TableCell>
                    <TableCell>{user.lastNames}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400">
                        <Clock className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={daysPending > 7 ? 'destructive' : 'secondary'}
                        className="gap-1"
                      >
                        {daysPending} día{daysPending !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-sm" onClick={handleReminder}>
                            Enviar Recordatorio
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-sm" onClick={handleDetails}>
                            Ver Detalles
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
