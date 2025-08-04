//src\components\bimester\content.tsx
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { useBimesterContext } from '@/context/BimesterContext';
import { BimesterDataTable } from '@/components/bimester/dataTable';
import BimesterModalForm from './ContentModalForm';
import { Bimester } from "@/types/SchoolBimesters";
import { NoResultsFound } from "@/components/noresult/NoData";
import { PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useCyclesContext } from '@/context/CyclesContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SchoolCycle } from '@/types/SchoolCycle';
import { BimestersTable } from "@/components/bimester/bimesters-table"
import { CalendarDays, GraduationCap, Calendar, Clock, BarChart3 } from "lucide-react"

export default function BimesterTableContainer() {
  const { cycles, isLoadingCycles } = useCyclesContext();
  const {
    fetchBimesters,
    bimesters,
    isLoading: isLoadingBimesters,
    cycleId,
    setCycleId
  } = useBimesterContext();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [bimesterToEdit, setBimesterToEdit] = useState<Bimester | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<SchoolCycle | null>(null);

  const openCreateModal = () => {
    setBimesterToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (bimester: Bimester) => {
    setBimesterToEdit(bimester);
    setIsFormModalOpen(true);
  };

  // Cargar bimestres cuando se selecciona un ciclo
  useEffect(() => {
    if (selectedCycle?.id) {
      setCycleId(selectedCycle.id); // Esto actualiza el contexto
      fetchBimesters(selectedCycle.id);
    }
  }, [selectedCycle?.id, setCycleId]);



  // Seleccionar el primer ciclo por defecto al cargar
  useEffect(() => {
    if (cycles.length > 0 && !selectedCycle) {
      setSelectedCycle(cycles[0]);
    }
  }, [cycles, selectedCycle]);

  if (isLoadingCycles || isLoadingBimesters) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">


          <div>
              <div className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      Bimestres Académicos
                    </div>
                    <p className="mt-2 text-base text-gray-600">
                      Gestiona los períodos bimestrales de evaluación y seguimiento
                    </p>
                  </div>
                </div>
              </div>
            
          </div>






          <Button
            onClick={openCreateModal}
            className="gap-2"
            disabled={!selectedCycle}
          >
            <PlusCircle className="h-4 w-4" />
            Crear Bimestre
          </Button>
        </div>
        <Separator />
      </div>

      {/* Selector de Ciclo Escolar */}
      <div className="flex items-center gap-4">
        <div className="w-full max-w-xs">
          <Select
            value={selectedCycle?.id?.toString() || ''}
            onValueChange={(value) => {
              const cycle = cycles.find(c => c.id === Number(value));
              setSelectedCycle(cycle || null);
            }}
            disabled={isLoadingCycles}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingCycles ? "Cargando ciclos..." : "Selecciona un ciclo"} />
            </SelectTrigger>
            <SelectContent>
              {cycles.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id.toString()}>
                  {cycle.name} ({cycle.isActive ? 'Activo' : 'Inactivo'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCycle && (
          <div className="text-sm text-muted-foreground">
            {formatDate(selectedCycle.startDate)} - {formatDate(selectedCycle.endDate)}
          </div>
        )}
      </div>

      <Card className="shadow-2xl hover:shadow-2xl hover:border-primary/20 rounded-xl
          bg-white dark:bg-white/[0.03] dark:border-gray-800
          pl-5 pr-5"
      >
        <CardHeader>
          <CardTitle className="text-xl">
            Listado de Bimestres {selectedCycle ? `- ${selectedCycle.name}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedCycle ? (
            <div className="flex flex-col items-center justify-center py-8">
              <NoResultsFound
                message="Selecciona un ciclo escolar"
                suggestion="Elige un ciclo de la lista para ver sus bimestres"
              />
            </div>
          ) : bimesters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <NoResultsFound
                message="No se encontraron bimestres registrados"
                suggestion="Comienza creando un nuevo bimestre"
              />
              <Button
                onClick={openCreateModal}
                variant="outline"
                className="mt-4 gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Crear primer bimestre
              </Button>
            </div>
          ) : (
            <BimestersTable
              data={bimesters}
              onEdit={openEditModal}
              onCreate={openCreateModal}

            />
          )}
        </CardContent>
      </Card>

      {selectedCycle && (
        <BimesterModalForm
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setBimesterToEdit(null);
          }}
          defaultValues={
            bimesterToEdit
              ? {
                name: bimesterToEdit.name,
                number: bimesterToEdit.number,
                startDate: new Date(bimesterToEdit.startDate),
                endDate: new Date(bimesterToEdit.endDate),
                isActive: bimesterToEdit.isActive ?? false,
                weeksCount: bimesterToEdit.weeksCount ?? 8,
              }
              : undefined
          }
          bimesterId={bimesterToEdit ? bimesterToEdit.id : null}
          cycleId={selectedCycle.id}
        />
      )}
    </div>
  );
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES');
}