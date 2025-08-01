'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCyclesContext } from '@/context/CyclesContext';
import { CycleDataTable } from '@/components/cycles/datatable';
import ModalFormularioCycle from './ModalFormularioCycle';
import { SchoolCycle } from "@/types/SchoolCycle";
import { NoResultsFound } from "@/components/noresult/NoData";
import { PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SchoolCycleTable() {
  const { cycles } = useCyclesContext();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [cycleToEdit, setCycleToEdit] = useState<SchoolCycle | null>(null);

  const openCreateModal = () => {
    setCycleToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (cycle: SchoolCycle) => {
    setCycleToEdit(cycle);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Ciclos Escolares</h1>
            <p className="text-muted-foreground">
              Administra los periodos académicos de la institución
            </p>
          </div>
          <Button onClick={openCreateModal} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Crear Ciclo Escolar
          </Button>
        </div>
        <Separator />
      </div>

      <Card className="shadow-2xl hover:shadow-2xl hover:border-primary/20 rounded-xl
          bg-white dark:bg-white/[0.03] dark:border-gray-800
          pl-5 pr-5"
      
      >
        <CardHeader>
          <CardTitle className="text-xl">
            Listado de Ciclos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cycles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <NoResultsFound 
                message="No se encontraron ciclos escolares registrados"
                suggestion="Comienza creando un nuevo ciclo escolar"
              />
              <Button 
                onClick={openCreateModal} 
                variant="outline" 
                className="mt-4 gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Crear primer ciclo
              </Button>
            </div>
          ) : (
            <CycleDataTable data={cycles} onEdit={openEditModal} />
          )}
        </CardContent>
      </Card>

      <ModalFormularioCycle
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCycleToEdit(null);
        }}
        defaultValues={
          cycleToEdit
            ? {
                name: cycleToEdit.name,
                startDate: new Date(cycleToEdit.startDate),
                endDate: new Date(cycleToEdit.endDate),
                isActive: cycleToEdit.isActive ?? false,
                isClosed: cycleToEdit.isClosed ?? false,
              }
            : undefined
        }
        cycleId={cycleToEdit ? cycleToEdit.id : null}
      />
    </div>
  );
}