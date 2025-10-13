'use client';

import { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookOpen, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { Course, CourseWithRelations } from '@/types/courses';
import { useCourseForm, useCourseList } from '@/context/CourseContext';
import { CourseForm } from './CourseForm';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

interface CourseTableRowProps {
  course: CourseWithRelations;
  className?: string;
}

export function CourseTableRow({ course, className }: CourseTableRowProps) {
  const [showEditForm, setShowEditForm] = useState(false);

      const { hasPermission } = useAuth();
  const canUpdate = hasPermission('course', 'update');
  const canDelete = hasPermission('course', 'delete');

  // Hooks del Context
  const { startEdit } = useCourseForm();
  const { handleDelete } = useCourseList();

  const getAreaColor = (area: string | null | undefined) => {
    if (!area) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    
    const colors = {
      'Científica': "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      'Humanística': "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      'Sociales': "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      'Tecnológica': "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
      'Artística': "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      'Idiomas': "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      'Educación Física': "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    
    return colors[area as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const getCourseColor = (color: string | null | undefined) => {
    return color || '#6B7280';
  };

  // Función para manejar la edición
  const handleEdit = async () => {
    try {
      console.log('Iniciando edición para curso:', course.id);
      await startEdit(course.id); // ✅ Cargar datos en el Context
      setShowEditForm(true);       // ✅ Luego abrir el modal
    } catch (error) {
      console.error('Error al cargar datos del curso:', error);
      toast.error('Error al cargar los datos del curso');
    }
  };

  // Función para manejar eliminación
  const handleDeleteCourse = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el curso "${course.name}"?`)) {
      try {
        const result = await handleDelete(course.id);
        if (result.success) {
          toast.success('Curso eliminado correctamente');
        }
      } catch (error) {
        console.error('Error al eliminar curso:', error);
        toast.error('Error al eliminar el curso');
      }
    }
  };

  // Función para cerrar el formulario
  const handleCloseForm = () => {
    setShowEditForm(false);
  };

  return (
    <>
      <TableRow className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700 ${className || ''}`}>
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
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {course.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
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
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {cg.grade?.name || `Grado ${cg.gradeId}`}
                </Badge>
              ))}
              {course.courseGrades.length > 2 && (
                <Badge 
                  variant="outline" 
                  className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  +{course.courseGrades.length - 2} más
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Sin grados asignados
            </span>
          )}
        </TableCell>

        <TableCell>
          <Badge 
            variant={course.isActive ? "default" : "secondary"}
            className={course.isActive 
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            }
          >
            {course.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </TableCell>

        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {(canUpdate || canDelete) && (
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 border-gray-200 dark:border-gray-700"
            >
                {canUpdate && (   
              <DropdownMenuItem 
                onClick={handleEdit}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
                )}
            {canDelete && (
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={handleDeleteCourse}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
                )}
            </DropdownMenuContent>
            )}
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Modal de edición - SIN props obsoletas */}
      <CourseForm
        open={showEditForm}
        onOpenChange={handleCloseForm}
        // ✅ NO necesita isEditMode ni courseId - el Context maneja todo
      />
    </>
  );
}