// src/components/enrollments/EnrollmentsContent.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Users, GraduationCap, UserCheck, Filter } from 'lucide-react';
import { useTheme } from 'next-themes';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedContent from '@/components/common/ProtectedContent';
import { EnrollmentTable } from './EnrollmentTable';
import { EnrollmentFilters } from './EnrollmentFilters';
import { EnrollmentModal } from './CreateEnrollmentModal';
 import { EnrollmentCards } from './EnrollmentCards';
 
// Hooks
import { useEnrollment } from '@/hooks/useEnrollment';
import { useAuth } from '@/context/AuthContext';

// Types
import type { EnrollmentResponse } from '@/types/enrollment.types';

export default function EnrollmentsContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { hasPermission } = useAuth();

  // Permisos
  const canRead = hasPermission('enrollment', 'read');
  const canCreate = hasPermission('enrollment', 'create');
  const canUpdate = hasPermission('enrollment', 'update');
  const canDelete = hasPermission('enrollment', 'delete');

  // Hook principal
  const {
    formData,
    enrollments,
    selectedEnrollment,
    isLoadingFormData,
    isLoading,
    isSubmitting,
    error,
    loadFormData,
    loadEnrollments,
    loadEnrollmentById,
    createEnrollmentItem,
    updateEnrollmentItem,
    deleteEnrollmentItem,
    graduateEnrollmentItem,
    transferEnrollmentItem,
    reactivateEnrollmentItem,
    setSelectedEnrollment,
    clearError
  } = useEnrollment({
    autoLoadFormData: true,
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(error)
  });

  // Estado local
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterParams, setFilterParams] = useState<any>({});

  // Handlers
  const handleCreateClick = () => {
    setSelectedEnrollment(null);
    setShowModal(true);
  };

  const handleEditClick = async (enrollment: EnrollmentResponse) => {
    await loadEnrollmentById(enrollment.id);
    setShowModal(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta matrícula?')) {
      await deleteEnrollmentItem(id);
    }
  };

  const handleGraduateClick = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas graduar esta matrícula?')) {
      await graduateEnrollmentItem(id);
    }
  };

  const handleTransferClick = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas transferir esta matrícula?')) {
      await transferEnrollmentItem(id);
    }
  };

  const handleReactivateClick = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas reactivar esta matrícula?')) {
      await reactivateEnrollmentItem(id);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEnrollment(null);
  };

  const handleModalSave = async (data: any) => {
    if (selectedEnrollment) {
      await updateEnrollmentItem(selectedEnrollment.id, data);
    } else {
      await createEnrollmentItem(data);
    }
    handleModalClose();
  };

  const handleFilterChange = (filters: any) => {
    setFilterParams(filters);
    loadEnrollments(filters);
  };

  // ✅ PROTECCIÓN: Sin permiso de lectura
  if (!canRead) {
    return (
      <ProtectedContent requiredPermission={{ module: 'enrollment', action: 'read' }}>
        <div>No tienes permisos para ver matrículas</div>
      </ProtectedContent>
    );
  }

  // Loading inicial
  if (isLoadingFormData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Cargando datos...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error && !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className={isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-6 text-center">
            <p className={isDark ? 'text-red-300' : 'text-red-600'}>
              {error}
            </p>
            <Button 
              onClick={() => loadFormData()} 
              className="mt-4"
              variant="outline"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sin datos
  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6 text-center">
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              No hay datos disponibles
            </p>
            <Button 
              onClick={() => loadFormData()} 
              className="mt-4"
            >
              Cargar datos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Matrículas
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Ciclo Escolar: <span className="font-semibold">{formData.activeCycle.name}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={isDark ? 'border-gray-600 hover:bg-gray-700' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>

          {canCreate && (
            <Button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Matrícula
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <EnrollmentCards />
        enrollments={formData.enrollments}
        isLoading={isLoading}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onGraduate={handleGraduateClick}
        onTransfer={handleTransferClick}
        onReactivate={handleReactivateClick}
      />

      {/* Filtros */}
      {showFilters && (
        <EnrollmentFilters
          grades={formData.grades}
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      )}

      {/* Tabla */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Users className="h-5 w-5" />
            Lista de Matrículas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnrollmentTable
            enrollments={formData.enrollments}
            isLoading={isLoading}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onGraduate={handleGraduateClick}
            onTransfer={handleTransferClick}
            onReactivate={handleReactivateClick}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <EnrollmentModal
          isOpen={showModal}
          enrollment={selectedEnrollment}
          formData={formData}
          isSubmitting={isSubmitting}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}