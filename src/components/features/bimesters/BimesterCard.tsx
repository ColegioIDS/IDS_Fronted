// src/components/features/bimesters/BimesterCard.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle2,
  XCircle 
} from 'lucide-react';
import { Bimester } from '@/types/bimester.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatISODateWithTimezone } from '@/utils/dateUtils';

interface BimesterCardProps {
  bimester: Bimester;
  onEdit?: (bimester: Bimester) => void;
  onDelete?: (bimester: Bimester) => void;
  onViewDetails: (bimester: Bimester) => void;
}

/**
 * Tarjeta individual de bimestre
 */
export function BimesterCard({
  bimester,
  onEdit,
  onDelete,
  onViewDetails,
}: BimesterCardProps) {
  const formatDate = (date: string) => {
    try {
      return formatISODateWithTimezone(date, 'dd MMM yyyy');
    } catch {
      return date;
    }
  };

  const getNumberBadgeColor = (number: number) => {
    const colors: Record<number, string> = {
      1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      2: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      3: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      4: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    };
    return colors[number] || colors[1];
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge className={getNumberBadgeColor(bimester.number)}>
            Bimestre {bimester.number}
          </Badge>
          
          {bimester.isActive ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Activo
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Inactivo
            </Badge>
          )}
        </div>

        <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[3.5rem]">
          {bimester.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Fechas */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Inicio: {formatDate(bimester.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Fin: {formatDate(bimester.endDate)}</span>
          </div>
        </div>

        {/* Semanas */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span>{bimester.weeksCount} semanas</span>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(bimester)}
            className="flex-1 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>

          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bimester)}
              className="border-gray-300 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(bimester)}
              className="border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default BimesterCard;
