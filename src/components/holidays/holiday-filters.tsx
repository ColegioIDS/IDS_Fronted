"use client"

import * as React from "react"
import { PlusIcon, FilterIcon, CalendarRangeIcon, BookOpenIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useCyclesContext } from "@/context/CyclesContext"
import { useBimesterContext } from "@/context/BimesterContext"


export interface HolidayFiltersProps {
  selectedCycleId: number | null;
  setSelectedCycleId: (id: number) => void;  // Changed to match context
  selectedBimesterId: number | null;
  setSelectedBimesterId: (id: number) => void;  // Changed to match context
}

export function HolidayFilters({
  selectedCycleId,
  setSelectedCycleId,
  selectedBimesterId,
  setSelectedBimesterId
}: HolidayFiltersProps) {

  const [localLoading, setLocalLoading] = React.useState(false)

  const { cycles, isLoadingCycles } = useCyclesContext()
  const { bimesters, fetchBimesters, isLoading, setCycleId } = useBimesterContext()
  const [filteredBimesters, setFilteredBimesters] = React.useState<typeof bimesters>([])


  React.useEffect(() => {
    if (selectedCycleId && bimesters) {
      const filtered = bimesters.filter(b => b.cycleId === selectedCycleId);
      setFilteredBimesters(filtered);

      // Get current value and calculate new value directly
      const defaultBimesterId = filtered[0]?.id || 0;
      const newBimesterId = selectedBimesterId && !filtered.some(b => b.id === selectedBimesterId)
        ? defaultBimesterId
        : selectedBimesterId || defaultBimesterId;

      setSelectedBimesterId(newBimesterId);
    } else {
      setSelectedBimesterId(0);
    }
  }, [selectedCycleId, bimesters]);


  const handleCycleChange = async (value: string) => {
    const id = Number(value)
    setLocalLoading(true)
    setSelectedCycleId(id)
    setCycleId(id)

    // Pequeño delay para evitar parpadeo muy rápido
    await new Promise(resolve => setTimeout(resolve, 300))
    setLocalLoading(false)
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-5xl mb-8 p-6 ">
      

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {/* Selector de Ciclo */}
        <div>
          <Label htmlFor="cycle-select" className="text-sm font-medium text-gray-700 mb-1 block">
            Ciclo Escolar
          </Label>
          {isLoadingCycles ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedCycleId?.toString() || ""}
              onValueChange={handleCycleChange}
            >
              <SelectTrigger id="cycle-select" className="w-full">
                <CalendarRangeIcon className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Selecciona un Ciclo Escolar" />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id.toString()}>
                    {cycle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Selector de Bimestre */}
        <div>
          <Label htmlFor="bimester-select" className="text-sm font-medium text-gray-700 mb-1 block">
            Bimestre
          </Label>
          {localLoading || isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedBimesterId?.toString() || ""}
              onValueChange={(value) => setSelectedBimesterId(Number(value))}
              disabled={!selectedCycleId || filteredBimesters.length === 0}
            >
              <SelectTrigger id="bimester-select" className="w-full">
                <BookOpenIcon className="mr-2 h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Selecciona un Bimestre" />
              </SelectTrigger>
              <SelectContent>
                {filteredBimesters
                  .filter(b => b.id !== undefined)
                  .map((bimester) => (
                    <SelectItem key={bimester.id} value={bimester.id!.toString()}>
                      {bimester.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

   
    </div>
  )
}