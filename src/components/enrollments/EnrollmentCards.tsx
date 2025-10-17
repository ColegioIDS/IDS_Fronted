// src/components/enrollments/EnrollmentCards.tsx
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
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Heart,
  Star,
  BookOpen,
  Users
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
import { toast } from 'sonner';

// ==================== UTILITY FUNCTIONS ====================

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    case 'graduated':
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
    case 'transferred':
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800";
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

// ==================== INTERFACES ====================

interface EnrollmentCardsProps {
  enrollments: any[];
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

export function EnrollmentCards({
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
}: EnrollmentCardsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // Use enrollments directly
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
      toast.error('Error al procesar la acción');
    }
  };

  // Get student initials
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
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Cargando matrículas...
          </p>
        </div>
      </div>
    );
  }

  // ==================== EMPTY STATE ====================

  if (displayEnrollments.length === 0) {
    return (
      <div className={`w-full h-64 flex items-center justify-center rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="text-center space-y-3">
          <div className={`p-3 rounded-xl w-fit mx-auto ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <Users className="h-8 w-8 text-gray-400" />
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

  // ==================== CARDS GRID ====================

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {paginatedData.map((enrollment) => {
          return (
            <Card
              key={enrollment.id}
              className={`backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group ${
                isDark ? 'bg-gray-900/70' : 'bg-white/70'
              } ${
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
                      <div className={`p-2 rounded-xl ${
                        isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                      }`}>
                        <BookOpen className={`h-5 w-5 ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`} />
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
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={enrollment.studentProfilePicture || ''} 
                      alt={enrollment.studentName}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      {getStudentInitials(enrollment.studentName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className={`text-lg truncate ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {enrollment.studentName}
                    </CardTitle>
                    <p className={`text-sm font-mono ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {enrollment.studentId || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Academic Info */}
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Badge 
                      variant="outline" 
                      className={isDark
                        ? 'bg-purple-900/20 text-purple-400 border-purple-800'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                      }
                    >
                      {enrollment.gradeName}
                    </Badge>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Sección {enrollment.sectionName}
                    </p>
                  </div>
                </div>

                {/* Student Details */}
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Ciclo: {enrollment.cycleId}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`pt-3 border-t ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex-1 text-xs ${
                        isDark ? 'bg-gray-800/50' : 'bg-white/50'
                      }`}
                      onClick={() => handleAction('view', enrollment.id, enrollment.studentName)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    {canUpdate && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`flex-1 text-xs ${
                          isDark ? 'bg-gray-800/50' : 'bg-white/50'
                        }`}
                        onClick={() => handleAction('edit', enrollment.id, enrollment.studentName)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    )}
                    {enrollment.status === 'active' && canUpdate && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`flex-1 text-xs ${
                          isDark ? 'bg-gray-800/50' : 'bg-white/50'
                        }`}
                        onClick={() => handleAction('graduate', enrollment.id, enrollment.studentName)}
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
      <Card className={`backdrop-blur-sm border-0 shadow-lg ${
        isDark ? 'bg-gray-900/70' : 'bg-white/70'
      }`}>
        <CardContent className="flex items-center justify-between py-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Mostrando{' '}
            <span className={`font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {((currentPage - 1) * pageSize) + 1}
            </span>
            {' '} a{' '}
            <span className={`font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {Math.min(currentPage * pageSize, displayEnrollments.length)}
            </span>
            {' '} de{' '}
            <span className={`font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
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