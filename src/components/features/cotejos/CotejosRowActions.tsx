'use client';

import { Edit2, MoreHorizontal, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CotejoResponse } from '@/types/cotejos.types';
import { CotejoEditDialog } from './CotejoEditDialog';
import { useState } from 'react';
import { useRecalculateCotejo } from '@/hooks/useCotejos';
import { toast } from 'sonner';

interface CotejosRowActionsProps {
  cotejo: CotejoResponse;
  onUpdate: () => void;
  onSelectForDelete?: (cotejo: CotejoResponse) => void;
}

/**
 * Menú de acciones para cada fila de cotejo
 */
export const CotejosRowActions = ({
  cotejo,
  onUpdate,
  onSelectForDelete,
}: CotejosRowActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutate: recalculate, loading: isRecalculating } = useRecalculateCotejo();

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onUpdate();
  };

  const handleRecalculate = async () => {
    try {
      await recalculate(cotejo.id);
      toast.success('Cotejo recalculado exitosamente');
      onUpdate();
    } catch (error) {
      toast.error('Error al recalcular el cotejo');
    }
  };

  // Solo se puede editar si el cotejo está en estado DRAFT
  const canEdit = cotejo.status === 'DRAFT';
  const isOutdated = cotejo.isUpToDate === false;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isRecalculating}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Recalcular - solo si está desactualizado */}
          {isOutdated && (
            <>
              <DropdownMenuItem 
                onClick={handleRecalculate}
                disabled={isRecalculating}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
                Actualizar Ahora
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Editar */}
          <DropdownMenuItem 
            onClick={handleEditClick}
            disabled={!canEdit}
            title={!canEdit ? 'No se puede editar cotejos completados o enviados' : ''}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          {/* Eliminar */}
          {cotejo.status === 'DRAFT' && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onSelectForDelete?.(cotejo)}
            >
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de edición */}
      <CotejoEditDialog
        cotejo={cotejo}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};
