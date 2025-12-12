'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CotejoResponse } from '@/types/cotejos.types';
import { CotejoEditActitudinal } from './CotejoEditActitudinal';
import { CotejoEditDeclarativo } from './CotejoEditDeclarativo';
import { CotejoSubmit } from './CotejoSubmit';

interface CotejoEditDialogProps {
  cotejo: CotejoResponse;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog para editar los componentes de un cotejo
 */
export const CotejoEditDialog = ({
  cotejo,
  isOpen,
  onOpenChange,
  onSuccess,
}: CotejoEditDialogProps) => {
  const [activeTab, setActiveTab] = useState<'actitudinal' | 'declarativo' | 'submit'>(
    'actitudinal',
  );

  const studentName = `${cotejo.enrollment?.student?.givenNames} ${cotejo.enrollment?.student?.lastNames}`;

  const isCompleted =
    cotejo.ericaScore !== null &&
    cotejo.tasksScore !== null &&
    cotejo.actitudinalScore !== null &&
    cotejo.declarativoScore !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Cotejo</DialogTitle>
          <DialogDescription>
            Actualizando cotejo de {studentName} en {cotejo.course?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info del cotejo */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-muted rounded-lg">
            <div>
              <p className="text-xs font-medium text-muted-foreground">ERICA</p>
              <p className="text-lg font-bold">
                {cotejo.ericaScore !== null ? cotejo.ericaScore.toFixed(2) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">TAREAS</p>
              <p className="text-lg font-bold">
                {cotejo.tasksScore !== null ? cotejo.tasksScore.toFixed(2) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">ACTITUDINAL</p>
              <p className="text-lg font-bold">
                {cotejo.actitudinalScore !== null ? cotejo.actitudinalScore.toFixed(2) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">DECLARATIVO</p>
              <p className="text-lg font-bold">
                {cotejo.declarativoScore !== null ? cotejo.declarativoScore.toFixed(2) : '—'}
              </p>
            </div>
          </div>

          {/* Tabs de edición */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="actitudinal">Actitudinal</TabsTrigger>
              <TabsTrigger value="declarativo">Declarativo</TabsTrigger>
              <TabsTrigger value="submit" disabled={!isCompleted}>
                Finalizar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actitudinal" className="space-y-4">
              <CotejoEditActitudinal
                cotejo={cotejo}
                onSuccess={() => {
                  onSuccess();
                  setActiveTab('declarativo');
                }}
              />
            </TabsContent>

            <TabsContent value="declarativo" className="space-y-4">
              <CotejoEditDeclarativo
                cotejo={cotejo}
                onSuccess={() => {
                  onSuccess();
                  if (isCompleted) {
                    setActiveTab('submit');
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="submit" className="space-y-4">
              {isCompleted && (
                <CotejoSubmit
                  cotejo={cotejo}
                  onSuccess={() => {
                    onSuccess();
                    onOpenChange(false);
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
