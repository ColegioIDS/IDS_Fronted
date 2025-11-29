// src/components/features/verify-email/admin/VerifiedUsersTable.tsx
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
import { Badge } from '@/components/ui/badge';
import { UnverifiedUser } from '@/types/verify-email.types';
import { CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface VerifiedUsersTableProps {
  users: UnverifiedUser[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Tabla de usuarios con email verificado (Admin)
 */
export function VerifiedUsersTable({
  users,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: VerifiedUsersTableProps) {
  const formatDate = (date: string) => {
    return format(parseISO(date), 'dd MMM yyyy HH:mm', { locale: es });
  };

  // Filtrar solo usuarios verificados
  const verifiedUsers = users.filter((user) => user.accountVerified);

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

  if (verifiedUsers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-3 opacity-50" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              No hay usuarios verificados
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Los usuarios aparecerán aquí una vez verifiquen sus emails
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios Verificados</CardTitle>
        <CardDescription>
          {verifiedUsers.length} usuario{verifiedUsers.length !== 1 ? 's' : ''} con email verificado
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
                <TableHead>Fecha Creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifiedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.email}</TableCell>
                  <TableCell>{user.givenNames}</TableCell>
                  <TableCell>{user.lastNames}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Verificado
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
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
