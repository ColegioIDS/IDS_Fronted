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
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" style={{ borderLeftColor: getStatusColor(status.colorCode) }}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-semibold text-slate-700 dark:text-slate-300">
                {status.code}
              </code>
              <span className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">{status.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" style={{ borderTopColor: getStatusColor(status.colorCode) }}>
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0"
              style={{ backgroundColor: getStatusColor(status.colorCode) }}
            >
              {status.code}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-slate-100">{status.name}</h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge 
                  variant={status.isActive ? "secondary" : "outline"} 
                  className={cn(
                    "text-xs px-2.5 py-0.5 font-medium", 
                    status.isActive 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30" 
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}
                >
                  {status.isActive ? "Activo" : "Inactivo"}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Orden: {status.order}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 py-3 min-h-[100px]">
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {status.description || <span className="italic opacity-50">Sin descripción</span>}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {status.isNegative && (
            <Badge variant="outline" className="text-xs px-2.5 py-1 gap-1.5 font-medium border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" /> Ausencia
            </Badge>
          )}
          {status.isExcused && (
            <Badge variant="outline" className="text-xs px-2.5 py-1 gap-1.5 font-medium border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" /> Justificable
            </Badge>
          )}
          {status.isTemporal && (
            <Badge variant="outline" className="text-xs px-2.5 py-1 gap-1.5 font-medium border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors">
              <Clock className="w-3.5 h-3.5" /> Temporal
            </Badge>
          )}
          
          {(status.requiresJustification || status.canHaveNotes) && (
            <div className="flex gap-2 ml-auto">
               {status.requiresJustification && (
                 <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-500 transition-all group-hover:scale-110" title="Requiere justificación">
                   <FileText className="w-4 h-4" />
                 </div>
               )}
               {status.canHaveNotes && (
                 <div className="w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-950/30 flex items-center justify-center text-cyan-600 dark:text-cyan-500 transition-all group-hover:scale-110" title="Permite notas">
                   <Edit2 className="w-4 h-4" />
                 </div>
               )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {onToggleActive && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
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
            className="flex-1 h-9 text-xs font-medium border-blue-200 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            onClick={() => onEdit(status)}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Editar
          </Button>
        )}
        
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/40 transition-colors"
            onClick={() => onDelete(status.id)}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};