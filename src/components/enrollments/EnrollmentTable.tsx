// src/components/enrollments/EnrollmentTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import {
  MoreHorizontal,
  Eye,
  Edit,
  GraduationCap,
  ArrowRightLeft,
  RefreshCw,
  Trash2,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EnrollmentStatus } from '@/types/enrollment.types';
import { toast } from 'sonner';

// ==================== UTILITY FUNCTIONS ====================

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case 'graduated':
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case 'transferred':
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return "Activo";
    case 'graduated': return "Graduado";
    case 'transferred': return "Transferido";
    default: return status;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// ==================== INTERFACES ====================

interface EnrollmentTableProps {
  enrollments: any[]; // ✅ Recibe enrollments como prop
  isLoading?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  selectedItems?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
  onEdit?: (enrollment: any) => void;
  onDelete?: (id: number) => void;
  onGraduate?: (id: number) => void;
  onTransfer?: (id: number) => void;
  onReactivate?: (id: number) => void;
}

// ==================== COMPONENT ====================

export function EnrollmentTable({
  enrollments,
  isLoading = false,
  canUpdate = false,
  canDelete = false,
  selectedItems = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onGraduate,
  onTransfer,
  onReactivate
}: EnrollmentTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // ✅ Usar enrollments directamente (viene de formData.enrollments)
  const displayEnrollments = enrollments || [];

  // Pagination logic
  const totalPages = Math.ceil(displayEnrollments.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return displayEnrollments.slice(startIndex, startIndex + pageSize);
  }, [displayEnrollments, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange(paginatedData.map(enrollment => enrollment.id));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedItems, id]);
      } else {
        onSelectionChange(selectedItems.filter(item => item !== id));
      }
    }
  };

  const isAllSelected = paginatedData.length > 0 && 
    paginatedData.every(enrollment => selectedItems.includes(enrollment.id));
  const isSomeSelected = paginatedData.some(enrollment => selectedItems.includes(enrollment.id));

  // Action handlers
  const handleAction = async (action: string, enrollmentId: number, studentName: string) => {
    try {
      switch (action) {
        case 'graduate':
          onGraduate?.(enrollmentId);
          break;
        case 'transfer':
          onTransfer?.(enrollmentId);
          break;
        case 'reactivate':
          onReactivate?.(enrollmentId);
          break;
        case 'delete':
          const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar la matrícula de ${studentName}?`
          );
          if (confirmed) {
            onDelete?.(enrollmentId);
          }
          break;
        case 'edit':
          const enrollment = displayEnrollments.find(e => e.id === enrollmentId);
          if (enrollment) {
            onEdit?.(enrollment);
          }
          break;
        case 'view':
          toast.info('Funcionalidad de vista de perfil en desarrollo');
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Error al procesar la acción`);
    }
  };

  // Get student initials for avatar fallback
  const getStudentInitials = (studentName: string) => {
    const names = studentName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return studentName.charAt(0).toUpperCase();
  };

  // ==================== LOADING STATE ====================

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Cargando matrículas...
          </span>
        </div>
      </div>
    );
  }

  // ==================== EMPTY STATE ====================

  if (displayEnrollments.length === 0) {
    return (
      <div className={`w-full h-64 flex items-center justify-center rounded-lg border ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="text-center space-y-3">
          <div className={`p-3 rounded-xl w-fit mx-auto ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p className={`text-lg font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No hay matrículas
            </p>
            <p className="text-sm text-gray-500">
              No se encontraron matrículas registradas
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== TABLE ====================

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className={`rounded-lg border overflow-hidden ${
        isDark 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-white'
      }`}>
        <Table>
          <TableHeader className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
            <TableRow className={isDark ? 'border-gray-700' : 'border-gray-200'}>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
                      if (input) {
                        input.indeterminate = isSomeSelected && !isAllSelected;
                      }
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className={`font-medium ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Estudiante
              </TableHead>
              <TableHead className={`font-medium ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Código SIRE
              </TableHead>
              <TableHead className={`font-medium ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Grado/Sección
              </TableHead>
              <TableHead className={`font-medium ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Estado
              </TableHead>
              <TableHead className={`font-medium ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Edad
              </TableHead>
              <TableHead className={`font-medium text-right ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((enrollment) => {
              return (
                <TableRow
                  key={enrollment.id}
                  className={`transition-colors ${
                    isDark 
                      ? 'border-gray-700 hover:bg-gray-900/50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${
                    selectedItems.includes(enrollment.id)
                      ? isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                      : ''
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(enrollment.id)}
                      onCheckedChange={(checked) => 
                        handleSelectItem(enrollment.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={enrollment.studentProfilePicture || ''}
                          alt={enrollment.studentName}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {getStudentInitials(enrollment.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {enrollment.studentName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-mono text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {enrollment.studentId || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge 
                        variant="outline" 
                        className={isDark
                          ? 'bg-blue-900/30 text-blue-400 border-blue-800'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                        }
                      >
                        {enrollment.gradeName}
                      </Badge>
                      <div className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Sección {enrollment.sectionName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(enrollment.status)}>
                      {getStatusText(enrollment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {/* Edad no disponible en enrollments simplificados */}
                      -
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className={`w-48 backdrop-blur ${
                          isDark ? 'bg-gray-900/90' : 'bg-white/90'
                        }`}
                      >
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleAction('view', enrollment.id, enrollment.studentName)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver perfil completo
                        </DropdownMenuItem>
                        {canUpdate && (
                          <DropdownMenuItem 
                            onClick={() => handleAction('edit', enrollment.id, enrollment.studentName)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar matrícula
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {enrollment.status === 'active' && canUpdate && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleAction('graduate', enrollment.id, enrollment.studentName)}
                            >
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Graduar estudiante
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAction('transfer', enrollment.id, enrollment.studentName)}
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Transferir estudiante
                            </DropdownMenuItem>
                          </>
                        )}
                        {enrollment.status !== 'active' && canUpdate && (
                          <DropdownMenuItem 
                            onClick={() => handleAction('reactivate', enrollment.id, enrollment.studentName)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reactivar matrícula
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleAction('delete', enrollment.id, enrollment.studentName)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar matrícula
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <span>Mostrando</span>
          <span className={`font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {((currentPage - 1) * pageSize) + 1}
          </span>
          <span>a</span>
          <span className={`font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {Math.min(currentPage * pageSize, displayEnrollments.length)}
          </span>
          <span>de</span>
          <span className={`font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {displayEnrollments.length}
          </span>
          <span>estudiantes</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className="h-8 w-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}