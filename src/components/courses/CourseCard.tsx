'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Edit, Eye, MoreHorizontal, Trash2, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Course, CourseWithRelations } from '@/types/courses';
import { CourseForm } from './CourseForm';

interface CourseCardProps {
  course: CourseWithRelations;
}

export function CourseCard({ course }: CourseCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  const getAreaColor = (area: string | null | undefined): string => {
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

  const getCourseColor = (color: string | null | undefined): string => {
    return color || '#6B7280';
  };


  return (
    <>
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div
              className="p-2 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: `${getCourseColor(course.color)}20`,
                color: getCourseColor(course.color)
              }}
            >
              <BookOpen className="h-5 w-5" />
            </div>
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
          </div>
          <div>
            <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{course.code}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={getAreaColor(course.area)} variant="secondary">
              {course.area || 'Sin área'}
            </Badge>
            <div className="flex items-center gap-2">
              <Badge variant={course.isActive ? "default" : "secondary"}>
                {course.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>

          {/* Información de grados si está disponible */}
          {course.courseGrades && course.courseGrades.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Grados:</h4>
              <div className="flex flex-wrap gap-1">
                {course.courseGrades.slice(0, 3).map((cg, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {cg.grade?.name || `Grado ${cg.gradeId}`}
                  </Badge>
                ))}
                {course.courseGrades.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.courseGrades.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Footer con indicador de color */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: getCourseColor(course.color) }}
                title={`Color: ${course.color}`}
              />
              <span className="text-xs text-gray-500">
                {course.color || 'Sin color'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log('Ver detalles completos', course.id)}
            >
              Ver más
            </Button>
          </div>
        </CardContent>
      </Card>

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