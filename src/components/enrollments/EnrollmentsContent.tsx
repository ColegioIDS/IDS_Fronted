'use client';

import { useState, useEffect } from 'react';
import { useEnrollmentContext, useEnrollmentList, useEnrollmentStatsContext, useEnrollmentBulkOperations } from '@/context/EnrollmentContext';
import { 
  Users, 
  GraduationCap, 
  ArrowRightLeft, 
  Plus, 
  Filter,
  Table as TableIcon,
  Grid3X3,
  Download,
  MoreHorizontal,
  Search,
  RefreshCw,
  BookOpen,
  School,
  ChevronDown,
  Star,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { EnrollmentStatus } from '@/types/enrollment.types';
import { toast } from 'react-toastify';

// Import the actual components
import EnrollmentTable from '@/components/enrollments/EnrollmentTable';
import EnrollmentCards from '@/components/enrollments/EnrollmentCards';
import EnrollmentFilters from '@/components/enrollments/EnrollmentFilters';
import CreateEnrollmentModal from '@/components/enrollments/CreateEnrollmentModal';

// Wrapper para CreateEnrollmentModal que usa el contexto
function CreateEnrollmentModalWrapper({ onClose }: { onClose: () => void }) {
  const { state: { submitting }, createEnrollment } = useEnrollmentContext();
  
  return (
    <CreateEnrollmentModal 
      onClose={onClose}
      createEnrollment={createEnrollment}
      isSubmitting={submitting}
    />
  );
}

export default function EnrollmentsContent() {
  const { 
    state: { 
      enrollments, 
      loading: isLoadingEnrollments, 
      error,
      selectedIds 
    },
    fetchEnrollments,
    refreshEnrollments,
    setSelectedIds,
    toggleSelectedId,
    clearSelection
  } = useEnrollmentContext();

  const { 
    stats, 
    loading: isLoadingStats, 
    fetchStats 
  } = useEnrollmentStatsContext();

  const {
    hasSelection,
    submitting: isBulkOperating,
    handleBulkGraduate,
    handleBulkTransfer
  } = useEnrollmentBulkOperations();

  const [activeView, setActiveView] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    fetchEnrollments();
    fetchStats();
  }, [fetchEnrollments, fetchStats]);

  // Función para refrescar datos
  const handleRefresh = async () => {
    try {
      await refreshEnrollments();
      await fetchStats();
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los datos');
    }
  };

  // Calcular estadísticas en tiempo real si no vienen del backend
  const calculateRealTimeStats = () => {
    if (!enrollments || enrollments.length === 0) {
      return {
        total: 0,
        active: 0,
        graduated: 0,
        transferred: 0
      };
    }

    const total = enrollments.length;
    const active = enrollments.filter(e => e.status === EnrollmentStatus.ACTIVE).length;
    const graduated = enrollments.filter(e => e.status === EnrollmentStatus.GRADUATED).length;
    const transferred = enrollments.filter(e => e.status === EnrollmentStatus.TRANSFERRED).length;

    return { total, active, graduated, transferred };
  };

  // Usar stats del contexto o calcular en tiempo real
  const currentStats = stats || calculateRealTimeStats();

  // Calcular porcentajes y tendencias
  const calculateStatsWithTrends = () => {
    const { total, active, graduated, transferred } = currentStats;
    
    return [
      {
        title: "Total Matrículas",
        value: total,
        icon: Users,
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
        description: "En todos los ciclos",
        change: "Sistema completo",
        percentage: 100,
        trend: "stable"
      },
      {
        title: "Estudiantes Activos",
        value: active,
        icon: BookOpen,
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        description: "Cursando actualmente",
        change: total > 0 ? `${Math.round((active / total) * 100)}% del total` : "0%",
        percentage: total > 0 ? (active / total) * 100 : 0,
        trend: "up"
      },
      {
        title: "Graduados",
        value: graduated,
        icon: GraduationCap,
        bgColor: "bg-purple-100",
        textColor: "text-purple-600",
        description: "Completaron estudios",
        change: total > 0 ? `${Math.round((graduated / total) * 100)}% del total` : "0%",
        percentage: total > 0 ? (graduated / total) * 100 : 0,
        trend: "up"
      },
      {
        title: "Transferidos",
        value: transferred,
        icon: ArrowRightLeft,
        bgColor: "bg-orange-100",
        textColor: "text-orange-600",
        description: "Nuevos horizontes",
        change: total > 0 ? `${Math.round((transferred / total) * 100)}% del total` : "0%",
        percentage: total > 0 ? (transferred / total) * 100 : 0,
        trend: "stable"
      }
    ];
  };

  const statsWithTrends = calculateStatsWithTrends();

  // Manejo de filtros
  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // Aquí puedes llamar a fetchEnrollments con los filtros
    fetchEnrollments(filters);
  };

  // Manejo de selección múltiple
  const handleSelectionChange = (ids: number[]) => {
    setSelectedIds(ids);
  };

  // Manejo de acciones masivas
  const handleBulkGraduateAction = async () => {
    if (!hasSelection) {
      toast.warning('Selecciona al menos una matrícula');
      return;
    }

    const result = await handleBulkGraduate();
    if (result.success) {
      clearSelection();
    }
  };

  const handleBulkTransferAction = async () => {
    if (!hasSelection) {
      toast.warning('Selecciona al menos una matrícula');
      return;
    }

    const result = await handleBulkTransfer();
    if (result.success) {
      clearSelection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      {/* Clean Header */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <School className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Centro de Matrículas
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Sistema integral de gestión estudiantil
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingEnrollments || isLoadingStats}
                className="bg-white/50 dark:bg-gray-800/50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(isLoadingEnrollments || isLoadingStats) ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}> 
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Matrícula
                  </Button>
                </DialogTrigger>
                <CreateEnrollmentModalWrapper onClose={() => setIsCreateModalOpen(false)} />
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Stats Cards con datos reales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsWithTrends.map((stat, index) => (
            <Card
              key={index}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor} dark:bg-opacity-30`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {stat.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  {isLoadingStats || isLoadingEnrollments ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </p>
                  )}
                  <p className={`text-xs ${stat.textColor}`}>{stat.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
                </div>
                
                {/* Barra de progreso visual */}
                {stat.title !== "Total Matrículas" && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          stat.title.includes('Activos') ? 'bg-green-500' :
                          stat.title.includes('Graduados') ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estadísticas adicionales en tiempo real */}
        {enrollments && enrollments.length > 0 && (
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Análisis en Tiempo Real
              </CardTitle>
              <CardDescription>
                Datos actualizados automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {((currentStats.active / currentStats.total) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Actividad</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {((currentStats.graduated / currentStats.total) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Graduación</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {((currentStats.transferred / currentStats.total) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasa de Transferencia</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {currentStats.total}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clean Search and Filters */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre de estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0 bg-white/50 dark:bg-gray-800/50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                {showFilters && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-600">
                    ON
                  </Badge>
                )}
              </Button>
            </div>

            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent>
                <div className="pt-4">
                  <Separator className="mb-4" />
                  <EnrollmentFilters onFiltersChange={handleFiltersChange} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Clean Action Toolbar */}
        {hasSelection && selectedIds.length > 0 && (
          <Card className="bg-orange-50/70 dark:bg-orange-900/20 backdrop-blur-sm border border-orange-200 dark:border-orange-800 shadow-lg">
            <CardContent className="flex items-center justify-between py-4 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    {selectedIds.length} seleccionados
                  </Badge>
                  <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                    Acciones masivas disponibles
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkGraduateAction}
                  disabled={isBulkOperating}
                  className="bg-white/50 dark:bg-gray-800/50 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {isBulkOperating ? 'Graduando...' : 'Graduar Seleccionados'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleBulkTransferAction}
                  disabled={isBulkOperating}
                  className="bg-white/50 dark:bg-gray-800/50 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  {isBulkOperating ? 'Transfiriendo...' : 'Transferir Seleccionados'}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={isBulkOperating}
                      className="bg-white/50 dark:bg-gray-800/50 border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur">
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Seleccionados
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Eliminar Seleccionados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => clearSelection()}
                  disabled={isBulkOperating}
                  className="text-orange-700 hover:bg-orange-100"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50/70 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800">
            <CardContent className="py-4 px-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Clean Main Content Tabs */}
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">
                    Listado de Matrículas
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {isLoadingEnrollments ? (
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded inline-block" />
                    ) : (
                      `${enrollments?.length || 0} matrículas encontradas`
                    )}
                  </CardDescription>
                </div>
              </div>
              
              <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'table' | 'cards')}>
                <TabsList className="bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    Tabla
                  </TabsTrigger>
                  <TabsTrigger value="cards" className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    Cards
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'table' | 'cards')}>
              <TabsContent value="table" className="mt-0">
                <EnrollmentTable 
                  selectedItems={selectedIds}
                  onSelectionChange={handleSelectionChange}
                />
              </TabsContent>
              
              <TabsContent value="cards" className="mt-0">
                <EnrollmentCards 
                  selectedItems={selectedIds}
                  onSelectionChange={handleSelectionChange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Clean Floating Action Button */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogTrigger asChild>
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </DialogTrigger>
        <CreateEnrollmentModalWrapper onClose={() => setIsCreateModalOpen(false)} />
      </Dialog>
    </div>
  );
}