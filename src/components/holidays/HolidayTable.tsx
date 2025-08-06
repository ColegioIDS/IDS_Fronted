"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter
} from '@/components/ui/card'
import { Plus, Search, Edit, Trash2, Calendar, RefreshCw, MoreHorizontal, Eye, MapPin } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useHolidayContext } from "@/context/HolidayContext"
import { Skeleton } from "@/components/ui/skeleton"
import { useCyclesContext } from "@/context/CyclesContext"
import { useBimesterContext } from "@/context/BimesterContext"

interface HolidaysTableProps {
  compact?: boolean
  selectedCycleId?: number
  selectedBimesterId?: number
}

export function HolidaysTable({ compact = false, selectedCycleId, selectedBimesterId }: HolidaysTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { holidays, isLoading, deleteHoliday } = useHolidayContext()
  const { cycles } = useCyclesContext()
  const { bimesters } = useBimesterContext()

  const filteredHolidays = holidays.filter((holiday) => {
    const matchesSearch = holiday.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const displayHolidays = compact ? filteredHolidays.slice(0, 4) : filteredHolidays


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    })
  }

  const getDayOfWeek = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", { weekday: "short" })
  }

  const getTypeColor = (type: string) => {
    const colors = {
      nacional: "bg-blue-100 text-blue-800",
      cultural: "bg-purple-100 text-purple-800",
      religioso: "bg-green-100 text-green-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getBimesterName = (bimesterId: number) => {
    const bimester = bimesters.find(b => b.id === bimesterId)
    return bimester ? bimester.name : "Sin bimestre"
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este día festivo?")) {
      await deleteHoliday(id)
    }
  }

  if (isLoading) {
    if (compact) {
      return (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {displayHolidays.map((holiday) => (
          <Card key={holiday.id} className="bg-white/50 border-0 shadow-sm hover:shadow-md transition-all duration-200 w-full max-w-5xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{getShortDate(holiday.date)}</p>
                    <p className="text-xs text-gray-500">{getDayOfWeek(holiday.date)}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-900">{holiday.description}</h4>
                    <div className="flex items-center gap-2">

                      {holiday.isRecovered && (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Recuperado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row  justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar días festivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 border-gray-200/50 focus:bg-white"
            />
          </div>
        </div>
        
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-200/50">
              <TableHead className="font-semibold text-gray-700 py-4">Fecha</TableHead>
              <TableHead className="font-semibold text-gray-700">Evento</TableHead>
              <TableHead className="font-semibold text-gray-700">Bimestre</TableHead>
              <TableHead className="font-semibold text-gray-700">Estado</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHolidays.map((holiday) => (
              <TableRow key={holiday.id} className="hover:bg-white/50 border-b border-gray-100/50 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{formatDate(holiday.date)}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {getDayOfWeek(holiday.date)}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{holiday.description}</span>
                  </div>
                </TableCell>

                <TableCell className="text-gray-600 font-medium">
                  {getBimesterName(holiday.bimesterId)}
                </TableCell>
                <TableCell>
                  {holiday.isRecovered ? (
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 shadow-sm">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Recuperado
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">No Laborable</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(holiday.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}