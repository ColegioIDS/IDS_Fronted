//src\components\enrollments\EnrollmentTable.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
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
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Phone,
  Calendar
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// ✅ Función auxiliar para iniciales
const getStudentInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string') return '?';
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Utility functions
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

interface EnrollmentTableProps {
  enrollments?: any[];
  selectedItems?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

export default function EnrollmentTable({
  enrollments: propsEnrollments,
  selectedItems = [],
  onSelectionChange
}: EnrollmentTableProps) {
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
    loadEnrollmentById,
    selectedEnrollment
  } = useEnrollment({
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
  const [pageSize] = useState(10);

  const displayEnrollments = propsEnrollments || formData?.enrollments || [];
  const isLoadingEnrollments = isLoading;
  const submitting = isSubmitting;

  // Pagination logic
  const totalPages = Math.ceil(displayEnrollments.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return displayEnrollments.slice(startIndex, startIndex + pageSize);
  }, [displayEnrollments, currentPage, pageSize]);

  // ✅ Declarar isAllSelected e isSomeSelected ANTES de usarlas
  const isAllSelected = useMemo(
    () => paginatedData.length > 0 && paginatedData.every(enrollment => selectedItems.includes(enrollment.id)),
    [paginatedData, selectedItems]
  );
  const isSomeSelected = useMemo(
    () => paginatedData.some(enrollment => selectedItems.includes(enrollment.id)),
    [paginatedData, selectedItems]
  );



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
          if (!confirmed) {
            return;
          }
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

  console.log('enrollment', paginatedData);

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
                    <Badge className={`${getStatusColor(selectedEnrollmentData.status)} mt-1`}>
                      {getStatusText(selectedEnrollmentData.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Más información si está disponible */}
            {selectedEnrollmentData.dateEnrolled && (
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Información de Matrícula
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Fecha de matrícula: {formatDate(selectedEnrollmentData.dateEnrolled)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      Para cambiar el estado, usa las acciones disponibles en la tabla
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

  if (displayEnrollments.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center space-y-3">
          <User className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">No hay matrículas para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-medium text-gray-900 dark:text-gray-100">
                Estudiante
              </TableHead>
              <TableHead className="font-medium text-gray-900 dark:text-gray-100">
                ID
              </TableHead>
              <TableHead className="font-medium text-gray-900 dark:text-gray-100">
                Grado / Sección
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
              const studentName = enrollment.studentName || enrollment.student?.name || 'Sin nombre';

              return (
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
                          src={enrollment.studentProfilePicture || ''}
                          alt={studentName}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                          {getStudentInitials(studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {studentName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                      {enrollment.studentId || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                        {enrollment.gradeName}
                      </Badge>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Sección {enrollment.sectionName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {enrollment.cycleName || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(enrollment.status)}>
                      {getStatusText(enrollment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900 dark:text-white">
                      -
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modales */}
      <ViewModal />
      <EditModal />

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