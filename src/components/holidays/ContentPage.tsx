"use client"

import * as React from "react"
import { HolidayCalendar } from "@/components/holidays/holiday-calendar"
import { HolidayFilters } from "@/components/holidays/holiday-filters"
import { HolidaysTable } from "@/components/holidays/HolidayTable"
import { useHolidayContext } from "@/context/HolidayContext"
import {
    Card,
    CardHeader,
    CardContent
} from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { HolidayModalForm } from "./ContentModalForm" // Asegúrate de que la ruta sea correcta

export default function ContentPage() {
    const {
        cycleId,
        setCycleId,
        bimesterId,
        setBimesterId,

    } = useHolidayContext();

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleModalClose = () => {
        setIsModalOpen(false);
        // refetchHolidays?.(); // Refrescar la lista de feriados después de cerrar el modal
    };

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="w-full">
                <Card>
                    <CardHeader className="text-center space-y-2">
                        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                            Gestor de Días Festivos
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Explora y gestiona los días festivos por ciclo escolar y bimestre.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {cycleId && bimesterId ? (
                            <div className="flex justify-end">
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Feriado
                                </Button>
                            </div>
                        ) : null}


                        <HolidayFilters
                            selectedCycleId={cycleId}
                            setSelectedCycleId={setCycleId}
                            selectedBimesterId={bimesterId}
                            setSelectedBimesterId={setBimesterId}
                        />

                        <HolidayCalendar />

                        <HolidaysTable />
                    </CardContent>
                </Card>

                {/* Modal para crear/editar feriados */}
               <HolidayModalForm
                isOpen={isModalOpen}
                onClose={handleModalClose}
                bimesters={[]} // Aún requerido si el schema lo necesita, pero no se usará para el select
                defaultValues={{
                    bimesterId: bimesterId || 0, // Aquí se pasa directamente
                }}
                />
            </div>
        </main>
    )
}