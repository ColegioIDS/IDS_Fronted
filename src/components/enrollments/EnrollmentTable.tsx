'use client';

import { useState, useMemo } from 'react';
import { useEnrollmentContext, useEnrollmentStatus } from '@/context/EnrollmentContext';
import {
  MoreHorizontal,
  Eye,
  Edit,
  GraduationCap,
  ArrowRightLeft,
  RefreshCw,
  Trash2,
  User,
  Calendar,
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
import { toast } from 'react-toastify';

// Utility functions
const getStatusColor = (status: EnrollmentStatus) => {
  switch (status) {
    case EnrollmentStatus.ACTIVE:
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case EnrollmentStatus.GRADUATED:
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case EnrollmentStatus.TRANSFERRED:
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const getStatusText = (status: EnrollmentStatus) => {
  switch (status) {
    case EnrollmentStatus.ACTIVE: return "Activo";
    case EnrollmentStatus.GRADUATED: return "Graduado";
    case EnrollmentStatus.TRANSFERRED: return "Transferido";
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

interface EnrollmentTableProps {
  selectedItems?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

export default function EnrollmentTable({
  selectedItems = [],
  onSelectionChange
}: EnrollmentTableProps) {
  const {
    state: {
      enrollments,
      loading: isLoadingEnrollments,
      submitting,
      error
    },
    removeEnrollment,
    refreshEnrollments,
    setFormMode
  } = useEnrollmentContext();

  const {
    handleGraduate,
    handleTransfer,
    handleReactivate
  } = useEnrollmentStatus();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Use real data from context
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

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(enrollment => selectedItems.includes(enrollment.id));
  const isSomeSelected = paginatedData.some(enrollment => selectedItems.includes(enrollment.id));

  // Action handlers with proper error handling and refresh
  const handleAction = async (action: string, enrollmentId: number, studentName?: string) => {
    try {
      let result;
      switch (action) {
        case 'graduate':
          result = await handleGraduate(enrollmentId, studentName);
          break;
        case 'transfer':
          result = await handleTransfer(enrollmentId, studentName);
          break;
        case 'reactivate':
          result = await handleReactivate(enrollmentId, studentName);
          break;
        case 'delete':
          const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar la matrícula de ${studentName || 'este estudiante'}?`
          );
          if (!confirmed) {
            return;
          }
          result = await removeEnrollment(enrollmentId);
          break;
        case 'edit':
          setFormMode('edit', enrollmentId);
          return;
        case 'view':
          // Implementar navegación a vista de perfil
          toast.info('Funcionalidad de vista de perfil en desarrollo');
          return;
      }

      // Remove from selection if deleted and action was successful
      if (result?.success && action === 'delete' && onSelectionChange) {
        onSelectionChange(selectedItems.filter(id => id !== enrollmentId));
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Error al ${action === 'graduate' ? 'graduar' :
        action === 'transfer' ? 'transferir' :
          action === 'reactivate' ? 'reactivar' :
            action === 'delete' ? 'eliminar' : 'procesar'} la matrícula`);
    }
  };

  // Get student profile picture or create fallback
  const getStudentAvatar = (student: any) => {
    // Check if student has pictures array
    const profilePicture = student.pictures?.find((pic: any) => pic.kind === 'profile');

    if (profilePicture?.url) {
      return profilePicture.url;
    }

    return null; // Will use fallback initials
  };

  // Generate fallback initials
  const getStudentInitials = (student: any) => {
    const firstInitial = student.givenNames?.charAt(0) || '';
    const lastInitial = student.lastNames?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Loading state
  if (isLoadingEnrollments) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Cargando matrículas...</span>
        </div>
      </div>
    );
  }

  console.log('Matrículas cargadas:', enrollments);

  // Error state
  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-center space-y-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl w-fit mx-auto">
            <User className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-red-900 dark:text-red-100">Error al cargar</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshEnrollments()}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no enrollments
  if (displayEnrollments.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-3">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl w-fit mx-auto">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">No hay matrículas</p>
            <p className="text-sm text-gray-500">No se encontraron matrículas registradas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow className="border-gray-200 dark:border-gray-700">
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
              <TableHead className="font-medium text-gray-900 dark:text-gray-100">
                Estudiante
              </TableHead>
              <TableHead className="font-medium text-gray-900 dark:text-gray-100">
                Código SIRE
              </TableHead>
              <TableHead className="font-medium text-gray-900 dark:text-gray-100">
                Grado/Sección
              </TableHead>
              <TableHead className="font-medium text-gray-900 dark:text-gray-100">
                Ciclo
              </TableHead>
              <TableHead className="font-medium text-gray-900 dark:text-gray-100">
                Estado
              </TableHead>
              <TableHead className="font-medium text-gray-900 dark:text-gray-100">
                Edad
              </TableHead>
              <TableHead className="font-medium text-gray-900 dark:text-gray-100 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((enrollment) => {
              const studentName = `${enrollment.student.givenNames} ${enrollment.student.lastNames}`;

              return (
                <TableRow
                  key={enrollment.id}
                  className={`border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${selectedItems.includes(enrollment.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                    }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(enrollment.id)}
                      onCheckedChange={(checked) => handleSelectItem(enrollment.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={getStudentAvatar(enrollment.student)}
                          alt={studentName}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {getStudentInitials(enrollment.student)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {studentName}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {enrollment.student.birthPlace || 'Guatemala'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {enrollment.student.codeSIRE || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                        {enrollment.section?.grade?.name || `Grado ${enrollment.gradeId}`}
                      </Badge>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Sección {enrollment.section?.name || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {enrollment.cycle?.name || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(enrollment.status)}>
                      {getStatusText(enrollment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {calculateAge(enrollment.student.birthDate)} años
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={submitting}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('view', enrollment.id, studentName)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver perfil completo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('edit', enrollment.id, studentName)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar matrícula
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {enrollment.status === EnrollmentStatus.ACTIVE && (
                          <>
                            <DropdownMenuItem onClick={() => handleAction('graduate', enrollment.id, studentName)}>
                              <GraduationCap className="h-4 w-4 mr-2" />
                              Graduar estudiante
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('transfer', enrollment.id, studentName)}>
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                              Transferir estudiante
                            </DropdownMenuItem>
                          </>
                        )}
                        {enrollment.status !== EnrollmentStatus.ACTIVE && (
                          <DropdownMenuItem onClick={() => handleAction('reactivate', enrollment.id, studentName)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reactivar matrícula
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleAction('delete', enrollment.id, studentName)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar matrícula
                        </DropdownMenuItem>
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
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Mostrando</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {((currentPage - 1) * pageSize) + 1}
          </span>
          <span>a</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.min(currentPage * pageSize, displayEnrollments.length)}
          </span>
          <span>de</span>
          <span className="font-medium text-gray-900 dark:text-white">
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