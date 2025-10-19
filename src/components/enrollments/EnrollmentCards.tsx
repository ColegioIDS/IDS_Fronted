'use client';

import { useState, useMemo } from 'react';
import { useEnrollment } from '@/hooks/useEnrollment';
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
  BookOpen,
  AlertCircle
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Utility functions
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
  enrollments?: any[];
  selectedItems?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

export default function EnrollmentCards({ 
  enrollments: propsEnrollments,
  selectedItems = [], 
  onSelectionChange 
}: EnrollmentCardsProps) {
  const {
    formData,
    isLoading,
    isSubmitting,
    error,
    loadFormData,
    deleteEnrollmentItem,
    graduateEnrollmentItem,
    transferEnrollmentItem,
    reactivateEnrollmentItem,
    loadEnrollmentById
  }  = useEnrollment({
    autoLoadFormData: true,
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(error)
  });

  // ✅ Estado para modales de ver y editar
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEnrollmentData, setSelectedEnrollmentData] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  const displayEnrollments = propsEnrollments || formData?.enrollments || [];
  const isLoadingEnrollments = isLoading;
  const submitting = isSubmitting;

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

  // ✅ Action handlers con modales para ver y editar
  const handleAction = async (action: string, enrollmentId: number, studentName?: string) => {
    try {
      let result;
      switch (action) {
        case 'graduate':
          result = await graduateEnrollmentItem(enrollmentId);
          break;
        case 'transfer':
          result = await transferEnrollmentItem(enrollmentId);
          break;
        case 'reactivate':
          result = await reactivateEnrollmentItem(enrollmentId);
          break;
        case 'delete':
          const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar la matrícula de ${studentName || 'este estudiante'}?`
          );
          if (!confirmed) return;
          result = await deleteEnrollmentItem(enrollmentId);
          break;
        case 'edit':
          // ✅ Cargar datos del enrollment y abrir modal
          const enrollment = displayEnrollments.find(e => e.id === enrollmentId);
          if (enrollment) {
            setSelectedEnrollmentData(enrollment);
            setEditModalOpen(true);
          }
          return;
        case 'view':
          // ✅ Cargar datos del enrollment y abrir modal
          const enrollmentView = displayEnrollments.find(e => e.id === enrollmentId);
          if (enrollmentView) {
            setSelectedEnrollmentData(enrollmentView);
            setViewModalOpen(true);
          }
          return;
      }
      
      // Remove from selection if deleted and successful
      if (result && action === 'delete' && onSelectionChange) {
        onSelectionChange(selectedItems.filter(id => id !== enrollmentId));
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Error al ${
        action === 'graduate' ? 'graduar' : 
        action === 'transfer' ? 'transferir' : 
        action === 'reactivate' ? 'reactivar' : 
        action === 'delete' ? 'eliminar' : 'procesar'
      } la matrícula`);
    }
  };

  // Get student profile picture or create fallback
  const getStudentAvatar = (enrollment: any) => {
    return enrollment.studentProfilePicture || null;
  };

  // Generate fallback initials
  const getStudentInitials = (studentName: string) => {
    const names = studentName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return studentName.charAt(0).toUpperCase();
  };

  // ✅ Modal de Ver Perfil
  const ViewModal = () => {
    if (!selectedEnrollmentData) return null;

    return (
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Perfil del Estudiante
            </DialogTitle>
            <DialogDescription>
              Información completa de la matrícula
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información del Estudiante */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedEnrollmentData.studentProfilePicture || ''}
                      alt={selectedEnrollmentData.studentName}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg">
                      {getStudentInitials(selectedEnrollmentData.studentName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedEnrollmentData.studentName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      ID: {selectedEnrollmentData.studentId}
                    </p>
                    <div className="mt-2">
                      <Badge className={getStatusColor(selectedEnrollmentData.status)}>
                        {getStatusText(selectedEnrollmentData.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Académica */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Información Académica
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Grado</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedEnrollmentData.gradeName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sección</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedEnrollmentData.sectionName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ciclo</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedEnrollmentData.cycleId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                    <Badge className={getStatusColor(selectedEnrollmentData.status)}>
                      {getStatusText(selectedEnrollmentData.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // ✅ Modal de Editar
  const EditModal = () => {
    if (!selectedEnrollmentData) return null;

    return (
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Editar Matrícula
            </DialogTitle>
            <DialogDescription>
              Modifica la información de la matrícula del estudiante
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Estudiante</TabsTrigger>
              <TabsTrigger value="academic">Académico</TabsTrigger>
            </TabsList>

            {/* Tab Estudiante */}
            <TabsContent value="student" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre del Estudiante
                    </label>
                    <input
                      type="text"
                      value={selectedEnrollmentData.studentName}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Este campo no se puede editar
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID del Estudiante
                    </label>
                    <input
                      type="text"
                      value={selectedEnrollmentData.studentId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Académico */}
            <TabsContent value="academic" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Grado
                    </label>
                    <input
                      type="text"
                      value={selectedEnrollmentData.gradeName}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sección
                    </label>
                    <input
                      type="text"
                      value={selectedEnrollmentData.sectionName}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado Actual
                    </label>
                    <div className="flex items-center">
                      <Badge className={getStatusColor(selectedEnrollmentData.status)}>
                        {getStatusText(selectedEnrollmentData.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Para cambiar el estado, usa las acciones disponibles en las tarjetas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              disabled
              title="La edición de matrículas se implementará en futuras versiones"
            >
              Guardar Cambios (Próximamente)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
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
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (displayEnrollments.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Users className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">No hay matrículas para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedData.map((enrollment) => {
          const studentName = enrollment.studentName;

          return (
            <Card
              key={enrollment.id}
              className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                selectedItems.includes(enrollment.id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Checkbox
                    checked={selectedItems.includes(enrollment.id)}
                    onCheckedChange={(checked) => handleSelectItem(enrollment.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={submitting}
                        onClick={(e) => e.stopPropagation()}
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
                      {enrollment.status === 'active' && (
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
                      {enrollment.status !== 'active' && (
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
                      src={getStudentAvatar(enrollment)} 
                      alt={studentName}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      {getStudentInitials(studentName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {studentName}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {enrollment.studentId || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Academic Info */}
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                      {enrollment.gradeName}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Sección {enrollment.sectionName}
                    </p>
                  </div>
                </div>

                {/* Student Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Ciclo: {enrollment.cycleId}</span>
                  </div>
                  <div>
                    <Badge className={getStatusColor(enrollment.status)}>
                      {getStatusText(enrollment.status)}
                    </Badge>
                  </div>
                </div>

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
                    {enrollment.status === 'active' && (
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

      {/* Modales */}
      <ViewModal />
      <EditModal />

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