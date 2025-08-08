"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Search, Edit, Trash2, MoreHorizontal, Eye, Users, CalendarDays, GraduationCap } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data
const mockGrades = [
  {
    id: 1,
    name: "Pre-Kinder",
    level: 0,
    schoolCycleId: 1,
    schoolCycleName: "2024-2025",
    sectionsCount: 2,
    studentsCount: 45,
  },
  {
    id: 2,
    name: "Kinder",
    level: 1,
    schoolCycleId: 1,
    schoolCycleName: "2024-2025",
    sectionsCount: 3,
    studentsCount: 70,
  },
]

interface GradesTableProps {
  searchTerm?: string
  selectedCycle?: string
}

export function GradesTable({ searchTerm = "", selectedCycle = "all" }: GradesTableProps) {
  const filteredGrades = mockGrades
    .filter((grade) => grade.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((grade) => selectedCycle === "all" || grade.schoolCycleName === selectedCycle)
    .sort((a, b) => a.level - b.level) // Sort by level

  return (
    <div className="rounded-xl bg-white/50 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-200/50">
            <TableHead className="font-semibold text-gray-700 py-4">Grado</TableHead>
            <TableHead className="font-semibold text-gray-700">Nivel</TableHead>
            <TableHead className="font-semibold text-gray-700">Ciclo Escolar</TableHead>
            <TableHead className="font-semibold text-gray-700">Secciones</TableHead>
            <TableHead className="font-semibold text-gray-700">Estudiantes</TableHead>
            <TableHead className="font-semibold text-gray-700 text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGrades.map((grade) => (
            <TableRow key={grade.id} className="hover:bg-white/50 border-b border-gray-100/50 transition-colors">
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-900">{grade.name}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Nivel {grade.level}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600 font-medium">{grade.schoolCycleName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{grade.sectionsCount}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-gray-900">{grade.studentsCount.toLocaleString()}</span>
                </div>
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
                      <DropdownMenuItem className="text-red-600">
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
  )
}