'use client';

import { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookOpen, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { Course, CourseWithRelations } from '@/types/courses';
import { CourseForm } from './CourseForm';

interface CourseTableRowProps {
  course: CourseWithRelations;
}

export function CourseTableRow({ course }: CourseTableRowProps) {
  const [showEditForm, setShowEditForm] = useState(false);

 const getAreaColor = (area: string | null | undefined) => {
  if (!area) return "bg-gray-100 text-gray-800";
  const colors = {
    'Científica': "bg-blue-100 text-blue-800",
    'Humanística': "bg-green-100 text-green-800",
    'Artística': "bg-yellow-100 text-yellow-800",
    'Deportiva': "bg-red-100 text-red-800",
    'Tecnológica': "bg-cyan-100 text-cyan-800",
  };
  return colors[area as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

const getCourseColor = (color: string | null | undefined) => {
  return color || '#6B7280';
};


  return (
    <>
      <TableRow className="hover:bg-gray-50/50">
        <TableCell>
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg flex items-center justify-center shrink-0"
              style={{ 
                backgroundColor: `${getCourseColor(course.color)}20`, 
                color: getCourseColor(course.color)
              }}
            >
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {course.name}
              </div>
              <div className="text-sm text-gray-500">
                {course.code}
              </div>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <Badge className={getAreaColor(course.area)} variant="secondary">
            {course.area || 'Sin área'}
          </Badge>
        </TableCell>

        <TableCell>
          {course.courseGrades && course.courseGrades.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {course.courseGrades.slice(0, 2).map((cg, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {cg.grade?.name || `Grado ${cg.gradeId}`}
                </Badge>
              ))}
              {course.courseGrades.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{course.courseGrades.length - 2} más
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500">Sin grados asignados</span>
          )}
        </TableCell>

        <TableCell>
          <Badge variant={course.isActive ? "default" : "secondary"}>
            {course.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </TableCell>

        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => console.log('Ver detalles', course.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => console.log('Eliminar', course.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Modal de edición */}
      <CourseForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        isEditMode={true}
        courseId={course.id}
      />
    </>
  );
}