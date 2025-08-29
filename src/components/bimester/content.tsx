//src\components\bimester\content.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { NoResultsFound } from "@/components/noresult/NoData";
import { BimestersTable } from "@/components/bimester/bimesters-table";

// ✅ NUEVO: Importar el Dialog en lugar del modal anterior
import BimesterDialog from './BimesterDialog';

// Contextos actualizados
import { useBimesterContext, useCycleBimesters } from '@/context/newBimesterContext';
import { useSchoolCycleContext } from '@/context/SchoolCycleContext';

import { Bimester } from "@/types/SchoolBimesters";
import { SchoolCycle } from '@/types/SchoolCycle';
import { PlusCircle, Calendar, CalendarDays, Clock } from 'lucide-react';

export default function BimesterTableContainer() {
  // Estados locales
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bimesterToEdit, setBimesterToEdit] = useState<Bimester | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  // Contexto de ciclos escolares
  const {
    cycles,
    activeCycle,
    isLoading: isLoadingCycles
  } = useSchoolCycleContext();

  // Contexto de bimestres (usa el ciclo activo automáticamente)
  const {
    bimesters: activeBimesters,
    isLoading: isLoadingActiveBimesters,
    cycleId: activeCycleId
  } = useBimesterContext();

  // Hook para bimestres de un ciclo específico
  const {
    bimesters: selectedBimesters,
    isLoading: isLoadingSelectedBimesters,
    cycleId: currentCycleId
  } = useCycleBimesters(selectedCycleId || undefined);

  // Determinar qué datos mostrar
  const shouldShowSelected = selectedCycleId && selectedCycleId !== activeCycleId;
  const bimesters = shouldShowSelected ? selectedBimesters : activeBimesters;
  const isLoadingBimesters = shouldShowSelected ? isLoadingSelectedBimesters : isLoadingActiveBimesters;
  const currentCycle = shouldShowSelected
    ? cycles.find(c => c.id === selectedCycleId)
    : activeCycle;

  // Inicializar con el ciclo activo
  useEffect(() => {
    if (activeCycle && !selectedCycleId) {
      setSelectedCycleId(activeCycle.id);
    }
  }, [activeCycle, selectedCycleId]);

  // ✅ ACTUALIZADO: Funciones para el dialog
  const handleCreateBimester = () => {
    setBimesterToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditBimester = (bimester: Bimester) => {
    setBimesterToEdit(bimester);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setBimesterToEdit(null);
  };

  // Función para formatear fechas
  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Estado de carga
  if (isLoadingCycles) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Cargando ciclos escolares...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 text-2xl font-semibold text-foreground">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              Bimestres Académicos
            </div>
            <p className="mt-2 text-base text-muted-foreground">
              Gestiona los períodos bimestrales de evaluación y seguimiento
            </p>
          </div>

          <Button
            onClick={handleCreateBimester}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!currentCycle}
          >
            <PlusCircle className="h-4 w-4" />
            Crear Bimestre
          </Button>
        </div>

        <Separator className="bg-border" />
      </div>

      {/* Selector de Ciclo Escolar */}
      <div className="flex items-center gap-4 p-4 bg-card dark:bg-card/50 rounded-lg border border-border">
        <div className="w-full max-w-xs">
          <Select
            value={selectedCycleId?.toString() || ''}
            onValueChange={(value) => {
              const cycleId = value ? Number(value) : null;
              setSelectedCycleId(cycleId);
            }}
            disabled={isLoadingCycles}
          >
            <SelectTrigger className="w-full bg-background dark:bg-background/50 border-border">
              <SelectValue
                placeholder={isLoadingCycles ? "Cargando ciclos..." : "Selecciona un ciclo"}
              />
            </SelectTrigger>
            <SelectContent className="bg-popover dark:bg-popover/95 border-border">
              {cycles.map((cycle) => (
                <SelectItem
                  key={cycle.id}
                  value={cycle.id.toString()}
                  className="focus:bg-accent dark:focus:bg-accent/50"
                >
                  <div className="flex items-center gap-2">
                    <span>{cycle.name}</span>
                    {cycle.isActive && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                        Activo
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentCycle && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {formatDate(currentCycle.startDate)} - {formatDate(currentCycle.endDate)}
            </span>
            {currentCycle.isActive && (
              <div className="flex items-center gap-1 text-primary">
                <Clock className="h-3 w-3" />
                <span className="text-xs font-medium">En curso</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabla de Bimestres */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl
          bg-card dark:bg-card/50 border-border hover:border-primary/20">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Listado de Bimestres
            {currentCycle && (
              <span className="text-muted-foreground font-normal">
                - {currentCycle.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {!currentCycle ? (
            <div className="flex flex-col items-center justify-center py-12">
              <NoResultsFound
                message="Selecciona un ciclo escolar"
                suggestion="Elige un ciclo de la lista para ver sus bimestres"
              />
            </div>
          ) : isLoadingBimesters ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Cargando bimestres...</span>
            </div>
          ) : bimesters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <NoResultsFound
                message="No se encontraron bimestres registrados"
                suggestion="Comienza creando un nuevo bimestre para este ciclo escolar"
              />
              <Button
                onClick={handleCreateBimester}
                variant="outline"
                className="gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5"
              >
                <PlusCircle className="h-4 w-4" />
                Crear primer bimestre
              </Button>
            </div>
          ) : (
            <BimestersTable
              data={bimesters}
              onEdit={handleEditBimester}
              onCreate={handleCreateBimester}
            />
          )}
        </CardContent>
      </Card>

      {/* ✅ NUEVO: Dialog Component */}
      <BimesterDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        selectedCycle={currentCycle ?? null}
        bimesterToEdit={bimesterToEdit}
      />
    </div>
  );
}