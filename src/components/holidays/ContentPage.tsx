"use client"

import * as React from "react"
import { HolidayCalendar } from "@/components/holidays/holiday-calendar"
import { HolidayFilters } from "@/components/holidays/holiday-filters"
import { HolidaysTable } from "@/components/holidays/HolidayTable"
import { useHolidayContext } from "@/context/HolidayContext"
import { useAuth } from "@/context/AuthContext"
import {
    Card,
    CardHeader,
    CardContent,
    CardDescription,
    CardTitle
} from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, PartyPopper, Lock, ShieldX, AlertTriangle } from "lucide-react"
import { HolidayModalForm } from "./ContentModalForm"

export default function ContentPage() {
    const {
        cycleId,
        setCycleId,
        bimesterId,
        setBimesterId,
    } = useHolidayContext();

    // ✅ Permisos
    const { user, hasPermission } = useAuth();
    const canCreate = hasPermission('holiday', 'create');
    const canView = hasPermission('holiday', 'read');

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    // ✅ Sin permisos de visualización
    if (!canView) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
                <Card className="max-w-md w-full border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <CardTitle className="text-amber-900 dark:text-amber-100">Acceso Restringido</CardTitle>
                        </div>
                        <CardDescription className="text-amber-700 dark:text-amber-300">
                            No tienes permisos para ver los días festivos. Contacta al administrador si necesitas acceso.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2 flex-1">
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                        Permiso requerido:
                                    </p>
                                    <code className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-md text-xs font-mono text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        <span className="font-semibold">holiday</span>
                                        <span className="text-amber-400">.</span>
                                        <span className="font-semibold">read</span>
                                    </code>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Card */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader className="space-y-4 pb-8">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                                        <PartyPopper className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                            Días Festivos
                                        </h1>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Gestiona el calendario de días festivos del año escolar
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Botón crear - solo si tiene permiso */}
                            {cycleId && bimesterId && canCreate && (
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white shadow-md"
                                    size="lg"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Nuevo Festivo
                                </Button>
                            )}
                        </div>

                        {/* Mensaje informativo si no puede crear */}
                        {cycleId && bimesterId && !canCreate && (
                            <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                                <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                                    Solo tienes permisos de lectura. Contacta al administrador para crear festivos.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardHeader>
                </Card>

                {/* Filtros */}
                <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Filtros
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                            Selecciona el ciclo y bimestre para ver los días festivos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <HolidayFilters
                            selectedCycleId={cycleId}
                            setSelectedCycleId={setCycleId}
                            selectedBimesterId={bimesterId}
                            setSelectedBimesterId={setBimesterId}
                        />
                    </CardContent>
                </Card>

                {/* Calendario - Solo si hay filtros seleccionados */}
                {cycleId && bimesterId ? (
                    <>
                        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Calendario
                                </CardTitle>
                                <CardDescription className="text-slate-600 dark:text-slate-400">
                                    Vista mensual de los días festivos
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <HolidayCalendar />
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Lista de Festivos
                                </CardTitle>
                                <CardDescription className="text-slate-600 dark:text-slate-400">
                                    Todos los días festivos del período seleccionado
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <HolidaysTable />
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardContent className="py-16">
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800">
                                        <PartyPopper className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        Selecciona un ciclo y bimestre
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                                        Para ver los días festivos, primero selecciona un ciclo escolar y un bimestre en los filtros de arriba.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Modal - Solo si tiene permiso de crear */}
                {canCreate && (
                    <HolidayModalForm
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        bimesters={[]}
                        defaultValues={{
                            bimesterId: bimesterId || 0,
                        }}
                    />
                )}
            </div>
        </main>
    )
}