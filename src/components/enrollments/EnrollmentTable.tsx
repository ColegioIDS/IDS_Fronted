'use client';

import { useState, useMemo } from 'react';
import { useEnrollmentContext } from '@/context/EnrollmentContext';
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
    enrollments,
    isLoadingEnrollments,
    graduateEnrollment,
    transferEnrollment,
    reactivateEnrollment,
    deleteEnrollment,
    fetchEnrollments
  } = useEnrollmentContext();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Use real data from context
  const displayEnrollments = enrollments;

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
  const handleAction = async (action: string, enrollmentId: number) => {
    try {
      let result;
      switch (action) {
        case 'graduate':
          result = await graduateEnrollment(enrollmentId);
          break;
        case 'transfer':
          result = await transferEnrollment(enrollmentId);
          break;
        case 'reactivate':
          result = await reactivateEnrollment(enrollmentId);
          break;
        case 'delete':
          result = await deleteEnrollment(enrollmentId);
          break;
      }
      
      // Refresh data after successful action
      if (result?.success) {
        await fetchEnrollments();
        // Remove from selection if deleted
        if (action === 'delete' && onSelectionChange) {
          onSelectionChange(selectedItems.filter(id => id !== enrollmentId));
        }
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
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

  // Show empty state if no enrollments
  if (!isLoadingEnrollments && displayEnrollments.length === 0) {
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
                    if (el) el.indeterminate = isSomeSelected && !isAllSelected;
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
            {paginatedData.map((enrollment) => (
              <TableRow 
                key={enrollment.id} 
                className={`border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                  selectedItems.includes(enrollment.id) 
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
                        alt={`${enrollment.student.givenNames} ${enrollment.student.lastNames}`}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                        {getStudentInitials(enrollment.student)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {enrollment.student.givenNames} {enrollment.student.lastNames}
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
                    {enrollment.student.codeSIRE}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                      {enrollment.grade?.name || `Grado ${enrollment.gradeId}`}
                    </Badge>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Sección {enrollment.section.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {enrollment.cycle.name}
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver perfil completo
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar matrícula
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {enrollment.status === EnrollmentStatus.ACTIVE && (
                        <>
                          <DropdownMenuItem onClick={() => handleAction('graduate', enrollment.id)}>
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Graduar estudiante
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('transfer', enrollment.id)}>
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Transferir estudiante
                          </DropdownMenuItem>
                        </>
                      )}
                      {enrollment.status !== EnrollmentStatus.ACTIVE && (
                        <DropdownMenuItem onClick={() => handleAction('reactivate', enrollment.id)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reactivar matrícula
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleAction('delete', enrollment.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar matrícula
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
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