"use client"

import * as React from "react"
import { format, isSameMonth, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDaysIcon, InfoIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useHolidayContext } from "@/context/HolidayContext"
import { Skeleton } from "@/components/ui/skeleton"

interface HolidayCalendarProps {
  selectedBimesterId?: number
}

export function HolidayCalendar({ selectedBimesterId }: HolidayCalendarProps) {
  const { holidays, isLoading } = useHolidayContext()
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())

  // Filtra por bimestre seleccionado
  const filteredByBimester = React.useMemo(() => {
    if (selectedBimesterId === undefined) return holidays
    return holidays.filter(h => h.bimesterId === selectedBimesterId)
  }, [selectedBimesterId, holidays])

  // Filtra por mes visible
  const filteredHolidays = React.useMemo(() => {
    return filteredByBimester.filter(holiday =>
      isSameMonth(parseISO(holiday.date), currentMonth))
  }, [filteredByBimester, currentMonth])

  // Encuentra el evento para la fecha seleccionada
  const selectedHoliday = React.useMemo(() => {
    if (!selectedDate) return undefined
    return filteredByBimester.find(holiday => {
      const holidayDate = parseISO(holiday.date)
      return (
        holidayDate.getFullYear() === selectedDate.getFullYear() &&
        holidayDate.getMonth() === selectedDate.getMonth() &&
        holidayDate.getDate() === selectedDate.getDate()
      )
    })
  }, [selectedDate, filteredByBimester])

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl p-6 shadow-lg border-t-4 border-secondary">
        <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b">
          <CalendarDaysIcon className="h-7 w-7 text-secondary" />
          <CardTitle className="text-2xl font-semibold text-gray-800">Calendario de Días Festivos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 pt-6 md:flex-row md:items-start md:justify-center">
          <Skeleton className="h-[300px] w-full max-w-[350px] rounded-lg" />
          <Skeleton className="h-[250px] w-full max-w-sm rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-5xl p-6">
      <CardHeader className="flex flex-row items-center gap-3 pb-4 border-b">
        <CalendarDaysIcon className="h-7 w-7" />
        <CardTitle className="text-2xl font-semibold text-gray-800">Calendario de Días Festivos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-8 pt-6 md:flex-row md:items-start md:justify-center">
        <div className="rounded-lg border shadow-md bg-background">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            onMonthChange={setCurrentMonth}
            month={currentMonth}
            locale={es}
            modifiers={{
              holiday: filteredByBimester.map(h => parseISO(h.date)),
            }}
            modifiersClassNames={{
              holiday: "bg-red-500 text-white rounded-full font-bold hover:bg-red-600",
            }}
            className="p-4"
            disabled={(date) => {
              // Deshabilita días que no tienen eventos
              return !filteredByBimester.some(h => {
                const holidayDate = parseISO(h.date)
                return (
                  holidayDate.getFullYear() === date.getFullYear() &&
                  holidayDate.getMonth() === date.getMonth() &&
                  holidayDate.getDate() === date.getDate()
                )
              })
            }}
          />
        </div>

        {/* Tarjeta de detalles */}
        <Card className="w-full max-w-xs md:max-w-sm shadow-md border">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <InfoIcon className="h-5 w-5 text-blue-500" />
              Detalles del Día
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Selecciona una fecha"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {selectedHoliday ? (
              <div className="space-y-2">
                <p className="font-medium text-gray-800">{selectedHoliday.description}</p>
                <p className="text-muted-foreground">
                  Estado:{" "}
                  <span
                    className={cn("font-semibold", selectedHoliday.isRecovered ? "text-green-600" : "text-red-600")}
                  >
                    {selectedHoliday.isRecovered ? "Recuperado" : "No Recuperado"}
                  </span>
                </p>
                {selectedHoliday.bimester && (
                  <p className="text-muted-foreground">
                    Bimestre: {selectedHoliday.bimester.name} (Número: {selectedHoliday.bimester.id})
                  </p>
                )}
                {selectedHoliday.bimester?.cycle && (
                  <p className="text-muted-foreground">Ciclo: {selectedHoliday.bimester.cycle.name}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {selectedDate
                  ? "No se encontró ningún día festivo para esta fecha."
                  : "Selecciona una fecha en el calendario para ver los detalles."}
              </p>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </div>
  )
}