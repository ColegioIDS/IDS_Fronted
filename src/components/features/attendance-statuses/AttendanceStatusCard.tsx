// src/components/features/attendance-statuses/AttendanceStatusCard.tsx

'use client';

import { AttendanceStatus } from '@/types/attendance-status.types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface AttendanceStatusCardProps {
  status: AttendanceStatus;
  onEdit?: (status: AttendanceStatus) => void;
  onDelete?: (id: number) => void;
  onToggleActive?: (id: number, isActive: boolean) => void;
  isCompact?: boolean;
}

export const AttendanceStatusCard = ({
  status,
  onEdit,
  onDelete,
  onToggleActive,
  isCompact = false,
}: AttendanceStatusCardProps) => {
  
  const getStatusColor = (colorCode?: string) => {
    return colorCode || '#94a3b8';
  };

  if (isCompact) {
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md border-l-4" style={{ borderLeftColor: getStatusColor(status.colorCode) }}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded border">
                {status.code}
              </code>
              <span className="font-semibold text-sm truncate">{status.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4" style={{ borderTopColor: getStatusColor(status.colorCode) }}>
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
              style={{ backgroundColor: getStatusColor(status.colorCode) }}
            >
              {status.code}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{status.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={status.isActive ? "secondary" : "outline"} 
                  className={cn(
                    "text-[10px] px-1.5 h-5", 
                    status.isActive 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : "text-muted-foreground"
                  )}
                >
                  {status.isActive ? "Activo" : "Inactivo"}
                </Badge>
                <span className="text-xs text-muted-foreground">Orden: {status.order}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-5 py-2 min-h-[80px]">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {status.description || <span className="italic opacity-50">Sin descripción</span>}
        </p>
        
        <div className="flex flex-wrap gap-1.5">
          {status.isNegative && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-6 gap-1 border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
              <AlertTriangle className="w-3 h-3" /> Ausencia
            </Badge>
          )}
          {status.isExcused && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-6 gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
              <ShieldCheck className="w-3 h-3" /> Justificable
            </Badge>
          )}
          {status.isTemporal && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-6 gap-1 border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-400">
              <Clock className="w-3 h-3" /> Temporal
            </Badge>
          )}
          
          {(status.requiresJustification || status.canHaveNotes) && (
            <div className="flex gap-1.5 ml-auto">
               {status.requiresJustification && (
                 <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-500" title="Requiere justificación">
                   <FileText className="w-3.5 h-3.5" />
                 </div>
               )}
               {status.canHaveNotes && (
                 <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-500" title="Permite notas">
                   <Edit2 className="w-3.5 h-3.5" />
                 </div>
               )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-5 py-4 bg-muted/30 border-t flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {onToggleActive && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onToggleActive(status.id, !status.isActive)}
          >
            {status.isActive ? (
              <>
                <EyeOff className="w-3.5 h-3.5 mr-1.5" /> Desactivar
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 mr-1.5" /> Activar
              </>
            )}
          </Button>
        )}
        
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800"
            onClick={() => onEdit(status)}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Editar
          </Button>
        )}
        
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
            onClick={() => onDelete(status.id)}
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
