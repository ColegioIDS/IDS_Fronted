"use client"

import { Bimester } from "@/types/SchoolBimesters"
import { formatDate } from "@/utils/date"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, CheckCircle, Edit, Eye, MoreHorizontal, Plus, Search, Trash2, Users, XCircle, Clock } from "lucide-react"
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
      1: "bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700",
      2: "bg-gradient-to-r from-green-500 to-green-600 text-white dark:from-green-600 dark:to-green-700",
      3: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white dark:from-yellow-600 dark:to-yellow-700",
      4: "bg-gradient-to-r from-purple-500 to-purple-600 text-white dark:from-purple-600 dark:to-purple-700",
    }
    return colors[number as keyof typeof colors] || "bg-gradient-to-r from-gray-500 to-gray-600 text-white dark:from-gray-600 dark:to-gray-700"
  }

  const getBimesterBg = (number: number) => {
    const colors = {
      1: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30",
      2: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30",
      3: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/30",
      4: "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/30",
    }
    return colors[number as keyof typeof colors] || "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800/30"
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
        {filteredBimesters.map((bimester) => {
          // ✅ Calcular progreso real basado en fechas
          const now = new Date();
          const startDate = new Date(bimester.startDate);
          const endDate = new Date(bimester.endDate);
          
          // Calcular progreso temporal
          const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const elapsedDays = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
          const progressPercentage = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
          
          // Calcular semanas transcurridas
          const weeksPassed = Math.max(0, Math.floor(elapsedDays / 7));
          const totalWeeks = bimester.weeksCount || 8;
          
          // Determinar estado del bimestre
          const isUpcoming = now < startDate;
          const isCompleted = now > endDate;
          const isCurrent = !isUpcoming && !isCompleted;
          
          // Días restantes
          const daysRemaining = isCompleted ? 0 : Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          
          // Estudiantes simulados (puedes reemplazar con datos reales)
          const studentCount = Math.floor(Math.random() * 30) + 15; // 15-45 estudiantes

          return (
            <div
              key={bimester.id}
              className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
                ${getBimesterBg(bimester.number!)} 
                ${bimester.isActive 
                  ? "ring-2 ring-primary ring-opacity-50 shadow-lg" 
                  : ""
                }
                ${isCompleted 
                  ? "opacity-75 hover:opacity-90" 
                  : ""
                }
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <Badge className={getBimesterColor(bimester.number!)} >
                  {bimester.number}
                </Badge>
                
                <div className="flex gap-2">
                  {bimester.isActive && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  )}
                  
                  {/* Estado del bimestre */}
                  {isUpcoming && (
                    <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300">
                      Próximo
                    </Badge>
                  )}
                  
                  {isCompleted && (
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                      Completado
                    </Badge>
                  )}
                  
                  {isCurrent && !bimester.isActive && (
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300">
                      En curso
                    </Badge>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                {bimester.name}
              </h3>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                {/* Fechas */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="truncate">
                    {formatDate(bimester.startDate)} - {formatDate(bimester.endDate)}
                  </span>
                </div>

                {/* Estudiantes */}
                {/* <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>{studentCount} estudiantes</span>
                </div> */}

                {/* Información temporal */}
                {isCurrent && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                      {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Último día'}
                    </span>
                  </div>
                )}

                {isUpcoming && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                      Inicia en {Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} días
                    </span>
                  </div>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                      Completado hace {Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))} días
                    </span>
                  </div>
                )}

                {/* Progreso de semanas */}
                {bimester.weeksCount && (
                  <div className="space-y-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Progreso</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {isUpcoming ? '0%' : `${Math.round(progressPercentage)}%`}
                      </span>
                    </div>
                    
                    <Progress
                      value={isUpcoming ? 0 : progressPercentage}
                      className={`h-2 ${
                        isCompleted 
                          ? '[&>[role=progressbar]]:bg-green-500' 
                          : isCurrent 
                            ? '[&>[role=progressbar]]:bg-blue-500'
                            : '[&>[role=progressbar]]:bg-gray-400'
                      }`}
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {isUpcoming ? 0 : Math.min(weeksPassed, totalWeeks)} de {totalWeeks} semanas
                      </span>
                      {isCurrent && (
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          Semana {Math.min(weeksPassed + 1, totalWeeks)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Acciones rápidas */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(bimester)}
                    className="h-7 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
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