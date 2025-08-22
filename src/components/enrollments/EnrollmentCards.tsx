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
  ChevronsRight,
  Heart,
  Star,
  Phone,
  Mail,
  Users,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { EnrollmentStatus } from '@/types/enrollment.types';
import { toast } from 'react-toastify';

// Utility functions
const getStatusColor = (status: EnrollmentStatus) => {
  switch (status) {
    case EnrollmentStatus.ACTIVE:
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    case EnrollmentStatus.GRADUATED:
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
    case EnrollmentStatus.TRANSFERRED:
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800";
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

interface EnrollmentCardsProps {
  selectedItems?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

export default function EnrollmentCards({ 
  selectedItems = [], 
  onSelectionChange 
}: EnrollmentCardsProps) {
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
  const [pageSize, setPageSize] = useState(12); // More cards per page

  // Use real data from context
  const displayEnrollments = enrollments || [];

  // Pagination logic
  const totalPages = Math.ceil(displayEnrollments.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return displayEnrollments.slice(startIndex, startIndex + pageSize);
  }, [displayEnrollments, currentPage, pageSize]);

  // Selection handlers
  const handleSelectItem = (id: number, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedItems, id]);
      } else {
        onSelectionChange(selectedItems.filter(item => item !== id));
      }
    }
  };

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
          if (!confirmed) return;
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
      
      // Remove from selection if deleted and successful
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
    const profilePicture = student.pictures?.find((pic: any) => pic.kind === 'profile');
    if (profilePicture?.url) {
      return profilePicture.url;
    }
    return null;
  };

  // Generate fallback initials
  const getStudentInitials = (student: any) => {
    const firstInitial = student.givenNames?.charAt(0) || '';
    const lastInitial = student.lastNames?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Show loading state
  if (isLoadingEnrollments) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Cargando matrículas...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-center space-y-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl w-fit mx-auto">
            <Users className="h-8 w-8 text-red-600" />
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
            <Users className="h-8 w-8 text-gray-400" />
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
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {paginatedData.map((enrollment) => {
          const studentName = `${enrollment.student.givenNames} ${enrollment.student.lastNames}`;
          
          return (
            <Card
              key={enrollment.id}
              className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group ${
                selectedItems.includes(enrollment.id) 
                  ? 'ring-2 ring-blue-500 ring-opacity-50' 
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Checkbox
                        checked={selectedItems.includes(enrollment.id)}
                        onCheckedChange={(checked) => handleSelectItem(enrollment.id, checked as boolean)}
                        className="absolute -top-1 -left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(enrollment.status)} shadow-sm`}>
                      {getStatusText(enrollment.status)}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={submitting}
                      >
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
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={getStudentAvatar(enrollment.student)} 
                      alt={studentName}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      {getStudentInitials(enrollment.student)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {studentName}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {enrollment.student.codeSIRE || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Academic Info */}
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                      {enrollment.section?.grade?.name || `Grado ${enrollment.gradeId}`}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Sección {enrollment.section?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {calculateAge(enrollment.student.birthDate)} años
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Edad</p>
                  </div>
                </div>

                {/* Student Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Ciclo: {enrollment.cycle?.name || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span className="truncate">
                      {enrollment.student.birthPlace || 'Guatemala'}
                    </span>
                  </div>

                  {enrollment.student.favoriteColor && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span>Color favorito: {enrollment.student.favoriteColor}</span>
                    </div>
                  )}

                  {enrollment.student.hobby && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Hobby: {enrollment.student.hobby}</span>
                    </div>
                  )}
                </div>

                {/* Siblings info */}
                {enrollment.student.siblingsCount > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Información familiar:</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        👫 {enrollment.student.siblingsCount} hermanos
                      </span>
                      {enrollment.student.brothersCount > 0 && (
                        <span className="text-gray-600 dark:text-gray-400">
                          👦 {enrollment.student.brothersCount}
                        </span>
                      )}
                      {enrollment.student.sistersCount > 0 && (
                        <span className="text-gray-600 dark:text-gray-400">
                          👧 {enrollment.student.sistersCount}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs bg-white/50 dark:bg-gray-800/50"
                      onClick={() => handleAction('view', enrollment.id, studentName)}
                      disabled={submitting}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs bg-white/50 dark:bg-gray-800/50"
                      onClick={() => handleAction('edit', enrollment.id, studentName)}
                      disabled={submitting}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    {enrollment.status === EnrollmentStatus.ACTIVE && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs bg-white/50 dark:bg-gray-800/50"
                        onClick={() => handleAction('graduate', enrollment.id, studentName)}
                        disabled={submitting}
                      >
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Graduar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex items-center justify-between py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {((currentPage - 1) * pageSize) + 1}
            </span>
            {' '} a{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.min(currentPage * pageSize, displayEnrollments.length)}
            </span>
            {' '} de{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {displayEnrollments.length}
            </span>
            {' '} estudiantes
          </p>
          
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
        </CardContent>
      </Card>
    </div>
  );
}