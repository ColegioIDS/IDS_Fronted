// components/erica-topics/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  BookOpen,
  User,
  ArrowUpDown
} from "lucide-react";
import { EricaTopic } from "@/types/erica-topics";

interface ColumnActionsProps {
  topic: EricaTopic;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number, isCompleted: boolean) => void;
}

function ColumnActions({ 
  topic, 
  onView, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onToggleComplete 
}: ColumnActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(topic.id)}>
          <Eye className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
          Ver detalles
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onEdit(topic.id)}>
          <Edit className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onDuplicate(topic.id)}>
          <Copy className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
          Duplicar
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onToggleComplete(topic.id, !topic.isCompleted)}
          className={topic.isCompleted ? "text-orange-600" : "text-green-600"}
        >
          {topic.isCompleted ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Marcar pendiente
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar completado
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onDelete(topic.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createColumns = (
  onView: (id: number) => void,
  onEdit: (id: number) => void,
  onDuplicate: (id: number) => void,
  onDelete: (id: number) => void,
  onToggleComplete: (id: number, isCompleted: boolean) => void
): ColumnDef<EricaTopic>[] => [
  // Checkbox para selección múltiple
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // Curso - CON VERIFICACIÓN DE TIPOS CORREGIDA
  {
    accessorKey: "course",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        <BookOpen className="mr-2 h-4 w-4" />
        Curso
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const course = row.original.course;
      if (!course) return <span className="text-muted-foreground">-</span>;
      
      // Verificación segura de la propiedad color
      const courseColor = 'color' in course ? course.color : null;
      
      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className="text-xs font-medium"
              style={{ 
                backgroundColor: courseColor ? `${courseColor}15` : undefined,
               
              }}
            >
              {course.code}
            </Badge>
          </div>
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">
            {course.name}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const courseA = rowA.original.course?.name || "";
      const courseB = rowB.original.course?.name || "";
      return courseA.localeCompare(courseB);
    }
  },

  // Sección y Grado
  {
    accessorKey: "section",
    header: "Sección",
    cell: ({ row }) => {
      const section = row.original.section;
      if (!section) return <span className="text-muted-foreground">-</span>;
      
      return (
        <div className="space-y-1">
          <Badge variant="secondary" className="text-xs">
            {section.grade?.name}
          </Badge>
          <div className="font-medium text-sm">
            Sección {section.name}
          </div>
        </div>
      );
    },
  },

  // Semana Académica
  {
    accessorKey: "academicWeek",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Semana
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const week = row.original.academicWeek;
      if (!week) return <span className="text-muted-foreground">-</span>;
      
      return (
        <div className="text-center space-y-1">
          <div className="font-medium text-lg text-blue-600 dark:text-blue-400">
            S{week.number}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(week.startDate).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short' 
            })}
            {' - '}
            {new Date(week.endDate).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short' 
            })}
          </div>
          {week.bimester && (
            <Badge variant="outline" className="text-xs">
              {week.bimester.name}
            </Badge>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const weekA = rowA.original.academicWeek?.number || 0;
      const weekB = rowB.original.academicWeek?.number || 0;
      return weekA - weekB;
    }
  },

  // Título del tema
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Tema
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const topic = row.original;
      return (
        <div className="max-w-[250px] space-y-1">
          <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
            {topic.title}
          </div>
          {topic.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {topic.description}
            </div>
          )}
          {topic._count?.evaluations !== undefined && (
            <Badge variant="outline" className="text-xs">
              {topic._count.evaluations} evaluaciones
            </Badge>
          )}
        </div>
      );
    },
  },

  // Profesor
  {
    accessorKey: "teacher",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        <User className="mr-2 h-4 w-4" />
        Profesor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const teacher = row.original.teacher;
      if (!teacher) return <span className="text-muted-foreground">-</span>;
      
      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {teacher.givenNames}
          </div>
          <div className="text-muted-foreground">
            {teacher.lastNames}
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const teacherA = `${rowA.original.teacher?.givenNames || ""} ${rowA.original.teacher?.lastNames || ""}`;
      const teacherB = `${rowB.original.teacher?.givenNames || ""} ${rowB.original.teacher?.lastNames || ""}`;
      return teacherA.localeCompare(teacherB);
    }
  },

  // Estado
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const topic = row.original;
      
      if (!topic.isActive) {
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Inactivo</span>
          </Badge>
        );
      }
      
      if (topic.isCompleted) {
        return (
          <Badge className="flex items-center space-x-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="h-3 w-3" />
            <span>Completado</span>
          </Badge>
        );
      }
      
      return (
        <Badge className="flex items-center space-x-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
          <Clock className="h-3 w-3" />
          <span>Pendiente</span>
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const topic = row.original;
      if (value === "completed") return topic.isCompleted;
      if (value === "pending") return topic.isActive && !topic.isCompleted;
      if (value === "inactive") return !topic.isActive;
      return true;
    }
  },

  // Fecha de creación
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Creado
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm space-y-1">
          <div className="font-medium">
            {date.toLocaleDateString('es-ES')}
          </div>
          <div className="text-xs text-muted-foreground">
            {date.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      );
    },
  },

  // Acciones
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <ColumnActions
        topic={row.original}
        onView={onView}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
      />
    ),
  },
];