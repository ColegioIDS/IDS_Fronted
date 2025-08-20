// src/components/grades/GradesContent.tsx
'use client';
import { useEffect, useState } from 'react';
import { useGradeContext, useGradeList, useGradeForm } from '@/context/GradeContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Filter, 
  Download, 
  Upload,
  BookOpen,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Baby,
  GraduationCap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import GradeTable from './GradeTable';
import GradeForm from './GradeForm';
import GradeFilters from './GradeFilters';
import GradeStats from './GradeStats';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'react-toastify';

export default function GradesContent() {
  const [activeTab, setActiveTab] = useState('list');
  const { state, fetchGrades } = useGradeContext();
  const { 
    grades, 
    meta, 
    loading, 
    error, 
    filters, 
    handleFilterChange, 
    handleDelete,
    refetch
  } = useGradeList();
  
  const { 
    formMode, 
    startCreate, 
    startEdit, 
    cancelForm 
  } = useGradeForm();

  // Cargar grados al montar el componente
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los datos');
    }
  };

  const handleExport = () => {
    // Implementar exportación
    const csvContent = grades.map(grade => 
      `${grade.name},${grade.level},${grade.order},${grade.isActive ? 'Activo' : 'Inactivo'}`
    ).join('\n');
    
    const blob = new Blob([`Nombre,Nivel,Orden,Estado\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grados.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Datos exportados correctamente');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast.info('Función de importación en desarrollo');
        // Aquí implementarías la lógica de importación
      }
    };
    input.click();
  };

  // Componente de error
  if (error && grades.length === 0) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <BookOpen className="h-16 w-16 text-gray-400" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se pudieron cargar los grados
            </h3>
            <p className="text-gray-600 mb-4">
              Verifica tu conexión e intenta nuevamente
            </p>
          </div>
          <Button onClick={() => fetchGrades()} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Reintentar</span>
          </Button>
        </div>
      </div>
    );
  }

  // Componente de carga inicial
  if (loading && grades.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <LoadingSpinner 
          size="lg" 
          text="Cargando grados..." 
          type="grades" 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <span>Gestión de Grados</span>
          </h1>
          <p className="text-gray-600 mt-2 ml-14">
            Administra los grados académicos del sistema educativo
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={grades.length === 0}
            className="flex items-center space-x-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          >
            <Upload className="h-4 w-4" />
            <span>Importar</span>
          </Button>
          
          <Button
            onClick={startCreate}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Grado</span>
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{meta.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-xl font-bold text-green-600">
                  {grades.filter(g => g.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactivos</p>
                <p className="text-xl font-bold text-red-600">
                  {grades.filter(g => !g.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Niveles</p>
                <p className="text-xl font-bold text-purple-600">
                  {new Set(grades.map(g => g.level)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 bg-gray-100">
          <TabsTrigger 
            value="list" 
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Filter className="h-4 w-4" />
            <span>Lista de Grados</span>
          </TabsTrigger>
          <TabsTrigger 
            value="stats" 
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Estadísticas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filtros */}
          <GradeFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Tabla de grados */}
          <GradeTable
            grades={grades}
            loading={loading}
            onEdit={startEdit}
            onDelete={handleDelete}
            meta={meta}
            onFilterChange={handleFilterChange}
          />

          {/* Mensaje cuando no hay datos */}
          {!loading && grades.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No hay grados registrados
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Comienza creando tu primer grado académico
                    </p>
                  </div>
                  <Button
                    onClick={startCreate}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Grado
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <GradeStats />
        </TabsContent>
      </Tabs>

      {/* Modal/Form para crear/editar */}
      {formMode && (
        <GradeForm
          mode={formMode}
          onCancel={cancelForm}
          onSuccess={() => {
            cancelForm();
            refetch(); // Recargar la lista
            toast.success(
              formMode === 'create' 
                ? 'Grado creado correctamente' 
                : 'Grado actualizado correctamente'
            );
          }}
        />
      )}
    </div>
  );
}