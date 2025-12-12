'use client';

import { Edit2, MoreHorizontal } from 'lucide-react';
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

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onUpdate();
  };

  // Solo se puede editar si el cotejo está en estado DRAFT
  const canEdit = cotejo.status === 'DRAFT';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={handleEditClick}
            disabled={!canEdit}
            title={!canEdit ? 'No se puede editar cotejos completados o enviados' : ''}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
