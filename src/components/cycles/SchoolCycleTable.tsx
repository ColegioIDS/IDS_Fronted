'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Importamos el nuevo context y componentes adaptados
import {
  useSchoolCycleContext,
  useSchoolCycleStats,
  useSchoolCycleActions
} from '@/context/SchoolCycleContext';
import { CycleDataTable } from '@/components/cycles/datatable';
import { CycleForm } from '@/components/cycles/CycleForm';
import { SchoolCycle } from "@/types/SchoolCycle";
import { NoResultsFound } from "@/components/noresult/NoData";

import {
  PlusCircle,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Eye,
  BarChart3
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";

// Componentes de diálogo
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

export default function SchoolCycleTable() {
  // Hooks del context
  const { cycles, isLoading, isError, error } = useSchoolCycleContext();
  const stats = useSchoolCycleStats();
  const { refetchAll } = useSchoolCycleActions();

  // Estados locales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [cycleToEdit, setCycleToEdit] = useState<SchoolCycle | null>(null);
  const [cycleToView, setCycleToView] = useState<SchoolCycle | null>(null);

  // ========== HANDLERS ==========
  const openCreateModal = () => {
    setCycleToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (cycle: SchoolCycle) => {
    setCycleToEdit(cycle);
    setIsFormModalOpen(true);
  };

  const openViewModal = (cycle: SchoolCycle) => {
    setCycleToView(cycle);
    setIsViewModalOpen(true);
  };

  const handleFormSuccess = (cycle: SchoolCycle) => {
    const action = cycleToEdit ? 'actualizado' : 'creado';
    toast.success(`Ciclo "${cycle.name}" ${action} exitosamente`);
    setIsFormModalOpen(false);
    setCycleToEdit(null);
  };

  const handleFormError = (error: Error) => {
    toast.error(`Error: ${error.message}`);
  };

  const handleDelete = async (cycle: SchoolCycle) => {
    // Por ahora solo mostramos un toast, pero aquí iría la lógica de eliminación
    toast.success(`Funcionalidad de eliminar "${cycle.name}" no implementada aún`);
  };

  const closeForm = () => {
    setIsFormModalOpen(false);
    setCycleToEdit(null);
  };

  const closeView = () => {
    setIsViewModalOpen(false);
    setCycleToView(null);
  };

  // ========== RENDERIZADO DE ESTADOS DE ERROR/CARGA ==========
  if (isError) {
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
          </div>
          <Separator />
        </div>

        <Card className="shadow-2xl hover:shadow-2xl hover:border-primary/20 rounded-xl bg-white dark:bg-white/[0.03] dark:border-gray-800">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar los ciclos escolares: {error?.message || 'Error desconocido'}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 ml-2"
                  onClick={refetchAll}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Ciclos Escolares</h1>
            <p className="text-muted-foreground">
              Administra los periodos académicos de la institución
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={refetchAll}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={openCreateModal} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Crear Ciclo Escolar
            </Button>
          </div>
        </div>
        <Separator />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.totalCycles}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Activos</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.activeCycles}</p>
                {stats.hasMultipleActive && (
                  <Badge variant="destructive" className="text-xs">
                    Múltiples
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">En curso</p>
              <p className="text-2xl font-bold">{stats.currentCycles}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Próximos</p>
              <p className="text-2xl font-bold">{stats.futureCycles}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Advertencia de múltiples activos */}
      {stats.hasMultipleActive && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tienes múltiples ciclos activos. Se recomienda mantener solo uno activo para evitar confusiones.
          </AlertDescription>
        </Alert>
      )}

      {/* ✅ Información del ciclo activo con dark mode completo */}
      {stats.hasActiveCycle && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 
    dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800/40 
    backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* Header del ciclo */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
                  <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                    Ciclo Activo Actual
                  </p>
                </div>

                {/* Nombre del ciclo */}
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100 truncate">
                  {stats.academicYear}
                </p>

                {/* Información de progreso */}
                {stats.activeCycle.progress > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-blue-700 dark:text-blue-300">
                        Progreso: <span className="font-medium">{Math.round(stats.activeCycle.progress)}%</span>
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {stats.activeCycle.daysRemaining} días restantes
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 transition-all duration-500 ease-out"
                        style={{ width: `${Math.round(stats.activeCycle.progress)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de acción */}
              {stats.activeCycle.cycle && (
                <div className="ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openViewModal(stats.activeCycle.cycle!)}
                    className="
                border-blue-300 bg-white/50 text-blue-700 
                hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800
                dark:border-blue-600 dark:bg-blue-950/30 dark:text-blue-300
                dark:hover:bg-blue-900/40 dark:hover:border-blue-500 dark:hover:text-blue-200
                backdrop-blur-sm transition-all duration-200
              "
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla principal */}
      <Card className="shadow-2xl hover:shadow-2xl hover:border-primary/20 rounded-xl bg-white dark:bg-white/[0.03] dark:border-gray-800 pl-5 pr-5">
        <CardHeader>
          <CardTitle className="text-xl">
            Listado de Ciclos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando ciclos escolares...</span>
            </div>
          ) : cycles.length === 0 ? (
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
            <CycleDataTable
              onEdit={openEditModal}
              onView={openViewModal}
              onDelete={handleDelete}
              onCreate={openCreateModal}
              showActions={true}
              showToolbar={false} // Ya tenemos nuestro propio toolbar
              showSearch={true}
              showPagination={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal del formulario */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {cycleToEdit ? 'Editar Ciclo Escolar' : 'Crear Nuevo Ciclo Escolar'}
            </DialogTitle>
          </DialogHeader>
          <CycleForm
            editingCycle={cycleToEdit}
            onSuccess={handleFormSuccess}
            onError={handleFormError}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>

      {/* Sheet para ver detalles */}
      <Sheet open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalles del Ciclo Escolar</SheetTitle>
          </SheetHeader>
          {cycleToView && (
            <CycleDetailsView
              cycle={cycleToView}
              onEdit={() => {
                setIsViewModalOpen(false);
                openEditModal(cycleToView);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============ COMPONENTE PARA VER DETALLES ============
interface CycleDetailsViewProps {
  cycle: SchoolCycle;
  onEdit: () => void;
}

function CycleDetailsView({ cycle, onEdit }: CycleDetailsViewProps) {
  const now = new Date();
  const startDate = new Date(cycle.startDate);
  const endDate = new Date(cycle.endDate);

  // Calculamos información adicional
  const isCurrentPeriod = startDate <= now && now <= endDate;
  const isPastPeriod = endDate < now;
  const isFuturePeriod = startDate > now;

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const progress = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{cycle.name}</h2>
        <div className="flex gap-2 flex-wrap">
          {cycle.isActive && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Activo
            </Badge>
          )}
          {cycle.isClosed && (
            <Badge className="bg-red-100 text-red-800">
              Cerrado
            </Badge>
          )}
          {isCurrentPeriod && (
            <Badge className="bg-blue-100 text-blue-800">
              En curso
            </Badge>
          )}
          {isFuturePeriod && (
            <Badge className="bg-yellow-100 text-yellow-800">
              Próximo
            </Badge>
          )}
          {isPastPeriod && (
            <Badge variant="outline">
              Finalizado
            </Badge>
          )}
        </div>
      </div>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Fecha de inicio</p>
            <p className="font-medium">{formatDate(cycle.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de finalización</p>
            <p className="font-medium">{formatDate(cycle.endDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duración total</p>
            <p className="font-medium">{totalDays} días</p>
          </div>
          {cycle.createdAt && (
            <div>
              <p className="text-sm text-muted-foreground">Fecha de creación</p>
              <p className="font-medium">{formatDate(cycle.createdAt)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progreso (solo si está en curso) */}
      {isCurrentPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progreso del Ciclo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progreso</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Días transcurridos</p>
                <p className="font-medium">{Math.max(0, elapsedDays)} días</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Días restantes</p>
                <p className="font-medium">{Math.max(0, remainingDays)} días</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas adicionales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estadísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Estado del ciclo</p>
            <p className="font-medium">
              {isCurrentPeriod ? 'En curso' :
                isFuturePeriod ? 'Próximo a iniciar' :
                  'Finalizado'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Año académico</p>
            <p className="font-medium">{startDate.getFullYear()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Semestre</p>
            <p className="font-medium">
              {startDate.getMonth() < 6 ? 'Primer semestre' : 'Segundo semestre'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-2">
        <Button onClick={onEdit} className="flex-1">
          Editar Ciclo
        </Button>
      </div>
    </div>
  );
}