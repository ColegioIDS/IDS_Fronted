"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  value?: Date | string
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<number | undefined>(undefined)
  const [year, setYear] = React.useState<number | undefined>(undefined)

  // Convert string to Date if needed
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    
    // Handle ISO string format (YYYY-MM-DD or full ISO)
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  // Initialize month and year when selectedDate changes
  React.useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate.getMonth())
      setYear(selectedDate.getFullYear())
    } else {
      const now = new Date()
      setMonth(now.getMonth())
      setYear(now.getFullYear())
    }
  }, [selectedDate])

  const handleDateSelect = (date: Date | undefined) => {
    onChange(date)
    setOpen(false)
  }

  const handleMonthChange = (newMonth: string) => {
    const m = parseInt(newMonth)
    setMonth(m)
    if (year !== undefined) {
      const newDate = new Date(year, m, 1)
      onChange(newDate)
    }
  }

  const handleYearChange = (newYear: string) => {
    const y = parseInt(newYear)
    setYear(y)
    if (month !== undefined) {
      const newDate = new Date(y, month, 1)
      onChange(newDate)
    }
  }

  const months = [
    { value: "0", label: "Enero" },
    { value: "1", label: "Febrero" },
    { value: "2", label: "Marzo" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Mayo" },
    { value: "5", label: "Junio" },
    { value: "6", label: "Julio" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Septiembre" },
    { value: "9", label: "Octubre" },
    { value: "10", label: "Noviembre" },
    { value: "11", label: "Diciembre" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-white dark:placeholder-slate-400",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 dark:bg-slate-900 dark:border-slate-700/50" align="start">
        <div className="space-y-4">
          {/* Mes y Año Selectors */}
          <div className="flex gap-2">
            <Select value={month?.toString() ?? ""} onValueChange={handleMonthChange}>
              <SelectTrigger className="flex-1 dark:bg-slate-800 dark:border-slate-700">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year?.toString() ?? ""} onValueChange={handleYearChange}>
              <SelectTrigger className="flex-1 dark:bg-slate-800 dark:border-slate-700">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calendar */}
          {month !== undefined && year !== undefined && (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabled}
              initialFocus
              month={new Date(year, month)}
              onMonthChange={(date) => {
                setMonth(date.getMonth())
                setYear(date.getFullYear())
              }}
              className="dark:bg-slate-900"
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
