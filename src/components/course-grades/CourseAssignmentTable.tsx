// components/course-grade/CourseAssignmentTable.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BookOpen, 
  Search, 
  Save,
  Loader2,
  Check,
  X,
  Filter,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { useCourse } from '@/hooks/useCourse';
import { useGrade } from '@/hooks/useGrade';
import { useCourseGrade } from '@/hooks/useCourseGrade';
import { toast } from 'sonner';

interface CourseAssignment {
  courseId: number;
  isAssigned: boolean;
  isCore: boolean;
  wasOriginallyAssigned: boolean; // Para trackear estado original
}

interface CourseAssignmentTableProps {
  gradeId: number;
  onSave?: () => void;
}

/**
 * Enhanced table component for mass assignment of courses to a grade
 * Features: 
 * - Shows existing assignments with switches activated
 * - Visual indicators for assigned/unassigned courses
 * - Improved filtering and search
 * - Better visual presentation with colors and icons
 */
export function CourseAssignmentTable({
  gradeId,
  onSave,
}: CourseAssignmentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignments, setAssignments] = useState<Record<number, CourseAssignment>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { courses, isLoadingCourses } = useCourse();
  const { grades } = useGrade();
  const { fetchByGrade, createCourseGrade } = useCourseGrade();

  const currentGrade = grades.find(g => g.id === gradeId);

  // Load existing assignments when component mounts or gradeId changes
  useEffect(() => {
    const loadExistingAssignments = async () => {
      if (!gradeId || courses.length === 0) return;
      
      setIsLoading(true);
      try {
        const existingRelations = await fetchByGrade(gradeId);
        const newAssignments: Record<number, CourseAssignment> = {};
        
        courses.forEach(course => {
          const existing = existingRelations.find(r => r.courseId === course.id);
          const isAssigned = !!existing;
          
          newAssignments[course.id] = {
            courseId: course.id,
            isAssigned,
            isCore: existing?.isCore ?? true,
            wasOriginallyAssigned: isAssigned, // Track original state
          };
        });
        
        setAssignments(newAssignments);
      } catch (error) {
        console.error('Error loading assignments:', error);
        toast.error('Error al cargar las asignaciones existentes');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingAssignments();
  }, [gradeId, courses.length]);

  // Get unique areas for filter
  const uniqueAreas = useMemo(() => {
    const areas = courses
      .filter(course => course.area)
      .map(course => course.area!)
      .filter((area, index, arr) => arr.indexOf(area) === index);
    return areas.sort();
  }, [courses]);

  // Filter courses based on search term, area, and status
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (!course.isActive) return false;
      
      const assignment = assignments[course.id];
      
      // Search filter
      const matchesSearch = !searchTerm || 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.area?.toLowerCase().includes(searchTerm.toLowerCase());

      // Area filter
      const matchesArea = areaFilter === 'all' || 
        (areaFilter === 'no-area' && !course.area) ||
        course.area === areaFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'assigned' && assignment?.isAssigned) ||
        (statusFilter === 'unassigned' && !assignment?.isAssigned) ||
        (statusFilter === 'new' && assignment?.isAssigned && !assignment?.wasOriginallyAssigned) ||
        (statusFilter === 'existing' && assignment?.wasOriginallyAssigned);

      return matchesSearch && matchesArea && matchesStatus;
    });
  }, [courses, searchTerm, areaFilter, statusFilter, assignments]);

  const handleAssignmentChange = (courseId: number, isAssigned: boolean) => {
    setAssignments(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        courseId,
        isAssigned,
        isCore: prev[courseId]?.isCore ?? true,
        wasOriginallyAssigned: prev[courseId]?.wasOriginallyAssigned ?? false,
      },
    }));
  };

  const handleCoreChange = (courseId: number, isCore: boolean) => {
    setAssignments(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        isCore,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get courses that are newly assigned (not originally assigned)
      const newlyAssignedCourses = Object.values(assignments).filter(
        a => a.isAssigned && !a.wasOriginallyAssigned
      );
      
      if (newlyAssignedCourses.length === 0) {
        toast.info('No hay nuevas asignaciones para guardar');
        return;
      }

      // Create new course-grade relationships
      for (const assignment of newlyAssignedCourses) {
        await createCourseGrade({
          courseId: assignment.courseId,
          gradeId,
          isCore: assignment.isCore,
        });
      }
      
      toast.success(`${newlyAssignedCourses.length} cursos asignados correctamente`);
      onSave?.();
    } catch (error) {
      toast.error('Error al guardar las asignaciones');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setAreaFilter('all');
    setStatusFilter('all');
  };

  // Calculate statistics
  const totalAssigned = Object.values(assignments).filter(a => a.isAssigned).length;
  const originallyAssigned = Object.values(assignments).filter(a => a.wasOriginallyAssigned).length;
  const newlyAssigned = Object.values(assignments).filter(a => a.isAssigned && !a.wasOriginallyAssigned).length;
  const coreCount = Object.values(assignments).filter(a => a.isAssigned && a.isCore).length;
  const electiveCount = totalAssigned - coreCount;

  const getRowClassName = (assignment: CourseAssignment) => {
    if (assignment.isAssigned && !assignment.wasOriginallyAssigned) {
      return 'bg-green-50 dark:bg-green-950/20 border-l-4 border-l-green-500';
    }
    if (assignment.wasOriginallyAssigned && assignment.isAssigned) {
      return 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500';
    }
    return '';
  };

  if (isLoadingCourses || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando cursos y asignaciones...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Asignar Cursos a{' '}
              <span className="text-indigo-600">{currentGrade?.name}</span>
            </CardTitle>
            
            {/* Statistics */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Info className="h-3 w-3 mr-1" />
                {originallyAssigned} ya asignados
              </Badge>
              {newlyAssigned > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  {newlyAssigned} nuevos
                </Badge>
              )}
              <Badge variant="default" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                {coreCount} principales
              </Badge>
              <Badge variant="secondary">
                {electiveCount} electivas
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={resetFilters}
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || newlyAssigned === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Guardar {newlyAssigned > 0 ? `(${newlyAssigned})` : ''}
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        {originallyAssigned > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Cursos ya asignados</p>
                <p className="text-blue-600 dark:text-blue-300">
                  Los cursos marcados en azul ya están asignados a este grado. 
                  Los nuevos cursos que asignes aparecerán en verde.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Area Filter */}
          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las áreas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              <SelectItem value="no-area">Sin área</SelectItem>
              {uniqueAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="assigned">Asignados</SelectItem>
              <SelectItem value="unassigned">No asignados</SelectItem>
              <SelectItem value="existing">Ya existían</SelectItem>
              <SelectItem value="new">Nuevos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-300">Ya asignado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-300">Nuevo</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch disabled  />
            <span className="text-gray-600 dark:text-gray-300">Toggle para asignar/desasignar</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Asignar</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Área</TableHead>
                <TableHead className="w-32">Tipo</TableHead>
                <TableHead className="w-32">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => {
                const assignment = assignments[course.id] || {
                  courseId: course.id,
                  isAssigned: false,
                  isCore: true,
                  wasOriginallyAssigned: false,
                };

                return (
                  <TableRow 
                    key={course.id}
                    className={getRowClassName(assignment)}
                  >
                    <TableCell>
                      <Switch
                        checked={assignment.isAssigned}
                        onCheckedChange={(checked) =>
                          handleAssignmentChange(course.id, checked)
                        }
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold text-white shadow-sm"
                          style={{ 
                            backgroundColor: course.color || '#6366f1' 
                          }}
                        >
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {course.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {course.code}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={course.area 
                          ? "bg-gray-50 text-gray-700 border-gray-200" 
                          : "bg-orange-50 text-orange-700 border-orange-200"
                        }
                      >
                        {course.area || 'Sin área'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {assignment.isAssigned ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={assignment.isCore}
                            onCheckedChange={(checked) =>
                              handleCoreChange(course.id, checked)
                            }
                          
                          />
                          <span className="text-sm font-medium">
                            {assignment.isCore ? 'Principal' : 'Electiva'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {assignment.wasOriginallyAssigned && assignment.isAssigned ? (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Info className="h-4 w-4" />
                          <span className="text-sm font-medium">Existente</span>
                        </div>
                      ) : assignment.isAssigned && !assignment.wasOriginallyAssigned ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Nuevo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <X className="h-4 w-4" />
                          <span className="text-sm">No asignado</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Filter className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              No se encontraron cursos
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta ajustar los filtros para ver más resultados.
            </p>
            <Button variant="outline" onClick={resetFilters} className="mt-4">
              Limpiar filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}