"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Clock, 
  User, 
  BookOpen, 
  MapPin, 
  Calendar, 
  Users,
  Search,
  Filter
} from 'lucide-react';
import { cn } from "@/lib/utils";
import type { Schedule, DayOfWeek } from "@/types/schedules";
import type { User as Teacher } from "@/types/user";
import { useScheduleContext } from "@/context/ScheduleContext";
import { useSectionContext } from "@/context/SectionContext";
import { useCourseContext } from "@/context/CourseContext";
import { useTeacherContext } from "@/context/TeacherContext";

interface ScheduleListViewProps {
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (schedule: Schedule) => void;
  onView?: (schedule: Schedule) => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export const getScheduleColumns = (
  sections: any[] = [],
  courses: any[] = [],
  teachers: Teacher[] = [],
  onEdit?: (schedule: Schedule) => void,
  onDelete?: (schedule: Schedule) => void,
  onView?: (schedule: Schedule) => void
): ColumnDef<Schedule>[] => [
  {
    accessorKey: "section.name",
    header: "Sección",
    cell: ({ row }) => {
      const section = sections.find(s => s.id === row.original.sectionId);
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{section?.name || 'Sin sección'}</p>
            {section?.grade && (
              <p className="text-xs text-gray-500">{section.grade.name}</p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "course.name",
    header: "Curso",
    cell: ({ row }) => {
      const course = courses.find(c => c.id === row.original.courseId);
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 w-fit">
          <BookOpen className="h-3 w-3" />
          {course?.name || 'Sin curso'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "teacher.name",
    header: "Docente",
    cell: ({ row }) => {
      const teacher = teachers.find(t => t.id === row.original.teacherId);
      
      if (!teacher) {
        return (
          <div className="flex items-center gap-2 text-gray-400">
            <User className="h-4 w-4" />
            <span>Sin asignar</span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-purple-100 rounded-full">
            <User className="h-3 w-3 text-purple-600" />
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {teacher.givenNames} {teacher.lastNames}
            </span>
            {teacher.teacherDetails?.academicDegree && (
              <div className="text-xs text-gray-500">
                {teacher.teacherDetails.academicDegree}
              </div>
            )}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const teacherA = teachers.find(t => t.id === rowA.original.teacherId);
      const teacherB = teachers.find(t => t.id === rowB.original.teacherId);
      
      const nameA = teacherA ? `${teacherA.givenNames} ${teacherA.lastNames}` : "Sin asignar";
      const nameB = teacherB ? `${teacherB.givenNames} ${teacherB.lastNames}` : "Sin asignar";
      
      return nameA.localeCompare(nameB);
    },
  },
  {
    accessorKey: "dayOfWeek",
    header: "Día",
    cell: ({ row }) => {
      const day = DAYS_OF_WEEK.find(d => d.value === row.original.dayOfWeek);
      return (
        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
          <Calendar className="h-3 w-3" />
          {day?.label || 'Sin día'}
        </Badge>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.dayOfWeek - rowB.original.dayOfWeek;
    },
  },
  {
    accessorKey: "startTime",
    header: "Horario",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-orange-500" />
        <span className="font-medium">
          {row.original.startTime} - {row.original.endTime}
        </span>
      </div>
    ),
    sortingFn: (rowA, rowB) => {
      const timeA = rowA.original.startTime.replace(':', '');
      const timeB = rowB.original.startTime.replace(':', '');
      return parseInt(timeA) - parseInt(timeB);
    },
  },
  {
    accessorKey: "classroom",
    header: "Aula",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.classroom ? (
          <>
            <MapPin className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium">{row.original.classroom}</span>
          </>
        ) : (
          <span className="text-gray-400 text-sm">Sin asignar</span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const schedule = row.original;
      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm">
              {onView && (
                <DropdownMenuItem onClick={() => onView(schedule)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(schedule)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(schedule)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function ScheduleListView({ onEdit, onDelete, onView }: ScheduleListViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");

  const { schedules, isLoadingSchedules: schedulesLoading, schedulesError: schedulesError } = useScheduleContext();

  const { sections, isLoadingSections: sectionsLoading } = useSectionContext();
  const { courses, isLoadingCourses: coursesLoading } = useCourseContext();

  const { teachers, isLoading: teachersLoading } = useTeacherContext();

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!schedules) return [];

    return schedules.filter(schedule => {
      // Filtro por búsqueda (curso, profesor, aula)
      if (searchTerm) {
        const course = courses?.find(c => c.id === schedule.courseId);
        const teacher = teachers?.find(t => t.id === schedule.teacherId);
        const section = sections?.find(s => s.id === schedule.sectionId);
        
        const searchLower = searchTerm.toLowerCase();
        const matches = 
          course?.name.toLowerCase().includes(searchLower) ||
          `${teacher?.givenNames} ${teacher?.lastNames}`.toLowerCase().includes(searchLower) ||
          schedule.classroom?.toLowerCase().includes(searchLower) ||
          section?.name.toLowerCase().includes(searchLower);
          
        if (!matches) return false;
      }

      // Filtro por sección
      if (selectedSection !== "all" && schedule.sectionId !== parseInt(selectedSection)) {
        return false;
      }

      // Filtro por profesor
      if (selectedTeacher !== "all" && schedule.teacherId !== parseInt(selectedTeacher)) {
        return false;
      }

      // Filtro por día
      if (selectedDay !== "all" && schedule.dayOfWeek !== parseInt(selectedDay)) {
        return false;
      }

      return true;
    });
  }, [schedules, searchTerm, selectedSection, selectedTeacher, selectedDay, courses, teachers, sections]);

  const table = useReactTable({
    data: filteredData,
    columns: getScheduleColumns(sections, courses, teachers, onEdit, onDelete, onView),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const isLoading = schedulesLoading || sectionsLoading || coursesLoading || teachersLoading;
  const hasErrors = schedulesError;

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasErrors) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
            Error al cargar los horarios
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lista de Horarios
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda general */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por curso, profesor, aula..."
                className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro por sección */}
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <SelectValue placeholder="Todas las secciones" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm">
                <SelectItem value="all">Todas las secciones</SelectItem>
                {sections?.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {section.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por profesor */}
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <SelectValue placeholder="Todos los profesores" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm">
                <SelectItem value="all">Todos los profesores</SelectItem>
                {teachers?.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {teacher.givenNames} {teacher.lastNames}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por día */}
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <SelectValue placeholder="Todos los días" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm">
                <SelectItem value="all">Todos los días</SelectItem>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {day.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-4 flex flex-wrap gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Total: {filteredData.length} horarios
            </Badge>
            {selectedSection !== "all" && (
              <Badge variant="secondary">
                Sección: {sections?.find(s => s.id === parseInt(selectedSection))?.name}
              </Badge>
            )}
            {selectedTeacher !== "all" && (
              <Badge variant="secondary">
                Profesor: {teachers?.find(t => t.id === parseInt(selectedTeacher))?.givenNames} {teachers?.find(t => t.id === parseInt(selectedTeacher))?.lastNames}
              </Badge>
            )}
            {selectedDay !== "all" && (
              <Badge variant="secondary">
                Día: {DAYS_OF_WEEK.find(d => d.value === parseInt(selectedDay))?.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        {/* Controles de paginación superiores */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-700">Filas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-white/80 backdrop-blur-sm border-gray-200/50">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white/95 backdrop-blur-sm">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              className="hidden md:flex bg-white/80 backdrop-blur-sm border-gray-200/50"
            >
              Primera
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-white/80 backdrop-blur-sm border-gray-200/50"
            >
              <FiChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-gray-700">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-white/80 backdrop-blur-sm border-gray-200/50"
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              className="hidden md:flex bg-white/80 backdrop-blur-sm border-gray-200/50"
            >
              Última
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id} 
                className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-200/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="font-semibold text-gray-700 py-4 cursor-pointer hover:bg-gray-100/50"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() && (
                        <span className="text-xs">
                          {header.column.getIsSorted() === 'desc' ? ' ↓' : ' ↑'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-white/50 border-b border-gray-100/50 transition-colors"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={getScheduleColumns().length} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
                    <Calendar className="h-8 w-8 text-gray-300" />
                    <p className="text-sm">No se encontraron horarios</p>
                    <p className="text-xs">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Controles de paginación inferiores */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200/50">
          <div className="text-sm text-gray-600">
            Mostrando{" "}
            {table.getFilteredRowModel().rows.length === 0
              ? 0
              : pagination.pageIndex * pagination.pageSize + 1}{" "}
            -{" "}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            de {table.getFilteredRowModel().rows.length} horarios
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              className="hidden md:flex bg-white/80 backdrop-blur-sm border-gray-200/50"
            >
              <FiChevronsLeft className="h-4 w-4 mr-1" />
              Primera
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-white/80 backdrop-blur-sm border-gray-200/50"
            >
              <FiChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-white/80 backdrop-blur-sm border-gray-200/50"
            >
              Siguiente
              <FiChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              className="hidden md:flex bg-white/80 backdrop-blur-sm border-gray-200/50"
            >
              Última
              <FiChevronsRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}