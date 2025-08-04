"use client"

import { Bimester } from "@/types/SchoolBimesters"
import { formatDate } from "@/utils/date"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, CheckCircle, Edit, Eye, MoreHorizontal, Plus, Search, Trash2, Users, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
interface BimestersTableProps {
  data: Bimester[];
  onEdit: (bimester: Bimester) => void;
  onDelete?: (bimester: Bimester) => void;
  onCreate?: () => void;
}

export function BimestersTable({ data, onEdit, onDelete, onCreate }: BimestersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBimesters = data.filter((bimester) => {
    return bimester.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getBimesterColor = (number: number) => {
    const colors = {
      1: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      2: "bg-gradient-to-r from-green-500 to-green-600 text-white",
      3: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
      4: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
    }
    return colors[number as keyof typeof colors] || "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
  }

  const getBimesterBg = (number: number) => {
    const colors = {
      1: "bg-blue-50 border-blue-200",
      2: "bg-green-50 border-green-200",
      3: "bg-yellow-50 border-yellow-200",
      4: "bg-purple-50 border-purple-200",
    }
    return colors[number as keyof typeof colors] || "bg-gray-50 border-gray-200"
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar bimestres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/50 border-gray-200/50 focus:bg-white"
          />
        </div>

      </div>

      {/* Bimesters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {filteredBimesters.map((bimester) => (
          <div
            key={bimester.id}
            className={`p-6 rounded-xl border-2 ${getBimesterBg(bimester.number!)} ${bimester.isActive ? "ring-2 ring-blue-500 ring-opacity-50" : ""
              } hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <Badge className={getBimesterColor(bimester.number!)} >
                {bimester.number}
              </Badge>
              {bimester.isActive && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">{bimester.name}</h3>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(bimester.startDate)} - {formatDate(bimester.endDate)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{"0"} estudiantes</span>
              </div>

              {bimester.weeksCount && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progreso</span>
                    <span>{Math.round((bimester.id || 0 / bimester.weeksCount) * 100)}%</span>
                  </div>
                  <Progress
                    value={Math.round((bimester.id || 0 / bimester.weeksCount) * 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">
                    {bimester.cycleId || 0} de {bimester.weeksCount} semanas
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <Table>
         <TableHeader className="font-semibold text-gray-700">
            <TableRow className="bg-gray-50/50 dark:bg-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 border-b border-gray-200/50 dark:border-gray-700/40">
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Bimestre</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Período</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Progreso</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Estado</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-center">Acciones</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBimesters.map((bimester) => (
              <TableRow key={bimester.id} className="hover:bg-white/50 border-b border-gray-100/50 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getBimesterColor(bimester.number!)} >
                      {bimester.number}
                    </Badge>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{bimester.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{"0"} estudiantes</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{formatDate(bimester.startDate)}</p>
                      <p className="text-sm text-gray-500">hasta {formatDate(bimester.endDate)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {bimester.weeksCount && (
                    <div className="space-y-2 min-w-32">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Semanas</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {0}/{bimester.weeksCount}
                        </span>
                      </div>
                      <Progress
                        value={Math.round((0 / bimester.weeksCount) * 100)}
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {Math.round((0 / bimester.weeksCount) * 100)}% completado
                      </p>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {bimester.isActive ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-200/10 dark:text-green-400 hover:bg-green-100">

                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactivo
                    </Badge>
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
                        <DropdownMenuItem onClick={() => onEdit(bimester)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {onDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(bimester)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
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